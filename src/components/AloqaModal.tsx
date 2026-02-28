import { useState } from 'react';
import type { Lead } from '../pages/lid';
import ModalPattern from './ModalPattern';

interface AloqaModalProps {
  lead: Lead;
  onConfirm: (subStatus: string) => void;
  onCancel: () => void;
}

const STATUS_ITEMS = [
  {
    id: 'ornatildi',
    title: "Aloqa o'rnatildi",
    desc: "Mijoz bilan aloqaga o'tkazildi",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12.4 19.79 19.79 0 0 1 1.62 3.78 2 2 0 0 1 3.59 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.58a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'ornatilmadi',
    title: "Aloqa o'rnatilmadi",
    desc: "Qo'ng'iroqqa javob bermadi",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'qiziqmadi',
    title: 'Qiziqmadi',
    desc: "Xizmat ma'qul kelmadi",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path
          d="M8 15s1.5-2 4-2 4 2 4 2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="9" cy="9" r="1" fill="currentColor" />
        <circle cx="15" cy="9" r="1" fill="currentColor" />
      </svg>
    ),
  },
];

export default function AloqaModal({ lead, onConfirm, onCancel }: AloqaModalProps) {
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
          <div className="modal-lead-card__group">ALOQA BO'LIMI</div>
        </div>
      </div>

      <div className="modal-tabs">
        <button className="modal-tab" type="button">
          Shartnoma va to'lov
        </button>
        <button className="modal-tab modal-tab--active" type="button">
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
