import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployerRegister from './pages/EmployerRegister';
import ConfirmEmail from './pages/ConfirmEmail';
import Dashboard from './pages/Dashboard';
import PostJob from './pages/PostJob';
import NotFound from './pages/NotFound';

const NO_SHELL = ['/login', '/register', '/employer/register', '/confirm-email'];

export default function App() {
  const { pathname } = useLocation();
  const hideShell = NO_SHELL.includes(pathname);
  return (
    <>
      {!hideShell && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/employer/register" element={<EmployerRegister />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={['employer', 'admin']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post-job"
          element={
            <ProtectedRoute roles={['employer', 'admin']}>
              <PostJob />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!hideShell && <Footer />}
    </>
  );
}
