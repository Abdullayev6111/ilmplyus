import { API } from '../../api/api';
import type {
  LidsPaginatedResponse,
  LidsQueryParams,
  LidComment,
  LidOperator,
  Lid,
  LidStatus,
} from './lid.types';

export async function fetchLids(params: LidsQueryParams): Promise<LidsPaginatedResponse> {
  const { data } = await API.get<LidsPaginatedResponse>('/lids', { params });
  return data;
}

export async function deleteLid(id: number): Promise<void> {
  await API.delete(`/lids/${id}`);
}

export async function getLidComments(lidId: number): Promise<LidComment[]> {
  const { data } = await API.get<LidComment[]>(`/lids/${lidId}/comment`);
  return data;
}

export async function addLidComment(lidId: number, text: string): Promise<LidComment> {
  const { data } = await API.post<LidComment>(`/lids/${lidId}/comment`, { text });
  return data;
}

export function getOperatorFullName(operator: LidOperator | null | undefined): string {
  if (!operator) return '—';

  return `${operator.last_name} ${operator.first_name} `.trim();
}

export async function updateLidStatus(
  id: number,
  status: LidStatus,
  operator_id: number,
): Promise<Lid> {
  const { data } = await API.patch<Lid>(`/lids/${id}`, {
    status,
    operator_id,
  });

  return data;
}
