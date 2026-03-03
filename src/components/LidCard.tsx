import { useCallback, useRef, memo } from 'react';
import type { Lid } from '../pages/lid/lid.types';
import { formatGender, getSourceLabel } from '../pages/lid/lid.types';
import { getOperatorFullName } from '../pages/lid/lid.service';
import { LID_STATUS } from '../pages/lid/lid.types';

interface LeadCardProps {
  lead: Lid;
  color: string;
  hideComment?: boolean;
  onDragStart: (id: number) => void;
  onClick: (lead: Lid) => void;
}

const DRAG_THRESHOLD = 5;

function formatDateParts(dateStr: string) {
  const clean = dateStr.split('.')[0];
  const [datePart, timePart] = clean.split('T');

  if (!datePart || !timePart) {
    return { time: '', date: '' };
  }

  const [year, month, day] = datePart.split('-');
  const [hours, minutes] = timePart.split(':');

  return {
    time: `${hours}:${minutes}`,
    date: `${day}.${month}.${year}`,
  };
}

function LeadCard({ lead, color, onDragStart, onClick, hideComment }: LeadCardProps) {
  const { time, date } = formatDateParts(lead.created_at);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);

  const shouldHideComment =
    hideComment || lead.status === LID_STATUS.NEW_ONLINE || lead.status === LID_STATUS.NEW_OFFLINE;

  const handleDragStart = useCallback(() => {
    isDraggingRef.current = true;
    onDragStart(lead.id);
  }, [onDragStart, lead.id]);

  const handleDragEnd = useCallback(() => {
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 0);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    isDraggingRef.current = false;
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isDraggingRef.current) return;
      if (!pointerStartRef.current) return;

      const dx = Math.abs(e.clientX - pointerStartRef.current.x);
      const dy = Math.abs(e.clientY - pointerStartRef.current.y);

      if (dx < DRAG_THRESHOLD && dy < DRAG_THRESHOLD) {
        onClick(lead);
      }

      pointerStartRef.current = null;
    },
    [onClick, lead],
  );

  return (
    <div
      className="lead-card"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      role="article"
      aria-label={`Lead: ${lead.first_name} ${lead.last_name}, ID: ${lead.id}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(lead);
        }
      }}
    >
      <div className="lead-card__top">
        <span className="lead-card__badge lead-card__badge--source">
          {getSourceLabel(lead.source)}
        </span>
        <span
          className={`lead-card__badge lead-card__badge--${
            lead.gender === 'male' ? 'male' : 'female'
          }`}
        >
          {formatGender(lead.gender)}
        </span>
      </div>

      <div className="lead-card__id">ID: {lead.id}</div>
      <div className="lead-card__name">
        {lead.first_name} {lead.last_name}
      </div>
      <div className="lead-card__phone">{lead.phone}</div>

      <div className="lead-card__meta">
        {lead.course?.name && (
          <span className="lead-card__course" style={{ backgroundColor: color, color: '#fff' }}>
            {lead.course.name}
          </span>
        )}

        <div className="lead-card__date">
          <span className="lead-card__time">{time}</span>
          <span className="lead-card__date-text">{date}</span>
        </div>
      </div>

      <div className="lead-card__group">
        {lead.level?.name && <span className="lead-card__level">{lead.level.name}</span>}

        {lead.group?.name && <span className="lead-card__group-name">{lead.group.name}</span>}
      </div>

      {!shouldHideComment && lead.comment && (
        <div className="lead-card__note-section">
          <div className="lead-card__note-label">IZOH</div>
          <div className="lead-card__note">{lead.comment}</div>
        </div>
      )}

      <div className="lead-card__operator">Operator: {getOperatorFullName(lead.operator)}</div>
    </div>
  );
}

export default memo(LeadCard);
