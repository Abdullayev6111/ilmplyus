import { useCallback, useEffect, useMemo, useState } from 'react';
import { API } from '../../api/api';
import type {
  AddCourseFormErrors,
  AddCourseFormState,
  BranchMeta,
  CourseMeta,
  CoursePrice,
  SaveCoursePayload,
} from './courses.types';

interface AddCourseModalProps {
  coursePrices: CoursePrice[];
  isSaving: boolean;
  onClose: () => void;
  onSave: (data: SaveCoursePayload) => Promise<void>;
}

const EMPTY_FORM: AddCourseFormState = {
  filial: '',
  kurs: '',
  new_price: '',
  lessons_count: '',
  start_date: '',
  comment: '',
};

const MONTHS = [
  { value: '01', label: 'Yanvar' },
  { value: '02', label: 'Fevral' },
  { value: '03', label: 'Mart' },
  { value: '04', label: 'Aprel' },
  { value: '05', label: 'May' },
  { value: '06', label: 'Iyun' },
  { value: '07', label: 'Iyul' },
  { value: '08', label: 'Avgust' },
  { value: '09', label: 'Sentabr' },
  { value: '10', label: 'Oktabr' },
  { value: '11', label: 'Noyabr' },
  { value: '12', label: 'Dekabr' },
];

function getDaysInMonth(month: string): number {
  if (!month) return 31;
  const m = parseInt(month, 10);
  if ([1, 3, 5, 7, 8, 10, 12].includes(m)) return 31;
  if ([4, 6, 9, 11].includes(m)) return 30;
  return 29;
}

