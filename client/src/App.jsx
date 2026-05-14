import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DoctorsList from './pages/doctors/DoctorsList';
import DoctorNew from './pages/doctors/DoctorNew';
import DoctorDetail from './pages/doctors/DoctorDetail';
import PatientsList from './pages/patients/PatientsList';
import PatientNew from './pages/patients/PatientNew';
import PatientDetail from './pages/patients/PatientDetail';
import RecordNew from './pages/records/RecordNew';
import DiseasesList from './pages/diseases/DiseasesList';
import DiseaseNew from './pages/diseases/DiseaseNew';
import UsersList from './pages/users/UsersList';

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">Loading…</div>
    );
  }
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

function RoleRoute({ allow, children }) {
  const { user } = useAuth();
  if (!allow.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function AppShell() {
  return (
    <ProtectedRoute>
      <Layout />
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/doctors" element={<DoctorsList />} />
        <Route
          path="/doctors/new"
          element={
            <RoleRoute allow={['admin']}>
              <DoctorNew />
            </RoleRoute>
          }
        />
        <Route path="/doctors/:id" element={<DoctorDetail />} />
        <Route path="/patients" element={<PatientsList />} />
        <Route path="/patients/new" element={<PatientNew />} />
        <Route path="/patients/:id" element={<PatientDetail />} />
        <Route
          path="/records/new"
          element={
            <RoleRoute allow={['admin', 'clinician']}>
              <RecordNew />
            </RoleRoute>
          }
        />
        <Route
          path="/diseases"
          element={
            <RoleRoute allow={['admin', 'clinician']}>
              <DiseasesList />
            </RoleRoute>
          }
        />
        <Route
          path="/diseases/new"
          element={
            <RoleRoute allow={['admin', 'clinician']}>
              <DiseaseNew />
            </RoleRoute>
          }
        />
        <Route
          path="/users"
          element={
            <RoleRoute allow={['admin']}>
              <UsersList />
            </RoleRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
