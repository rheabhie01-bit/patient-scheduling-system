import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { ConfirmModal } from "./Modal.jsx";

const MENUS = {
  admin: [
    { to: "/admin", icon: "🏠", label: "Dashboard" },
    { to: "/patients", icon: "🧑", label: "Patients" },
    { to: "/doctors", icon: "🩺", label: "Doctors" },
    { to: "/appointments", icon: "📅", label: "Appointments" },
    { to: "/schedules", icon: "🕒", label: "Schedules" },
  ],
  doctor: [
    { to: "/doctor", icon: "🏠", label: "Dashboard" },
    { to: "/patients", icon: "🧑", label: "Patients" },
    { to: "/appointments", icon: "📅", label: "Appointments" },
    { to: "/schedules", icon: "🕒", label: "My Schedule" },
  ],
  patient: [
    { to: "/patient", icon: "🏠", label: "Dashboard" },
    { to: "/doctors", icon: "🩺", label: "Doctors" },
    { to: "/appointments", icon: "📅", label: "Appointments" },
    { to: "/schedules", icon: "🕒", label: "Schedules" },
  ],
};

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      {MENUS[user.role].map((item) => (
        <NavLink key={item.to} to={item.to}>
          <span className="nav-icon">{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}

      <button className="logout" onClick={() => setConfirmLogout(true)}>
        <span>Log out</span>
      </button>

      <ConfirmModal
        isOpen={confirmLogout}
        title="Log out?"
        message="You will need to sign in again to access your account."
        confirmText="Yes, log out"
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
      />
    </aside>
  );
}

export default Sidebar;