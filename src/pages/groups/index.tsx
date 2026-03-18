import { useState, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import './groups.css';
import { API } from '../../api/api';

interface Branch {
  id: number;
  name: string;
  city: string;
  address: string;
  phone: string;
}

interface Level {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

interface Course {
  id: number;
  name: string;
  description: string;
  branch_id: number;
  level: Level;
  is_active: number;
}

interface Level {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

interface Room {
  id: number;
  name: string;
  capacity: number;
}

interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
  middle_name: string;
  branch_id: number;
  phone: string;
}

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  middle_name: string;
  branch_id: number;
  phone: string;
}

interface Group {
  id: number;
  name: string;
  branch: Branch;
  course: Course;
  level: Level;
  teacher: Teacher | null;
  room: Room | null;
  duration: number;
  max_students: number;
  start_date: string | null;
  end_date: string | null;
  start_time: string;
  end_time: string;
  days: string[];
}

interface GroupsApiResponse {
  data: Group[];
  meta?: {
    last_page: number;
    total: number;
    current_page: number;
  };
  last_page?: number;
  total?: number;
}

interface GroupCreatePayload {
  name: string;
  branch_id: number;
  course_id: number;
  level_id: number;
  teacher_id: number;
  room_id: number;
  duration: number;
  max_students: number;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  days: { day: string }[];
}

interface FilterState {
  courseId: string;
  levelId: string;
  teacherId: string;
  search: string;
}

interface TimeInputProps {
  value: string;
  onChange: (val: string) => void;
}

type WeekDayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

interface WeekDayOption {
  key: WeekDayKey;
  short: string;
}

const WEEK_DAYS: WeekDayOption[] = [
  { key: 'monday', short: 'Du' },
  { key: 'tuesday', short: 'Se' },
  { key: 'wednesday', short: 'Ch' },
  { key: 'thursday', short: 'Pa' },
  { key: 'friday', short: 'Ju' },
  { key: 'saturday', short: 'Sha' },
];

const DAY_SHORT: Record<string, string> = {
  monday: 'Du',
  tuesday: 'Se',
  wednesday: 'Ch',
  thursday: 'Pa',
  friday: 'Ju',
  saturday: 'Sha',
};

const DAY_INDEX: Record<WeekDayKey, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

function formatDays(days: string[]): string {
  return days?.map((d) => DAY_SHORT[d] ?? d).join(', ');
}

function parseTimeToMinutes(time: string): number {
  if (!time) return 0;

  const isPM = /PM/i.test(time);
  const clean = time.replace(/AM|PM/i, '').trim();

  const [hour, minute] = clean.split(':').map(Number);

  let h = hour;

  if (isPM && h < 12) h += 12;
  if (!isPM && h === 12) h = 0;

  return h * 60 + minute;
}

function calcDuration(
  startDate: string,
  endDate: string,
  startTime: string,
  endTime: string,
  days: WeekDayKey[],
): number {
  if (!startDate || !endDate || !startTime || !endTime || days.length === 0) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) return 0;

  const lessonDays = days.map((d) => DAY_INDEX[d]);

  let lessons = 0;
  const current = new Date(start);

  while (current <= end) {
    const day = current.getDay() === 0 ? 7 : current.getDay(); // 🔥 FIX

    if (lessonDays.includes(day)) {
      lessons++;
    }

    current.setDate(current.getDate() + 1);
  }

  const startMin = parseTimeToMinutes(startTime);
  const endMin = parseTimeToMinutes(endTime);

  const diff = endMin - startMin;

  if (diff <= 0) return 0;

  return Math.round(lessons * (diff / 60));
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function useAllCourses() {
  return useQuery<Course[]>({
    queryKey: ['courses', 'all'],
    queryFn: async () => {
      const res = await API.get<{ data: Course[] }>('/courses');
      return Array.isArray(res.data) ? res.data : [];
    },
  });
}

function useRooms() {
  return useQuery<Room[]>({
    queryKey: ['rooms'],
    queryFn: async () => {
      const res = await API.get<{ data: Room[] }>('/rooms');
      return Array.isArray(res.data.data) ? res.data.data : [];
    },
  });
}

function useEmployees() {
  return useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await API.get<{ data: Employee[] } | Employee[]>('/employees');
      if (Array.isArray(res.data)) return res.data;
      if (Array.isArray((res.data as { data: Employee[] }).data)) {
        return (res.data as { data: Employee[] }).data;
      }
      return [];
    },
  });
}

