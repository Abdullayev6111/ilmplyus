import { useCallback, useRef, memo } from 'react';
import type { Lid } from '../pages/lid/lid.types';
import { getName, formatGender, getSourceLabel } from '../pages/lid/lid.types';
import { getOperatorFullName } from '../pages/lid/lid.service';

interface LeadCardProps {
  lead: Lid;
  color: string;
  onDragStart: (id: number) => void;
  onClick: (lead: Lid) => void;
}

const DRAG_THRESHOLD = 5;

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${hours}:${minutes} ${day}.${month}.${year}`;
}

function LeadCard({ lead, color, onDragStart, onClick }: LeadCardProps) {
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);

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
        <span className="lead-card__course" style={{ color }}>
          {getName(lead.course)}
        </span>
        <span className="lead-card__date">{formatDate(lead.created_at)}</span>
      </div>

      {lead.comment && (
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
