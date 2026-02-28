import { useState } from 'react';
import type { Lead } from '../pages/lid';
import ModalPattern from './ModalPattern';

interface ShartnomaModalProps {
  lead: Lead;
  onConfirm: (subStatus: string) => void;
  onCancel: () => void;
}

const STATUS_ITEMS = [
  {
    id: 'shartnoma-qildi',
    title: 'Shartnoma qildi',
    desc: 'Mijoz shartnoma imzoladi',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: 'tolov-qildi',
    title: "To'lov qildi",
    desc: "Mijoz to'lovni amalga oshirdi",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="1" y="4" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M1 10h22" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
];

export default function ShartnomaModal({ lead, onConfirm, onCancel }: ShartnomaModalProps) {
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
          <div className="modal-lead-card__group">SHARTNOMA VA TO'LOV</div>
        </div>
      </div>

      <div className="modal-tabs">
        <button className="modal-tab modal-tab--active" type="button">
          Shartnoma va to'lov
        </button>
        <button className="modal-tab" type="button">
          Aloqa
        </button>
        <button className="modal-tab" type="button">
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
