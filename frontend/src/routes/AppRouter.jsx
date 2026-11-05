import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth, HOME_PATHS } from "../context/AuthContext.jsx";
import Modal from "../components/Modal.jsx";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import AdminDashboard from "../pages/AdminDashboard.jsx";
import PatientDashboard from "../pages/PatientDashboard.jsx";
import DoctorDashboard from "../pages/DoctorDashboard.jsx";
import Patients from "../pages/Patients.jsx";
import Doctors from "../pages/Doctors.jsx";
import Appointments from "../pages/Appointments.jsx";
import Schedules from "../pages/Schedules.jsx";

function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={HOME_PATHS[user.role]} replace />;
  }
  return children;
}

function Layout() {
  const { user, welcome, dismissWelcome } = useAuth();

  return (
    <>
      <Navbar />
      <div className="layout">
        <Sidebar />
        <main className="content">
          <Outlet />
        </main>
      </div>

      <Modal isOpen={welcome} title="Login successful" onClose={dismissWelcome}>
        <p className="confirm-text">Welcome back, {user.name}! You are now signed in.</p>
        <div className="form-buttons">
          <button className="primary" onClick={dismissWelcome}>Continue</button>
        </div>
      </Modal>
    </>
  );
}

function AppRouter() {
  const { user } = useAuth();
  const home = user ? HOME_PATHS[user.role] : "/login";

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={home} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={home} replace /> : <Register />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/patient" element={<ProtectedRoute roles={["patient"]}><PatientDashboard /></ProtectedRoute>} />
        <Route path="/doctor" element={<ProtectedRoute roles={["doctor"]}><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/patients" element={<ProtectedRoute roles={["admin", "doctor"]}><Patients /></ProtectedRoute>} />
        <Route path="/doctors" element={<ProtectedRoute roles={["admin", "patient"]}><Doctors /></ProtectedRoute>} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/schedules" element={<Schedules />} />
        <Route path="/schedules/:doctorId" element={<Schedules />} />
      </Route>

      <Route path="*" element={<Navigate to={home} replace />} />
    </Routes>
  );
}

export default AppRouter;