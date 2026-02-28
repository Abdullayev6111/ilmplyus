import { Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import Lids from './pages/lid';
import Payments from './pages/payments';
import Courses from './pages/courses';
import Reports from './pages/reports';
import Tasks from './pages/tasks';
import Registration from './pages/registration';
import NotFound from './pages/notFound';
import LoginPage from './pages/login';
import useAuthStore from './store/useAuthStore';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import './index.css';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

const App = () => {
  const isAuth = useAuthStore((state) => state.isAuth);

  return (
    <Routes>
      <Route path="/login" element={isAuth ? <Navigate to="/" replace /> : <LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/lids" element={<Lids />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/tasks" element={<Tasks />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;
