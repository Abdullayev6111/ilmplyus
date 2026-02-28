export interface LidRegion {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface LidDistrict {
  id: number;
  region_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface LidBranch {
  id: number;
  name: string;
  city: string;
  has_contract: number;
  director_name: string;
  address: string;
  postal_code: string;
  legal_name: string;
  inn: string;
  phone: string;
  email: string;
  bank_name: string;
  account_number: string;
  mfo: string;
  oked: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface LidCourse {
  id: number;
  name: string;
  description: string;
  branch_id: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface LidLevel {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface LidGroup {
  id: number;
  name: string;
  branch_id: number;
  course_id: number;
  teacher_id: number;
  monthly_price: string;
  start_date: string;
  end_date: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface LidSource {
  id: number;
  name: string;
  link: string;
  created_at: string;
  updated_at: string;
}

export interface Lid {
  id: number;
  first_name: string;
  last_name: string;
  father_name: string | null;
  birth_date: string | null;
  gender: 'male' | 'female';
  phone: string;
  region_id: number | null;
  district_id: number | null;
  branch_id: number | null;
  course_id: number | null;
  level_id: number | null;
  group_id: number | null;
  source_id: number | null;
  comment: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  region: LidRegion | null;
  district: LidDistrict | null;
  branch: LidBranch | null;
  course: LidCourse | null;
  level: LidLevel | null;
  group: LidGroup | null;
  source: LidSource | null;
  operator: LidOperator | null;
}

export interface LidOperator {
  id: number;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  branch_id: number;
}

export interface LidsPaginatedResponse {
  data: Lid[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
}

export interface LidComment {
  id: number;
  lid_id: number;
  text: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

export interface LidsQueryParams {
  page: number;
  per_page: number;
}

export function getName(obj: { name: string } | null | undefined): string {
  return obj?.name ?? '—';
}

export function formatGender(gender: Lid['gender']): string {
  return gender === 'male' ? 'Erkak' : 'Ayol';
}

export function getSourceKey(source: LidSource | null | undefined): string {
  if (!source) return '';
  return source.name.toLowerCase();
}

export function getSourceLabel(source: LidSource | null | undefined): string {
  if (!source) return '—';
  return source.name.toUpperCase();
}
