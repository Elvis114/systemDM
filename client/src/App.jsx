import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout       from './components/Layout';
import Login        from './pages/Login';
import Dashboard    from './pages/Dashboard';
import Students     from './pages/Students';
import StudentDetail from './pages/StudentDetail';
import Teachers     from './pages/Teachers';
import Classes      from './pages/Classes';
import Subjects     from './pages/Subjects';
import Grades       from './pages/Grades';
import Attendance   from './pages/Attendance';
import Fees         from './pages/Fees';
import Payments     from './pages/Payments';
import PaymentHistory from './pages/PaymentHistory';
import PayFees      from './pages/PayFees';
import PaymentSuccess from './pages/PaymentSuccess';
import Events       from './pages/Events';
import Announcements from './pages/Announcements';
import Settings     from './pages/Settings';
import NotFound     from './pages/NotFound';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index              element={<Dashboard />} />
            <Route path="students"    element={<Students />} />
            <Route path="students/:id" element={<StudentDetail />} />
            <Route path="teachers"    element={<Teachers />} />
            <Route path="classes"     element={<Classes />} />
            <Route path="subjects"    element={<Subjects />} />
            <Route path="grades"      element={<Grades />} />
            <Route path="attendance"  element={<Attendance />} />
            <Route path="fees"        element={<Fees />} />
            <Route path="payments"        element={<Payments />} />
            <Route path="payment-history" element={<PaymentHistory />} />
            <Route path="pay-fees"        element={<PayFees />} />
            <Route path="payment-success" element={<PaymentSuccess />} />
            <Route path="events"      element={<Events />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="settings" element={<ProtectedRoute roles={['admin','teacher']}><Settings /></ProtectedRoute>} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
