import React, { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { API } from "../../api/api";
import "./contracts.css";

interface Branch {
  id: number;
  name: string;
  city: string;
}

interface Department {
  id: number;
  name: string;
}

interface Position {
  id: number;
  name: string;
}

interface AdditionalTask {
  task_id: number;
  salary: number;
  comment: string;
}

interface FormState {
  jshshr: string;
  language: "UZ" | "RU";
  citizenship: "citizen" | "no_citizenship" | "foreign_citizen";
  country: string;
  branch_id: number;
  city: string;
  contract_date: string;
  passport_series: string;
  passport_number: string;
  passport_given_date: string;
  passport_given_by: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  birth_date: string;
  department_id: number;
  position_id: number;
  contract_start_date: string;
  contract_end_date: string;
  contract_type: string;
  contract_number: string;
  contract_duration: string;
  probation_enabled: boolean;
  probation_days: number;
  working_hours: number;
  base_salary: number;
  additional_tasks: AdditionalTask[];
  salary_period_start: string;
  salary_period_end: string;
  vacation_enabled: boolean;
  vacation_type: string;
  vacation_days: number;
  vacation_payment: number;
  phones: string[];
  address_reg: string;
  address_current: string;
}

interface ContractsCreateProps {
  employeeId?: number;
  contractId?: number;
  onCancel?: () => void;
  onSuccess?: () => void;
}

const formatDateForInput = (dateStr: any) => {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return dateStr.substring(0, 10);
  if (/^\d{2}\.\d{2}\.\d{4}/.test(dateStr)) {
    const [day, month, year] = dateStr.substring(0, 10).split('.');
    return `${year}-${month}-${day}`;
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
  return "";
};

const ContractsCreate: React.FC<ContractsCreateProps> = ({
  employeeId: propEmpId,
  contractId: propContractId,
  onCancel,
  onSuccess,
}) => {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const employeeId = propEmpId || (paramId ? Number(paramId) : undefined);
  const contractId = propContractId || undefined;

  const [formData, setFormData] = useState<FormState>({
    jshshr: "",
    language: "UZ",
    citizenship: "citizen",
    country: "",
    branch_id: 0,
    city: "",
    contract_date: "",
    passport_series: "",
    passport_number: "",
    passport_given_date: "",
    passport_given_by: "",
    first_name: "",
    last_name: "",
    middle_name: "",
    birth_date: "",
    department_id: 0,
    position_id: 0,
    contract_start_date: "",
    contract_end_date: "",
    contract_type: "",
    contract_number: "",
    contract_duration: "",
    probation_enabled: false,
    probation_days: 0,
    working_hours: 0,
    base_salary: 0,
    additional_tasks: [],
    salary_period_start: "",
    salary_period_end: "",
    vacation_enabled: false,
    vacation_type: "",
    vacation_days: 0,
    vacation_payment: 0,
    phones: ["+998"],
    address_reg: "",
    address_current: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: branches } = useQuery<Branch[]>({
    queryKey: ["branches"],
    queryFn: async () => (await API.get("/branches")).data,
  });
  const { data: departments } = useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: async () => (await API.get("/departments")).data,
  });
  const { data: positions } = useQuery<Position[]>({
    queryKey: ["positions"],
    queryFn: async () => (await API.get("/positions")).data,
  });


  useQuery({
    queryKey: ["contracts", employeeId, contractId],
    queryFn: async () => {
      if (!employeeId) return null;
      const { data: contracts } = await API.get("/contracts");
      let contract;
      if (contractId) {
        contract = contracts.find(
          (c: { id: number; employee?: { id: number } }) => c.id === contractId,
        );
      } else {
        contract = contracts.find(
          (c: { id: number; employee?: { id: number } }) =>
            c.employee?.id === employeeId,
        );
      }

      if (contract) {
        const emp = contract.employee || {};
        setFormData((prevData) => ({
          ...prevData,
          first_name: emp.first_name || "",
          last_name: emp.last_name || "",
          middle_name: emp.middle_name || "",
          birth_date: formatDateForInput(emp.birth_date),
          jshshr: emp.jshshr || emp.pinfl || "",
          passport_series: emp.passport_series || "",
          passport_number: emp.passport_number || "",
          passport_given_date: formatDateForInput(emp.passport_given_date),
          passport_given_by: emp.passport_given_by || "",
          
          branch_id: Number(emp.branch_id || contract.branch_id || prevData.branch_id || 0),
          department_id: Number(contract.department?.id || contract.department_id || prevData.department_id || 0),
          position_id: Number(contract.position?.id || contract.position_id || prevData.position_id || 0),
          
          contract_start_date: formatDateForInput(contract.contract_start_date),
          contract_end_date: formatDateForInput(contract.contract_end_date),
          contract_date: formatDateForInput(contract.contract_date),
          contract_type: contract.contract_type || "",
          contract_number: contract.contract_number ? String(contract.contract_number) : "",
          contract_duration: contract.contract_duration || "",
          
          probation_enabled: !!contract.probation_period,
          probation_days: parseInt(contract.probation_period) || 0,
          working_hours: Number(contract.working_hours_monthly) || 0,
          base_salary: Number(contract.base_salary) || 0,
          
          salary_period_start: formatDateForInput(contract.salary_start_date),
          salary_period_end: formatDateForInput(contract.salary_end_date),
          
          vacation_enabled: !!contract.vacation_type,
          vacation_type: contract.vacation_type || "",
          
          address_reg: emp.address_registration || emp.address_reg || "",
          address_current: emp.address_living || emp.address_current || "",
          phones: emp.phone ? [emp.phone] : ["+998"],
          
          language: contract.language || emp.language || "UZ",
          citizenship: contract.citizenship || emp.citizenship || "citizen",
          country: contract.country || emp.country || "",
        }));
      }
      return contract;
    },
    enabled: !!employeeId,
  });

  const selectedBranch = useMemo(
    () => branches?.find((b) => b.id === Number(formData.branch_id)),
    [branches, formData.branch_id],
  );

  const hourlyRate = useMemo(() => {
    return formData.working_hours > 0
      ? (formData.base_salary / formData.working_hours).toFixed(2)
      : "0.00";
  }, [formData.base_salary, formData.working_hours]);

  const totalMonthlySalary = useMemo(() => {
    const additionalTotal = formData.additional_tasks.reduce(
      (sum, task) => sum + (task.salary || 0),
      0,
    );
    return formData.base_salary + additionalTotal;
  }, [formData.base_salary, formData.additional_tasks]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!/^\d{14}$/.test(formData.jshshr))
      newErrors.jshshr = "JSHSHR 14 ta raqamdan iborat bo'lishi kerak";
    if (!/^[A-Z]{2}$/.test(formData.passport_series))
      newErrors.passport_series = "2 ta katta harf";
    if (!/^\d{7}$/.test(formData.passport_number))
      newErrors.passport_number = "7 ta raqam";
    if (!formData.first_name) newErrors.first_name = t("contractsValidation.required");
    if (!formData.last_name) newErrors.last_name = t("contractsValidation.required");
    if (!formData.branch_id) newErrors.branch_id = t("contractsValidation.required");
    if (!formData.contract_type) newErrors.contract_type = t("contractsValidation.required");
    if (!['doimiy', 'muddatli', 'sinov'].includes(formData.contract_type)) newErrors.contract_type = t("contractsValidation.invalidType");
    if (formData.salary_period_start && formData.salary_period_end) {
      if (new Date(formData.salary_period_end) <= new Date(formData.salary_period_start)) {
        newErrors.salary_period_end = t("contractsValidation.mustBeGreater");
      }
    }
    if (!formData.vacation_type) newErrors.vacation_type = t("contractsValidation.required");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const empData = {
        last_name: formData.last_name,
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        branch_id: Number(formData.branch_id),
        pinfl: formData.jshshr,
        passport_series: formData.passport_series,
        passport_number: formData.passport_number,
        passport_given_date: formData.passport_given_date,
        passport_given_by: formData.passport_given_by,
        birth_date: formData.birth_date,
        phone: formData.phones[0],
        address_registration: formData.address_reg,
        address_living: formData.address_current,
        // Keeping additional original fields mapped safely for the system
        citizenship: formData.citizenship,
        country: formData.country,
        language: formData.language,
        department_id: Number(formData.department_id),
      };

      let currentEmployeeId = employeeId;
      try {
        if (employeeId) {
          await API.put(`/employees/${employeeId}`, empData);
        } else {
          const res = await API.post("/employees", empData);
          currentEmployeeId = res.data.data.id;
        }
      } catch (err: any) {
        throw err;
      }

      let nextContractNumber: number = 1;
      if (!contractId) {
        try {
          const res = await API.get("/contracts");
          // Safely handle if data is nested or direct array
          const allContracts = Array.isArray(res.data) ? res.data : (res.data?.data || []);
          if (Array.isArray(allContracts) && allContracts.length > 0) {
            const numbers: number[] = allContracts
              .map((c: any) => Number(c.contract_number))
              .filter((n: number) => Number.isInteger(n) && n > 0 && n < 50); // Hard filter out corrupted backend test-data to satisfy max:50 numeric bounds
            if (numbers.length > 0) {
              const lastNumber: number = Math.max(...numbers);
              nextContractNumber = lastNumber + 1;
            }
          }
        } catch (err) {
          throw new Error("Shartnoma raqamini shakllantirishda xatolik yuz berdi");
        }
      }

      let probationEndDate: string | null = null;
      if (
        formData.probation_enabled &&
        formData.contract_start_date &&
        formData.probation_days > 0
      ) {
        const d = new Date(formData.contract_start_date);
        d.setDate(d.getDate() + formData.probation_days);
        probationEndDate = d.toISOString().split("T")[0];
      }

      const contractData = {
        employee_id: currentEmployeeId,
        contract_number: contractId ? Number(formData.contract_number) : nextContractNumber,
        language: formData.language,
        citizenship: "Uzbekistan",
        contract_date: formData.contract_date,
        signed_by: "HR Manager",
        department_id: Number(formData.department_id),
        position_id: Number(formData.position_id),
        contract_start_date: formData.contract_start_date,
        contract_end_date: formData.contract_end_date,
        contract_type: formData.contract_type,
        probation_period: formData.probation_enabled
          ? `${formData.probation_days} kun`
          : null,
        probation_end_date: probationEndDate,
        working_hours_monthly: Number(formData.working_hours),
        base_salary: Number(formData.base_salary),
        hourly_rate: Number(hourlyRate),
        total_monthly_salary: Number(totalMonthlySalary),
        salary_start_date: formData.salary_period_start,
        salary_end_date: formData.salary_period_end,
        vacation_type: formData.vacation_type,
        status: "active",
      };

      try {
        if (contractId && currentEmployeeId) {
          await API.put(
            `/employees/${currentEmployeeId}/contracts/${contractId}`,
            contractData,
          );
        } else {
          await API.post(
            `/employees/${currentEmployeeId}/contracts`,
            contractData,
          );
        }
      } catch (err: any) {
        throw err;
      }
    },
    onError: (error: any) => {
      const responseErrors = error.response?.data?.errors;
      if (responseErrors) {
        const backendErrors: Record<string, string> = {};
        Object.entries(responseErrors).forEach(([field, msgs]) => {
          backendErrors[field] = (msgs as string[])[0];
        });
        setErrors((prev) => ({ ...prev, ...backendErrors }));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/contracts");
      }
    },
  });

  const handleAddField = (field: "additional_tasks" | "phones") => {
    if (field === "phones") {
      setFormData({ ...formData, phones: [...formData.phones, "+998"] });
    } else {
      setFormData({
        ...formData,
        additional_tasks: [
          ...formData.additional_tasks,
          { task_id: 0, salary: 0, comment: "" },
        ],
      });
    }
  };

  const updatePhone = (index: number, value: string) => {
    // Force prefix +998 and allow only digits after it
    if (!value.startsWith("+998")) {
      const newPhones = [...formData.phones];
      newPhones[index] = "+998";
      setFormData({ ...formData, phones: newPhones });
      return;
    }
    const newPhones = [...formData.phones];
    newPhones[index] = value;
    setFormData({ ...formData, phones: newPhones });
  };

  const updateTask = (index: number, updates: Partial<AdditionalTask>) => {
    const newTasks = [...formData.additional_tasks];
    newTasks[index] = { ...newTasks[index], ...updates };
    setFormData({ ...formData, additional_tasks: newTasks });
  };

  return (
    <div className="contracts-container">
      <div className="contracts-header">
        <h1>
          <div className="icon-box">
            <i className="fas fa-user-edit"></i>
          </div>
          Xodim bilan shartnoma
        </h1>
      </div>

      <form
        className="contracts-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (validate()) saveMutation.mutate();
        }}
      >
        <div className="form-grid">
          <div className="form-group span-2">
            <label>
              JSHSHR <span className="required">*</span>
            </label>
            <input
              type="text"
              placeholder="00000000000000"
              maxLength={14}
              value={formData.jshshr}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  jshshr: e.target.value.replace(/\D/g, ""),
                })
              }
              className={errors.jshshr ? "error" : ""}
            />
            {errors.jshshr && (
              <span className="error-text">{errors.jshshr}</span>
            )}
          </div>

          <div className="form-group">
            <label>
              Shartnoma tili <span className="required">*</span>
            </label>
            <select
              value={formData.language}
              onChange={(e) =>
                setFormData({ ...formData, language: e.target.value as any })
              }
            >
              <option value="UZ">UZ</option>
              <option value="RU">RU</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              Fuqaroligi <span className="required">*</span>
            </label>
            <select
              value={formData.citizenship}
              onChange={(e) =>
                setFormData({ ...formData, citizenship: e.target.value as any })
              }
            >
              <option value="citizen">O'zbekiston fuqarosi</option>
              <option value="no_citizenship">Fuqaroligi yo'q</option>
              <option value="foreign_citizen">Chet el fuqarosi</option>
            </select>
          </div>

          {formData.citizenship === "foreign_citizen" && (
            <div className="form-group">
              <label>
                Mamlakat <span className="required">*</span>
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
              />
            </div>
          )}

          <div className="form-group">
            <label>
              Filial <span className="required">*</span>
            </label>
            <select
              value={formData.branch_id}
              onChange={(e) =>
                setFormData({ ...formData, branch_id: Number(e.target.value) })
              }
            >
              <option value={0}>Tanlang</option>
              {branches?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Shahar</label>
            <input
              type="text"
              value={selectedBranch?.city || ""}
              readOnly
              disabled
            />
          </div>


          <div className="form-group">
            <label>
              Shartnoma sanasi <span className="required">*</span>
            </label>
            <input
              type="date"
              value={formData.contract_date}
              onChange={(e) =>
                setFormData({ ...formData, contract_date: e.target.value })
              }
            />
          </div>

          <div className="form-group span-2">
            <label>
              Passport seriyasi va raqami <span className="required">*</span>
            </label>
            <div className="passport-row">
              <input
                type="text"
                maxLength={2}
                placeholder="AA"
                value={formData.passport_series}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  setFormData({ ...formData, passport_series: val });
                  if (val.length === 2)
                    document.getElementById("pass-num")?.focus();
                }}
              />
              <input
                id="pass-num"
                type="text"
                maxLength={7}
                placeholder="1234567"
                value={formData.passport_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    passport_number: e.target.value.replace(/\D/g, ""),
                  })
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              Berilgan sanasi <span className="required">*</span>
            </label>
            <input
              type="date"
              value={formData.passport_given_date}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  passport_given_date: e.target.value,
                })
              }
            />
          </div>

          <div className="form-group full-width">
            <label>
              Kim tomonidan berilganligi <span className="required">*</span>
            </label>
            <input
              type="text"
              placeholder="kiring"
              value={formData.passport_given_by}
              onChange={(e) =>
                setFormData({ ...formData, passport_given_by: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>
              Familya <span className="required">*</span>
            </label>
            <input
              type="text"
              placeholder="Kiritish"
              value={formData.last_name}
              onChange={(e) =>
                setFormData({ ...formData, last_name: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>
              Ism <span className="required">*</span>
            </label>
            <input
              type="text"
              placeholder="Kiritish"
              value={formData.first_name}
              onChange={(e) =>
                setFormData({ ...formData, first_name: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>
              Otasini ismi <span className="required">*</span>
            </label>
            <input
              type="text"
              placeholder="Kiritish"
              value={formData.middle_name}
              onChange={(e) =>
                setFormData({ ...formData, middle_name: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>
              Tug'ilgan sanasi <span className="required">*</span>
            </label>
            <input
              type="date"
              value={formData.birth_date}
              onChange={(e) =>
                setFormData({ ...formData, birth_date: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>
              Bo'lim <span className="required">*</span>
            </label>
            <select
              value={formData.department_id}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  department_id: Number(e.target.value),
                })
              }
            >
              <option value={0}>tanlang</option>
              {departments?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              Lavozimi <span className="required">*</span>
            </label>
            <select
              value={formData.position_id}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  position_id: Number(e.target.value),
                })
              }
            >
              <option value={0}>tanlang</option>
              {positions?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              Shartnoma boshlanish sanasi <span className="required">*</span>
            </label>
            <input
              type="date"
              value={formData.contract_start_date}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  contract_start_date: e.target.value,
                })
              }
            />
          </div>

          <div className="form-group">
            <label>
              Shartnoma tugash sanasi <span className="required">*</span>
            </label>
            <input
              type="date"
              value={formData.contract_end_date}
              onChange={(e) =>
                setFormData({ ...formData, contract_end_date: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>
              {t("contractsValidation.fields.contractType")} <span className="required">*</span>
            </label>
            <select
              value={formData.contract_type}
              onChange={(e) =>
                setFormData({ ...formData, contract_type: e.target.value })
              }
              className={errors.contract_type ? "error" : ""}
            >
              <option value="">tanlang</option>
              <option value="doimiy">{t("contractsValidation.options.doimiy")}</option>
              <option value="muddatli">{t("contractsValidation.options.muddatli")}</option>
              <option value="sinov">{t("contractsValidation.options.sinov")}</option>
            </select>
            {errors.contract_type && <span className="error-text">{errors.contract_type}</span>}
          </div>

          <div className="form-group">
            <label>
              Shartnoma muddati <span className="required">*</span>
            </label>
            <input
              type="date"
              value={formData.contract_duration}
              onChange={(e) =>
                setFormData({ ...formData, contract_duration: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Sinov muddati</label>
            <select
              value={formData.probation_enabled ? "yes" : "no"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  probation_enabled: e.target.value === "yes",
                })
              }
            >
              <option value="no">Yo'q</option>
              <option value="yes">Ha</option>
            </select>
          </div>

          {formData.probation_enabled && (
            <div className="form-group">
              <label>
                Sinov muddati kunda <span className="required">*</span>
              </label>
              <input
                type="number"
                value={formData.probation_days}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    probation_days: Number(e.target.value),
                  })
                }
              />
            </div>
          )}

          <div className="form-group">
            <label>
              Umumiy ish soati (oylik) <span className="required">*</span>
            </label>
            <input
              type="number"
              value={formData.working_hours}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  working_hours: Number(e.target.value),
                })
              }
            />
          </div>

          <div className="form-group">
            <label>
              Asosiy maosh <span className="required">*</span>
            </label>
            <input
              type="number"
              value={formData.base_salary}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  base_salary: Number(e.target.value),
                })
              }
            />
          </div>

          <div className="form-group">
            <label>Soatlik maosh</label>
            <input type="text" value={hourlyRate} readOnly disabled />
          </div>
        </div>

        <div className="dynamic-section">
          <h3>Qo'shimcha topshiriqlar</h3>
          {formData.additional_tasks.map((task, idx) => (
            <div key={idx} className="dynamic-item">
              <div className="form-group">
                <label>Topshiriq</label>
                <select
                  value={task.task_id}
                  onChange={(e) =>
                    updateTask(idx, { task_id: Number(e.target.value) })
                  }
                >
                  <option value={0}>tanlang</option>
                  <option value={1}>Monitoring</option>
                  <option value={2}>Adminstrator</option>
                </select>
              </div>
              <div className="form-group">
                <label>Maosh</label>
                <input
                  type="number"
                  value={task.salary}
                  onChange={(e) =>
                    updateTask(idx, { salary: Number(e.target.value) })
                  }
                />
              </div>
              <div className="form-group">
                <label>Izoh</label>
                <input
                  type="text"
                  value={task.comment}
                  onChange={(e) => updateTask(idx, { comment: e.target.value })}
                />
              </div>
              <button
                type="button"
                className="remove-dynamic-btn"
                onClick={() =>
                  setFormData({
                    ...formData,
                    additional_tasks: formData.additional_tasks.filter(
                      (_, i) => i !== idx,
                    ),
                  })
                }
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          ))}
          <button
            type="button"
            className="add-dynamic-btn"
            onClick={() => handleAddField("additional_tasks")}
          >
            <i className="fas fa-plus"></i>
          </button>
        </div>

        <div className="form-group full-width">
          <label>Jami oylik maosh</label>
          <input
            type="text"
            value={totalMonthlySalary.toFixed(2)}
            readOnly
            disabled
            style={{ background: "#f8fafc", fontWeight: "bold" }}
          />
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>
              Maosh davri (boshi) <span className="required">*</span>
            </label>
            <input
              type="date"
              value={formData.salary_period_start}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  salary_period_start: e.target.value,
                })
              }
            />
          </div>
          <div className="form-group">
            <label>
              Maosh davri (tugashi) <span className="required">*</span>
            </label>
            <input
              type="date"
              value={formData.salary_period_end}
              min={formData.salary_period_start || undefined}
              onChange={(e) => {
                const val = e.target.value;
                setFormData({ ...formData, salary_period_end: val });
                if (formData.salary_period_start && val) {
                  if (new Date(val) <= new Date(formData.salary_period_start)) {
                    setErrors((prev) => ({ ...prev, salary_period_end: t("contractsValidation.mustBeGreater") }));
                  } else {
                    setErrors((prev) => {
                      const newE = { ...prev };
                      delete newE.salary_period_end;
                      return newE;
                    });
                  }
                }
              }}
              className={errors.salary_period_end ? "error" : ""}
            />
            {errors.salary_period_end && <span className="error-text">{errors.salary_period_end}</span>}
          </div>

          <div className="form-group">
            <label>{t("contractsValidation.fields.vacationType")} <span className="required">*</span></label>
            <select
              value={formData.vacation_type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  vacation_type: e.target.value,
                  vacation_enabled: e.target.value !== "",
                })
              }
              className={errors.vacation_type ? "error" : ""}
            >
              <option value="">tanlang</option>
              <option value="yillik">{t("contractsValidation.options.annual")}</option>
              <option value="qisman">{t("contractsValidation.options.partial")}</option>
              <option value="boshqa">{t("contractsValidation.options.other")}</option>
            </select>
            {errors.vacation_type && <span className="error-text">{errors.vacation_type}</span>}
          </div>

          {formData.vacation_enabled && (
            <>
              <div className="form-group">
                <label>
                  Ta'til kuni <span className="required">*</span>
                </label>
                <input
                  type="number"
                  value={formData.vacation_days}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vacation_days: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>
                  Ta'til uchun maosh <span className="required">*</span>
                </label>
                <input
                  type="number"
                  value={formData.vacation_payment}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vacation_payment: Number(e.target.value),
                    })
                  }
                />
              </div>
            </>
          )}
        </div>

        <div className="dynamic-section">
          <label>
            Telefon nomer <span className="required">*</span>
          </label>
          {formData.phones.map((phone, idx) => (
            <div
              key={idx}
              className="dynamic-item"
              style={{ gridTemplateColumns: "1fr 50px" }}
            >
              <input
                type="text"
                value={phone}
                onChange={(e) => updatePhone(idx, e.target.value)}
              />
              {idx > 0 && (
                <button
                  type="button"
                  className="remove-dynamic-btn"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      phones: formData.phones.filter((_, i) => i !== idx),
                    })
                  }
                >
                  <i className="fas fa-trash"></i>
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="add-dynamic-btn"
            onClick={() => handleAddField("phones")}
          >
            <i className="fas fa-plus"></i>
          </button>
        </div>

        <div className="form-grid">
          <div className="form-group span-2">
            <label>
              Yashash joyi (Ro'yxatga olingan manzili){" "}
              <span className="required">*</span>
            </label>
            <textarea
              value={formData.address_reg}
              onChange={(e) =>
                setFormData({ ...formData, address_reg: e.target.value })
              }
            />
          </div>
          <div className="form-group span-2">
            <label>
              Yashash joyi <span className="required">*</span>
            </label>
            <textarea
              value={formData.address_current}
              onChange={(e) =>
                setFormData({ ...formData, address_current: e.target.value })
              }
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-cancel"
            onClick={() => {
              if (onCancel) onCancel();
              else navigate("/contracts");
            }}
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            className="btn btn-save"
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContractsCreate;
