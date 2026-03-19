import { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API } from '../../api/api';
import './attendance.css';
import { useTranslation } from 'react-i18next';

type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused';

interface Employee {
  full_name: string;
  role: string;
  avatar: string | null;
}

interface AttendanceRecord {
  id: number;
  employee: string;
  employee_role: string | null;
  employee_avatar: string | null;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: AttendanceStatus;
  comment: string | null;
}

interface AttendancePayload {
  employee_id: number;
  date: string;
  check_in: string;
  check_out: string;
  status: AttendanceStatus;
  comment: string;
}

interface AttendanceMap {
  [employeeName: string]: {
    [date: string]: AttendanceRecord;
  };
}

const STATUS_COLORS: Record<AttendanceStatus, string> = {
  present: '#1bb200',
  late: '#fe9100',
  absent: '#ff0000',
  excused: '#3f88c9',
};

const YEAR_RANGE_START = 2020;
const YEAR_RANGE_END = 2030;

const normalizeArray = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (value !== null && typeof value === 'object') {
    const nested = Object.values(value as Record<string, unknown>).find(Array.isArray);
    if (nested) return nested as T[];
  }
  return [];
};

const fetchAttendances = async (year: number, month: number): Promise<AttendanceRecord[]> => {
  const from = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  const { data } = await API.get<unknown>(`/attendances?from=${from}&to=${to}`);
  return normalizeArray<AttendanceRecord>(data);
};

const createAttendance = async (payload: AttendancePayload): Promise<AttendanceRecord> => {
  const { data } = await API.post<AttendanceRecord>('/attendances', payload);
  return data;
};

const getDaysInMonth = (year: number, month: number): Date[] => {
  const count = new Date(year, month, 0).getDate();
  return Array.from({ length: count }, (_, i) => new Date(year, month - 1, i + 1));
};

