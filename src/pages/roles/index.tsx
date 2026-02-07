import './roles.css';

interface PermissionProps {
  title: string;
  items: string[];
}

const Roles = () => {
  return (
    <section className="role-page">
      {/* TOP FORM */}
      <div className="role-create-card">
        <h2>Yangi rol qo‘shish</h2>

        <div className="role-form">
          <label>
            Rol nomi
            <input type="text" placeholder="Rol nomini kiriting" />
          </label>

          <button className="save-btn">Saqlash</button>
        </div>
      </div>

      {/* PERMISSIONS */}

      <div className="permission-grid">
        <PermissionCard title="Admin panel" items={['Panelga kirish']} />

        <PermissionCard
          title="Foydalanuvchilar"
          items={['Qo‘shish', 'Tahrirlash', 'Ko‘rish', 'O‘chirish', 'Vaqt belgilash', 'Arxivlash']}
        />

        <PermissionCard
          title="To‘lovlar"
          items={['Qo‘shish', 'Tahrirlash', 'Ko‘rish', 'O‘chirish']}
        />

        <PermissionCard
          title="Chiqimlar"
          items={['Qo‘shish', 'Tahrirlash', 'Ko‘rish', 'O‘chirish']}
        />

        <PermissionCard
          title="Filiallar"
          items={['Qo‘shish', 'Tahrirlash', 'Ko‘rish', 'O‘chirish']}
        />
      </div>
    </section>
  );
};

const PermissionCard = ({ title, items }: PermissionProps) => {
  return (
    <div className="permission-card">
      <h3>{title}</h3>

      {items.map((item) => (
        <label key={item} className="permission-item">
          <span>{item}</span>
          <input type="checkbox" />
        </label>
      ))}
    </div>
  );
};

export default Roles;
