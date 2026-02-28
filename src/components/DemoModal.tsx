import { useState } from 'react';
import type { Lead } from '../pages/lid';
import ModalPattern from './ModalPattern';

interface DemoModalProps {
  lead: Lead;
  onConfirm: (subStatus: string) => void;
  onCancel: () => void;
}

const STATUS_ITEMS = [
  {
    id: 'keldi',
    title: 'Keldi',
    desc: 'Mijoz demo darsga keldi',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
        <path
          d="M23 21v-2a4 4 0 0 0-3-3.87"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: 'kelmoqchi',
    title: 'Kelmoqchi',
    desc: 'Mijozda qiziqish bor va kelmoqchi',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'kelmadi',
    title: 'Kelmadi',
    desc: "Xizmat ma'qul kelmadi",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M18 6L6 18M6 6l12 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export default function DemoModal({ lead, onConfirm, onCancel }: DemoModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const handleConfirm = () => {
    if (!selectedStatus) return;
    onConfirm(selectedStatus);
  };

  return (
    <ModalPattern title="HOLATNI TAHRIRLASH" onCancel={onCancel}>
      <div className="modal-lead-card">
        <div className="modal-lead-card__icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
              stroke="#ff9800"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="7" r="4" stroke="#ff9800" strokeWidth="2" />
          </svg>
        </div>
        <div className="modal-lead-card__info">
          <div className="modal-lead-card__name">{lead.fullName}</div>
          <div className="modal-lead-card__group">DEMO DARS</div>
        </div>
      </div>

      <div className="modal-tabs">
        <button className="modal-tab" type="button">
          Shartnoma va to'lov
        </button>
        <button className="modal-tab" type="button">
          Aloqa
        </button>
        <button className="modal-tab modal-tab--active" type="button">
          Demo dars
        </button>
      </div>

      <div className="modal-section">
        <div className="modal-section-title">Sub-status</div>
        {STATUS_ITEMS.map((item) => {
          const isSelected = selectedStatus === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`modal-status-card${isSelected ? ' modal-status-card--selected' : ''}`}
              onClick={() => setSelectedStatus(isSelected ? null : item.id)}
              aria-pressed={isSelected}
            >
              <div className="modal-status-card__icon" aria-hidden="true">
                {item.icon}
              </div>
              <div className="modal-status-card__content">
                <div className="modal-status-card__title">{item.title}</div>
                <div className="modal-status-card__desc">{item.desc}</div>
              </div>
              {isSelected && (
                <div className="modal-status-card__check" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 6L9 17l-5-5"
                      stroke="#ff9800"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="modal-section">
        <div className="modal-section-title">Izoh(IXTIYORIY)</div>
        <textarea
          className="modal-textarea"
          placeholder="Izoh yozing..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
        />
      </div>

      <div className="modal-actions">
        <button className="modal-btn modal-btn--cancel" onClick={onCancel} type="button">
          Bekor qilish
        </button>
        <button
          className="modal-btn modal-btn--confirm"
          onClick={handleConfirm}
          type="button"
          disabled={!selectedStatus}
        >
          Saqlash
        </button>
      </div>
    </ModalPattern>
  );
}
