import { useEffect, useRef, useCallback, memo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import type { Lid, LidComment } from '../../pages/lid/lid.types';
import { getName, formatGender } from '../../pages/lid/lid.types';
import { getLidComments, addLidComment } from '../../pages/lid/lid.service';
import './LeadDetailsModal.css';

interface LeadDetailsModalProps {
  lead: Lid;
  onClose: () => void;
}

const SOURCE_ICONS: Record<string, ReactElement> = {
  telegram: <i className="fa-brands fa-telegram" />,
  instagram: <i className="fa-brands fa-instagram" />,
  facebook: <i className="fa-brands fa-facebook" />,
};

function LeadDetailsModal({ lead, onClose }: LeadDetailsModalProps) {
  const [note, setNote] = useState<string>('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const queryClient = useQueryClient();

  const { data: comments } = useQuery<LidComment[]>({
    queryKey: ['lid-comments', lead.id],
    queryFn: () => getLidComments(lead.id),
    enabled: !!lead.id,
  });

  const addCommentMutation = useMutation({
    mutationFn: (text: string) => addLidComment(lead.id, text),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['lid-comments', lead.id],
      });
      setNote('');
    },
  });

  useEffect(() => {
    closeBtnRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();

      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  const handleSave = useCallback(() => {
    const trimmed = note.trim();
    if (!trimmed) return;
    addCommentMutation.mutate(trimmed);
  }, [note, addCommentMutation]);

  const fullName = `${lead.first_name ?? ''} ${lead.last_name ?? ''}`.trim() || '—';

  const sourceName = lead.source?.name ?? '';
  const sourceKey = sourceName.toLowerCase();
  const sourceLabel = sourceName ? sourceName.toUpperCase() : '—';

  const registrationDate = (() => {
    const d = new Date(lead.created_at);
    if (isNaN(d.getTime())) return '—';

    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${hours}:${minutes} ${day}.${month}.${year}`;
  })();

  return (
    <div
      className="ldm-overlay"
      role="presentation"
      onClick={handleBackdropClick}
      aria-hidden="false"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ldm-title"
        aria-describedby="ldm-desc"
        className="ldm-container"
      >
        <button
          ref={closeBtnRef}
          className="ldm-close-btn"
          type="button"
          onClick={onClose}
          aria-label="Modalni yopish"
        >
          <i className="fa-solid fa-xmark" />
        </button>

        <div className="ldm-header">
          <div className="ldm-avatar">
            <i className="fa-solid fa-user-graduate" />
          </div>

          <div className="ldm-header-info">
            <h2 id="ldm-title" className="ldm-fullname">
              {fullName.toUpperCase()}
            </h2>

            <div className="ldm-meta-row">
              <span className="ldm-meta-item">
                <i className="fa-solid fa-id-card ldm-meta-icon" />
                <span className="ldm-meta-label"># ID: {lead.id}</span>
              </span>

              <span className="ldm-meta-item">
                <i className="fa-solid fa-calendar ldm-meta-icon" />
                <span className="ldm-meta-label">REGISTRATSIYA VAQTI: {registrationDate}</span>
              </span>
            </div>

            <div className="ldm-meta-row">
              <span className="ldm-gender">{formatGender(lead.gender).toUpperCase()}</span>

              <span className="ldm-meta-item">
                <i className="fa-solid fa-location-dot ldm-meta-icon" />
                <span className="ldm-meta-label">{(lead.district?.name ?? '—').toUpperCase()}</span>
              </span>
            </div>
          </div>

          <div className="ldm-header-right">
            <button type="button" className="ldm-source-btn">
              <span>{SOURCE_ICONS[sourceKey] ?? <i className="fa-solid fa-globe" />}</span>{' '}
              {sourceLabel}
            </button>

            <button type="button" className="ldm-phone-btn">
              <i className="fa-solid fa-phone" /> {lead.phone ?? '—'}
            </button>
          </div>
        </div>

        <div id="ldm-desc" className="ldm-body">
          <div className="ldm-education">
            <div className="ldm-section-header">
              <i className="fa-solid fa-graduation-cap ldm-section-icon" />
              <span className="ldm-section-title">TA'LIM</span>
            </div>

            <div className="ldm-edu-field">
              <span className="ldm-edu-label">KURS:</span>
              <span className="ldm-edu-value">{getName(lead.course)}</span>
            </div>

            <div className="ldm-edu-field">
              <span className="ldm-edu-label">BOSQICH:</span>
              <span className="ldm-edu-value">{getName(lead.level)}</span>
            </div>

            <div className="ldm-edu-field">
              <span className="ldm-edu-label">GURUH:</span>
              <span className="ldm-edu-value">{getName(lead.group)}</span>
            </div>
          </div>

          <div className="ldm-note-section">
            <div className="ldm-note-label">IZOH:</div>

            <textarea
              className="ldm-note-textarea"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              aria-label="Izoh"
            />

            <button
              type="button"
              className="ldm-save-btn"
              onClick={handleSave}
              disabled={addCommentMutation.isPending}
            >
              SAQLASH
            </button>
          </div>
        </div>

        {comments?.length ? (
          <div className="ldm-comments">
            {comments.map((c) => {
              const d = new Date(c.created_at);
              const formatted = isNaN(d.getTime())
                ? '—'
                : `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(
                    2,
                    '0',
                  )} ${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(
                    2,
                    '0',
                  )}.${d.getFullYear()}`;

              const authorName = `${c.user.first_name ?? ''} ${c.user.last_name ?? ''}`.trim();

              return (
                <div key={c.id} className="ldm-comment-card">
                  <div className="ldm-comment-author">
                    <i className="fa-solid fa-user" /> {authorName || '—'}
                  </div>
                  <p className="ldm-comment-text">{c.text}</p>
                  <div className="ldm-comment-date">
                    <i className="fa-solid fa-clock" /> {formatted}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default memo(LeadDetailsModal);
