import { useMemo, useState, useCallback } from 'react';
import { useQuery, keepPreviousData, useQueryClient, useMutation } from '@tanstack/react-query';
import LeadColumn from '../../components/LidColumn';
import AloqaModal from '../../components/AloqaModal';
import DemoModal from '../../components/DemoModal';
import ShartnomaModal from '../../components/ShartnomaModal';
import LeadDetailsModal from '../../components/LeadDetailsModal';
import { fetchLids, updateLidStatus } from './lid.service';
import type { Lid, LidsPaginatedResponse, LidStatus } from './lid.types';
import type { Column, ColumnFilter } from '../../components/LidColumn';
import {} from './lid.service';
import './lid.css';

export type { Lid };

export type Group = {
  id: number;
  title: string;
  columnIds: number[];
};

export interface PendingDrop {
  leadId: number;
  targetGroupId: number;
}

type ModalType = 'aloqa' | 'demo' | 'shartnoma' | null;

const GROUPS: Group[] = [
  { id: 1, title: "RO'YXATDAN O'TGANLAR", columnIds: [1, 2] },
  { id: 2, title: 'ALOQA', columnIds: [3, 4, 5] },
  { id: 3, title: 'DEMO DARS', columnIds: [6, 7, 8] },
  { id: 4, title: "SHARTNOMA VA TO'LOV", columnIds: [9, 10] },
];

const COLUMNS: Column[] = [
  { id: 1, title: 'Onlayn', color: '#FE9100', groupId: 1 },
  { id: 2, title: 'Oflayn', color: '#FE9100', groupId: 1 },
  { id: 3, title: "O'rnatildi", color: '#FE9100', groupId: 2 },
  { id: 4, title: "O'rnatilmadi", color: '#FE9100', groupId: 2 },
  { id: 5, title: 'Qiziqmadi', color: '#FE9100', groupId: 2 },
  { id: 6, title: 'Kelmoqchi', color: '#FE9100', groupId: 3 },
  { id: 7, title: 'Keldi', color: '#FE9100', groupId: 3 },
  { id: 8, title: 'Kelmadi', color: '#FE9100', groupId: 3 },
  { id: 9, title: 'Shartnoma', color: '#FE9100', groupId: 4 },
  { id: 10, title: "To'lov", color: '#FE9100', groupId: 4 },
];

function getGroupIdByColumnId(columnId: number): number {
  const col = COLUMNS.find((c) => c.id === columnId);
  return col ? col.groupId : -1;
}

function getModalTypeForGroup(groupId: number): ModalType {
  if (groupId === 2) return 'aloqa';
  if (groupId === 3) return 'demo';
  if (groupId === 4) return 'shartnoma';
  return null;
}

export default function Lid() {
  const queryClient = useQueryClient();
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [columnFilters, setColumnFilters] = useState<Record<number, ColumnFilter>>({});
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [pendingDrop, setPendingDrop] = useState<PendingDrop | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lid | null>(null);

  const { data } = useQuery<LidsPaginatedResponse>({
    queryKey: ['lids', 1, 100],
    queryFn: () => fetchLids({ page: 1, per_page: 100 }),
    placeholderData: keepPreviousData,
  });

  const { mutate: mutateStatus } = useMutation({
    mutationFn: ({
      id,
      status,
      operator_id,
    }: {
      id: number;
      status: LidStatus;
      operator_id: number;
    }) => updateLidStatus(id, status, operator_id),

    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['lids', 1, 100] });

      const previous = queryClient.getQueryData<LidsPaginatedResponse>(['lids', 1, 100]);

      queryClient.setQueryData<LidsPaginatedResponse>(['lids', 1, 100], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((lid) => (lid.id === id ? { ...lid, status } : lid)),
        };
      });

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['lids', 1, 100], context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['lids'] });
    },
  });

  const lids: Lid[] = useMemo(() => data?.data ?? [], [data?.data]);

  const grouped = useMemo(
    () =>
      GROUPS.map((group) => ({
        ...group,
        columns: COLUMNS.filter((col) => col.groupId === group.id).map((col) => {
          const filter = columnFilters[col.id] || { source: null, course: null };

          const colLeads = lids.filter((l) => l.status === col.id);

          return { ...col, leads: colLeads, filter };
        }),
      })),
    [lids, columnFilters],
  );

  const handleDragStart = useCallback((id: number) => {
    setDraggedId(id);
  }, []);

  const handleDrop = useCallback(
    (targetColumnId: number) => {
      if (draggedId === null) return;

      const lead = lids.find((l) => l.id === draggedId);
      if (!lead) {
        setDraggedId(null);
        return;
      }

      const fromGroupId = getGroupIdByColumnId(lead.status);
      const toGroupId = getGroupIdByColumnId(targetColumnId);

      if (fromGroupId === toGroupId) {
        mutateStatus({
          id: lead.id,
          status: targetColumnId as LidStatus,
          operator_id: lead.operator?.id ?? 0,
        });
        setDraggedId(null);
        return;
      }

      const modalType = getModalTypeForGroup(toGroupId);

      if (modalType) {
        setPendingDrop({ leadId: draggedId, targetGroupId: toGroupId });
        setActiveModal(modalType);
        setDraggedId(null);
      }
    },
    [draggedId, lids, mutateStatus],
  );

  const handleModalConfirm = useCallback(
    (status: LidStatus) => {
      if (!pendingDrop) return;

      const lead = lids.find((l) => l.id === pendingDrop.leadId);
      if (!lead) return;

      mutateStatus({
        id: lead.id,
        status,
        operator_id: lead.operator?.id ?? 0,
      });

      setActiveModal(null);
      setPendingDrop(null);
    },
    [pendingDrop, mutateStatus, lids],
  );

  const handleModalCancel = useCallback(() => {
    setActiveModal(null);
    setPendingDrop(null);
  }, []);

  const handleFilterChange = useCallback((columnId: number, filter: ColumnFilter) => {
    setColumnFilters((prev) => ({ ...prev, [columnId]: filter }));
  }, []);

  const handleLeadClick = useCallback((lead: Lid) => {
    setSelectedLead(lead);
  }, []);

  const activeLead = pendingDrop ? (lids.find((l) => l.id === pendingDrop.leadId) ?? null) : null;

  return (
    <>
      <div className="lids-board-wrapper">
        <div className="lids-board">
          {grouped.map((group) => (
            <div key={group.id} className="lids-group">
              <div className="lids-group__header">
                <span className="lids-group__title">{group.title}</span>
              </div>
              <div className="lids-group__columns">
                {group.columns.map((col) => (
                  <LeadColumn
                    key={col.id}
                    column={col}
                    leads={col.leads}
                    filter={col.filter}
                    onDrop={handleDrop}
                    onDragStart={handleDragStart}
                    onFilterChange={handleFilterChange}
                    onLeadClick={handleLeadClick}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeModal === 'aloqa' && activeLead && (
        <AloqaModal lead={activeLead} onConfirm={handleModalConfirm} onCancel={handleModalCancel} />
      )}
      {activeModal === 'demo' && activeLead && (
        <DemoModal lead={activeLead} onConfirm={handleModalConfirm} onCancel={handleModalCancel} />
      )}
      {activeModal === 'shartnoma' && activeLead && (
        <ShartnomaModal
          lead={activeLead}
          onConfirm={handleModalConfirm}
          onCancel={handleModalCancel}
        />
      )}

      {selectedLead && (
        <LeadDetailsModal
          key={selectedLead.id}
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </>
  );
}
