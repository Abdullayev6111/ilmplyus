import { useMemo, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import LeadColumn from '../../components/LidColumn';
import AloqaModal from '../../components/AloqaModal';
import DemoModal from '../../components/DemoModal';
import ShartnomaModal from '../../components/ShartnomaModal';
import LeadDetailsModal from '../../components/LeadDetailsModal';
import { SUB_STATUS_COLUMN_MAP } from '../../components/Lidconstants';
import { fetchLids, deleteLid } from './lid.service';
import type { Lid, LidsPaginatedResponse } from './lid.types';
import type { Column, ColumnFilter } from '../../components/LidColumn';
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

const STATUS_COLUMN_MAP: Record<string, number> = {
  onlayn: 1,
  oflayn: 2,
  ornatildi: 3,
  ornatilmadi: 4,
  qiziqmadi: 5,
  kelmoqchi: 6,
  keldi: 7,
  kelmadi: 8,
  shartnoma: 9,
  boglanildi: 3,
  tolandi: 10,
};

function getColumnIdByStatus(status: string): number {
  return STATUS_COLUMN_MAP[status.toLowerCase()] ?? 1;
}

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

function getDefaultColumnForGroup(groupId: number): number {
  const group = GROUPS.find((g) => g.id === groupId);
  return group ? group.columnIds[0] : -1;
}

export default function Lid() {
  const queryClient = useQueryClient();
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [columnFilters, setColumnFilters] = useState<Record<number, ColumnFilter>>({});
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [pendingDrop, setPendingDrop] = useState<PendingDrop | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lid | null>(null);
  const [columnOverrides, setColumnOverrides] = useState<Record<number, number>>({});

  const { data } = useQuery<LidsPaginatedResponse>({
    queryKey: ['lids', 1, 100],
    queryFn: () => fetchLids({ page: 1, per_page: 100 }),
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteLid(id),
    onSuccess: () => {
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

          const colLeads = lids.filter((l) => {
            const overriddenCol = columnOverrides[l.id];
            const effectiveColId =
              overriddenCol !== undefined ? overriddenCol : getColumnIdByStatus(l.status);
            return effectiveColId === col.id;
          });

          return { ...col, leads: colLeads, filter };
        }),
      })),
    [lids, columnFilters, columnOverrides],
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

      const currentColId =
        columnOverrides[lead.id] !== undefined
          ? columnOverrides[lead.id]
          : getColumnIdByStatus(lead.status);

      const fromGroupId = getGroupIdByColumnId(currentColId);
      const toGroupId = getGroupIdByColumnId(targetColumnId);

      if (fromGroupId === toGroupId) {
        setColumnOverrides((prev) => ({ ...prev, [draggedId]: targetColumnId }));
        setDraggedId(null);
        return;
      }

      const modalType = getModalTypeForGroup(toGroupId);

      if (modalType) {
        setPendingDrop({ leadId: draggedId, targetGroupId: toGroupId });
        setActiveModal(modalType);
        setDraggedId(null);
      } else {
        setColumnOverrides((prev) => ({ ...prev, [draggedId]: targetColumnId }));
        setDraggedId(null);
      }
    },
    [draggedId, lids, columnOverrides],
  );

  const handleModalConfirm = useCallback(
    (subStatus: string) => {
      if (!pendingDrop) return;

      const targetColumnId =
        SUB_STATUS_COLUMN_MAP[subStatus] ?? getDefaultColumnForGroup(pendingDrop.targetGroupId);

      setColumnOverrides((prev) => ({ ...prev, [pendingDrop.leadId]: targetColumnId }));
      setActiveModal(null);
      setPendingDrop(null);
    },
    [pendingDrop],
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
