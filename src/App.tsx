import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import LoginPage from './pages/login';
import '@mantine/core/styles.css';
import Layout from './components/Layout';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
      </Route>
    </Routes>
  );
};

export default App;
