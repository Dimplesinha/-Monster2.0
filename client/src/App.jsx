import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import CareerAdvice from './pages/CareerAdvice';
import ArticleDetail from './pages/ArticleDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployerRegister from './pages/EmployerRegister';
import ConfirmEmail from './pages/ConfirmEmail';
import Dashboard from './pages/Dashboard';
import PostJob from './pages/PostJob';
import ResumeUpload from './pages/ResumeUpload';
import ResumeBuilder from './pages/ResumeBuilder';
import ContactInfo from './pages/ContactInfo';
import ResumeVisibility from './pages/ResumeVisibility';
import JobPreferences from './pages/JobPreferences';
import OnboardingSuccess from './pages/OnboardingSuccess';
import CandidateProfile from './pages/CandidateProfile';
import EmployerOnboarding from './pages/EmployerOnboarding';
import EmployerPricing from './pages/EmployerPricing';
import EmployerJobDetail from './pages/EmployerJobDetail';
import Messages from './pages/Messages';
import MyApplications from './pages/MyApplications';
import BlogsListPage from './pages/BlogsListPage';
import BlogEditorPage from './pages/BlogEditorPage';
import BlogsPublicPage from './pages/BlogsPublicPage';
import PublicBlogPage from './pages/PublicBlogPage';
import NotFound from './pages/NotFound';

// Exact paths that suppress the jobseeker Navbar & Footer
const NO_SHELL_EXACT = [
  '/login', '/register', '/confirm-email',
  '/resume-upload', '/resume-builder',
  '/onboarding/contact-info', '/onboarding/visibility', '/onboarding/job-preferences',
  '/onboarding/success',
  '/post-job', '/dashboard',
];

// Prefix-based: any path under these prefixes also hides the jobseeker shell
const NO_SHELL_PREFIX = [
  '/employer/',   // /employer/register, /employer/pricing, /employer/onboarding, /employer/jobs/:id, /employer/blogs
  '/my-blogs/',   // /my-blogs/new, /my-blogs/:id/edit  (editor has own header)
];

export default function App() {
  const { pathname } = useLocation();
  const hideShell =
    NO_SHELL_EXACT.includes(pathname) ||
    NO_SHELL_PREFIX.some((prefix) => pathname.startsWith(prefix));
  return (
    <>
      {!hideShell && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/career-advice" element={<CareerAdvice />} />
        <Route path="/career-advice/:slug" element={<ArticleDetail />} />
        <Route path="/blogs" element={<BlogsPublicPage />} />
        <Route path="/blogs/:slug" element={<PublicBlogPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/employer/register" element={<EmployerRegister />} />
        <Route path="/employer/pricing" element={<EmployerPricing />} />
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
          path="/employer/onboarding"
          element={
            <ProtectedRoute roles={['employer', 'admin']}>
              <EmployerOnboarding />
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
        <Route
          path="/resume-upload"
          element={
            <ProtectedRoute roles={['jobseeker']}>
              <ResumeUpload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resume-builder"
          element={
            <ProtectedRoute roles={['jobseeker']}>
              <ResumeBuilder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding/contact-info"
          element={
            <ProtectedRoute roles={['jobseeker']}>
              <ContactInfo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding/visibility"
          element={
            <ProtectedRoute roles={['jobseeker']}>
              <ResumeVisibility />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding/job-preferences"
          element={
            <ProtectedRoute roles={['jobseeker']}>
              <JobPreferences />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding/success"
          element={
            <ProtectedRoute roles={['jobseeker']}>
              <OnboardingSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute roles={['jobseeker']}>
              <CandidateProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute roles={['jobseeker']}>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-applications"
          element={
            <ProtectedRoute roles={['jobseeker']}>
              <MyApplications />
            </ProtectedRoute>
          }
        />

        {/* ── Jobseeker blogs ──────────────────────────────────── */}
        <Route
          path="/my-blogs"
          element={
            <ProtectedRoute roles={['jobseeker']}>
              <BlogsListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-blogs/new"
          element={
            <ProtectedRoute roles={['jobseeker']}>
              <BlogEditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-blogs/:id/edit"
          element={
            <ProtectedRoute roles={['jobseeker']}>
              <BlogEditorPage />
            </ProtectedRoute>
          }
        />

        {/* ── Employer blogs ───────────────────────────────────── */}
        <Route
          path="/employer/blogs"
          element={
            <ProtectedRoute roles={['employer', 'admin']}>
              <BlogsListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/blogs/new"
          element={
            <ProtectedRoute roles={['employer', 'admin']}>
              <BlogEditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/blogs/:id/edit"
          element={
            <ProtectedRoute roles={['employer', 'admin']}>
              <BlogEditorPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employer/jobs/:id"
          element={
            <ProtectedRoute roles={['employer', 'admin']}>
              <EmployerJobDetail />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!hideShell && <Footer />}
    </>
  );
}
