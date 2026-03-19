import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import '../pages/tasks/tasks.css';
import { API } from '../api/api';

interface Comment {
  id: number;
  task_id: number;
  user_id: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  lid_id: number;
  operator_id: number;
  deadline: string;
  priority: 'shoshilinch' | 'orta' | 'sekin';
  status: 'yangi' | 'bajarish' | 'bajarildi' | 'bajarilmadi';
  description: string;
  created_at: string;
  updated_at: string;
  lid: {
    id?: number;
    first_name: string;
    last_name: string;
    father_name: string;
    phone: string;
    comment: string;
  };
  operator: {
    id: number;
    full_name: string;
    phone: string;
  };
  comments: Comment[] | null | undefined;
}

type Role = 'manager' | 'operator';

interface UpdateStatusPayload {
  taskId: number;
  status: 'yangi' | 'bajarish' | 'bajarildi' | 'bajarilmadi';
}

interface AddCommentPayload {
  task_id: number;
  comment: string;
  user_id: number;
}

interface TaskCardProps {
  task: Task;
  role: Role;
  currentUserId: number;
  onEdit: (task: Task) => void;
}

const priorityClassMap: Record<Task['priority'], string> = {
  shoshilinch: 'task-card__priority--shoshilinch',
  orta: 'task-card__priority--orta',
  sekin: 'task-card__priority--bemalol',
};

const priorityLabelMap: Record<Task['priority'], string> = {
  shoshilinch: 'taskCard.priority.urgent',
  orta: "taskCard.priority.medium",
  sekin: 'taskCard.priority.low',
};

