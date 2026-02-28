export type StudentSource = 'Instagram' | 'Telegram' | 'Website';
export type StudentGender = 'Erkak' | 'Ayol';

export interface DirectionNode {
  label: string;
  sub: string[];
}

export interface FilterState {
  sources: StudentSource[];
  genders: StudentGender[];
  directions: {
    main: string[];
    sub: string[];
  };
}

export const EMPTY_FILTER: FilterState = {
  sources: [],
  genders: [],
  directions: { main: [], sub: [] },
};

export const SOURCES: StudentSource[] = ['Instagram', 'Telegram', 'Website'];
export const GENDERS: StudentGender[] = ['Erkak', 'Ayol'];

export const DIRECTIONS: DirectionNode[] = [
  { label: 'English', sub: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'IELTS'] },
  { label: 'Matematika', sub: ['1-daraja', '2-daraja', '3-daraja'] },
  { label: 'Fizika', sub: ['Asosiy', 'Olimpiya'] },
  { label: 'Kimyo', sub: ['Umumiy', 'Organik'] },
  { label: 'Dasturlash', sub: ['Python', 'JavaScript', 'Java', 'C++'] },
];