export default function AddCourseModal({
  coursePrices,
  isSaving,
  onClose,
  onSave,
}: AddCourseModalProps) {
  const [form, setForm] = useState<AddCourseFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<AddCourseFormErrors>({});
  const [startDay, setStartDay] = useState('');
  const [startMonth, setStartMonth] = useState('');
  const [courses, setCourses] = useState<CourseMeta[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [branches, setBranches] = useState<BranchMeta[]>([]);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const { data } = await API.get<CourseMeta[]>('/courses');
        setCourses(data);
      } catch {
        setCourses([]);
      }
    };

    loadCourses();
  }, []);

  useEffect(() => {
    const loadBranches = async () => {
      setIsLoadingData(true);
      try {
        const { data } = await API.get<BranchMeta[]>('/branches');
        setBranches(data);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadBranches();
  }, []);

  const filteredCourses = useMemo(() => {
    if (!form.filial) return [];

    const branchId = Number(form.filial);

    return courses.filter((course) => course.branch_id === branchId);
  }, [courses, form.filial]);

  const daysInMonth = useMemo(() => getDaysInMonth(startMonth), [startMonth]);

  const dayOptions = useMemo(
    () =>
      Array.from({ length: daysInMonth }, (_, i) => {
        const v = String(i + 1).padStart(2, '0');
        return { value: v, label: v };
      }),
    [daysInMonth],
  );

  const matchedCoursePrice = useMemo(() => {
    if (!form.kurs) return null;
    const filtered = coursePrices.filter((cp) => String(cp.course_id) === form.kurs);
    if (!filtered.length) return null;
    if (form.filial) {
      const exact = filtered.find((cp) => String(cp.branch_id) === form.filial);
      return exact ?? filtered[0];
    }
    return filtered[0];
  }, [form.kurs, form.filial, coursePrices]);

  const oldPriceRaw = useMemo(() => {
    if (!matchedCoursePrice) return 0;
    return parseFloat(matchedCoursePrice.new_price) || 0;
  }, [matchedCoursePrice]);

  const oldPriceDisplay = useMemo(
    () => (oldPriceRaw === 0 ? '' : oldPriceRaw.toLocaleString('uz-UZ')),
    [oldPriceRaw],
  );

  const newPriceRaw = useMemo(() => Number(form.new_price) || 0, [form.new_price]);
  const lessonCountRaw = useMemo(() => Number(form.lessons_count) || 0, [form.lessons_count]);

  const bittaDarsSummasiRaw = useMemo(() => {
    if (!newPriceRaw || !lessonCountRaw) return 0;
    return Math.round(newPriceRaw / lessonCountRaw);
  }, [newPriceRaw, lessonCountRaw]);

  const bittaDarsSummasiDisplay = useMemo(
    () => (bittaDarsSummasiRaw === 0 ? '' : bittaDarsSummasiRaw.toLocaleString('uz-UZ')),
    [bittaDarsSummasiRaw],
  );

  const percentageRaw = useMemo(() => {
    if (!oldPriceRaw || !newPriceRaw) return 0;
    return Math.round(((newPriceRaw - oldPriceRaw) / oldPriceRaw) * 100);
  }, [oldPriceRaw, newPriceRaw]);

  const ozgaruvchiFoiz = useMemo(() => {
    if (!oldPriceRaw || !newPriceRaw) return '';
    return `${percentageRaw > 0 ? '+' : ''}${percentageRaw}%`;
  }, [oldPriceRaw, newPriceRaw, percentageRaw]);

  const foizIsUp = useMemo(() => newPriceRaw > oldPriceRaw, [newPriceRaw, oldPriceRaw]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;

      if (name === 'filial') {
        setForm((prev) => ({
          ...prev,
          filial: value,
          kurs: '',
        }));
      } else {
        setForm((prev) => ({ ...prev, [name]: value }));
      }

      setErrors((prev) => ({ ...prev, [name]: undefined }));
    },
    [],
  );

  const handleDayChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const day = e.target.value;
      setStartDay(day);
      setErrors((prev) => ({ ...prev, start_date: undefined }));
      setForm((prev) => ({
        ...prev,
        start_date: day && startMonth ? `${day}.${startMonth}` : '',
      }));
    },
    [startMonth],
  );

  const handleMonthChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const month = e.target.value;
      setStartMonth(month);
      setErrors((prev) => ({ ...prev, start_date: undefined }));
      const maxDay = getDaysInMonth(month);
      const validDay = startDay && parseInt(startDay, 10) <= maxDay ? startDay : '';
      if (!validDay) setStartDay('');
      setForm((prev) => ({
        ...prev,
        start_date: validDay && month ? `${validDay}.${month}` : '',
      }));
    },
    [startDay],
  );

  const validate = useCallback((): boolean => {
    const next: AddCourseFormErrors = {};
    if (!form.filial) next.filial = 'Filialni tanlang';
    if (!form.kurs) next.kurs = 'Kursni tanlang';
    if (!form.new_price || Number(form.new_price) <= 0) next.new_price = 'Yangi narxni kiriting';
    if (!form.lessons_count || Number(form.lessons_count) <= 0)
      next.lessons_count = 'Darslar sonini kiriting';
    if (!form.start_date) next.start_date = 'Kun va oyni tanlang';
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [form]);

  const handleSave = useCallback(async () => {
    if (!validate()) return;
    const payload: SaveCoursePayload = {
      branch_id: Number(form.filial),
      course_id: Number(form.kurs),
      old_price: oldPriceRaw,
      new_price: newPriceRaw,
      lessons_count: lessonCountRaw,
      lesson_price: bittaDarsSummasiRaw,
      percentage: percentageRaw,
      start_date: form.start_date,
      comment: form.comment || '',
    };
    await onSave(payload);
  }, [
    form,
    onSave,
    validate,
    oldPriceRaw,
    newPriceRaw,
    lessonCountRaw,
    bittaDarsSummasiRaw,
    percentageRaw,
  ]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget && !isSaving) onClose();
    },
    [onClose, isSaving],
  );

  const todayLabel = useMemo(() => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  }, []);

  return (
    <div
      className="courses-modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="courses-modal-title"
    >
      <div className="courses-modal">
        <div className="courses-modal__header">
          <h2 className="courses-modal__title" id="courses-modal-title">
            Kurs narxi belgilash
          </h2>
          <span className="courses-modal__date">📅 {todayLabel}</span>
        </div>

        <div className="courses-modal__body">
          {isLoadingData ? (
            <div className="courses-modal__loading">Yuklanmoqda...</div>
          ) : (
            <>
              <div className="courses-modal__row">
                <div className="courses-modal__field">
                  <label htmlFor="cm-filial" className="courses-modal__label">
                    Fillial tanlang
                  </label>
                  <select
                    id="cm-filial"
                    name="filial"
                    className={`courses-modal__select${errors.filial ? ' courses-modal__select--error' : ''}`}
                    value={form.filial}
                    onChange={handleChange}
                    disabled={isSaving}
                  >
                    <option value="">Tanlang</option>
                    {branches.map((b) => (
                      <option key={b.id} value={String(b.id)}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  {errors.filial && <span className="courses-modal__error">{errors.filial}</span>}
                </div>

                <div className="courses-modal__field">
                  <label htmlFor="cm-kurs" className="courses-modal__label">
                    Kursni tanlang
                  </label>
                  <select
                    id="cm-kurs"
                    name="kurs"
                    value={form.kurs}
                    onChange={handleChange}
                    disabled={isSaving || !form.filial}
                  >
                    <option value="">Tanlang</option>

                    {filteredCourses.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}
                        {c.level ? ` (${c.level.name})` : ''}
                      </option>
                    ))}
                  </select>
                  {errors.kurs && <span className="courses-modal__error">{errors.kurs}</span>}
                </div>
              </div>

              <div className="courses-modal__row">
                <div className="courses-modal__field">
                  <label htmlFor="cm-old-price" className="courses-modal__label">
                    Eski narx
                  </label>
                  <div className="courses-modal__input-wrap">
                    <input
                      id="cm-old-price"
                      className="courses-modal__input courses-modal__input--readonly"
                      type="text"
                      value={oldPriceDisplay}
                      readOnly
                      placeholder="0"
                    />
                    <span className="courses-modal__currency">UZS</span>
                  </div>
                </div>

                <div className="courses-modal__field">
                  <label htmlFor="cm-new-price" className="courses-modal__label">
                    Yangi narx
                  </label>
                  <div className="courses-modal__input-wrap">
                    <input
                      id="cm-new-price"
                      name="new_price"
                      className={`courses-modal__input${errors.new_price ? ' courses-modal__input--error' : ''}`}
                      type="number"
                      value={form.new_price}
                      onChange={handleChange}
                      placeholder="0"
                      min={0}
                      disabled={isSaving}
                    />
                    <span className="courses-modal__currency">UZS</span>
                  </div>
                  {ozgaruvchiFoiz && (
                    <span
                      className={`courses-modal__hint${foizIsUp ? ' courses-modal__hint--up' : ' courses-modal__hint--down'}`}
                    >
                      Narx o'zgarish: {ozgaruvchiFoiz} kutilmoqda
                    </span>
                  )}
                  {errors.new_price && (
                    <span className="courses-modal__error">{errors.new_price}</span>
                  )}
                </div>
              </div>

              <div className="courses-modal__row">
                <div className="courses-modal__field">
                  <label htmlFor="cm-lessons" className="courses-modal__label">
                    Darslar soni
                  </label>
                  <input
                    id="cm-lessons"
                    name="lessons_count"
                    className={`courses-modal__input${errors.lessons_count ? ' courses-modal__input--error' : ''}`}
                    type="number"
                    value={form.lessons_count}
                    onChange={handleChange}
                    placeholder="0"
                    min={1}
                    disabled={isSaving}
                  />
                  <span className="courses-modal__hint">Bir oyda nechta dars bo'lishi</span>
                  {errors.lessons_count && (
                    <span className="courses-modal__error">{errors.lessons_count}</span>
                  )}
                </div>

                <div className="courses-modal__field">
                  <label htmlFor="cm-lesson-price" className="courses-modal__label">
                    Bitta dars summasi
                  </label>
                  <div className="courses-modal__input-wrap">
                    <input
                      id="cm-lesson-price"
                      className="courses-modal__input courses-modal__input--readonly"
                      type="text"
                      value={bittaDarsSummasiDisplay}
                      readOnly
                      placeholder="0"
                    />
                    <span className="courses-modal__currency">UZS</span>
                  </div>
                </div>
              </div>

              <div className="courses-modal__row">
                <div className="courses-modal__field">
                  <label htmlFor="cm-foiz" className="courses-modal__label">
                    O'zgaruvchi foiz
                  </label>
                  <input
                    id="cm-foiz"
                    className="courses-modal__input courses-modal__input--readonly"
                    type="text"
                    value={ozgaruvchiFoiz}
                    readOnly
                    placeholder="0%"
                  />
                  <span className="courses-modal__hint">
                    Belgilangan muddatda summa oshishi foizda
                  </span>
                </div>

                <div className="courses-modal__field">
                  <label className="courses-modal__label">O'zgaruvchi muddat</label>
                  <div className="courses-modal__date-row">
                    <select
                      id="cm-start-day"
                      className={`courses-modal__select courses-modal__select--half${errors.start_date ? ' courses-modal__select--error' : ''}`}
                      value={startDay}
                      onChange={handleDayChange}
                      disabled={isSaving}
                    >
                      <option value="">Kun</option>
                      {dayOptions.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                    <select
                      id="cm-start-month"
                      className={`courses-modal__select courses-modal__select--half${errors.start_date ? ' courses-modal__select--error' : ''}`}
                      value={startMonth}
                      onChange={handleMonthChange}
                      disabled={isSaving}
                    >
                      <option value="">Oy</option>
                      {MONTHS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="courses-modal__hint">O'zgarish muddati (kun.oy)</span>
                  {errors.start_date && (
                    <span className="courses-modal__error">{errors.start_date}</span>
                  )}
                </div>
              </div>

              <div className="courses-modal__field courses-modal__field--full">
                <label htmlFor="cm-comment" className="courses-modal__label">
                  Izoh
                </label>
                <textarea
                  id="cm-comment"
                  name="comment"
                  className="courses-modal__textarea"
                  value={form.comment}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Izoh yozing..."
                  disabled={isSaving}
                />
              </div>
            </>
          )}
        </div>

        <div className="courses-modal__footer">
          <button
            type="button"
            className="courses-modal__btn courses-modal__btn--cancel"
            onClick={onClose}
            disabled={isSaving}
          >
            Bekor qilish
          </button>
          <button
            type="button"
            className="courses-modal__btn courses-modal__btn--save"
            onClick={handleSave}
            disabled={isSaving || isLoadingData}
          >
            {isSaving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </div>
    </div>
  );
}