function formatDeadline(dateStr: string): string {
  const d = new Date(dateStr);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${hh}:${mm} ${day}.${month}.${year}`;
}

function getShortName(fullName: string): string {
  const parts = fullName.trim().split(' ');
  return `${parts[0] ?? ''} ${parts[1] ?? ''}`.trim();
}

export default function TaskCard({ task, role, currentUserId, onEdit }: TaskCardProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const comments = task.comments ?? [];
  const [pendingStatus, setPendingStatus] = useState<'bajarildi' | 'bajarilmadi' | null>(null);

  const statusMutation = useMutation<void, Error, UpdateStatusPayload>({
    mutationFn: ({ taskId, status }) => API.patch(`/tasks/${taskId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteMutation = useMutation<void, Error, number>({
    mutationFn: (taskId) => API.delete(`/tasks/${taskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const commentMutation = useMutation<Comment, Error, AddCommentPayload>({
    mutationFn: (payload) => API.post('/tasks/comment', payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleStatus = (status: UpdateStatusPayload['status']) => {
    statusMutation.mutate({ taskId: task.id, status });
  };

  const handleDelete = () => {
    deleteMutation.mutate(task.id);
  };

  const handleCommentAndFinish = (comment: string) => {
    if (!pendingStatus) return;
    const targetStatus = pendingStatus;
    commentMutation.mutate(
      { task_id: task.id, comment, user_id: currentUserId },
      {
        onSuccess: () => {
          statusMutation.mutate({ taskId: task.id, status: targetStatus });
          setPendingStatus(null);
        },
      },
    );
  };

  const isMutating = statusMutation.isPending || commentMutation.isPending;

  return (
    <div className="task-card">
      <div className="task-card__header">
        <span className={`task-card__priority ${priorityClassMap[task.priority]}`}>
          {t(priorityLabelMap[task.priority])}
        </span>
        <div className="task-card__header-right">
          <span className="task-card__lid">{t('taskCard.lidId')}:{task.lid_id}</span>
          <span className="task-card__deadline">{formatDeadline(task.deadline)}</span>
        </div>
      </div>

      <div className="task-card__meta">
        <p className="task-card__name">
          {task.lid.first_name} {task.lid.last_name}
        </p>
        <span className="task-card__operator">
          <span className="task-card__operator-icon">👤</span>
          {getShortName(task.operator.full_name)}
        </span>
      </div>

      {task.description ? (
        <div className="task-card__comment-box">
          <span className="task-card__comment-label">{t('taskCard.managerComment')}:</span> {task.description}
          <span className="task-card__comment-time">{formatDeadline(task.created_at)}</span>
        </div>
      ) : null}

      {comments.map((c) => (
        <div key={c.id} className="task-card__comment-box">
          <span className="task-card__comment-label">{t('taskCard.operatorComment')}:</span> {c.comment}
          <span className="task-card__comment-time">{formatDeadline(c.created_at)}</span>
        </div>
      ))}

      {role === 'operator' && (
        <OperatorSection
          status={task.status}
          pendingStatus={pendingStatus}
          onStart={() => handleStatus('bajarish')}
          onRequestFinish={(s) => setPendingStatus(s)}
          onCancelFinish={() => setPendingStatus(null)}
          onCommentAndFinish={handleCommentAndFinish}
          loading={isMutating}
        />
      )}

      {role === 'manager' && (
        <div className="task-card__actions">
          <button
            type="button"
            className="task-card__btn task-card__btn--tahrirlash"
            onClick={() => onEdit(task)}
          >
            ✏ {t('taskCard.editBtn')}
          </button>
          <button
            type="button"
            className="task-card__btn task-card__btn--ochirish"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            ✕ {t('taskCard.deleteBtn')}
          </button>
        </div>
      )}
    </div>
  );
}

interface OperatorSectionProps {
  status: Task['status'];
  pendingStatus: 'bajarildi' | 'bajarilmadi' | null;
  onStart: () => void;
  onRequestFinish: (s: 'bajarildi' | 'bajarilmadi') => void;
  onCancelFinish: () => void;
  onCommentAndFinish: (comment: string) => void;
  loading: boolean;
}

function OperatorSection({
  status,
  pendingStatus,
  onStart,
  onRequestFinish,
  onCancelFinish,
  onCommentAndFinish,
  loading,
}: OperatorSectionProps) {
  const { t } = useTranslation();

  if (status === 'bajarildi') {
    return (
      <div className="task-card__status-label task-card__status-label--yakunlangan">
        {t('taskCard.status.completed')}
      </div>
    );
  }

  if (status === 'bajarilmadi') {
    return (
      <div className="task-card__status-label task-card__status-label--bajarilmadi">
        ✕ {t('taskCard.status.failed')}
      </div>
    );
  }

  if (status === 'yangi') {
    return (
      <div className="task-card__actions">
        <button
          type="button"
          className="task-card__btn task-card__btn--bajarish"
          onClick={onStart}
          disabled={loading}
        >
          ▶ {t('taskCard.btn.start')}
        </button>
        <button
          type="button"
          className="task-card__btn task-card__btn--bajarildi"
          onClick={() => onRequestFinish('bajarildi')}
          disabled={loading}
        >
          ✓ {t('taskCard.btn.done')}
        </button>
        <button
          type="button"
          className="task-card__btn task-card__btn--bajarilmadi"
          onClick={() => onRequestFinish('bajarilmadi')}
          disabled={loading}
        >
          ✕ {t('taskCard.btn.notDone')}
        </button>
      </div>
    );
  }

  if (status === 'bajarish') {
    if (pendingStatus !== null) {
      return (
        <CommentBeforeFinish
          pendingStatus={pendingStatus}
          onSubmit={onCommentAndFinish}
          onCancel={onCancelFinish}
          loading={loading}
        />
      );
    }

    return (
      <div className="task-card__actions">
        <div className="task-card__status-label task-card__status-label--bajarilmoqda">
          {t('taskCard.status.inProgress')}
        </div>
        <button
          type="button"
          className="task-card__btn task-card__btn--bajarildi"
          onClick={() => onRequestFinish('bajarildi')}
          disabled={loading}
        >
          ✓ {t('taskCard.btn.done')}
        </button>
        <button
          type="button"
          className="task-card__btn task-card__btn--bajarilmadi"
          onClick={() => onRequestFinish('bajarilmadi')}
          disabled={loading}
        >
          ✕ {t('taskCard.btn.notDone')}
        </button>
      </div>
    );
  }

  return null;
}

interface CommentBeforeFinishProps {
  pendingStatus: 'bajarildi' | 'bajarilmadi';
  onSubmit: (comment: string) => void;
  onCancel: () => void;
  loading: boolean;
}

function CommentBeforeFinish({
  pendingStatus,
  onSubmit,
  onCancel,
  loading,
}: CommentBeforeFinishProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const value = inputRef.current?.value.trim();
    if (value) onSubmit(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const btnClass =
    pendingStatus === 'bajarildi'
      ? 'task-card__btn task-card__btn--bajarildi'
      : 'task-card__btn task-card__btn--bajarilmadi';

  const btnLabel = pendingStatus === 'bajarildi' ? `✓ ${t('taskCard.btn.done')}` : `✕ ${t('taskCard.btn.notDone')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className="task-card__comment-form">
        <input
          ref={inputRef}
          className="task-card__comment-input"
          placeholder={t('taskCard.writeCommentPlaceholder')}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      </div>
      <div className="task-card__actions">
        <button
          type="button"
          className="task-card__btn task-card__btn--ochirish"
          onClick={onCancel}
          disabled={loading}
          style={{ flex: '0 0 auto', padding: '10px 16px' }}
        >
          {t('taskCard.btn.cancel')}
        </button>
        <button type="button" className={btnClass} onClick={handleSubmit} disabled={loading}>
          {loading ? '...' : btnLabel}
        </button>
      </div>
    </div>
  );
}
