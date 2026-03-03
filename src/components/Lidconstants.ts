import type { LidStatus } from '../pages/lid/lid.types';

export const SUB_STATUS_COLUMN_MAP: Record<string, LidStatus> = {
  online: 1,
  offline: 2,
  contacted: 3,
  not_contacted: 4,
  not_interested: 5,
  demo_scheduled: 6,
  demo_attended: 7,
  demo_missed: 8,
  contract_signed: 9,
  paid: 10,
};
