import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API } from '../../api/api';
import './payments.css';
import Loading from '../../components/Loading';

interface Branch {
  id: number;
  name: string;
  address: string;
  city: string;
}

interface Employee {
  id: number;
  full_name: string;
}

interface Course {
  id: number;
  name: string;
}

interface Student {
  id: number;
  first_name: string;
  last_name: string;
}

interface Group {
  id: number;
  name: string;
}

interface Payment {
  id: number;
  amount: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  student_id: number;
  group_id: number;
  course_id: number;
  branch_id: number;
  user_id: number;
  branch?: Branch;
  cashier?: Employee;
  student?: Student;
  group?: Group;
  course?: Course;
  teacher?: Employee;
}

interface PaymentPayload {
  amount: number;
  payment_method: string;
  course_id: number;
  branch_id: number;
  student_id?: number;
  group_id?: number;
}

const Payments = () => {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<number[]>([]);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | 'all' | null>(null);
  const [search, setSearch] = useState('');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showRange, setShowRange] = useState(false);

  const [formData, setFormData] = useState({
    familiya: '',
    ism: '',
    sharif: '',
    amount: '',
    payment_type: '',
    payment_period: '',
    course_id: '',
    teacher_id: '',
    cashier_id: '',
    branch_id: '',
    payment_date: '',
  });

  const { data: apiData, isLoading } = useQuery<Payment[]>({
    queryKey: ['payments'],
    queryFn: async () => {
      const { data } = await API.get('/payments');
      return data;
    },
  });

  const { data: branchesData } = useQuery<Branch[]>({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data } = await API.get('/branches');
      return data;
    },
  });

  const { data: employeesData } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data } = await API.get('/employees');
      return data;
    },
  });

  const { data: coursesData } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data } = await API.get('/courses');
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newPayment: typeof formData) => {
      const payload: PaymentPayload = {
        amount: Number(newPayment.amount),
        payment_method: newPayment.payment_type,
        course_id: Number(newPayment.course_id),
        branch_id: Number(newPayment.branch_id),
      };
      const { data } = await API.post('/payments', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: PaymentPayload }) => {
      const { data } = await API.put(`/payments/${id}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await API.delete(`/payments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });

  const closeModal = () => {
    setShowAddModal(false);
    setEditingPayment(null);
    setFormData({
      familiya: '',
      ism: '',
      sharif: '',
      amount: '',
      payment_type: '',
      payment_period: '',
      course_id: '',
      teacher_id: '',
      cashier_id: '',
      branch_id: '',
      payment_date: '',
    });
  };

  const openEditModal = (payment: Payment) => {
    setEditingPayment(payment);
    setFormData({
      familiya: payment.student?.last_name || '',
      ism: payment.student?.first_name || '',
      sharif: '',
      amount: payment.amount?.toString() || '',
      payment_type: payment.payment_method || '',
      payment_period: '',
      course_id: payment.course_id?.toString() || '',
      teacher_id: '',
      cashier_id: payment.user_id?.toString() || '',
      branch_id: payment.branch_id?.toString() || '',
      payment_date: payment.created_at?.split('T')[0] || '',
    });
    setShowAddModal(true);
  };

  const handleFormSubmit = () => {
    const payload: PaymentPayload = {
      amount: Number(formData.amount),
      payment_method: formData.payment_type,
      course_id: Number(formData.course_id),
      branch_id: Number(formData.branch_id),
    };

    if (editingPayment) {
      updateMutation.mutate({ id: editingPayment.id, updates: payload });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filtered = useMemo(() => {
    const payments = apiData || [];
    return payments
      .filter((u) => {
        const fullName =
          `${u.student?.last_name ?? ''} ${u.student?.first_name ?? ''}`.toLowerCase();
        const matchSearch = fullName.includes(search.toLowerCase());
        const matchPaymentType = paymentTypeFilter ? u.payment_method === paymentTypeFilter : true;

        const paymentDate = new Date(u.created_at).getTime();
        const start = fromDate ? new Date(fromDate).getTime() : null;
        const end = toDate ? new Date(toDate).getTime() : null;

        let matchDate = true;
        if (start && end) {
          matchDate = paymentDate >= start && paymentDate <= end;
        } else if (start) {
          matchDate = paymentDate >= start;
        } else if (end) {
          matchDate = paymentDate <= end;
        }

        return matchSearch && matchPaymentType && matchDate;
      })
      .sort((a, b) => b.id - a.id);
  }, [apiData, search, paymentTypeFilter, fromDate, toDate]);

  const confirmDelete = () => {
    if (deleteTarget === 'all') {
      selected.forEach((id) => deleteMutation.mutate(id));
      setSelected([]);
    } else if (typeof deleteTarget === 'number') {
      deleteMutation.mutate(deleteTarget);
      setSelected((p) => p.filter((x) => x !== deleteTarget));
    }
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  if (isLoading) return <Loading />;

  return (
    <section className="payments container">
      <h1 className="main-title">To‘lovlar</h1>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal add-payment-modal large">
            <h3 className="modal-title">
              {editingPayment ? 'To‘lovni tahrirlash' : 'Yangi To‘lov qo‘shish'}
            </h3>

            <div className="add-payment-form two-column">
              {/* LEFT */}
              <div className="form-left">
                <div className="form-group">
                  <label>Familiya</label>
                  <input
                    value={formData.familiya}
                    onChange={(e) => setFormData({ ...formData, familiya: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Ism</label>
                  <input
                    value={formData.ism}
                    onChange={(e) => setFormData({ ...formData, ism: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Sharif</label>
                  <input
                    value={formData.sharif}
                    onChange={(e) => setFormData({ ...formData, sharif: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Summa</label>
                  <input
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>To‘lov turi</label>
                  <select
                    value={formData.payment_type}
                    onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
                  >
                    <option value="">Tanlang</option>
                    <option value="Naqt">Naqd</option>
                    <option value="Karta">Karta</option>
                    <option value="Bank">Bank</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>To‘lov davri</label>
                  <select
                    value={formData.payment_period}
                    onChange={(e) => setFormData({ ...formData, payment_period: e.target.value })}
                  >
                    <option value="">Tanlang</option>
                    <option value="Yanvar">Yanvar</option>
                    <option value="Fevral">Fevral</option>
                    <option value="Mart">Mart</option>
                  </select>
                </div>
              </div>

              {/* RIGHT */}
              <div className="form-right">
                <div className="form-group">
                  <label>Filial</label>
                  <select
                    value={formData.branch_id}
                    onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                  >
                    <option value="">Tanlang</option>
                    {branchesData?.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.address}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Kurs</label>
                  <select
                    value={formData.course_id}
                    onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                  >
                    <option value="">Tanlang</option>
                    {coursesData?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>O‘qituvchi</label>
                  <select
                    value={formData.teacher_id}
                    onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                  >
                    <option value="">Tanlang</option>
                    {employeesData?.map((e) => (
                      <option key={e.id} value={e.id} color="red">
                        {e.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Kassir</label>
                  <select
                    value={formData.cashier_id}
                    onChange={(e) => setFormData({ ...formData, cashier_id: e.target.value })}
                  >
                    <option value="">Tanlang</option>
                    {employeesData?.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>To‘lov sanasi</label>
                  <input
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="modal-actions center">
              <button className="primary" onClick={handleFormSubmit}>
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal small">
            <h3>O‘chirishni tasdiqlaysizmi?</h3>
            <div className="modal-actions">
              <button className="cancel" onClick={() => setShowDeleteModal(false)}>
                Bekor
              </button>
              <button className="danger" onClick={confirmDelete}>
                Tasdiqlash
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="payments-filters">
        <button className="add-new-payment" onClick={() => setShowAddModal(true)}>
          Qo‘shish
        </button>
        <button
          className="delete-all"
          disabled={!selected.length}
          onClick={() => {
            setDeleteTarget('all');
            setShowDeleteModal(true);
          }}
        >
          O‘chirish
        </button>
        <select
          className="payment-type-select"
          value={paymentTypeFilter}
          onChange={(e) => setPaymentTypeFilter(e.target.value)}
        >
          <option value="">To‘lov turi</option>
          <option value="Naqt">Naqt</option>
          <option value="Karta">Karta</option>
          <option value="Bank">Bank</option>
        </select>

        <div className="date-range-wrapper">
          <input
            type="text"
            readOnly
            className="date-range-input"
            placeholder="1.02.2026-30.02.2026"
            value={
              fromDate && toDate
                ? `${fromDate.replaceAll('-', '.')}-${toDate.replaceAll('-', '.')}`
                : ''
            }
            onClick={() => setShowRange(true)}
          />
          <i className="fa-solid fa-calendar-days calendar-icon"></i>

          {showRange && (
            <div className="range-box">
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setShowRange(false);
                }}
              />
            </div>
          )}
        </div>

        <div className="search-box">
          <input placeholder="Qidiruv..." onChange={(e) => setSearch(e.target.value)} />
          <i className="fa-solid fa-magnifying-glass"></i>
        </div>
      </div>

      <div className="payments-table-wrapper">
        <table className="payments-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>F.I.SH</th>
              <th>Summa</th>
              <th>To‘lov turi</th>
              <th>Kurs</th>
              <th>Kassir</th>
              <th>Filial</th>
              <th>Harakatlar</th>
            </tr>
          </thead>
          <tbody>
            {filtered?.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>
                  {u.student?.last_name} {u.student?.first_name}
                </td>
                <td>{u.amount}</td>
                <td>{u.payment_method}</td>
                <td>{u.course?.name}</td>
                <td>{u.cashier?.full_name}</td>
                <td>{u.branch?.address}</td>
                <td className="actions">
                  <button className="payment-edit-btn" onClick={() => openEditModal(u)}>
                    <i className="fa-solid fa-pen"></i>
                  </button>
                  <button
                    className="payment-delete-btn"
                    onClick={() => {
                      setDeleteTarget(u.id);
                      setShowDeleteModal(true);
                    }}
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Payments;