interface GroupsResult {
  groups: Group[];
  lastPage: number;
}

function useGroups(filter: FilterState, page: number) {
  return useQuery<GroupsResult>({
    queryKey: ['groups', page, filter],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit: 10 };

      // if (filter.search) params.search = filter.search;
      // if (filter.levelId) params.level_id = filter.levelId;
      // if (filter.courseId && !filter.levelId) params.course_id = filter.courseId;
      // if (filter.teacherId) params.teacher_id = filter.teacherId;

      const res = await API.get<GroupsApiResponse>('/groups', { params });

      const groups = Array.isArray(res.data.data) ? res.data.data : [];
      groups.sort((a, b) => a.id - b.id);

      const lastPage = res.data.meta?.last_page ?? res.data.last_page ?? 1;

      return { groups, lastPage };
    },
  });
}

function useGroupBranches() {
  return useQuery<Branch[]>({
    queryKey: ['branches'],
    queryFn: async () => {
      const res = await API.get<{ data: Branch[] }>('/branches');
      return Array.isArray(res.data) ? res.data : [];
    },
  });
}

function useGroupCourses(branchId: number | null) {
  return useQuery<Course[]>({
    queryKey: ['group-courses', branchId],
    enabled: !!branchId,
    queryFn: async () => {
      const res = await API.get<{ data: Course[] }>('/courses', {
        params: { branch_id: branchId },
      });
      return Array.isArray(res.data) ? res.data : [];
    },
  });
}

function useGroupLevels(courseId: number | null) {
  return useQuery<Level[]>({
    queryKey: ['group-levels', courseId],
    enabled: !!courseId,
    queryFn: async () => {
      const res = await API.get<{ data: Level[] }>('/levels', {
        params: { course_id: courseId },
      });
      return Array.isArray(res.data) ? res.data : [];
    },
  });
}

function useCreateGroup(onClose: () => void, onCreated: () => void) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, GroupCreatePayload>({
    mutationFn: async (payload: GroupCreatePayload) => {
      await API.post('/groups', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      onCreated();
      onClose();
    },
    onError: (error: Error) => {
      console.error('Group creation failed:', error);
    },
  });
}

interface GroupModalProps {
  onClose: () => void;
  onCreated: () => void;
  groups: Group[];
}

function generateGroupName(courseName: string, levelName: string, existingGroups: Group[]): string {
  if (!courseName || !levelName) return '';

  // 1. Kurs birinchi harfi
  const courseLetter = courseName.trim()[0]?.toUpperCase() ?? '';

  // 2. Level parse (B1 → B + 1)
  const match = levelName.match(/^([A-Za-z]+)(\d+)$/);
  if (!match) return '';

  const [, levelLetter, levelNumber] = match;

  const prefix = `${courseLetter}${levelLetter.toUpperCase()}`;

  // 3. Base number (B1 → 100, B2 → 200)
  const base = Number(levelNumber) * 100;

  // 4. Mavjud grouplarni tekshirish
  const samePrefixGroups = existingGroups.filter((g) => g.name.startsWith(prefix));

  if (samePrefixGroups.length === 0) {
    return `${prefix}-${base + 1}`;
  }

  // 5. Eng katta suffixni topish
  const numbers = samePrefixGroups
    .map((g) => {
      const num = Number(g.name.split('-')[1]);
      return isNaN(num) ? 0 : num;
    })
    .filter(Boolean);

  const max = numbers.length ? Math.max(...numbers) : base;

  return `${prefix}-${max + 1}`;
}

