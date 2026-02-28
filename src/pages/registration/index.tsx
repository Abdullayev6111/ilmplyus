import { useCallback, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import FilterDropdown from '../../components/FilterDropdown';
import { EMPTY_FILTER, DIRECTIONS } from '../../components/FilterDropdown/Filterdropdown.constants';
import type {
  FilterState,
  StudentSource,
  StudentGender,
} from '../../components/FilterDropdown/Filterdropdown.constants';
import { RegistrationModal } from '../../components/RegistrationModal';
import { fetchLids, deleteLid } from '../lid/lid.service';
import type { Lid, LidsPaginatedResponse } from '../lid/lid.types';
import { getName, formatGender, getSourceKey, getSourceLabel } from '../lid/lid.types';
import './registration.css';
import { useTranslation } from 'react-i18next';

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

function matchesDirectionFilter(
  courseName: string,
  selectedMain: string[],
  selectedSub: string[],
): boolean {
  if (selectedMain.length === 0 && selectedSub.length === 0) return true;
  const lc = courseName.toLowerCase();
  if (selectedMain.some((m) => lc.includes(m.toLowerCase()))) return true;
  const relevantSubs = selectedSub.filter((sub) => {
    const parent = DIRECTIONS.find((d) => d.sub.includes(sub));
    return parent ? !selectedMain.includes(parent.label) : true;
  });
  return relevantSubs.some((sub) => lc.includes(sub.toLowerCase()));
}

function applyClientFilters(lids: Lid[], search: string, filters: FilterState): Lid[] {
  const q = search.trim().toLowerCase();
  return lids.filter((s) => {
    const courseName = getName(s.course);
    const groupName = getName(s.group);
    const branchName = getName(s.branch);
    const sourceKey = getSourceKey(s.source);
    const genderLabel = formatGender(s.gender) as StudentGender;

    if (q) {
      const fullName = `${s.first_name} ${s.last_name}`;
      const haystack =
        `${fullName} ${s.phone} ${courseName} ${groupName} ${branchName}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (filters.sources.length > 0 && !filters.sources.includes(sourceKey as StudentSource))
      return false;
    if (filters.genders.length > 0 && !filters.genders.includes(genderLabel)) return false;
    if (!matchesDirectionFilter(courseName, filters.directions.main, filters.directions.sub))
      return false;
    return true;
  });
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  const pages = useMemo((): (number | '...')[] => {
    if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, '...', totalPages];
    if (currentPage >= totalPages - 2)
      return [1, '...', totalPages - 2, totalPages - 1, totalPages];
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
      {pages?.map((page, idx) =>
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

const Registration = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTER);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const total: number = data?.total ?? 0;

  const filteredData = useMemo(() => {
    const allLids: Lid[] = data?.data ?? [];
    return applyClientFilters(allLids, search, filters);
  }, [data, search, filters]);

  const totalPages = Math.ceil(total / pageSize);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleFiltersChange = useCallback((next: FilterState) => {
    setFilters(next);
    setCurrentPage(1);
  }, []);

  const handlePageSizeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value) as PageSize);
    setCurrentPage(1);
  }, []);

  const handleOpenModal = useCallback(() => setIsModalOpen(true), []);
  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);

  const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);
  const showPagination = totalPages > 1;

  return (
    <>
      <section className="registration container">
        <div className="registration-top">
          <h1>{t('registration.newRegistrated')}</h1>
          <div className="registration-top__actions">
            <form
              className="registration-top__search"
              onSubmit={(e) => e.preventDefault()}
              role="search"
              aria-label="O'quvchilarni qidirish"
            >
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              <input
                type="search"
                placeholder={t('registration.inputPlaceholder')}
                value={search}
                onChange={handleSearchChange}
                aria-label="Qidiruv"
              />
            </form>
            <FilterDropdown filters={filters} onChange={handleFiltersChange} />
            <button
              type="button"
              className="registration-top__register-btn"
              onClick={handleOpenModal}
              aria-label="Yangi o'quvchi ro'yhatga olish"
            >
              Ro'yhatga olish
            </button>
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
                ) : filteredData.length > 0 ? (
                  filteredData.map((student: Lid) => {
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
                ) : (
                  <tr>
                    <td colSpan={8} className="db-empty-state" aria-live="polite">
                      <div className="db-empty-state__inner">
                        <i
                          className="fa-solid fa-magnifying-glass db-empty-state__icon"
                          aria-hidden="true"
                        />
                        <p>{t('registration.resultsNotFound')}</p>
                        <span>{t('registration.changeFilters')}</span>
                      </div>
                    </td>
                  </tr>
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
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </section>

      {isModalOpen && <RegistrationModal onClose={handleCloseModal} />}
    </>
  );
};

export default Registration;
