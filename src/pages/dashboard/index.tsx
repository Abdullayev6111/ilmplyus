import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, Tooltip } from 'recharts';
import { fetchLids, deleteLid } from '../lid/lid.service';
import type { Lid, LidsPaginatedResponse } from '../lid/lid.types';
import { getName, formatGender, getSourceKey, getSourceLabel } from '../lid/lid.types';
import './dashboard.css';
import { useTranslation } from 'react-i18next';

interface ChartDataPoint {
  day: string;
  value: number;
}

const CHART_DATA_30: ChartDataPoint[] = [
  { day: 'DUSHANBA', value: 60 },
  { day: 'SESHANBA', value: 95 },
  { day: 'CHORSHANBA', value: 140 },
  { day: 'PAYSHANBA', value: 175 },
  { day: 'JUMA', value: 230 },
  { day: 'SHANBA', value: 310 },
];

const CHART_DATA_7: ChartDataPoint[] = [
  { day: 'DUSHANBA', value: 40 },
  { day: 'SESHANBA', value: 70 },
  { day: 'CHORSHANBA', value: 55 },
  { day: 'PAYSHANBA', value: 110 },
  { day: 'JUMA', value: 90 },
  { day: 'SHANBA', value: 145 },
];

interface Task {
  id: number;
  title: string;
  meta: string;
  iconBg: string;
  iconClass: string;
  iconColor: string;
}

const TASKS: Task[] = [
  {
    id: 1,
    title: 'Ali Ismoilov',
    meta: '14:30 · Rus tili kursi',
    iconBg: '#e0f0ff',
    iconClass: 'fa-solid fa-phone',
    iconColor: '#3b82f6',
  },
  {
    id: 2,
    title: 'Test natijalari',
    meta: '16:00 · IELTS 6.0',
    iconBg: '#fff3e0',
    iconClass: 'fa-solid fa-clipboard-list',
    iconColor: '#f97316',
  },
  {
    id: 3,
    title: 'Shartnoma izolash',
    meta: '16:00 · IELTS 6.0',
    iconBg: '#e6f9f0',
    iconClass: 'fa-solid fa-shield-halved',
    iconColor: '#22c55e',
  },
];

