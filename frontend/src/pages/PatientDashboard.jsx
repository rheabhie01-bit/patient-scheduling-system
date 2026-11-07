import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Toast, useToast } from "../components/Modal.jsx";
import apiService from "../services/ApiService.js";

function PatientDashboard() {
  const { user } = useAuth();
  const { toast, showToast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setAppointments(await apiService.getAppointments());
      } catch (err) {
        showToast(err.message, "error");
      }
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) return <div className="spinner" />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-CA");
  const upcoming = appointments.filter((a) => a.status === "Scheduled" && a.appointment_date >= today);
  const completed = appointments.filter((a) => a.status === "Completed");
  const next = upcoming[0];
  const cancelledByClinic = appointments.filter(
    (a) =>
      a.status === "Cancelled" &&
      (a.cancelled_by === "doctor" || a.cancelled_by === "admin") &&
      a.appointment_date >= today
  );

  return (
    <>
      <div className="hero">
        <div>
          <h2>{greeting}, {user.name.split(" ")[0]} </h2>
          <p>
            {next
              ? `Your next visit is ${next.date_label} at ${next.time_label} with ${next.doctor_name}.`
              : "You have no upcoming visits. Ready to book one?"}
          </p>
        </div>
        <Link to="/appointments" state={{ openForm: true }} className="button light">+ Book Appointment</Link>
      </div>

      <div className="stats">
        <div className="stat-card"><div className="stat-icon icon-amber">📅</div><div><span className="stat-value">{upcoming.length}</span><span className="stat-label">Upcoming</span></div></div>
        <div className="stat-card"><div className="stat-icon icon-teal">✅</div><div><span className="stat-value">{completed.length}</span><span className="stat-label">Completed</span></div></div>
        <div className="stat-card"><div className="stat-icon icon-indigo">🗂️</div><div><span className="stat-value">{appointments.length}</span><span className="stat-label">Total visits</span></div></div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-head">
          <h3>Before Your Visit</h3>
        </div>
        <ul style={{ margin: 0, paddingLeft: 22, color: "var(--muted)" }}>
          <li>Arrive 10–15 minutes before your appointment.</li>
          <li>Bring your valid ID and necessary documents.</li>
          <li>Check your confirmed appointment schedule.</li>
        </ul>
      </div>

      {cancelledByClinic.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="section-head">
            <h3>Cancelled appointments</h3>
            <Link to="/doctors">Book a new time →</Link>
          </div>
          {cancelledByClinic.map((a) => (
            <div key={a.id} className="appt-row">
              <div className="date-chip"><span>{a.month_label}</span><strong>{a.day_number}</strong></div>
              <div className="appt-info">
                <strong>{a.doctor_name}</strong>
                <span>{a.date_label} · {a.time_label}</span>
              </div>
              <span className="badge cancelled">Cancelled by {a.cancelled_by}</span>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="section-head">
          <h3>Your upcoming appointments</h3>
          <Link to="/appointments">View all →</Link>
        </div>

        {upcoming.length === 0 && (
          <div className="empty-state">
            <span className="emoji">🩺</span>
            <p>No upcoming appointments.</p>
            <Link to="/doctors" className="button primary">Find a doctor</Link>
          </div>
        )}
        {upcoming.map((a) => (
          <div key={a.id} className="appt-row">
            <div className="date-chip"><span>{a.month_label}</span><strong>{a.day_number}</strong></div>
            <div className="appt-info">
              <strong>{a.doctor_name}</strong>
              <span>{a.specialty} · {a.time_label}</span>
            </div>
            <span className="badge scheduled">{a.status}</span>
          </div>
        ))}
      </div>

      <Toast toast={toast} />
    </>
  );
}

export default PatientDashboard;