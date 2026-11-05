import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { ConfirmModal, Toast, useToast } from "../components/Modal.jsx";
import apiService from "../services/ApiService.js";

function DoctorDashboard() {
  const { user } = useAuth();
  const { toast, showToast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toCancel, setToCancel] = useState(null);

  const loadAppointments = async () => {
    setAppointments(await apiService.getAppointments());
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await loadAppointments();
      } catch (err) {
        showToast(err.message, "error");
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const handleCancel = async () => {
    try {
      await apiService.updateAppointmentStatus(toCancel.id, "Cancelled");
      showToast("Appointment cancelled");
      loadAppointments();
    } catch (err) {
      showToast(err.message, "error");
    }
    setToCancel(null);
  };

  if (loading) return <div className="spinner" />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-CA");

  const scheduled = appointments.filter((a) => a.status === "Scheduled");
  const todayList = scheduled.filter((a) => a.appointment_date === today);
  const upcoming = scheduled.filter((a) => a.appointment_date > today).slice(0, 5);
  const completed = appointments.filter((a) => a.status === "Completed");

  return (
    <>
      <div className="hero">
        <div>
          <h2>{greeting}, {user.name} 👋</h2>
          <p>{todayList.length === 0 ? "You have no patients today." : `You have ${todayList.length} patient(s) today.`}</p>
        </div>
        <Link to="/schedules" className="button light">🕒 My Schedule</Link>
      </div>

      <div className="stats">
        <div className="stat-card"><div className="stat-icon icon-rose">⏰</div><div><span className="stat-value">{todayList.length}</span><span className="stat-label">Today</span></div></div>
        <div className="stat-card"><div className="stat-icon icon-amber">📅</div><div><span className="stat-value">{scheduled.length}</span><span className="stat-label">Scheduled</span></div></div>
        <div className="stat-card"><div className="stat-icon icon-teal">✅</div><div><span className="stat-value">{completed.length}</span><span className="stat-label">Completed</span></div></div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="section-head">
            <h3>Today's patients</h3>
            <Link to="/appointments">Manage →</Link>
          </div>
          {todayList.length === 0 && (
            <div className="empty-state"><span className="emoji">☕</span><p>A quiet day. Nothing scheduled.</p></div>
          )}
          {todayList.map((a) => (
            <div key={a.id} className="appt-row">
              <div className="date-chip"><span>Time</span><strong style={{ fontSize: 13 }}>{a.time_label}</strong></div>
              <div className="appt-info">
                <strong>{a.patient_name}</strong>
                <span>{a.reason || "No reason given"}</span>
              </div>
              <span className="badge scheduled">{a.status}</span>
              <button className="warn small" onClick={() => setToCancel(a)}>Cancel</button>
            </div>
          ))}
        </div>

        <div className="card">
          <h3>Coming up</h3>
          {upcoming.length === 0 && <p className="muted-text">No later appointments.</p>}
          {upcoming.map((a) => (
            <div key={a.id} className="appt-row">
              <div className="date-chip"><span>{a.month_label}</span><strong>{a.day_number}</strong></div>
              <div className="appt-info">
                <strong>{a.patient_name}</strong>
                <span>{a.time_label}</span>
              </div>
              <button className="warn small" onClick={() => setToCancel(a)}>Cancel</button>
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal
        isOpen={toCancel !== null}
        title="Cancel appointment?"
        message={`${toCancel?.patient_name}'s ${toCancel?.date_label} appointment at ${toCancel?.time_label} will be cancelled and the slot freed up.`}
        confirmText="Cancel appointment"
        onConfirm={handleCancel}
        onCancel={() => setToCancel(null)}
      />
      <Toast toast={toast} />
    </>
  );
}

export default DoctorDashboard;