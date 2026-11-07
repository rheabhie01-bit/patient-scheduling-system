import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Toast, useToast } from "../components/Modal.jsx";
import apiService from "../services/ApiService.js";
import Clock from "../components/Clock.jsx";

function AdminDashboard() {
  const { user } = useAuth();
  const { toast, showToast } = useToast();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setPatients(await apiService.getPatients());
        setDoctors(await apiService.getDoctors());
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

  const scheduled = appointments.filter((a) => a.status === "Scheduled");
  const todayList = scheduled.filter((a) => a.appointment_date === today);
  const upcoming = scheduled.filter((a) => a.appointment_date >= today).slice(0, 6);

  return (
    <>
      <div className="hero">
        <div>
          <h2>{greeting}, {user.name.split(" ")[0]} </h2>
          <p>{todayList.length === 0 ? "No appointments today." : `${todayList.length} appointment(s) today.`} Here's your clinic at a glance.</p>
        </div>
         
        <Link to="/appointments" state={{ openForm: true }} className="button light">+ Book Appointment</Link>
      </div>

      <div className="stats">
        <div className="stat-card"><div className="stat-icon icon-teal">🧑</div><div><span className="stat-value">{patients.length}</span><span className="stat-label">Patients</span></div></div>
        <div className="stat-card"><div className="stat-icon icon-indigo">🩺</div><div><span className="stat-value">{doctors.length}</span><span className="stat-label">Doctors</span></div></div>
        <div className="stat-card"><div className="stat-icon icon-amber">📅</div><div><span className="stat-value">{scheduled.length}</span><span className="stat-label">Scheduled</span></div></div>
        <div className="stat-card"><div className="stat-icon icon-rose">⏰</div><div><span className="stat-value">{todayList.length}</span><span className="stat-label">Today</span></div></div>
      </div>

      <div className="two-col">
        <div className="card">
          <h3>Upcoming appointments</h3>
          {upcoming.length === 0 && (
            <div className="empty-state"><span className="emoji">🗓️</span><p>Nothing scheduled yet.</p></div>
          )}
          {upcoming.map((a) => (
            <div key={a.id} className="appt-row">
              <div className="date-chip"><span>{a.month_label}</span><strong>{a.day_number}</strong></div>
              <div className="appt-info">
                <strong>{a.patient_name}</strong>
                <span>{a.doctor_name} · {a.time_label}</span>
              </div>
              <span className="badge scheduled">{a.status}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <h3>Quick actions</h3>
          <div className="quick-links">
            <Link to="/patients">🧑 Manage patients</Link>
            <Link to="/doctors">🩺 Manage doctors</Link>
            <Link to="/appointments">📅 All appointments</Link>
            <Link to="/schedules">🕒 Doctor schedules</Link>
          </div>
        </div>
      </div>

      <Toast toast={toast} />
    </>
  );
}

export default AdminDashboard;
