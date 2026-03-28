import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import './RegistrationModal.css';
import { API } from '../../api/api';
import {
  type LidRegion,
  type LidDistrict,
  type LidBranch,
  type LidCourse,
  type LidLevel,
  type LidGroup,
  type LidSource,
  type CreateLidPayload,
  type Lid,
  LID_STATUS,
} from '../../pages/lid/lid.types';
import { queryClient } from '../../main';

export type StudentGender = 'Erkak' | 'Ayol';

export interface RegistrationFormState {
  lastName: string;
  firstName: string;
  middleName: string;
  birthDate: string;
  gender: StudentGender | '';
  phone: string;
  regionId: string;
  districtId: string;
  branchId: string;
  courseId: string;
  levelId: string;
  groupId: string;
  sourceId: string;
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
  regionId: '',
  districtId: '',
  branchId: '',
  courseId: '',
  levelId: '',
  groupId: '',
  sourceId: '',
  note: '',
};

const UZ_PHONE_REGEX = /^\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/;

function validateForm(form: RegistrationFormState, t: any): FormErrors {
  const errors: FormErrors = {};
  if (!form.lastName.trim()) errors.lastName = t('registrationModal.errors.lastName');
  if (!form.firstName.trim()) errors.firstName = t('registrationModal.errors.firstName');
  if (!form.birthDate) errors.birthDate = t('registrationModal.errors.birthDate');
  if (!form.gender) errors.gender = t('registrationModal.errors.gender');
  if (!form.phone.trim()) {
    errors.phone = t('registrationModal.errors.phone');
  } else if (!UZ_PHONE_REGEX.test(form.phone.trim())) {
    errors.phone = t('registrationModal.errors.phoneFormat');
  }
  if (!form.regionId) errors.regionId = t('registrationModal.errors.regionId');
  if (!form.districtId) errors.districtId = t('registrationModal.errors.districtId');
  if (!form.branchId) errors.branchId = t('registrationModal.errors.branchId');
  if (!form.courseId) errors.courseId = t('registrationModal.errors.courseId');
  if (!form.levelId) errors.levelId = t('registrationModal.errors.levelId');
  if (!form.groupId) errors.groupId = t('registrationModal.errors.groupId');
  if (!form.sourceId) errors.sourceId = t('registrationModal.errors.sourceId');
  return errors;
}

