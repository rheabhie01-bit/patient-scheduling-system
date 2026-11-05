import { useAuth } from "../context/AuthContext.jsx";

function Navbar() {
  const { user } = useAuth();

  return (
    <header className="navbar">
      <div className="brand">
        <span className="brand-mark">🩺</span>
        <span className="brand-name">CareSchedule</span>
      </div>

      <div className="navbar-user">
        <div className="avatar av-0">{user.name.charAt(0)}</div>
        <div className="navbar-info">
          <strong>{user.name}</strong>
          <span>{user.role}</span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;