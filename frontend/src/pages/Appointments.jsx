import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Modal, { ConfirmModal, Toast, useToast } from "../components/Modal.jsx";
import AppointmentForm from "../components/AppointmentForm.jsx";
import apiService from "../services/ApiService.js";

const STATUS_TABS = ["All", "Scheduled", "Completed", "Cancelled"];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const shortName = (name) => name.replace("Dr. ", "").split(" ")[0];
const statusText = (a) =>
  a.status === "Cancelled" && a.cancelled_by ? `Cancelled by ${a.cancelled_by}` : a.status;
function buildMonthCells(monthStart) {
  const offset = (monthStart.getDay() + 6) % 7;
  const first = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1 - offset);

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(first.getFullYear(), first.getMonth(), first.getDate() + i);
    return {
      key: date.toLocaleDateString("en-CA"), 
      day: date.getDate(),
      inMonth: date.getMonth() === monthStart.getMonth(),
    };
  });
}

function Appointments() {
  const { user } = useAuth();
  const isAdmin = user.role === "admin";
  const isPatient = user.role === "patient";
  const isDoctor = user.role === "doctor";
  const canBook = isAdmin || isPatient;

  const preset = useLocation().state;
  const { toast, showToast } = useToast();
  const todayKey = new Date().toLocaleDateString("en-CA");

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [view, setView] = useState("calendar");
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(Boolean(preset?.openForm) && canBook);
  const [formDate, setFormDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(null); 
  const loadAppointments = async () => {
    setAppointments(await apiService.getAppointments());
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await loadAppointments();
        if (canBook) {
          setDoctors(await apiService.getDoctors());
          setSchedules(await apiService.getSchedules());
        }
        if (isAdmin) setPatients(await apiService.getPatients());
      } catch (err) {
        showToast(err.message, "error");
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const openForm = (date = "") => {
    setFormDate(date);
    setError("");
    setShowForm(true);
  };

  const changeMonth = (step) => {
    setMonth(new Date(month.getFullYear(), month.getMonth() + step, 1));
  };

  const goToToday = () => {
    const now = new Date();
    setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(todayKey);
  };

  const handleBook = async (form) => {
    setSubmitting(true);
    try {
      await apiService.bookAppointment(form);
      setError("");
      setShowForm(false);
      showToast("Appointment booked 🎉");
      loadAppointments();
    } catch (err) {
      setError(err.message);
    }
    setSubmitting(false);
  };

  const handleDone = async (id) => {
    try {
      await apiService.updateAppointmentStatus(id, "Completed");
      showToast("Marked as completed");
      loadAppointments();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleConfirm = async () => {
    const { type, appointment } = pending;
    try {
      if (type === "delete") {
        await apiService.deleteAppointment(appointment.id);
        showToast("Appointment deleted");
      } else {
        await apiService.updateAppointmentStatus(appointment.id, "Cancelled");
        showToast("Appointment cancelled");
      }
      loadAppointments();
    } catch (err) {
      showToast(err.message, "error");
    }
    setPending(null);
  };

  const countFor = (tab) =>
    tab === "All" ? appointments.length : appointments.filter((a) => a.status === tab).length;

  const visible = appointments
    .filter((a) => status === "All" || a.status === status)
    .filter((a) =>
      `${a.patient_name} ${a.doctor_name} ${a.reason || ""}`.toLowerCase().includes(search.toLowerCase())
    );

  const renderActions = (a) => (
    <>
      {a.status === "Scheduled" && !isPatient && (
        <button className="small" onClick={() => handleDone(a.id)}>✓ Done</button>
      )}
      {a.status === "Scheduled" && (
        <button className="warn small" onClick={() => setPending({ type: "cancel", appointment: a })}>Cancel</button>
      )}
      {isAdmin && (
        <button className="danger small" onClick={() => setPending({ type: "delete", appointment: a })}>Delete</button>
      )}
    </>
  );

  if (loading) return <div className="spinner" />;

  const cells = buildMonthCells(month);
  const monthTitle = month.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const dayItems = visible.filter((a) => a.appointment_date === selectedDate);
  const longDate = new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <div className="section-head">
        <div>
          <h2>{isPatient ? "My Appointments" : "Appointments"}</h2>
          <p className="page-sub">{appointments.length} in total</p>
        </div>
        {canBook && (
          <button className="primary" onClick={() => openForm()}>+ Book Appointment</button>
        )}
      </div>

      <div className="toolbar">
        <div className="tabs">
          <button className={view === "calendar" ? "active" : ""} onClick={() => setView("calendar")}>📅 Calendar</button>
          <button className={view === "list" ? "active" : ""} onClick={() => setView("list")}>☰ List</button>
        </div>
        <div className="tabs">
          {STATUS_TABS.map((tab) => (
            <button key={tab} className={status === tab ? "active" : ""} onClick={() => setStatus(tab)}>
              {tab}<small>{countFor(tab)}</small>
            </button>
          ))}
        </div>
        <input className="search" placeholder="  Search" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {view === "calendar" ? (
        <div className="cal-layout">
          <div className="cal">
            <div className="cal-head">
              <h3>{monthTitle}</h3>
              <div className="cal-nav">
                <button onClick={() => changeMonth(-1)} aria-label="Previous month">‹</button>
                <button onClick={goToToday}>Today</button>
                <button onClick={() => changeMonth(1)} aria-label="Next month">›</button>
              </div>
            </div>

            <div className="cal-weekdays">
              {WEEKDAYS.map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            <div className="cal-grid">
              {cells.map((cell) => {
                const items = visible.filter((a) => a.appointment_date === cell.key);
                const classes = [
                  "cal-day",
                  cell.inMonth ? "" : "other",
                  cell.key === todayKey ? "today" : "",
                  cell.key === selectedDate ? "selected" : "",
                  items.length > 0 ? "has-appts" : "",
                ].join(" ");

                return (
                  <button key={cell.key} className={classes} onClick={() => setSelectedDate(cell.key)}>
                    <span className="cal-num">{cell.day}</span>
                    {items.length > 0 && <span className="cal-count">{items.length}</span>}
                    <span className="cal-chips">
                      {items.slice(0, 3).map((a) => (
                        <span key={a.id} className={`cal-chip ${a.status.toLowerCase()}`} title={statusText(a)}>
                          {a.time_label.replace(":00", "")} {shortName(isPatient ? a.doctor_name : a.patient_name)}
                        </span>
                      ))}
                      {items.length > 3 && <span className="cal-more">+{items.length - 3} more</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card day-panel">
            <h3>{longDate}</h3>
            <p className="page-sub" style={{ marginBottom: 12 }}>
              {dayItems.length === 0 ? "Nothing scheduled" : `${dayItems.length} appointment${dayItems.length > 1 ? "s" : ""}`}
            </p>

            {dayItems.length === 0 && (
              <div className="empty-state" style={{ padding: "24px 0 8px" }}>
                <span className="emoji">🗓️</span>
                <p>No appointments on this day.</p>
              </div>
            )}

            {dayItems.map((a) => (
              <div key={a.id} className="day-item">
                <div className="day-item-top">
                  <strong>{a.time_label}</strong>
                  <span className={`badge ${a.status.toLowerCase()}`}>{statusText(a)}</span>
                </div>
                <div>
                  {isPatient && <>{a.doctor_name} <span className="muted-text">· {a.specialty}</span></>}
                  {isDoctor && a.patient_name}
                  {isAdmin && <>{a.patient_name} <span className="muted-text">with {a.doctor_name}</span></>}
                </div>
                {a.reason && <span className="muted-text">{a.reason}</span>}
                <div className="actions">{renderActions(a)}</div>
              </div>
            ))}
          </div>
        </div>
      ) : visible.length === 0 ? (
        <div className="card empty-state">
          <span className="emoji">📅</span>
          <p>{appointments.length === 0 ? "No appointments yet." : "No appointments match your filters."}</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>When</th>
                {!isPatient && <th>Patient</th>}
                {!isDoctor && <th>Doctor</th>}
                <th>Reason</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((a) => (
                <tr key={a.id}>
                  <td><strong>{a.date_label}</strong><span className="cell-sub">{a.time_label}</span></td>
                  {!isPatient && (
                    <td>
                      <div className="person">
                        <div className={`avatar av-${a.patient_id % 5}`}>{a.patient_name.charAt(0)}</div>
                        {a.patient_name}
                      </div>
                    </td>
                  )}
                  {!isDoctor && <td>{a.doctor_name}<span className="cell-sub">{a.specialty}</span></td>}
                  <td>{a.reason || "—"}</td>
                  <td><span className={`badge ${a.status.toLowerCase()}`}>{statusText(a)}</span></td>
                  <td className="actions">{renderActions(a)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showForm} title="Book an Appointment" onClose={() => setShowForm(false)}>
        <AppointmentForm
          doctors={doctors}
          patients={patients}
          schedules={schedules}
          defaultDoctorId={preset?.doctorId}
          defaultDate={formDate}
          onSubmit={handleBook}
          onCancel={() => setShowForm(false)}
          error={error}
          submitting={submitting}
        />
      </Modal>

      <ConfirmModal
        isOpen={pending !== null}
        title={pending?.type === "delete" ? "Delete appointment?" : "Cancel appointment?"}
        message={
          pending?.type === "delete"
            ? "This removes the appointment record completely."
            : `The ${pending?.appointment.date_label} appointment at ${pending?.appointment.time_label} will be cancelled and the slot freed up.`
        }
        confirmText={pending?.type === "delete" ? "Delete" : "Cancel appointment"}
        onConfirm={handleConfirm}
        onCancel={() => setPending(null)}
      />
      <Toast toast={toast} />
    </>
  );
}

export default Appointments;