const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const Attendance = () => {
  const { t } = useTranslation();

  const UZ_WEEKDAYS = [
    t('attendance.weekdays.sun'),
    t('attendance.weekdays.mon'),
    t('attendance.weekdays.tues'),
    t('attendance.weekdays.wed'),
    t('attendance.weekdays.thurs'),
    t('attendance.weekdays.fri'),
    t('attendance.weekdays.sat'),
  ];

  const UZ_MONTHS = [
    t('attendance.month.jan'),
    t('attendance.month.feb'),
    t('attendance.month.mar'),
    t('attendance.month.apr'),
    t('attendance.month.may'),
    t('attendance.month.jun'),
    t('attendance.month.jul'),
    t('attendance.month.aug'),
    t('attendance.month.sept'),
    t('attendance.month.oct'),
    t('attendance.month.nov'),
    t('attendance.month.dec'),
  ];

  const LEGEND_ITEMS: { status: AttendanceStatus; label: string }[] = [
    { status: 'present', label: t('attendance.attendanceStatus.come') },
    { status: 'late', label: t('attendance.attendanceStatus.late') },
    { status: 'absent', label: t('attendance.attendanceStatus.notCome') },
    { status: 'excused', label: t('attendance.attendanceStatus.notComeWithReason') },
  ];

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(today.getFullYear());
  const pickerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    if (pickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [pickerOpen]);

  const { data: attendances = [] } = useQuery<AttendanceRecord[]>({
    queryKey: ['attendances', currentYear, currentMonth],
    queryFn: () => fetchAttendances(currentYear, currentMonth),
  });

  const employees = useMemo<Employee[]>(() => {
    const seen = new Set<string>();
    const result: Employee[] = [];
    for (const record of attendances) {
      if (!seen.has(record.employee)) {
        seen.add(record.employee);
        result.push({
          full_name: record.employee,
          role: record.employee_role ?? '',
          avatar: record.employee_avatar ?? null,
        });
      }
    }
    return result;
  }, [attendances]);

  const mutation = useMutation<AttendanceRecord, Error, AttendancePayload>({
    mutationFn: createAttendance,
    onSuccess: (data) => {
      queryClient.setQueryData<AttendanceRecord[]>(
        ['attendances', currentYear, currentMonth],
        (old = []) => {
          const idx = old.findIndex((r) => r.employee === data.employee && r.date === data.date);
          return idx !== -1 ? old.map((r, i) => (i === idx ? data : r)) : [...old, data];
        },
      );
    },
  });

  const attendanceMap = useMemo<AttendanceMap>(() => {
    return attendances.reduce<AttendanceMap>((acc, record) => {
      if (!acc[record.employee]) acc[record.employee] = {};
      acc[record.employee][record.date] = record;
      return acc;
    }, {});
  }, [attendances]);

  const days = useMemo(
    () => getDaysInMonth(currentYear, currentMonth),
    [currentYear, currentMonth],
  );

  const yearOptions = useMemo(
    () =>
      Array.from({ length: YEAR_RANGE_END - YEAR_RANGE_START + 1 }, (_, i) => YEAR_RANGE_START + i),
    [],
  );

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleOpenPicker = () => {
    setPickerYear(currentYear);
    setPickerOpen(true);
  };

  const handlePickerMonthSelect = (month: number) => {
    setCurrentMonth(month);
    setCurrentYear(pickerYear);
    setPickerOpen(false);
  };

  return (
    <div className="attendance container">
      <div className="attendance-top">
        <div className="attendance-top-left">
          <button className="month-nav-btn" onClick={handlePrevMonth}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="month-picker-wrapper" ref={pickerRef}>
            <button className="month-label" onClick={handleOpenPicker}>
              {UZ_MONTHS[currentMonth - 1]} {currentYear}
            </button>

            {pickerOpen && (
              <div className="month-picker-dropdown">
                <div className="month-picker-year-row">
                  <button
                    className="picker-year-nav"
                    onClick={() => setPickerYear((y) => Math.max(YEAR_RANGE_START, y - 1))}
                  >
                    ‹
                  </button>
                  <select
                    className="picker-year-select"
                    value={pickerYear}
                    onChange={(e) => setPickerYear(Number(e.target.value))}
                  >
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  <button
                    className="picker-year-nav"
                    onClick={() => setPickerYear((y) => Math.min(YEAR_RANGE_END, y + 1))}
                  >
                    ›
                  </button>
                </div>
                <div className="month-picker-grid">
                  {UZ_MONTHS.map((name, idx) => (
                    <button
                      key={name}
                      className={`picker-month-btn${
                        currentMonth === idx + 1 && currentYear === pickerYear ? ' active' : ''
                      }`}
                      onClick={() => handlePickerMonthSelect(idx + 1)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button className="month-nav-btn" onClick={handleNextMonth}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <div className="attendance-top-right">
          {LEGEND_ITEMS.map(({ status, label }) => (
            <div key={status} className="attendance-box-wrapper">
              <div className="attendance-box" style={{ backgroundColor: STATUS_COLORS[status] }} />
              <h4>{label}</h4>
            </div>
          ))}
        </div>
      </div>

      <div className="attendance-content">
        <div
          className="attendance-table"
          style={{ '--day-count': days.length } as React.CSSProperties}
        >
          <div className="attendance-table-header">
            <div className="attendance-col-employee">{t('attendance.fish')}</div>
            {days.map((day) => (
              <div key={formatDate(day)} className="attendance-col-day">
                <span className="day-weekday">{UZ_WEEKDAYS[day.getDay()]}</span>
                <span className="day-number">{day.getDate()}</span>
              </div>
            ))}
          </div>

          <div className="attendance-table-body">
            {employees.map((employee) => (
              <div key={employee.full_name} className="attendance-row">
                <div className="attendance-col-employee attendance-employee-info">
                  <div className="employee-avatar">
                    {employee.avatar ? (
                      <img src={employee.avatar} alt={employee.full_name} />
                    ) : (
                      <svg
                        viewBox="0 0 40 40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="40"
                      >
                        <circle cx="20" cy="20" r="20" fill="#e8f0fe" />
                        <circle cx="20" cy="16" r="7" fill="#90a4ae" />
                        <ellipse cx="20" cy="34" rx="11" ry="7" fill="#90a4ae" />
                      </svg>
                    )}
                  </div>
                  <div className="employee-details">
                    <span className="employee-name">{employee.full_name}</span>
                    <span className="employee-role">{employee.role}</span>
                  </div>
                </div>

                {days.map((day) => {
                  const dateStr = formatDate(day);
                  const record = attendanceMap[employee.full_name]?.[dateStr];
                  return (
                    <div key={dateStr} className="attendance-col-day attendance-cell">
                      {record && (
                        <div
                          className="attendance-status-block"
                          style={{ backgroundColor: STATUS_COLORS[record.status] }}
                        >
                          {record.check_in && (
                            <span className="attendance-time check-in">
                              {record.check_in.slice(0, 5)}
                            </span>
                          )}
                          {record.check_out && (
                            <span className="attendance-time check-out">
                              {record.check_out.slice(0, 5)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {mutation.isError && (
        <div className="attendance-error">Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.</div>
      )}
    </div>
  );
};

export default Attendance;
