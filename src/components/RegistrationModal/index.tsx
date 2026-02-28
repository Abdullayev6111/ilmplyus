import { useCallback, useEffect, useRef, useState } from 'react';
import './RegistrationModal.css';

export type StudentSource = 'Instagram' | 'Telegram' | 'Website';
export type StudentGender = 'Erkak' | 'Ayol';

export interface RegistrationFormState {
  lastName: string;
  firstName: string;
  middleName: string;
  birthDate: string;
  gender: StudentGender | '';
  phone: string;
  region: string;
  district: string;
  branch: string;
  course: string;
  level: string;
  group: string;
  source: StudentSource | '';
  note: string;
}

type FormErrors = Partial<Record<keyof RegistrationFormState, string>>;

const INITIAL_FORM: RegistrationFormState = {
  lastName: '',
  firstName: '',
  middleName: '',
  birthDate: '',
  gender: '',
  phone: '',
  region: '',
  district: '',
  branch: '',
  course: '',
  level: '',
  group: '',
  source: '',
  note: '',
};

const REGIONS = [
  'Andijon viloyati',
  'Buxoro viloyati',
  "Farg'ona viloyati",
  'Jizzax viloyati',
  'Xorazm viloyati',
  'Namangan viloyati',
  'Navoiy viloyati',
  'Qashqadaryo viloyati',
  "Qoraqalpog'iston Respublikasi",
  'Samarqand viloyati',
  'Sirdaryo viloyati',
  'Surxondaryo viloyati',
  'Toshkent shahri',
  'Toshkent viloyati',
];

const BRANCHES = [
  'Andijon Yangi Bozor',
  'Andijon Markaz',
  'Buxoro Markaz',
  "Farg'ona Markaz",
  'Namangan Markaz',
  "Qo'qon Markaz",
  'Samarqand Markaz',
  "Samarqand Ulug'bek",
  'Toshkent Chilonzor',
  "Toshkent Mirzo Ulug'bek",
  'Toshkent Shayxontohur',
  'Toshkent Yunusobod',
];

const COURSES = ['English', 'Matematika', 'Fizika', 'Kimyo', 'Dasturlash'];

const LEVELS: Record<string, string[]> = {
  English: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'IELTS'],
  Matematika: ['1-daraja', '2-daraja', '3-daraja'],
  Fizika: ['Asosiy', 'Olimpiya'],
  Kimyo: ['Umumiy', 'Organik'],
  Dasturlash: ['Python', 'JavaScript', 'Java', 'C++'],
};

const GROUPS = ['AF - 102', 'BF - 201', 'CF - 305', 'DF - 401', 'EF - 102', 'FF - 503'];
const SOURCES: StudentSource[] = ['Instagram', 'Telegram', 'Website'];

const UZ_PHONE_REGEX = /^\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/;

function validateForm(form: RegistrationFormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.lastName.trim()) errors.lastName = 'Familiya kiritilishi shart';
  if (!form.firstName.trim()) errors.firstName = 'Ism kiritilishi shart';
  if (!form.birthDate) errors.birthDate = "Tug'ilgan sana kiritilishi shart";
  if (!form.gender) errors.gender = 'Jinsi tanlanishi shart';
  if (!form.phone.trim()) {
    errors.phone = 'Telefon raqami kiritilishi shart';
  } else if (!UZ_PHONE_REGEX.test(form.phone.trim())) {
    errors.phone = "Noto'g'ri format. Misol: +998 90 123 45 67";
  }
  if (!form.region) errors.region = 'Viloyat tanlanishi shart';
  if (!form.district.trim()) errors.district = 'Shahar/tuman kiritilishi shart';
  if (!form.branch) errors.branch = 'Filial tanlanishi shart';
  if (!form.course) errors.course = 'Kurs tanlanishi shart';
  if (!form.level) errors.level = 'Bosqich tanlanishi shart';
  if (!form.group) errors.group = 'Guruh tanlanishi shart';
  if (!form.source) errors.source = 'Manba tanlanishi shart';
  return errors;
}

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

const FormField = ({ label, required, error, children }: FieldProps) => (
  <div className={`rm-field${error ? ' rm-field--error' : ''}`}>
    <label className="rm-field__label">
      {label}
      {required && (
        <span className="rm-field__required" aria-hidden="true">
          *
        </span>
      )}
    </label>
    {children}
    {error && (
      <span className="rm-field__error" role="alert">
        {error}
      </span>
    )}
  </div>
);

