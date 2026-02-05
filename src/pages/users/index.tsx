import { useState, useMemo } from 'react';
import './users.css';

interface User {
  id: number;
  name: string;
  phone: string;
  role: string;
  status: string;
  branch: string;
  login: string;
  date: string;
  workTime?: string;
}

const initialData: User[] = [
  {
    id: 1145,
    name: 'Alijonov Valijon Abdullayevich',
    phone: '+998901234567',
    role: 'Administrator',
    status: 'Neaktiv',
    branch: 'Andijon',
    login: 'Alijonov',
    date: '2026-01-02',
  },
  {
    id: 1146,
    name: 'Ganisher Valiyev Abdullayevich',
    phone: '+998901234567',
    role: 'Kassir',
    status: 'Neaktiv',
    branch: 'Andijon',
    login: 'Ganisher',
    date: '2026-01-05',
  },
];

const genPassword = () =>
  Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4);

const Users = () => {
  const [users, setUsers] = useState<User[]>(() => initialData);
  const [selected, setSelected] = useState<number[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [workTimeId, setWorkTimeId] = useState<number | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | 'all' | null>(null);

  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [fromDate, setFromDate] = useState('');

  const [password, setPassword] = useState(genPassword());

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const d = new Date(u.date).getTime();
      const from = fromDate ? new Date(fromDate).getTime() : null;

      return (
        u.name.toLowerCase().includes(search.toLowerCase()) &&
        (role ? u.role === role : true) &&
        (from ? d >= from : true)
      );
    });
  }, [users, search, role, fromDate]);

  const toggleAll = (checked: boolean) => setSelected(checked ? filtered.map((u) => u.id) : []);

  const toggleOne = (id: number) =>
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const confirmDelete = () => {
    if (deleteTarget === 'all') {
      setUsers((prev) => prev.filter((u) => !selected.includes(u.id)));
      setSelected([]);
    }

    if (typeof deleteTarget === 'number') {
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget));
      setSelected((p) => p.filter((x) => x !== deleteTarget));
    }

    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const archiveUser = (u: User) => {
    const archived = JSON.parse(localStorage.getItem('archivedUsers') || '[]');
    localStorage.setItem('archivedUsers', JSON.stringify([...archived, u]));
    setUsers((p) => p.filter((x) => x.id !== u.id));
  };

  const updateUser = (id: number, key: keyof User, value: string) => {
    setUsers((p) => p.map((u) => (u.id === id ? { ...u, [key]: value } : u)));
  };

  return (
    <section className="users container">
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Yangi foydalanuvchi qo‘shish</h3>

            <div className="form-grid">
              <input placeholder="Familiya" />
              <input placeholder="Ism" />
              <input placeholder="Sharif" />
              <input placeholder="Telefon" />
              <input placeholder="Login" />
              <div style={{ position: 'relative' }}>
                <input value={password} readOnly />
                <button
                  style={{ position: 'absolute', right: 6, top: 6 }}
                  onClick={() => setPassword(genPassword())}
                >
                  🔄
                </button>
              </div>
              <input type="date" />
              <select>
                <option>Administrator</option>
                <option>Kassir</option>
                <option>Yetakchi</option>
              </select>
            </div>

            <div className="modal-actions">
              <button className="cancel" onClick={() => setShowAddModal(false)}>
                Bekor
              </button>
              <button className="primary">Saqlash</button>
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

      <div className="users-filters">
        <button className="add-new-user" onClick={() => setShowAddModal(true)}>
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

        <select onChange={(e) => setRole(e.target.value)}>
          <option value="">Xodim turi</option>
          <option value="Administrator">Administrator</option>
          <option value="Kassir">Kassir</option>
          <option value="Yetakchi">Yetakchi</option>
        </select>

        <input placeholder="Qidirish..." onChange={(e) => setSearch(e.target.value)} />
        <input type="date" onChange={(e) => setFromDate(e.target.value)} />
      </div>

      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selected.length === filtered.length && filtered.length > 0}
                  onChange={(e) => toggleAll(e.target.checked)}
                />
              </th>
              <th>ID</th>
              <th>F.I.SH</th>
              <th>Tel</th>
              <th>Rol</th>
              <th>Holat</th>
              <th>Filial</th>
              <th>Login</th>
              <th>Sana</th>
              <th>Harakat</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(u.id)}
                    onChange={() => toggleOne(u.id)}
                  />
                </td>

                <td>{u.id}</td>

                <td>
                  {editingId === u.id ? (
                    <input
                      value={u.name}
                      onChange={(e) => updateUser(u.id, 'name', e.target.value)}
                    />
                  ) : (
                    u.name
                  )}
                </td>

                <td>{u.phone}</td>
                <td>{u.role}</td>
                <td>{u.status}</td>
                <td>{u.branch}</td>
                <td>{u.login}</td>
                <td>{u.date}</td>

                <td className="actions">
                  <div style={{ position: 'relative' }}>
                    <button className="user-workTime-btn" onClick={() => setWorkTimeId(u.id)}>
                      <i className="fa-solid fa-clock"></i>
                    </button>

                    {workTimeId === u.id && (
                      <div
                        style={{
                          position: 'absolute',
                          top: -60,
                          left: -40,
                          background: '#fff',
                          border: '1px solid #003366',
                          padding: 8,
                        }}
                      >
                        <input
                          type="time"
                          step="60"
                          lang="ru"
                          onChange={(e) => updateUser(u.id, 'workTime', e.target.value)}
                        />
                        <button onClick={() => setWorkTimeId(null)}>OK</button>
                      </div>
                    )}
                  </div>

                  <button className="user-archive-btn" onClick={() => archiveUser(u)}>
                    <i className="fa-solid fa-box-archive"></i>
                  </button>

                  <button className="user-edit-btn" onClick={() => setEditingId(u.id)}>
                    <i className="fa-solid fa-pen"></i>
                  </button>

                  <button
                    className="user-delete-btn"
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

export default Users;