type PageSize = 5 | 10 | 20 | 50;
const PAGE_SIZE_OPTIONS: PageSize[] = [5, 10, 20, 50];

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${hours}:${minutes} ${day}.${month}.${year}`;
}

interface TooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <span className="chart-tooltip__label">{label}</span>
        <span className="chart-tooltip__value">{payload[0].value} lid</span>
      </div>
    );
  }
  return null;
};

interface DotProps {
  cx?: number;
  cy?: number;
}

const CustomDot = ({ cx, cy }: DotProps) => {
  if (cx === undefined || cy === undefined) return null;
  return <circle cx={cx} cy={cy} r={5} fill="#ff8c00" stroke="#fff" strokeWidth={2} />;
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  const pages = useMemo((): (number | '...')[] => {
    if (totalPages <= 6) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, '...', totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  }, [currentPage, totalPages]);

  return (
    <div className="db-pagination__pages">
      <button
        type="button"
        className="db-pagination__btn db-pagination__btn--nav"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Oldingi sahifa"
      >
        <i className="fa-solid fa-chevron-left" />
      </button>

      {pages.map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="db-pagination__ellipsis">
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            className={`db-pagination__btn${currentPage === page ? ' db-pagination__btn--active' : ''}`}
            onClick={() => onPageChange(page as number)}
            aria-label={`${page}-sahifa`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        ),
      )}

      <button
        type="button"
        className="db-pagination__btn db-pagination__btn--nav"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Keyingi sahifa"
      >
        <i className="fa-solid fa-chevron-right" />
      </button>
    </div>
  );
};

const Dashboard = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeRange, setActiveRange] = useState<'7' | '30'>('30');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<PageSize>(10);

  const chartData = useMemo<ChartDataPoint[]>(
    () => (activeRange === '30' ? CHART_DATA_30 : CHART_DATA_7),
    [activeRange],
  );

  const { data, isLoading, isError } = useQuery<LidsPaginatedResponse>({
    queryKey: ['lids', currentPage, pageSize],
    queryFn: () => fetchLids({ page: currentPage, per_page: pageSize }),
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteLid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lids'] });
    },
  });

  const lids: Lid[] = data?.data ?? [];
  const total: number = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value) as PageSize);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);
  const showPagination = totalPages > 1;

  return (
    <section className="dashboard container">
      <div className="dashboard-top">
        <article className="stat-card" aria-label="Jami Lidlar statistikasi">
          <div className="stat-card__badge" aria-label="13 foiz o'sish">
            <i className="fa-solid fa-arrow-up" style={{ fontSize: 10, color: '#22c55e' }} />
            13%
          </div>

          <div className="stat-card__body">
            <div className="stat-card__icon" aria-hidden="true">
              <i className="fa-solid fa-users" style={{ fontSize: 22, color: '#f97316' }} />
            </div>
            <div className="stat-card__info">
              <span className="stat-card__label">{t('dashboard.allLids')}</span>
              <strong className="stat-card__value">
                {total > 0 ? total.toLocaleString() : '—'}
              </strong>
            </div>
          </div>

          <div
            className="stat-card__progress-track"
            role="progressbar"
            aria-valuenow={75}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Jami lidlar ko'rsatkichi 75%"
          >
            <div
              className="stat-card__progress-fill stat-card__progress-fill--orange"
              style={{ width: '75%' }}
            />
          </div>
        </article>

        <article className="stat-card" aria-label="Konversiya statistikasi">
          <div className="stat-card__badge" aria-label="13 foiz o'sish">
            <i className="fa-solid fa-arrow-up" style={{ fontSize: 10, color: '#22c55e' }} />
            13%
          </div>

          <div className="stat-card__body">
            <div className="stat-card__icon" aria-hidden="true">
              <i className="fa-solid fa-chart-line" style={{ fontSize: 22, color: '#f97316' }} />
            </div>
            <div className="stat-card__info">
              <span className="stat-card__label">{t('dashboard.conversion')}</span>
              <strong className="stat-card__value">23%</strong>
            </div>
          </div>

          <div
            className="stat-card__progress-track"
            role="progressbar"
            aria-valuenow={23}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Konversiya ko'rsatkichi 23%"
          >
            <div
              className="stat-card__progress-fill stat-card__progress-fill--blue"
              style={{ width: '23%' }}
            />
          </div>
        </article>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-content-left">
          <div className="chart-card">
            <div className="chart-card__header">
              <div className="chart-card__titles">
                <h2 className="chart-card__title">{t('dashboard.lidProgress')}</h2>
                <p className="chart-card__subtitle">{t('dashboard.lastMonthResult')}</p>
              </div>
              <div
                className="chart-card__toggles"
                role="group"
                aria-label="Vaqt oralig'ini tanlang"
              >
                <button
                  className={`chart-toggle-btn${activeRange === '7' ? ' chart-toggle-btn--active' : ''}`}
                  onClick={() => setActiveRange('7')}
                  aria-pressed={activeRange === '7'}
                >
                  7 {t('dashboard.day')}
                </button>
                <button
                  className={`chart-toggle-btn${activeRange === '30' ? ' chart-toggle-btn--active' : ''}`}
                  onClick={() => setActiveRange('30')}
                  aria-pressed={activeRange === '30'}
                >
                  30 {t('dashboard.day')}
                </button>
              </div>
            </div>

            <div className="chart-card__chart" aria-label="Lidlar o'sishi grafigi">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff8c00" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#ff8c00" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#f0f0f0" strokeDasharray="4 4" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#9ca3af', fontFamily: 'noto-r' }}
                    dy={12}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: '#ff8c00', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#ff8c00"
                    strokeWidth={3}
                    fill="url(#orangeGradient)"
                    dot={<CustomDot />}
                    activeDot={{ r: 8, fill: '#ff8c00', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="dashboard-content-right">
          <div className="tasks-card">
            <div className="tasks-card__header">
              <h2 className="tasks-card__title">{t('dashboard.dailyTasks')}</h2>
              <button className="tasks-card__all-link" aria-label="Barcha vazifalarni ko'rish">
                {t('dashboard.allSelected')}
              </button>
            </div>

            <ul className="tasks-list" aria-label="Bugungi vazifalar ro'yxati">
              {TASKS.map((task) => (
                <li key={task.id} className="task-item">
                  <div
                    className="task-item__icon"
                    style={{ backgroundColor: task.iconBg }}
                    aria-hidden="true"
                  >
                    <i className={task.iconClass} style={{ fontSize: 18, color: task.iconColor }} />
                  </div>
                  <div className="task-item__info">
                    <span className="task-item__title">{task.title}</span>
                    <span className="task-item__meta">{task.meta}</span>
                  </div>
                  <label
                    className="task-item__checkbox-label"
                    aria-label={`${task.title} bajarildi deb belgilash`}
                  >
                    <input type="checkbox" className="task-item__checkbox" />
                    <span className="task-item__checkbox-custom" aria-hidden="true" />
                  </label>
                </li>
              ))}
            </ul>

            <button className="tasks-card__add-btn" aria-label="Yangi vazifa qo'shish">
              +{t('dashboard.addNewTask')}
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-bottom">
        <div className="db-header">
          <h2 className="db-header__title">{t('dashboard.newStudents')}</h2>
          <div className="db-header__controls">
            <label htmlFor="page-size-select" className="db-select__label">
              {t('dashboard.columns')}:
            </label>
            <select
              id="page-size-select"
              className="db-select"
              value={pageSize}
              onChange={handlePageSizeChange}
              aria-label="Sahifadagi qatorlar soni"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          className="db-table-wrapper"
          role="region"
          aria-label="Yangi o'quvchilar jadvali"
          tabIndex={0}
        >
          <table className="db-table">
            <thead>
              <tr>
                <th scope="col">{t('dashboard.student')}</th>
                <th scope="col">{t('dashboard.field')}</th>
                <th scope="col">{t('dashboard.group')}</th>
                <th scope="col">{t('dashboard.gender')}</th>
                <th scope="col">{t('dashboard.branch')}</th>
                <th scope="col">{t('dashboard.source')}</th>
                <th scope="col">{t('dashboard.date')}</th>
                <th scope="col">{t('dashboard.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="db-empty-state" aria-live="polite">
                    <div className="db-empty-state__inner">
                      <p>{t('dashboard.loading')}...</p>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={8} className="db-empty-state" aria-live="polite">
                    <div className="db-empty-state__inner">
                      <p>{t('dashboard.error')}</p>
                    </div>
                  </td>
                </tr>
              ) : lids.length === 0 ? (
                <tr>
                  <td colSpan={8} className="db-empty-state" aria-live="polite">
                    <div className="db-empty-state__inner">
                      <p>{t('dashboard.notFound')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                lids.map((student: Lid) => {
                  const fullName = `${student.first_name} ${student.last_name}`;
                  return (
                    <tr key={student.id} className="db-table__row">
                      <td>
                        <div className="db-student-cell">
                          <div className="db-student-cell__avatar" aria-hidden="true">
                            {getInitials(student.first_name, student.last_name)}
                          </div>
                          <div className="db-student-cell__info">
                            <span className="db-student-cell__name">{fullName}</span>
                            <span className="db-student-cell__phone">{student.phone}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="db-direction-cell">
                          <span className="db-direction-cell__dot" aria-hidden="true" />
                          <span className="db-direction-cell__text">
                            {getName(student.course)} {getName(student.level)}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className="db-group-cell">{getName(student.group)}</span>
                      </td>

                      <td>
                        <span className="db-gender-cell">{formatGender(student.gender)}</span>
                      </td>

                      <td>
                        <span className="db-branch-cell">{getName(student.branch)}</span>
                      </td>

                      <td>
                        <span
                          className={`db-source-badge db-source-badge--${getSourceKey(student.source)}`}
                        >
                          {getSourceLabel(student.source)}
                        </span>
                      </td>

                      <td>
                        <span className="db-date-cell">{formatDate(student.created_at)}</span>
                      </td>

                      <td>
                        <div className="db-actions-cell">
                          <button
                            type="button"
                            className="db-action-btn"
                            aria-label={`${fullName}ni tahrirlash`}
                          >
                            <i className="fa-solid fa-pen" />
                          </button>
                          <button
                            type="button"
                            className="db-action-btn"
                            aria-label={`${fullName}ni arxivlash`}
                          >
                            <i className="fa-solid fa-box-archive" />
                          </button>
                          <button
                            type="button"
                            className="db-action-btn db-action-btn--danger"
                            aria-label={`${fullName}ni o'chirish`}
                            onClick={() => deleteMutation.mutate(student.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <i className="fa-solid fa-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {showPagination && (
          <div className="db-pagination">
            <span className="db-pagination__info">
              {t('dashboard.all')}: {total}
              {t('dashboard.piece')} {startItem}-{endItem}
              {t('dashboard.pieceShown')}
            </span>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
