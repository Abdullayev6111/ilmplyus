import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import TaskCard, { type Task } from '../../components/TaskCard';
import TaskModal from '../../components/TaskModal';
import './tasks.css';
import { API } from '../../api/api';

interface RoleObj {
  id: number;
  name: string;
}

interface User {
  id: number;
  full_name: string;
  role_id: number | null;
  roles?: RoleObj[];
}

interface UsersResponse {
  data: User[];
}

function isOperatorUser(user: User): boolean {
  if (user.role_id === 1 || user.role_id === 2) return true;
  if (Array.isArray(user.roles)) {
    return user.roles.some((r) => r.id === 1 || r.id === 2 || /operator|admin/i.test(r.name));
  }
  return true; // fallback if no roles defined
}

type FilterStatus = 'barchasi' | 'bajarish' | 'bajarildi' | 'bajarilmadi';
type Role = 'manager' | 'operator';

const FILTER_OPTIONS: { label: string; value: FilterStatus }[] = [
  { label: 'Barchasi', value: 'barchasi' },
  { label: 'Bajarilmoqda', value: 'bajarish' },
  { label: 'Yakunlangan', value: 'bajarildi' },
  { label: 'Bajarilmadi', value: 'bajarilmadi' },
];

const CURRENT_USER_ID = 1;

export default function Tasks() {
  const { t } = useTranslation();
  const [role, setRole] = useState<Role>('manager');
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('barchasi');
  const [operatorFilter, setOperatorFilter] = useState<number | ''>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | undefined>(undefined);

  const {
    data: tasksRaw,
    isLoading,
    isError,
  } = useQuery<Task[], Error>({
    queryKey: ['tasks'],
    queryFn: () =>
      API.get('/tasks').then((r) => {
        const responseData = r.data;
        if (Array.isArray(responseData)) return responseData;
        if (Array.isArray(responseData?.data)) return responseData.data;
        return [];
      }),
  });

  const { data: usersData } = useQuery<UsersResponse>({
    queryKey: ['users'],
    queryFn: () => API.get('/users').then((r) => r.data),
  });

  const operators: User[] = useMemo(() => {
    return (usersData?.data ?? []).filter(isOperatorUser);
  }, [usersData]);

  const filteredTasks: Task[] = (tasksRaw ?? []).filter((task) => {
    const statusMatch = activeFilter === 'barchasi' || task.status === activeFilter;
    const operatorMatch = operatorFilter === '' || task.operator_id === Number(operatorFilter);
    return statusMatch && operatorMatch;
  });

  function getShortName(fullName: string) {
    const parts = fullName.split(' ');
    return `${parts[0] ?? ''} ${parts[1] ?? ''}`;
  }

  const handleOpenCreate = () => {
    setEditTask(undefined);
    setModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditTask(task);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditTask(undefined);
  };

  return (
    <div className="tasks container">
      {role === 'manager' && (
        <div className="tasks-top">
          <div className="tasks-top-left">
            <div className="tasks-filters">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`tasks-filter-btn${activeFilter === opt.value ? ' active' : ''}`}
                  onClick={() => setActiveFilter(opt.value)}
                >
                  {t(`tasks.filter.${opt.value}`)}
                </button>
              ))}
            </div>

            <select
              className="tasks-operator-select"
              value={operatorFilter}
              onChange={(e) =>
                setOperatorFilter(e.target.value === '' ? '' : Number(e.target.value))
              }
            >
              <option value="">{t('tasks.allOperators')}</option>

              {operators.map((u) => (
                <option key={u.id} value={u.id}>
                  {getShortName(u.full_name)}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="tasks-role-toggle">
              <span>{t('tasks.role')}:</span>

              <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
                <option value="manager">Manager</option>
                <option value="operator">Operator</option>
              </select>
            </div>

            <button className="tasks-create-btn" onClick={handleOpenCreate}>
              ＋ {t('tasks.createTask')}
            </button>
          </div>
        </div>
      )}

      {role === 'operator' && (
        <div className="tasks-top">
          <h2 className="tasks-title">{t('tasks.taskList')}</h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="tasks-filters">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`tasks-filter-btn${activeFilter === opt.value ? ' active' : ''}`}
                  onClick={() => setActiveFilter(opt.value)}
                >
                  {t(`tasks.filter.${opt.value}`)}
                </button>
              ))}
            </div>

            <div className="tasks-role-toggle">
              <span>{t('tasks.role')}:</span>

              <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
                <option value="manager">Manager</option>
                <option value="operator">Operator</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {isLoading && <div className="tasks-state loading">{t('tasks.loading')}</div>}

      {isError && (
        <div className="tasks-state error">{t('tasks.error')}</div>
      )}

      {!isLoading && !isError && filteredTasks.length === 0 && (
        <div className="tasks-state">{t('tasks.noTasks')}</div>
      )}

      {!isLoading && !isError && filteredTasks.length > 0 && (
        <div className="tasks-content">
          {filteredTasks?.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              role={role}
              currentUserId={CURRENT_USER_ID}
              onEdit={handleOpenEdit}
            />
          ))}
        </div>
      )}

      {modalOpen && <TaskModal onClose={handleCloseModal} editTask={editTask} />}
    </div>
  );
}
