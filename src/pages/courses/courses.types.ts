export type Role = 'operator' | 'manager';

export type HolatStatus = 'Jarayonda' | 'Tasdiqlangan' | 'Rad etilgan';

export interface CourseLevel {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface BranchMeta {
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

export interface CourseMeta {
  id: number;
  name: string;
  description: string;
  branch_id: number;
  level_id: number;
  is_active: number;
  created_at: string;
  updated_at: string;
  level: CourseLevel;
}

export interface CoursePrice {
  id: number;
  branch_id: number;
  course_id: number;
  old_price: string;
  new_price: string;
  lessons_count: number;
  lesson_price: string;
  percentage: number;
  start_date: string;
  comment: string | null;
  created_at: string;
  updated_at: string;
  course: CourseMeta;
  branch: BranchMeta;
  holat?: HolatStatus;
}

export interface CoursePriceListResponse {
  current_page: number;
  data: CoursePrice[];
  from: number;
  last_page: number;
  to: number;
  total: number;
}

export interface SaveCoursePayload {
  branch_id: number;
  course_id: number;
  old_price: number;
  new_price: number;
  lessons_count: number;
  lesson_price: number;
  percentage: number;
  start_date: string;
  comment: string;
}

export interface AddCourseFormState {
  filial: string;
  kurs: string;
  new_price: string;
  lessons_count: string;
  start_date: string;
  comment: string;
}

export interface AddCourseFormErrors {
  filial?: string;
  kurs?: string;
  new_price?: string;
  lessons_count?: string;
  start_date?: string;
}

export interface CoursesFilterState {
  courseName: string;
  levelName: string;
  branchName: string;
  dateFrom: string;
  dateTo: string;
}

export const EMPTY_COURSES_FILTER: CoursesFilterState = {
  courseName: '',
  levelName: '',
  branchName: '',
  dateFrom: '',
  dateTo: '',
};
