import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AddCourseModal from './AddCourseModal';
import { API } from '../../api/api';
import type {
  CoursePrice,
  CoursePriceListResponse,
  CoursesFilterState,
  HolatStatus,
  Role,
  SaveCoursePayload,
} from './courses.types';
import { EMPTY_COURSES_FILTER } from './courses.types';
import './courses.css';
import { useTranslation } from 'react-i18next';

const CURRENT_ROLE: Role = 'operator';

function formatDate(iso: string): string {
  if (!iso) return '';
  if (/^\d{2}-\d{2}$/.test(iso)) {
    return iso.replace('-', '.');
  }
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}

function formatDateTime(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} ${formatDate(iso)}`;
}

function formatNarx(val: string | number): string {
  const n = typeof val === 'string' ? parseFloat(val) : val;
  return isNaN(n) ? String(val) : n.toLocaleString('uz-UZ');
}

function applyCoursesFilter(
  rows: CoursePrice[],
  f: CoursesFilterState,
  search: string,
): CoursePrice[] {
  let result = rows;
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    result = result.filter(
      (r) =>
        r.course.name.toLowerCase().includes(q) ||
        r.course.level.name.toLowerCase().includes(q) ||
        r.branch.name.toLowerCase().includes(q),
    );
  }
  if (f.courseName.trim()) {
    const q = f.courseName.trim().toLowerCase();
    result = result.filter((r) => r.course.name.toLowerCase().includes(q));
  }
  if (f.levelName.trim()) {
    const q = f.levelName.trim().toLowerCase();
    result = result.filter((r) => r.course.level.name.toLowerCase().includes(q));
  }
  if (f.branchName.trim()) {
    const q = f.branchName.trim().toLowerCase();
    result = result.filter((r) => r.branch.name.toLowerCase().includes(q));
  }
  if (f.dateFrom) {
    const from = new Date(f.dateFrom).getTime();
    result = result.filter((r) => new Date(r.created_at).getTime() >= from);
  }
  if (f.dateTo) {
    const to = new Date(f.dateTo).getTime() + 86399999;
    result = result.filter((r) => new Date(r.created_at).getTime() <= to);
  }
  return result;
}

interface FilterPanelProps {
  filter: CoursesFilterState;
  onChange: (next: CoursesFilterState) => void;
  onReset: () => void;
}

function FilterPanel({ filter, onChange, onReset }: FilterPanelProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const handleField = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...filter, [e.target.name]: e.target.value });
    },
    [filter, onChange],
  );

  const hasActive = useMemo(() => Object.values(filter).some((v) => v !== ''), [filter]);

  return (
    <div className="courses-filter">
      <button
        type="button"
        className={`courses-filter__toggle${hasActive ? ' courses-filter__toggle--active' : ''}`}
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
        aria-label="Filtrlar"
      >
        <i className="fa-solid fa-sliders" aria-hidden="true" />
        {t('course.filter')}
        {hasActive && <span className="courses-filter__dot" aria-hidden="true" />}
      </button>

      {open && (
        <div className="courses-filter__panel" role="region" aria-label="Filter panel">
          <div className="courses-filter__panel-header">
            <span className="courses-filter__panel-title">{t('course.filter')}</span>
            <button
              type="button"
              className="courses-filter__close-btn"
              onClick={() => setOpen(false)}
              aria-label="Filterni yopish"
            >
              &#x2715;
            </button>
          </div>
          <div className="courses-filter__row">
            <div className="courses-filter__field">
              <label htmlFor="cf-course" className="courses-filter__label">
                {t('course.courseName')}
              </label>
              <input
                id="cf-course"
                name="courseName"
                type="text"
                className="courses-filter__input"
                value={filter.courseName}
                onChange={handleField}
                placeholder="Kurs nomini kiriting"
                autoComplete="off"
              />
            </div>
            <div className="courses-filter__field">
              <label htmlFor="cf-level" className="courses-filter__label">
                {t('course.level')} (Level)
              </label>
              <input
                id="cf-level"
                name="levelName"
                type="text"
                className="courses-filter__input"
                value={filter.levelName}
                onChange={handleField}
                placeholder="Masalan: B2, Beginner"
                autoComplete="off"
              />
            </div>
            <div className="courses-filter__field">
              <label htmlFor="cf-branch" className="courses-filter__label">
                {t('course.branch')}
              </label>
              <input
                id="cf-branch"
                name="branchName"
                type="text"
                className="courses-filter__input"
                value={filter.branchName}
                onChange={handleField}
                placeholder="Filial nomini kiriting"
                autoComplete="off"
              />
            </div>
            <div className="courses-filter__field">
              <label htmlFor="cf-date-from" className="courses-filter__label">
                {t('course.date')} {t('course.from')}
              </label>
              <input
                id="cf-date-from"
                name="dateFrom"
                type="date"
                className="courses-filter__input"
                value={filter.dateFrom}
                onChange={handleField}
              />
            </div>
            <div className="courses-filter__field">
              <label htmlFor="cf-date-to" className="courses-filter__label">
                {t('course.date')} {t('course.to')}
              </label>
              <input
                id="cf-date-to"
                name="dateTo"
                type="date"
                className="courses-filter__input"
                value={filter.dateTo}
                onChange={handleField}
              />
            </div>
          </div>
          <div className="courses-filter__actions">
            <button
              type="button"
              className="courses-filter__reset-btn"
              onClick={() => {
                onReset();
                setOpen(false);
              }}
            >
              {t('course.clear')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ holat }: { holat: HolatStatus }) {
  const mod =
    holat === 'Tasdiqlangan'
      ? 'courses-badge--blue'
      : holat === 'Rad etilgan'
        ? 'courses-badge--red'
        : 'courses-badge--orange';
  return <span className={`courses-badge ${mod}`}>{holat}</span>;
}

function LevelBadge({ name }: { name: string }) {
  return <span className="courses-level-badge">{name}</span>;
}

function PctCell({ value }: { value: number }) {
  const cls = value > 0 ? 'courses-pct--up' : value < 0 ? 'courses-pct--down' : '';
  return (
    <span className={`courses-pct ${cls}`}>
      {value > 0 ? '+' : ''}
      {value}%
    </span>
  );
}

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  from: number;
  to: number;
  total: number;
  onPageChange: (page: number) => void;
}

function Pagination({ currentPage, lastPage, from, to, total, onPageChange }: PaginationProps) {
  const { t } = useTranslation();
  const pages = useMemo<(number | '...')[]>(() => {
    if (lastPage <= 6) return Array.from({ length: lastPage }, (_, i) => i + 1);
    return [1, 2, 3, '...', lastPage];
  }, [lastPage]);

  return (
    <div className="courses-pagination">
      <span className="courses-pagination__info">
        {t('course.jami')}: {total}
        {t('course.from')} {from}-{to}
        {t('course.to')} {t('course.showing')}
      </span>
      <div className="courses-pagination__controls">
        <button
          type="button"
          className="courses-pagination__btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Oldingi sahifa"
        >
          ‹
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`el-${i}`} className="courses-pagination__ellipsis">
              ...
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={`courses-pagination__btn${currentPage === p ? ' courses-pagination__btn--active' : ''}`}
              onClick={() => onPageChange(p as number)}
              aria-current={currentPage === p ? 'page' : undefined}
              aria-label={`${p}-sahifa`}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          className="courses-pagination__btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === lastPage}
          aria-label="Keyingi sahifa"
        >
          ›
        </button>
      </div>
    </div>
  );
}

interface OperatorRowProps {
  row: CoursePrice;
  isSelected: boolean;
  onToggle: (id: number) => void;
}

function OperatorRow({ row, isSelected, onToggle }: OperatorRowProps) {
  return (
    <tr className={`courses-table__row${isSelected ? ' courses-table__row--selected' : ''}`}>
      <td className="courses-table__td courses-table__td--cb">
        <input
          type="checkbox"
          className="courses-table__checkbox"
          checked={isSelected}
          onChange={() => onToggle(row.id)}
          aria-label={`${row.course.name} tanlash`}
        />
      </td>
      <td className="courses-table__td">{row.id}</td>
      <td className="courses-table__td">
        <span className="courses-table__course-name">{row.course.name}</span>
      </td>
      <td className="courses-table__td" data-label="Daraja">
        <LevelBadge name={row.course.level.name} />
      </td>
      <td className="courses-table__td" data-label="Eski narx">
        {formatNarx(row.old_price)}
      </td>
      <td className="courses-table__td" data-label="Yangi narx">
        {formatNarx(row.new_price)}
      </td>
      <td className="courses-table__td" data-label="Dars soni">
        {row.lessons_count}
      </td>
      <td className="courses-table__td" data-label="O'zgarish">
        <PctCell value={row.percentage} />
      </td>
      <td className="courses-table__td" data-label="O'zgarish sanasi">
        {formatDate(row.start_date)}
      </td>
      <td className="courses-table__td" data-label="Filial">
        {row.branch.name}
      </td>
      <td className="courses-table__td" data-label="Sana">
        {formatDateTime(row.created_at)}
      </td>
      <td className="courses-table__td" data-label="Holat">
        {row.holat && <StatusBadge holat={row.holat} />}
      </td>
    </tr>
  );
}

interface OperatorTableProps {
  rows: CoursePrice[];
  selectedIds: Set<number>;
  onToggleOne: (id: number) => void;
  onToggleAll: () => void;
}

function OperatorTable({ rows, selectedIds, onToggleOne, onToggleAll }: OperatorTableProps) {
  const { t } = useTranslation();
  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.has(r.id));
  const someSelected = rows.some((r) => selectedIds.has(r.id)) && !allSelected;
  const cbRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (cbRef.current) cbRef.current.indeterminate = someSelected;
  }, [someSelected]);

  return (
    <div className="courses-table-wrap">
      <table className="courses-table" aria-label="Operator kurslari jadvali">
        <thead className="courses-table__head">
          <tr>
            <th className="courses-table__th courses-table__th--cb">
              <input
                ref={cbRef}
                type="checkbox"
                className="courses-table__checkbox"
                checked={allSelected}
                onChange={onToggleAll}
                aria-label="Hammasini tanlash"
              />
            </th>
            <th className="courses-table__th">#</th>
            <th className="courses-table__th">{t('course.courseName')}</th>
            <th className="courses-table__th">{t('course.level')}</th>
            <th className="courses-table__th">{t('course.oldPrice')}</th>
            <th className="courses-table__th">{t('course.newPrice')}</th>
            <th className="courses-table__th">{t('course.lessonCount')}</th>
            <th className="courses-table__th">{t('course.change')}</th>
            <th className="courses-table__th">{t('course.changeDate')}</th>
            <th className="courses-table__th">{t('course.branch')}</th>
            <th className="courses-table__th">{t('course.date')}</th>
            <th className="courses-table__th">{t('course.state')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <OperatorRow
              key={row.id}
              row={row}
              isSelected={selectedIds.has(row.id)}
              onToggle={onToggleOne}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface ManagerRowProps {
  row: CoursePrice;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

function ManagerRow({ row, onApprove, onReject }: ManagerRowProps) {
  const { t } = useTranslation();
  return (
    <tr className="courses-table__row">
      <td className="courses-table__td">{row.id}</td>
      <td className="courses-table__td" data-label="Kurs nomi">
        <span className="courses-table__course-name">{row.course.name}</span>
      </td>
      <td className="courses-table__td" data-label="Daraja">
        <LevelBadge name={row.course.level.name} />
      </td>
      <td className="courses-table__td" data-label="Eski narx">
        {formatNarx(row.old_price)}
      </td>
      <td className="courses-table__td" data-label="Yangi narx">
        {formatNarx(row.new_price)}
      </td>
      <td className="courses-table__td" data-label="Dars soni">
        {row.lessons_count}
      </td>
      <td className="courses-table__td" data-label="O'zgarish">
        <PctCell value={row.percentage} />
      </td>
      <td className="courses-table__td" data-label="O'zgarish sanasi">
        {formatDate(row.start_date)}
      </td>
      <td className="courses-table__td" data-label="Filial">
        {row.branch.name}
      </td>
      <td className="courses-table__td" data-label="Sana">
        {formatDateTime(row.created_at)}
      </td>
      <td className="courses-table__td courses-table__td--actions" data-label="Amallar">
        <button
          type="button"
          className="courses-table__action-btn courses-table__action-btn--approve"
          onClick={() => onApprove(row.id)}
          aria-label={`${row.course.name} tasdiqlash`}
        >
          {t('course.confirm')}
        </button>
        <button
          type="button"
          className="courses-table__action-btn courses-table__action-btn--reject"
          onClick={() => onReject(row.id)}
          aria-label={`${row.course.name} rad etish`}
        >
          {t('course.cancel')}
        </button>
      </td>
    </tr>
  );
}

interface ManagerTableProps {
  rows: CoursePrice[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

function ManagerTable({ rows, onApprove, onReject }: ManagerTableProps) {
  const { t } = useTranslation();
  return (
    <div className="courses-table-wrap">
      <table className="courses-table" aria-label="Menejer kurslari jadvali">
        <thead className="courses-table__head">
          <tr>
            <th className="courses-table__th">#</th>
            <th className="courses-table__th">{t('course.courseName')}</th>
            <th className="courses-table__th">{t('course.level')}</th>
            <th className="courses-table__th">{t('course.oldPrice')}</th>
            <th className="courses-table__th">{t('course.newPrice')}</th>
            <th className="courses-table__th">{t('course.lessonCount')}</th>
            <th className="courses-table__th">{t('course.change')}</th>
            <th className="courses-table__th">{t('course.changeDate')}</th>
            <th className="courses-table__th">{t('course.branch')}</th>
            <th className="courses-table__th">{t('course.date')}</th>
            <th className="courses-table__th">{t('course.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <ManagerRow key={row.id} row={row} onApprove={onApprove} onReject={onReject} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface RoleTableProps {
  activeRole: Role;
  rows: CoursePrice[];
  selectedIds: Set<number>;
  onToggleOne: (id: number) => void;
  onToggleAll: () => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

function RoleTable({
  activeRole,
  rows,
  selectedIds,
  onToggleOne,
  onToggleAll,
  onApprove,
  onReject,
}: RoleTableProps) {
  if (activeRole === 'operator') {
    return (
      <OperatorTable
        rows={rows}
        selectedIds={selectedIds}
        onToggleOne={onToggleOne}
        onToggleAll={onToggleAll}
      />
    );
  }
  return <ManagerTable rows={rows} onApprove={onApprove} onReject={onReject} />;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  from: number;
  to: number;
  total: number;
}

export default function Courses() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [coursesFilter, setCoursesFilter] = useState<CoursesFilterState>(EMPTY_COURSES_FILTER);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [localHolat, setLocalHolat] = useState<Record<number, HolatStatus>>({});

  const [rawRows, setRawRows] = useState<CoursePrice[]>([]);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchCoursePrices = useCallback(async (page: number) => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage('');
    try {
      const { data } = await API.get<CoursePriceListResponse>('/course_prices', {
        params: { page },
      });
      setRawRows(data.data);
      setPaginationMeta({
        current_page: data.current_page,
        last_page: data.last_page,
        from: data.from,
        to: data.to,
        total: data.total,
      });
    } catch (err) {
      setIsError(true);
      setErrorMessage(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoursePrices(currentPage);
  }, [currentPage, fetchCoursePrices]);

  const todayDDMM = useMemo(() => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}-${mm}`;
  }, []);

  const rows = useMemo<CoursePrice[]>(
    () =>
      rawRows.map((item) => {
        const startDDMM = item.start_date ?? '';
        const isActivationDay = startDDMM === todayDDMM;
        return {
          ...item,
          holat: isActivationDay
            ? (localHolat[item.id] ?? t('course.confirmed'))
            : (localHolat[item.id] ?? item.holat ?? t('course.inProcess')),
        };
      }),
    [rawRows, localHolat, todayDDMM, t],
  );

  const displayedRows = useMemo(
    () => applyCoursesFilter(rows, coursesFilter, search),
    [rows, coursesFilter, search],
  );

  const handleSaveCourse = useCallback(
    async (payload: SaveCoursePayload) => {
      setIsSaving(true);
      try {
        await API.post('/course_prices', payload);
        setIsModalOpen(false);
        await fetchCoursePrices(currentPage);
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'Saqlashda xatolik');
      } finally {
        setIsSaving(false);
      }
    },
    [currentPage, fetchCoursePrices],
  );

  const handleToggleOne = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleToggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      const allSel = displayedRows.every((r) => prev.has(r.id));
      const next = new Set(prev);
      displayedRows.forEach((r) => (allSel ? next.delete(r.id) : next.add(r.id)));
      return next;
    });
  }, [displayedRows]);

  const handleApprove = useCallback((id: number) => {
    setLocalHolat((prev) => ({ ...prev, [id]: 'Tasdiqlangan' }));
  }, []);

  const handleReject = useCallback((id: number) => {
    setLocalHolat((prev) => ({ ...prev, [id]: 'Rad etilgan' }));
  }, []);

  const handleSendApproval = useCallback(() => {
    setLocalHolat((prev) => {
      const next = { ...prev };
      selectedIds.forEach((id) => {
        next[id] = 'Jarayonda';
      });
      return next;
    });
    setSelectedIds(new Set());
  }, [selectedIds]);

  const isOperator = CURRENT_ROLE === 'operator';

  return (
    <section className="courses container">
      <div className="courses-top">
        {isOperator && (
          <button
            type="button"
            className="courses-top__send-btn"
            onClick={handleSendApproval}
            disabled={selectedIds.size === 0}
            aria-label="Tasdiqlashga yuborish"
          >
            {t('course.sendToConfirm')}
          </button>
        )}
        {!isOperator && <div aria-hidden="true" />}

        <div className="courses-top-right">
          <form
            className="registration-top__search"
            onSubmit={(e) => e.preventDefault()}
            role="search"
            aria-label="Kurslarni qidirish"
          >
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            <input
              type="search"
              placeholder="Ma'lumotlarni qidish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Qidiruv"
            />
          </form>
          <FilterPanel
            filter={coursesFilter}
            onChange={setCoursesFilter}
            onReset={() => setCoursesFilter(EMPTY_COURSES_FILTER)}
          />
          <button
            type="button"
            className="registration-top__register-btn"
            onClick={() => setIsModalOpen(true)}
            aria-label="Yangi kurs narxini qo'shish"
          >
            {t('course.add')}
          </button>
        </div>
      </div>

      <div className="courses-content">
        {isLoading && (
          <div className="courses-loading" role="status" aria-live="polite">
            {t('course.loading')}...
          </div>
        )}

        {isError && (
          <div className="courses-error" role="alert">
            {t('course.error')}: {errorMessage}
          </div>
        )}

        {!isLoading && !isError && displayedRows.length === 0 && (
          <div className="courses-empty">{t('course.notFound')}</div>
        )}

        {!isLoading && !isError && displayedRows.length > 0 && (
          <RoleTable
            activeRole={CURRENT_ROLE}
            rows={displayedRows}
            selectedIds={selectedIds}
            onToggleOne={handleToggleOne}
            onToggleAll={handleToggleAll}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}

        {!isLoading && !isError && paginationMeta && paginationMeta.total > 0 && (
          <Pagination
            currentPage={paginationMeta.current_page}
            lastPage={paginationMeta.last_page}
            from={paginationMeta.from}
            to={paginationMeta.to}
            total={paginationMeta.total}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {isModalOpen && (
        <AddCourseModal
          coursePrices={rawRows}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCourse}
          isSaving={isSaving}
        />
      )}
    </section>
  );
}
