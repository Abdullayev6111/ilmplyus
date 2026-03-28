import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import '../pages/tasks/tasks.css';
import { API } from '../api/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { Task } from './TaskCard';

interface LidResult {
  id: number;
  first_name: string;
  last_name: string;
  father_name: string;
  phone: string;
  comment: string;
}

interface LidApiResponse {
  data: LidResult[];
}

interface CreateTaskPayload {
  lid_id: number;
  operator_id: number;
  deadline: string;
  priority: string;
  description: string;
}

interface UpdateTaskPayload {
  priority: string;
  deadline: string;
  operator_id: number;
  description: string;
}

interface OperatorRole {
  id: number;
  name: string;
}

interface OperatorUser {
  id: number;
  full_name: string;
  phone: string;
  role_id?: number;
  roles?: OperatorRole[];
}

interface UsersResponse {
  data: OperatorUser[];
}

interface TaskModalProps {
  onClose: () => void;
  editTask?: Task;
}

type Priority = 'shoshilinch' | 'orta' | 'sekin';

const PRIORITY_OPTIONS: { label: string; value: Priority }[] = [
  { label: 'Shoshilinch', value: 'shoshilinch' },
  { label: "O'rta", value: 'orta' },
  { label: 'Sekin', value: 'sekin' },
];

function deadlineToInputs(deadline: string): { date: string; time: string } {
  const d = new Date(deadline);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return { date: `${year}-${month}-${day}`, time: `${hours}:${minutes}` };
}

function buildDeadline(date: string, time: string): string {
  const d = new Date(`${date}T${time}:00`);
  return d.toISOString();
}

function isValidTime(time: string): boolean {
  if (!time.includes(':')) return false;
  const [h, m] = time.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return false;
  if (h > 23 || m > 59) return false;
  return true;
}

function getShortName(full_name: string): string {
  const parts = full_name.trim().split(' ');
  return `${parts[0] ?? ''} ${parts[1] ?? ''}`.trim();
}

function isOperator(user: OperatorUser): boolean {
  if (user.role_id === 1 || user.role_id === 2) return true;
  if (Array.isArray(user.roles)) {
    return user.roles.some((r) => r.id === 1 || r.id === 2 || /operator|admin/i.test(r.name));
  }
  return true; // fallback if no roles defined
}

export default function TaskModal({ onClose, editTask }: TaskModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isEdit = !!editTask;

  const firstComment = editTask?.comments?.[0];
  const [comment, setComment] = useState(isEdit ? (firstComment?.comment ?? '') : '');

  const [lidSearch, setLidSearch] = useState(
    isEdit ? `${editTask.lid.first_name} ${editTask.lid.last_name}` : '',
  );

  const [selectedLidId, setSelectedLidId] = useState<number | null>(
    isEdit ? editTask.lid_id : null,
  );

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [priority, setPriority] = useState<Priority>(isEdit ? editTask.priority : 'orta');

  const defaultInputs = isEdit ? deadlineToInputs(editTask.deadline) : { date: '', time: '' };

  const [date, setDate] = useState(defaultInputs.date);
  const [time, setTime] = useState(defaultInputs.time);
  const [timeError, setTimeError] = useState(false);

  const [operatorId, setOperatorId] = useState<number | ''>(isEdit ? editTask.operator_id : '');

  const { data: usersData } = useQuery<UsersResponse, Error>({
    queryKey: ['users'],
    queryFn: () => API.get('/users').then((r) => r.data),
  });

  const operators: OperatorUser[] = (usersData?.data ?? []).filter(isOperator);

  const { data: lidData } = useQuery<LidApiResponse, Error>({
    queryKey: ['lids', lidSearch],
    queryFn: () => API.get('/lids', { params: { search: lidSearch } }).then((r) => r.data),
    enabled: lidSearch.length > 1 && !selectedLidId,
  });

  const lidResults = lidData?.data ?? [];

  const createMutation = useMutation({
    mutationFn: (payload: CreateTaskPayload) => API.post('/tasks', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateTaskPayload) => API.put(`/tasks/${editTask!.id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onClose();
    },
  });

  const handleTimeInput = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    let formatted = digits;

    if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}:${digits.slice(2)}`;
    }

    setTime(formatted);

    if (formatted.length === 5) {
      setTimeError(!isValidTime(formatted));
    } else {
      setTimeError(false);
    }
  };

  const handleSelectLid = (lid: LidResult) => {
    setSelectedLidId(lid.id);
    setLidSearch(`${lid.first_name} ${lid.last_name}`);
    setShowSuggestions(false);
  };

  const handleSubmit = () => {
    if (!date || !time || timeError) return;
    if (operatorId === '') return;
    if (!comment.trim()) return;

    const deadline = buildDeadline(date, time);

    if (isEdit) {
      updateMutation.mutate({
        priority,
        deadline,
        operator_id: operatorId,
        description: comment,
      });
      return;
    }

    if (!selectedLidId) return;

    createMutation.mutate({
      lid_id: selectedLidId,
      operator_id: operatorId,
      deadline,
      priority,
      description: comment,
    });
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="modal__title">
          {isEdit ? t('taskModal.editTitle') : t('taskModal.createTitle')}
        </div>



        {!isEdit && (
          <div className="modal__field">
            <label className="modal__label">{t('taskModal.selectLid')}</label>

            <div className="modal__search-wrap">
              <input
                className="modal__input"
                placeholder={t('taskModal.lidPlaceholder')}
                value={lidSearch}
                onChange={(e) => {
                  setLidSearch(e.target.value);
                  setSelectedLidId(null);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              />

              <span className="modal__search-icon">🔍</span>

              {showSuggestions && lidResults.length > 0 && (
                <div className="modal__suggestions">
                  {lidResults.map((lid) => (
                    <div
                      key={lid.id}
                      className="modal__suggestion-item"
                      onMouseDown={() => handleSelectLid(lid)}
                    >
                      {lid.first_name} {lid.last_name} — ID: {lid.id}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="modal__field">
          <label className="modal__label">{t('taskModal.priority')}</label>

          <div className="modal__priority-group">
            {PRIORITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`modal__priority-btn${priority === opt.value ? ' active' : ''}`}
                onClick={() => setPriority(opt.value)}
                type="button"
              >
                {t(`taskModal.priorityOptions.${opt.value}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="modal__row">
          <div className="modal__field">
            <label className="modal__label">{t('taskModal.date')}</label>

            <input
              type="date"
              className="modal__input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="modal__field">
            <label className="modal__label">{t('taskModal.time')}</label>

            <input
              className={`modal__input${timeError ? ' modal__input--error' : ''}`}
              placeholder="10:00"
              value={time}
              onChange={(e) => handleTimeInput(e.target.value)}
              maxLength={5}
            />
          </div>
        </div>

        <div className="modal__field">
          <label className="modal__label">{t('taskModal.operator')}</label>

          <select
            className="modal__select"
            value={operatorId}
            onChange={(e) => setOperatorId(e.target.value === '' ? '' : Number(e.target.value))}
          >
            <option value="">{t('taskModal.selectOperator')}</option>

            {operators.map((u) => (
              <option key={u.id} value={u.id}>
                {getShortName(u.full_name)}
              </option>
            ))}
          </select>
        </div>

        <div className="modal__field">
          <label className="modal__label">{t('taskModal.comment')}</label>

          <textarea
            className="modal__textarea"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>

          <button className="modal__close" onClick={onClose}>
            Bekor qilish
          </button>

          <button className="modal__save-btn" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? t('taskModal.saving') : t('taskModal.saveBtn')}
          </button>
        </div>

      </div>
    </div>
  );
}
