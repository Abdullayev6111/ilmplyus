import { useCallback, useState, useRef, useEffect, memo } from 'react';
import type { Lid } from '../pages/lid/lid.types';
import LeadCard from './LidCard';

export interface Column {
  id: number;
  title: string;
  color: string;
  groupId: number;
}

export interface ColumnFilter {
  source: 'Telegram' | 'Instagram' | 'Facebook' | null;
  course:
    | 'Turk tili'
    | 'Ingliz tili'
    | 'IELTS'
    | 'Matematika'
    | 'Kompyuter savodxonligi'
    | 'Ona-tili adabiyoti'
    | null;
}

interface LeadColumnProps {
  column: Column;
  leads: Lid[];
  filter: ColumnFilter;
  onDrop: (columnId: number) => void;
  onDragStart: (id: number) => void;
  onFilterChange: (columnId: number, filter: ColumnFilter) => void;
  onLeadClick: (lead: Lid) => void;
}

const SOURCES: Array<'Telegram' | 'Instagram' | 'Facebook'> = ['Telegram', 'Instagram', 'Facebook'];
const COURSES: Array<
  | 'Turk tili'
  | 'Ingliz tili'
  | 'IELTS'
  | 'Matematika'
  | 'Kompyuter savodxonligi'
  | 'Ona-tili adabiyoti'
> = [
  'Turk tili',
  'Ingliz tili',
  'IELTS',
  'Matematika',
  'Kompyuter savodxonligi',
  'Ona-tili adabiyoti',
];

function LeadColumn({
  column,
  leads,
  filter,
  onDrop,
  onDragStart,
  onFilterChange,
  onLeadClick,
}: LeadColumnProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(() => {
    onDrop(column.id);
  }, [onDrop, column.id]);

  const toggleFilter = useCallback(() => {
    setFilterOpen((prev) => !prev);
  }, []);

  const handleSourceClick = useCallback(
    (source: 'Telegram' | 'Instagram' | 'Facebook') => {
      const newSource = filter.source === source ? null : source;
      onFilterChange(column.id, { ...filter, source: newSource });
    },
    [filter, column.id, onFilterChange],
  );

  const handleCourseClick = useCallback(
    (
      course:
        | 'Turk tili'
        | 'Ingliz tili'
        | 'IELTS'
        | 'Matematika'
        | 'Kompyuter savodxonligi'
        | 'Ona-tili adabiyoti',
    ) => {
      const newCourse = filter.course === course ? null : course;
      onFilterChange(column.id, { ...filter, course: newCourse });
    },
    [filter, column.id, onFilterChange],
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        filterOpen &&
        filterRef.current &&
        buttonRef.current &&
        !filterRef.current.contains(e.target as Node) &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [filterOpen]);

  return (
    <div
      className="lead-column"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      aria-label={`${column.title} ustuni`}
    >
      <div className="lead-column__header" style={{ background: column.color }}>
        <span className="lead-column__title">{column.title}</span>
        <div className="lead-column__header-right">
          <span className="lead-column__badge">{leads.length}</span>
          <button
            ref={buttonRef}
            className="lead-column__menu-btn"
            type="button"
            aria-label={`${column.title} ustuni menyusi`}
            onClick={toggleFilter}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="5" r="1.8" fill="white" />
              <circle cx="12" cy="12" r="1.8" fill="white" />
              <circle cx="12" cy="19" r="1.8" fill="white" />
            </svg>
          </button>
        </div>
      </div>

      {filterOpen && (
        <div ref={filterRef} className="filter-panel">
          <div className="filter-section">
            <div className="filter-section__title">MANBA</div>
            <div className="filter-section__buttons">
              {SOURCES.map((source) => (
                <button
                  key={source}
                  type="button"
                  className={`filter-btn ${filter.source === source ? 'filter-btn--active' : ''}`}
                  onClick={() => handleSourceClick(source)}
                >
                  {source}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-section__title">KURSLAR</div>
            <div className="filter-section__buttons">
              {COURSES.map((course) => (
                <button
                  key={course}
                  type="button"
                  className={`filter-btn ${filter.course === course ? 'filter-btn--active' : ''}`}
                  onClick={() => handleCourseClick(course)}
                >
                  {course}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="lead-column__body">
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            color={column.color}
            onDragStart={onDragStart}
            onClick={onLeadClick}
          />
        ))}
      </div>
    </div>
  );
}

export default memo(LeadColumn);