function mapLidToForm(lid: Lid): RegistrationFormState {
  return {
    firstName: lid.first_name,
    lastName: lid.last_name,
    middleName: lid.father_name ?? '',
    birthDate: lid.birth_date ?? '',
    gender: lid.gender === 'male' ? 'Erkak' : 'Ayol',
    phone: lid.phone,
    regionId: lid.region_id != null ? String(lid.region_id) : '',
    districtId: lid.district_id != null ? String(lid.district_id) : '',
    branchId: lid.branch_id != null ? String(lid.branch_id) : '',
    courseId: lid.course_id != null ? String(lid.course_id) : '',
    levelId: lid.level_id != null ? String(lid.level_id) : '',
    groupId: lid.group_id != null ? String(lid.group_id) : '',
    sourceId: lid.source_id != null ? String(lid.source_id) : '',
    note: lid.comment ?? '',
  };
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
  options: { id: string | number; name: string }[];
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
      {options?.map((opt) => (
        <option key={opt.id} value={String(opt.id)}>
          {opt.name}
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

interface AuthMe {
  id: number;
}

interface RegistrationModalProps {
  onClose: () => void;
  editId?: number;
}

export const RegistrationModal = ({ onClose, editId }: RegistrationModalProps) => {
  const { t } = useTranslation();
  const isEditMode = editId != null;
  const [form, setForm] = useState<RegistrationFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [initialized, setInitialized] = useState(!isEditMode);
  const overlayRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLInputElement>(null);

  const { data: me } = useQuery<AuthMe>({
    queryKey: ['me'],
    queryFn: () => API.get('/me').then((res) => res.data),
  });

  const { data: lidData } = useQuery<Lid>({
    queryKey: ['lid', editId],
    queryFn: () => API.get(`/lids/${editId}`).then((res) => res.data),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (isEditMode && lidData) {
      const t = setTimeout(() => {
        setForm(mapLidToForm(lidData));
        setInitialized(true);
      }, 0);
      return () => clearTimeout(t);
    }
  }, [isEditMode, lidData]);

  const { data: regions } = useQuery<LidRegion[]>({
    queryKey: ['regions'],
    queryFn: () => API.get('/regions').then((res) => Array.isArray(res.data) ? res.data : res.data?.data || []),
  });

  const { data: districts } = useQuery<LidDistrict[]>({
    queryKey: ['districts', form.regionId],
    queryFn: () => API.get(`/regions/${form.regionId}/districts`).then((res) => Array.isArray(res.data) ? res.data : res.data?.data || []),
    enabled: !!form.regionId,
  });

  const { data: branches } = useQuery<LidBranch[]>({
    queryKey: ['branches', form.districtId],
    queryFn: () =>
      API.get('/branches', { params: { district_id: form.districtId } }).then((res) => Array.isArray(res.data) ? res.data : res.data?.data || []),
    enabled: !!form.districtId,
  });

  const { data: courses } = useQuery<LidCourse[]>({
    queryKey: ['courses', form.branchId],
    queryFn: () =>
      API.get('/courses', { params: { branch_id: form.branchId } }).then((res) => Array.isArray(res.data) ? res.data : res.data?.data || []),
    enabled: !!form.branchId,
  });

  const { data: levels } = useQuery<LidLevel[]>({
    queryKey: ['levels', form.courseId],
    queryFn: () =>
      API.get('/levels', { params: { course_id: form.courseId } }).then((res) => Array.isArray(res.data) ? res.data : res.data?.data || []),
    enabled: !!form.courseId,
  });

  const { data: groups } = useQuery<LidGroup[]>({
    queryKey: ['groups', form.levelId],
    queryFn: () =>
      API.get('/groups', { params: { level_id: form.levelId } }).then((res) => Array.isArray(res.data) ? res.data : res.data?.data || []),
    enabled: !!form.levelId,
  });

  const { data: sources } = useQuery<LidSource[]>({
    queryKey: ['sources'],
    queryFn: () => API.get('/sources').then((res) => Array.isArray(res.data) ? res.data : res.data?.data || []),
  });

  const createMutation = useMutation<void, Error, CreateLidPayload>({
    mutationFn: (payload) => API.post('/lids', payload).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lids'] });
      onClose();
    },
  });

  const updateMutation = useMutation<void, Error, CreateLidPayload>({
    mutationFn: (payload) => API.put(`/lids/${editId}`, payload).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lids'] });
      onClose();
    },
  });

  const activeMutation = isEditMode ? updateMutation : createMutation;

  useEffect(() => {
    if (initialized) {
      firstFocusRef.current?.focus();
    }
  }, [initialized]);

  useEffect(() => {
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
        if (submitted) setErrors(validateForm(next, t));
        return next;
      });
    },
    [submitted],
  );

  const handleGenderChange = useCallback(
    (value: StudentGender) => {
      setForm((prev) => {
        const next = { ...prev, gender: value };
        if (submitted) setErrors(validateForm(next, t));
        return next;
      });
    },
    [submitted],
  );

  const handleRegionChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      setForm((prev) => {
        const next: RegistrationFormState = {
          ...prev,
          regionId: value,
          districtId: '',
          branchId: '',
          courseId: '',
          levelId: '',
          groupId: '',
        };
        if (submitted) setErrors(validateForm(next, t));
        return next;
      });
    },
    [submitted],
  );

  const handleDistrictChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      setForm((prev) => {
        const next: RegistrationFormState = {
          ...prev,
          districtId: value,
          branchId: '',
          courseId: '',
          levelId: '',
          groupId: '',
        };
        if (submitted) setErrors(validateForm(next, t));
        return next;
      });
    },
    [submitted],
  );

  const handleBranchChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      setForm((prev) => {
        const next: RegistrationFormState = {
          ...prev,
          branchId: value,
          courseId: '',
          levelId: '',
          groupId: '',
        };
        if (submitted) setErrors(validateForm(next, t));
        return next;
      });
    },
    [submitted],
  );

  const handleCourseChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      setForm((prev) => {
        const next: RegistrationFormState = {
          ...prev,
          courseId: value,
          levelId: '',
          groupId: '',
        };
        if (submitted) setErrors(validateForm(next, t));
        return next;
      });
    },
    [submitted],
  );

  const handleLevelChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      setForm((prev) => {
        const next: RegistrationFormState = {
          ...prev,
          levelId: value,
          groupId: '',
        };
        if (submitted) setErrors(validateForm(next, t));
        return next;
      });
    },
    [submitted],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitted(true);
      const validationErrors = validateForm(form, t);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
      const payload: CreateLidPayload = {
        first_name: form.firstName,
        last_name: form.lastName,
        father_name: form.middleName,
        birth_date: form.birthDate,
        gender: form.gender === 'Erkak' ? 'male' : 'female',
        phone: form.phone,
        region_id: form.regionId,
        district_id: form.districtId,
        branch_id: form.branchId,
        course_id: form.courseId,
        level_id: form.levelId,
        group_id: form.groupId,
        source_id: form.sourceId,
        comment: form.note,
        operator_id: String(me?.id ?? ''),
        status: LID_STATUS.NEW_ONLINE,
      };
      activeMutation.mutate(payload);
    },
    [form, me, activeMutation],
  );

  const handleCancel = useCallback(() => {
    setForm(INITIAL_FORM);
    setErrors({});
    setSubmitted(false);
    onClose();
  }, [onClose]);

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
            {isEditMode ? t('registrationModal.edit') : t('registrationModal.create')}
          </h2>
          <button
            type="button"
            className="rm-modal__close"
            onClick={onClose}
            aria-label={t('registrationModal.closeModal')}
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
            <FormField label={t('registrationModal.fields.lastName')} required error={errors.lastName}>
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
                  placeholder={t('registrationModal.placeholders.lastName')}
                  value={form.lastName}
                  onChange={handleInputChange}
                  aria-required="true"
                  aria-invalid={!!errors.lastName}
                />
              </div>
            </FormField>

            <FormField label={t('registrationModal.fields.firstName')} required error={errors.firstName}>
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
                  placeholder={t('registrationModal.placeholders.firstName')}
                  value={form.firstName}
                  onChange={handleInputChange}
                  aria-required="true"
                  aria-invalid={!!errors.firstName}
                />
              </div>
            </FormField>

            <FormField label={t('registrationModal.fields.middleName')}>
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
                  placeholder={t('registrationModal.placeholders.middleName')}
                  value={form.middleName}
                  onChange={handleInputChange}
                />
              </div>
            </FormField>

            <FormField label={t('registrationModal.fields.birthDate')} required error={errors.birthDate}>
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

            <FormField label={t('registrationModal.fields.gender')} required error={errors.gender}>
              <div className="rm-gender-group" role="group" aria-label={t('registrationModal.fields.gender')}>
                {(['Erkak', 'Ayol'] as StudentGender[])?.map((g) => (
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
                    {g === 'Erkak' ? t('registrationModal.gender.male') : t('registrationModal.gender.female')}
                    <span
                      className={`rm-gender-box${form.gender === g ? ' rm-gender-box--checked' : ''}`}
                      aria-hidden="true"
                    />
                  </label>
                ))}
              </div>
            </FormField>

            <FormField label={t('registrationModal.fields.phone')} required error={errors.phone}>
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

            <FormField label={t('registrationModal.fields.regionId')} required error={errors.regionId}>
              <SelectField
                id="regionId"
                name="regionId"
                value={form.regionId}
                onChange={handleRegionChange}
                placeholder={t('registrationModal.placeholders.regionId')}
                options={regions?.map((r) => ({ id: r.id, name: r.name })) ?? []}
                required
                error={!!errors.regionId}
              />
            </FormField>

            <FormField label={t('registrationModal.fields.districtId')} required error={errors.districtId}>
              <SelectField
                id="districtId"
                name="districtId"
                value={form.districtId}
                onChange={handleDistrictChange}
                placeholder={t('registrationModal.placeholders.districtId')}
                options={districts?.map((d) => ({ id: d.id, name: d.name })) ?? []}
                disabled={!form.regionId}
                required
                error={!!errors.districtId}
              />
            </FormField>

            <FormField label={t('registrationModal.fields.branchId')} required error={errors.branchId}>
              <SelectField
                id="branchId"
                name="branchId"
                value={form.branchId}
                onChange={handleBranchChange}
                placeholder={t('registrationModal.placeholders.branchId')}
                options={branches?.map((b) => ({ id: b.id, name: b.name })) ?? []}
                disabled={!form.districtId}
                required
                error={!!errors.branchId}
              />
            </FormField>

            <FormField label={t('registrationModal.fields.courseId')} required error={errors.courseId}>
              <SelectField
                id="courseId"
                name="courseId"
                value={form.courseId}
                onChange={handleCourseChange}
                placeholder={t('registrationModal.placeholders.courseId')}
                options={courses?.map((c) => ({ id: c.id, name: c.name })) ?? []}
                disabled={!form.branchId}
                required
                error={!!errors.courseId}
              />
            </FormField>

            <FormField label={t('registrationModal.fields.levelId')} required error={errors.levelId}>
              <SelectField
                id="levelId"
                name="levelId"
                value={form.levelId}
                onChange={handleLevelChange}
                placeholder={t('registrationModal.placeholders.levelId')}
                options={levels?.map((l) => ({ id: l.id, name: l.name })) ?? []}
                disabled={!form.courseId}
                required
                error={!!errors.levelId}
              />
            </FormField>

            <FormField label={t('registrationModal.fields.groupId')} required error={errors.groupId}>
              <SelectField
                id="groupId"
                name="groupId"
                value={form.groupId}
                onChange={handleInputChange}
                placeholder={t('registrationModal.placeholders.groupId')}
                options={groups?.map((g) => ({ id: g.id, name: g.name })) ?? []}
                disabled={!form.levelId}
                required
                error={!!errors.groupId}
              />
            </FormField>

            <FormField label={t('registrationModal.fields.sourceId')} required error={errors.sourceId}>
              <SelectField
                id="sourceId"
                name="sourceId"
                value={form.sourceId}
                onChange={handleInputChange}
                placeholder={t('registrationModal.placeholders.sourceId')}
                options={sources?.map((s) => ({ id: s.id, name: s.name })) ?? []}
                required
                error={!!errors.sourceId}
              />
            </FormField>

            <FormField label={t('registrationModal.fields.noteOptional')}>
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
              {t('registrationModal.cancel')}
            </button>
            <button
              type="submit"
              className="rm-btn rm-btn--submit"
              disabled={activeMutation.isPending || (isEditMode && !initialized)}
            >
              {isEditMode ? t('registrationModal.save') : t('registrationModal.add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
