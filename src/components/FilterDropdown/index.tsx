import { useCallback, useEffect, useRef, useState } from 'react';
import { DIRECTIONS, EMPTY_FILTER, GENDERS, SOURCES } from './Filterdropdown.constants';
import type {
  DirectionNode,
  FilterState,
  StudentGender,
  StudentSource,
} from './Filterdropdown.constants';
import './FilterDropdown.css';

function toggleItem<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

function countActiveFilters(f: FilterState): number {
  return f.sources.length + f.genders.length + f.directions.main.length + f.directions.sub.length;
}

interface CheckboxItemProps {
  id: string;
  label: string;
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
}

const CheckboxItem = ({ id, label, checked, indeterminate, onChange }: CheckboxItemProps) => {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate;
  }, [indeterminate]);

  return (
    <label htmlFor={id} className="fd-checkbox">
      <input
        ref={ref}
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        aria-checked={indeterminate ? 'mixed' : checked}
      />
      <span className="fd-checkbox__box" aria-hidden="true" />
      <span className="fd-checkbox__label">{label}</span>
    </label>
  );
};

interface DirectionSectionProps {
  node: DirectionNode;
  selectedMain: string[];
  selectedSub: string[];
  onMainToggle: (label: string) => void;
  onSubToggle: (sub: string) => void;
}

const DirectionSection = ({
  node,
  selectedMain,
  selectedSub,
  onMainToggle,
  onSubToggle,
}: DirectionSectionProps) => {
  const isMainChecked = selectedMain.includes(node.label);
  const activeSubs = node.sub.filter((s) => selectedSub.includes(s));
  const isIndeterminate = !isMainChecked && activeSubs.length > 0;
  const [expanded, setExpanded] = useState(isMainChecked || activeSubs.length > 0);

  const handleToggleExpand = useCallback(() => setExpanded((v) => !v), []);
  const handleMainToggle = useCallback(() => onMainToggle(node.label), [onMainToggle, node.label]);

  return (
    <div className="fd-direction-section">
      <div className="fd-direction-section__header">
        <CheckboxItem
          id={`dir-main-${node.label}`}
          label={node.label}
          checked={isMainChecked}
          indeterminate={isIndeterminate}
          onChange={handleMainToggle}
        />
        <button
          type="button"
          className={`fd-expand-btn${expanded ? ' fd-expand-btn--open' : ''}`}
          onClick={handleToggleExpand}
          aria-expanded={expanded}
          aria-label={`${node.label} kichik yo'nalishlarini ${expanded ? 'yopish' : 'ochish'}`}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M2 4l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      {expanded && (
        <div
          className="fd-direction-section__subs"
          role="group"
          aria-label={`${node.label} kichik yo'nalishlari`}
        >
          {node.sub.map((sub) => (
            <CheckboxItem
              key={sub}
              id={`dir-sub-${node.label}-${sub}`}
              label={sub}
              checked={selectedSub.includes(sub)}
              onChange={() => onSubToggle(sub)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface FilterDropdownProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const FilterDropdown = ({ filters, onChange }: FilterDropdownProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeCount = countActiveFilters(filters);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleToggle = useCallback(() => setOpen((v) => !v), []);

  const handleSourceToggle = useCallback(
    (src: StudentSource) => {
      onChange({ ...filters, sources: toggleItem(filters.sources, src) });
    },
    [filters, onChange],
  );

  const handleGenderToggle = useCallback(
    (g: StudentGender) => {
      onChange({ ...filters, genders: toggleItem(filters.genders, g) });
    },
    [filters, onChange],
  );

  const handleMainToggle = useCallback(
    (main: string) => {
      const newMain = toggleItem(filters.directions.main, main);
      const node = DIRECTIONS.find((d) => d.label === main);
      const newSub = newMain.includes(main)
        ? filters.directions.sub
        : filters.directions.sub.filter((s) => !node?.sub.includes(s));
      onChange({ ...filters, directions: { main: newMain, sub: newSub } });
    },
    [filters, onChange],
  );

  const handleSubToggle = useCallback(
    (sub: string) => {
      onChange({
        ...filters,
        directions: {
          ...filters.directions,
          sub: toggleItem(filters.directions.sub, sub),
        },
      });
    },
    [filters, onChange],
  );

  const handleReset = useCallback(() => onChange(EMPTY_FILTER), [onChange]);

  return (
    <div className="fd-container" ref={containerRef}>
      <button
        type="button"
        className={`fd-trigger${open ? ' fd-trigger--active' : ''}`}
        onClick={handleToggle}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="filter-dropdown-panel"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M2 4h12M4 8h8M6 12h4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        Saralash
        {activeCount > 0 && (
          <span className="fd-badge" aria-label={`${activeCount} ta faol filtr`}>
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div
          id="filter-dropdown-panel"
          className="fd-panel"
          role="menu"
          aria-label="Filtrlar paneli"
        >
          <section className="fd-section" aria-labelledby="fd-source-heading">
            <h3 className="fd-section__title" id="fd-source-heading">
              Manba
            </h3>
            <div className="fd-section__body" role="group" aria-labelledby="fd-source-heading">
              {SOURCES.map((src) => (
                <CheckboxItem
                  key={src}
                  id={`src-${src}`}
                  label={src}
                  checked={filters.sources.includes(src)}
                  onChange={() => handleSourceToggle(src)}
                />
              ))}
            </div>
          </section>

          <div className="fd-divider" role="separator" />

          <section className="fd-section" aria-labelledby="fd-gender-heading">
            <h3 className="fd-section__title" id="fd-gender-heading">
              Jinsi
            </h3>
            <div className="fd-section__body" role="group" aria-labelledby="fd-gender-heading">
              {GENDERS.map((g) => (
                <CheckboxItem
                  key={g}
                  id={`gender-${g}`}
                  label={g}
                  checked={filters.genders.includes(g)}
                  onChange={() => handleGenderToggle(g)}
                />
              ))}
            </div>
          </section>

          <div className="fd-divider" role="separator" />

          <section className="fd-section" aria-labelledby="fd-direction-heading">
            <h3 className="fd-section__title" id="fd-direction-heading">
              Yo&apos;nalish
            </h3>
            <div className="fd-section__body">
              {DIRECTIONS.map((node) => (
                <DirectionSection
                  key={node.label}
                  node={node}
                  selectedMain={filters.directions.main}
                  selectedSub={filters.directions.sub}
                  onMainToggle={handleMainToggle}
                  onSubToggle={handleSubToggle}
                />
              ))}
            </div>
          </section>

          {activeCount > 0 && (
            <>
              <div className="fd-divider" role="separator" />
              <div className="fd-footer">
                <button type="button" className="fd-reset-btn" onClick={handleReset}>
                  Tozalash
                </button>
                <span className="fd-footer__count">{activeCount} ta filtr faol</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