function TimeInput({ value, onChange }: TimeInputProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;

    const val = raw.replace(/[^\d:]/g, '');

    if (val.length > 5) return;

    // partial valid input allow
    if (/^([01]?\d|2[0-3])(:([0-5]?\d)?)?$/.test(val)) {
      // auto ":" qo‘shish
      if (val.length === 2 && !val.includes(':')) {
        onChange(val + ':');
      } else {
        onChange(val);
      }
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const val = e.target.value;

    const match = val.match(/^(\d{1,2}):?(\d{1,2})?$/);

    if (!match) {
      onChange('');
      return;
    }

    const h = Number(match[1]);
    const m = Number(match[2] ?? 0);

    if (h > 23 || m > 59) {
      onChange('');
      return;
    }

    const formatted = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    onChange(formatted);
  }

  return (
    <input
      type="text"
      placeholder="HH:mm"
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      inputMode="numeric"
    />
  );
}

function GroupModal({ onClose, onCreated, groups }: GroupModalProps) {
  const [branchId, setBranchId] = useState<number | null>(null);
  const [courseId, setCourseId] = useState<number | null>(null);
  const [levelId, setLevelId] = useState<number | null>(null);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [days, setDays] = useState<WeekDayKey[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [groupName, setGroupName] = useState('');
  const [isManualName, setIsManualName] = useState(false);

  const { data: branches } = useGroupBranches();
  const { data: courses } = useGroupCourses(branchId);
  const { data: levels } = useGroupLevels(courseId);
  const { data: rooms } = useRooms();
  const { data: employees } = useEmployees();

  const mutation = useCreateGroup(onClose, onCreated);

  const selectedRoom = useMemo(() => {
    if (!roomId || !rooms) return null;
    return rooms.find((r) => r.id === roomId) ?? null;
  }, [roomId, rooms]);

  const duration = calcDuration(startDate, endDate, startTime, endTime, days);

  function toggleDay(day: WeekDayKey) {
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  const autoGroupName = useMemo(() => {
    if (!courseId || !levelId || !groups) return '';

    const course = courses?.find((c) => c.id === courseId);
    const level = levels?.find((l) => l.id === levelId);

    if (!course || !level) return '';

    return generateGroupName(course.name, level.name, groups);
  }, [courseId, levelId, courses, levels, groups]);

  const finalGroupName = isManualName ? groupName : autoGroupName;

  function handleSubmit() {
    if (
      !finalGroupName ||
      !branchId ||
      !courseId ||
      !levelId ||
      !roomId ||
      !teacherId ||
      !startDate ||
      !endDate ||
      !startTime ||
      !endTime ||
      days.length === 0
    ) {
      return;
    }

    mutation.mutate({
      name: finalGroupName.trim(),
      branch_id: branchId,
      course_id: courseId,
      level_id: levelId,
      teacher_id: teacherId,
      room_id: roomId,
      duration,
      max_students: selectedRoom?.capacity ?? 0,
      start_date: startDate,
      end_date: endDate,
      start_time: startTime,
      end_time: endTime,
      days: days.map((d) => ({ day: d })),
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-header-title">Guruh yaratish</span>
          <span className="modal-header-date">📅 {formatDate(new Date())}</span>
        </div>

        <div className="modal-body">
          <div className="modal-row">
            <div className="modal-field">
              <label>Fillial tanlang</label>
              <select
                value={branchId ?? ''}
                onChange={(e) => {
                  setBranchId(Number(e.target.value) || null);
                  setCourseId(null);
                  setLevelId(null);
                }}
              >
                <option value="">Tanlang</option>
                {branches?.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-field">
              <label>Kursni tanlang</label>
              <select
                value={courseId ?? ''}
                disabled={!branchId}
                onChange={(e) => {
                  setCourseId(Number(e.target.value) || null);
                  setLevelId(null);
                }}
              >
                <option value="">Tanlang</option>
                {courses?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-field">
              <label>Daraja</label>
              <select
                value={levelId ?? ''}
                disabled={!courseId}
                onChange={(e) => setLevelId(Number(e.target.value) || null)}
              >
                <option value="">Tanlang</option>
                {levels?.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-row">
            <div className="modal-field">
              <label>Guruh nomi</label>
              <input
                type="text"
                value={finalGroupName}
                placeholder="EN-101"
                onChange={(e) => {
                  setIsManualName(true);
                  setGroupName(e.target.value);
                }}
              />
            </div>

            <div className="modal-field">
              <label>Xona</label>
              <select
                value={roomId ?? ''}
                onChange={(e) => setRoomId(Number(e.target.value) || null)}
              >
                <option value="">Tanlang</option>
                {rooms?.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              {selectedRoom !== null && (
                <span className="modal-field-hint">
                  max o'quvchilar soni: {selectedRoom.capacity}
                </span>
              )}
            </div>

            <div className="modal-field">
              <label>Hafta kunlari</label>
              <div className="modal-days">
                {WEEK_DAYS?.map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    className={`modal-day-btn${days.includes(d.key) ? ' modal-day-btn--active' : ''}`}
                    onClick={() => toggleDay(d.key)}
                  >
                    {d.short}
                  </button>
                ))}
              </div>
              <span className="modal-field-hint">📅 Hafta davomida dars kunlari</span>
            </div>
          </div>

          <div className="modal-row">
            <div className="modal-field">
              <label>Dars boshlanish sanasi</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <span className="modal-field-hint">Birinchi dars kuni (Demo dars)</span>
            </div>

            <div className="modal-field">
              <label>Dars tugash sanasi</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              <span className="modal-field-hint">Kursni eng oxirgi darsi</span>
            </div>

            <div className="modal-field">
              <label>Boshlanish va tugash vaqti</label>
              <div className="modal-time-row">
                <TimeInput value={startTime} onChange={setStartTime} />
                <TimeInput value={endTime} onChange={setEndTime} />
              </div>
            </div>
          </div>

          <div className="modal-row modal-row--two">
            <div className="modal-field">
              <label>Kurs davomiyligi</label>
              <div className="modal-duration-wrap">
                <input type="number" value={duration} readOnly />
                <span className="modal-duration-unit">soat</span>
              </div>
              <span className="modal-field-hint">📅 avtomatik oyda hisoblab oladi</span>
            </div>

            <div className="modal-field">
              <label>O'qtuvchi</label>
              <select
                value={teacherId ?? ''}
                onChange={(e) => setTeacherId(Number(e.target.value) || null)}
              >
                <option value="">Tanlang</option>
                {employees?.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-cancel-btn" onClick={onClose}>
            Bekor qilish
          </button>
          <button className="modal-save-btn" onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface FilterPopoverProps {
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  onClose: () => void;
  employees: Employee[];
}

function FilterPopover({ filter, setFilter, onClose, employees }: FilterPopoverProps) {
  const { data: allCourses } = useAllCourses();
  console.log(allCourses);

  function handleClear() {
    setFilter((prev) => ({ ...prev, courseId: '', levelId: '', teacherId: '' }));
  }

  const courseLevels = useMemo(() => {
    if (!filter.courseId || !allCourses) return [];

    const course = allCourses.find((c) => c.id === Number(filter.courseId));

    return course?.level ? [course.level] : [];
  }, [filter.courseId, allCourses]);

  return (
    <div className="filter-popover">
      <div className="filter-popover-header">
        <span className="filter-popover-title">Filtr</span>
        <button className="filter-popover-close" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="filter-popover-body">
        <div className="filter-popover-field">
          <label>Kurs bo'yicha</label>
          <select
            value={filter.courseId}
            onChange={(e) =>
              setFilter((prev) => ({
                ...prev,
                courseId: e.target.value,
                levelId: '',
                teacherId: '',
              }))
            }
          >
            <option value="">Kurs tanlang</option>
            {allCourses?.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {filter.courseId && (
          <div className="filter-popover-field">
            <label>Daraja bo'yicha</label>
            <select
              value={filter.levelId}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  levelId: e.target.value,
                }))
              }
            >
              <option value="">Daraja tanlang</option>

              {courseLevels.map((l) => (
                <option key={l.id} value={String(l.id)}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="filter-popover-field">
          <label>O'qituvchi bo'yicha</label>
          <select
            value={filter.teacherId}
            onChange={(e) =>
              setFilter((prev) => ({
                ...prev,
                teacherId: e.target.value,
                courseId: e.target.value ? '' : prev.courseId,
                levelId: e.target.value ? '' : prev.levelId,
              }))
            }
          >
            <option value="">O'qituvchi tanlang</option>
            {employees?.map((emp) => (
              <option key={emp.id} value={String(emp.id)}>
                {emp.first_name} {emp.last_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="filter-popover-footer">
        <button className="filter-popover-clear" onClick={handleClear}>
          Filterni tozalash
        </button>
      </div>
    </div>
  );
}

const VISIBLE_PAGES = [1, 2, 3];

const Groups = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<FilterState>({
    courseId: '',
    levelId: '',
    teacherId: '',
    search: '',
  });

  const filterBtnRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useGroups(filter, page);
  const groups = data?.groups;
  const totalPages = data?.lastPage ?? 1;
  const { data: employees } = useEmployees();

  function goToLastPage() {
    setPage((prev) => {
      const last = data?.lastPage ?? prev;
      return last > prev ? last : prev + 1;
    });
  }

  const filteredGroups = useMemo(() => {
    if (!groups) return [];

    return groups.filter((g) => {
      if (filter.courseId && g.course?.id !== Number(filter.courseId)) return false;

      if (filter.levelId && g.level?.id !== Number(filter.levelId)) return false;

      if (filter.teacherId && g.teacher?.id !== Number(filter.teacherId)) return false;

      if (filter.search && !g.name.toLowerCase().includes(filter.search.toLowerCase()))
        return false;

      return true;
    });
  }, [groups, filter]);

  return (
    <section className="groups container">
      <div className="groups-top">
        <h1 className="groups-top-title">Guruh yaratih</h1>
        <div className="groups-top-right">
          <div className="groups-search">
            <svg
              className="groups-search-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Ma'lumotlarni qidirish..."
              value={filter.search}
              onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
            />
          </div>

          <div ref={filterBtnRef} className="groups-filter-wrap">
            <button className="groups-filter-btn" onClick={() => setFilterOpen((v) => !v)}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="8" y1="12" x2="16" y2="12" />
                <line x1="12" y1="18" x2="12" y2="18" />
              </svg>
              Saralash
            </button>

            {filterOpen && (
              <FilterPopover
                filter={filter}
                setFilter={setFilter}
                onClose={() => setFilterOpen(false)}
                employees={employees ?? []}
              />
            )}
          </div>

          <button className="groups-add-btn" onClick={() => setModalOpen(true)}>
            Guruh yaratish
          </button>
        </div>
      </div>

      <div className="groups-content">
        <table className="groups-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Guruh nomi</th>
              <th>Kurs</th>
              <th>Daraja</th>
              <th>Kurs davomiyligi</th>
              <th>O'quvchilar soni</th>
              <th>Hafta kunlari</th>
              <th>O'qituvchi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="groups-table-loading">
                  Yuklanmoqda...
                </td>
              </tr>
            ) : !groups || groups.length === 0 ? (
              <tr>
                <td colSpan={8} className="groups-table-empty">
                  Ma'lumot topilmadi
                </td>
              </tr>
            ) : (
              filteredGroups?.map((group) => (
                <tr key={group.id}>
                  <td>{group.id}</td>
                  <td>{group.name}</td>
                  <td>{group.course?.name}</td>
                  <td>{group.level?.name}</td>
                  <td>{group.duration} soat</td>
                  <td>{group.max_students}</td>
                  <td>{formatDays(group.days)}</td>
                  <td>
                    {group.teacher ? `${group.teacher.first_name} ${group.teacher.last_name}` : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="groups-pagination">
          <button className="groups-page-btn" onClick={() => setPage((p) => Math.max(1, p - 1))}>
            ‹
          </button>

          {VISIBLE_PAGES?.map((p) => (
            <button
              key={p}
              className={`groups-page-btn${page === p ? ' groups-page-btn--active' : ''}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}

          <span className="groups-page-dots">...</span>

          <button
            className={`groups-page-btn${page === totalPages ? ' groups-page-btn--active' : ''}`}
            onClick={() => setPage(totalPages)}
          >
            {totalPages}
          </button>

          <button
            className="groups-page-btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            ›
          </button>
        </div>
      </div>

      {modalOpen && (
        <GroupModal
          onClose={() => setModalOpen(false)}
          groups={groups ?? []}
          onCreated={goToLastPage}
        />
      )}
    </section>
  );
};

export default Groups;
