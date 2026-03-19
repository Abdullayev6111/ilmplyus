import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LID_STATUS, type Lid } from '../pages/lid/lid.types';
import ModalPattern from './ModalPattern';
import type { LidStatus } from '../pages/lid/lid.types';

interface DemoModalProps {
  lead: Lid;
  onConfirm: (subStatus: LidStatus) => void;
  onCancel: () => void;
}

const STATUS_ITEMS: Array<{
  id: LidStatus;
  title: string;
  desc: string;
  icon: React.ReactNode;
}> = [
  {
    id: LID_STATUS.DEMO_ATTENDED,
    title: 'lid.statuses.demoAttended.title',
    desc: 'lid.statuses.demoAttended.desc',
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
    id: LID_STATUS.DEMO_SCHEDULED,
    title: 'lid.statuses.demoScheduled.title',
    desc: 'lid.statuses.demoScheduled.desc',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: LID_STATUS.DEMO_MISSED,
    title: 'lid.statuses.demoMissed.title',
    desc: 'lid.statuses.demoMissed.desc',
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
  const { t } = useTranslation();
  const [selectedStatus, setSelectedStatus] = useState<LidStatus | null>(null);
  const [note, setNote] = useState('');

  const handleConfirm = () => {
    if (!selectedStatus) return;
    onConfirm(selectedStatus);
  };

  return (
    <ModalPattern title={t('lid.modals.editStatus')} onCancel={onCancel}>
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
          <div className="modal-lead-card__name">
            {lead.first_name && lead.last_name
              ? `${lead.first_name} ${lead.last_name}`
              : lead.first_name || lead.last_name || t('lid.modals.unknown')}
          </div>
          <div className="modal-lead-card__group">{t('lid.modals.demoClass')}</div>
        </div>
      </div>

      <div className="modal-tabs">
        <button className="modal-tab" type="button">
          {t('lid.modals.tabContract')}
        </button>
        <button className="modal-tab" type="button">
          {t('lid.modals.tabContact')}
        </button>
        <button className="modal-tab modal-tab--active" type="button">
          {t('lid.modals.tabDemo')}
        </button>
      </div>

      <div className="modal-section">
        <div className="modal-section-title">{t('lid.modals.subStatus')}</div>
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
                <div className="modal-status-card__title">{t(item.title)}</div>
                <div className="modal-status-card__desc">{t(item.desc)}</div>
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
        <div className="modal-section-title">{t('lid.modals.noteOptional')}</div>
        <textarea
          className="modal-textarea"
          placeholder={t('lid.modals.writeNote')}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
        />
      </div>

      <div className="modal-actions">
        <button className="modal-btn modal-btn--cancel" onClick={onCancel} type="button">
          {t('lid.modals.cancel')}
        </button>
        <button
          className="modal-btn modal-btn--confirm"
          onClick={handleConfirm}
          type="button"
          disabled={!selectedStatus}
        >
          {t('lid.modals.save')}
        </button>
      </div>
    </ModalPattern>
  );
}