interface SelectFieldProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder: string;
  options: string[];
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  name: keyof RegistrationFormState;
}

const SelectField = ({
  id,
  value,
  onChange,
  placeholder,
  options,
  disabled,
  required,
  error,
  name,
}: SelectFieldProps) => (
  <div className="rm-select-wrapper">
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      aria-required={required}
      aria-invalid={error}
      className={`rm-select${error ? ' rm-select--error' : ''}`}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
    <svg
      className="rm-select__arrow"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 4l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

interface RegistrationModalProps {
  onClose: () => void;
}

export const RegistrationModal = ({ onClose }: RegistrationModalProps) => {
  const [form, setForm] = useState<RegistrationFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstFocusRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === overlayRef.current) onClose();
    },
    [onClose],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setForm((prev) => {
        const next = { ...prev, [name]: value };
        if (submitted) setErrors(validateForm(next));
        return next;
      });
    },
    [submitted],
  );

  const handleGenderChange = useCallback(
    (value: StudentGender) => {
      setForm((prev) => {
        const next = { ...prev, gender: value };
        if (submitted) setErrors(validateForm(next));
        return next;
      });
    },
    [submitted],
  );

  const handleCourseChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setForm((prev) => {
        const next = { ...prev, course: e.target.value, level: '' };
        if (submitted) setErrors(validateForm(next));
        return next;
      });
    },
    [submitted],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitted(true);
      const validationErrors = validateForm(form);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
      onClose();
    },
    [form, onClose],
  );

  const handleCancel = useCallback(() => {
    setForm(INITIAL_FORM);
    setErrors({});
    setSubmitted(false);
    onClose();
  }, [onClose]);

  const availableLevels = form.course ? (LEVELS[form.course] ?? []) : [];

  return (
    <div
      className="rm-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="rm-title"
    >
      <div className="rm-modal">
        <div className="rm-modal__header">
          <h2 className="rm-modal__title" id="rm-title">
            Ro&apos;yhatga olish
          </h2>
          <button
            type="button"
            className="rm-modal__close"
            onClick={onClose}
            aria-label="Modalni yopish"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path
                d="M1 1l16 16M17 1L1 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <form className="rm-form" onSubmit={handleSubmit} noValidate>
          <div className="rm-form__grid">
            <FormField label="Familya" required error={errors.lastName}>
              <div className="rm-input-wrapper">
                <svg
                  className="rm-input__icon"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4" />
                  <path
                    d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  ref={firstFocusRef}
                  type="text"
                  name="lastName"
                  id="lastName"
                  className={`rm-input${errors.lastName ? ' rm-input--error' : ''}`}
                  placeholder="Aliev"
                  value={form.lastName}
                  onChange={handleInputChange}
                  aria-required="true"
                  aria-invalid={!!errors.lastName}
                />
              </div>
            </FormField>

            <FormField label="Ism" required error={errors.firstName}>
              <div className="rm-input-wrapper">
                <svg
                  className="rm-input__icon"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4" />
                  <path
                    d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  className={`rm-input${errors.firstName ? ' rm-input--error' : ''}`}
                  placeholder="Alijon"
                  value={form.firstName}
                  onChange={handleInputChange}
                  aria-required="true"
                  aria-invalid={!!errors.firstName}
                />
              </div>
            </FormField>

            <FormField label="Otasining ismi">
              <div className="rm-input-wrapper">
                <svg
                  className="rm-input__icon"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4" />
                  <path
                    d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  type="text"
                  name="middleName"
                  id="middleName"
                  className="rm-input"
                  placeholder="Aliyevich"
                  value={form.middleName}
                  onChange={handleInputChange}
                />
              </div>
            </FormField>

            <FormField label="Tug'ilgan sana" required error={errors.birthDate}>
              <div className="rm-select-wrapper">
                <svg
                  className="rm-input__icon rm-input__icon--left"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <rect
                    x="1"
                    y="3"
                    width="14"
                    height="12"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M1 7h14M5 1v4M11 1v4"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  type="date"
                  name="birthDate"
                  id="birthDate"
                  className={`rm-select rm-select--date${errors.birthDate ? ' rm-select--error' : ''}`}
                  value={form.birthDate}
                  onChange={handleInputChange}
                  aria-required="true"
                  aria-invalid={!!errors.birthDate}
                />
              </div>
            </FormField>

            <FormField label="Jinsi" required error={errors.gender}>
              <div className="rm-gender-group" role="group" aria-label="Jinsini tanlang">
                {(['Erkak', 'Ayol'] as StudentGender[]).map((g) => (
                  <label
                    key={g}
                    className={`rm-gender-option${form.gender === g ? ' rm-gender-option--active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={form.gender === g}
                      onChange={() => handleGenderChange(g)}
                      aria-required="true"
                      className="rm-gender-radio"
                    />
                    {g}
                    <span
                      className={`rm-gender-box${form.gender === g ? ' rm-gender-box--checked' : ''}`}
                      aria-hidden="true"
                    />
                  </label>
                ))}
              </div>
            </FormField>

            <FormField label="Telefon raqami" required error={errors.phone}>
              <div className="rm-input-wrapper">
                <svg
                  className="rm-input__icon"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 2h3l1.5 3.5-1.75 1.25A9.5 9.5 0 009.25 10.25L10.5 8.5 14 10v3c0 .552-.448 1-1 1C5.163 14 2 6.837 2 3c0-.552.448-1 1-1z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  className={`rm-input${errors.phone ? ' rm-input--error' : ''}`}
                  placeholder="+998 90 123 45 67"
                  value={form.phone}
                  onChange={handleInputChange}
                  aria-required="true"
                  aria-invalid={!!errors.phone}
                />
              </div>
            </FormField>

            <FormField label="Viloyat" required error={errors.region}>
              <SelectField
                id="region"
                name="region"
                value={form.region}
                onChange={handleInputChange}
                placeholder="Viloyat tanlang"
                options={REGIONS}
                required
                error={!!errors.region}
              />
            </FormField>

            <FormField label="Shahar(tuman)" required error={errors.district}>
              <div className="rm-input-wrapper">
                <svg
                  className="rm-input__icon"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 14V6l6-4 6 4v8"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <rect
                    x="5"
                    y="9"
                    width="2"
                    height="5"
                    rx="0.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <rect
                    x="9"
                    y="9"
                    width="2"
                    height="5"
                    rx="0.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                </svg>
                <input
                  type="text"
                  name="district"
                  id="district"
                  className={`rm-input${errors.district ? ' rm-input--error' : ''}`}
                  placeholder="Shahar yoki tuman"
                  value={form.district}
                  onChange={handleInputChange}
                  aria-required="true"
                  aria-invalid={!!errors.district}
                />
              </div>
            </FormField>

            <FormField label="Fillial" required error={errors.branch}>
              <SelectField
                id="branch"
                name="branch"
                value={form.branch}
                onChange={handleInputChange}
                placeholder="Fillial tanlang"
                options={BRANCHES}
                required
                error={!!errors.branch}
              />
            </FormField>

            <FormField label="Kurs" required error={errors.course}>
              <SelectField
                id="course"
                name="course"
                value={form.course}
                onChange={handleCourseChange}
                placeholder="Kurs tanlang"
                options={COURSES}
                required
                error={!!errors.course}
              />
            </FormField>

            <FormField label="Bosqich" required error={errors.level}>
              <SelectField
                id="level"
                name="level"
                value={form.level}
                onChange={handleInputChange}
                placeholder="Bosqich tanlang"
                options={availableLevels}
                disabled={!form.course}
                required
                error={!!errors.level}
              />
            </FormField>

            <FormField label="Guruh" required error={errors.group}>
              <SelectField
                id="group"
                name="group"
                value={form.group}
                onChange={handleInputChange}
                placeholder="Guruh tanlang"
                options={GROUPS}
                required
                error={!!errors.group}
              />
            </FormField>

            <FormField label="Manba" required error={errors.source}>
              <SelectField
                id="source"
                name="source"
                value={form.source}
                onChange={handleInputChange}
                placeholder="Manba tanlang"
                options={SOURCES}
                required
                error={!!errors.source}
              />
            </FormField>

            <FormField label="Izoh(ixtiyoriy)">
              <textarea
                name="note"
                id="note"
                className="rm-textarea"
                value={form.note}
                onChange={handleInputChange}
                rows={3}
              />
            </FormField>
          </div>

          <div className="rm-form__actions">
            <button type="button" className="rm-btn rm-btn--cancel" onClick={handleCancel}>
              Bekor qilish
            </button>
            <button type="submit" className="rm-btn rm-btn--submit">
              Qo&apos;shish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
