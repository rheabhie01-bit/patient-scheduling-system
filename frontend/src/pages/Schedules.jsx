import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Modal, { ConfirmModal, Toast, useToast } from "../components/Modal.jsx";
import apiService from "../services/ApiService.js";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const ROW = 56; 
const toMinutes = (time) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
const hourLabel = (hour) => `${hour % 12 || 12} ${hour >= 12 ? "PM" : "AM"}`;

function Schedules() {
  const { doctorId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user.role === "admin";
  const isDoctor = user.role === "doctor";
  const canEdit = isAdmin || isDoctor;
  const { toast, showToast } = useToast();

  const [schedules, setSchedules] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ doctor_id: doctorId || "", day_of_week: "Monday", start_time: "", end_time: "" });
  const [error, setError] = useState("");
  const [toDelete, setToDelete] = useState(null);

  const loadSchedules = async () => {
    setSchedules(await apiService.getSchedules());
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await loadSchedules();
        if (!isDoctor) setDoctors(await apiService.getDoctors());
      } catch (err) {
        showToast(err.message, "error");
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await apiService.addSchedule(form);
      setError("");
      setShowForm(false);
      showToast("Hours added");
      loadSchedules();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await apiService.deleteSchedule(toDelete.id);
      showToast("Hours removed");
      loadSchedules();
    } catch (err) {
      showToast(err.message, "error");
    }
    setToDelete(null);
  };

  const handleBlockClick = (slot) => {
    if (canEdit) {
      setToDelete(slot);
    } else {
      navigate("/appointments", { state: { openForm: true, doctorId: slot.doctor_id } });
    }
  };

  const activeDoctor = doctorId || selectedDoctor;
  const visible = schedules
    .filter((s) => activeDoctor === "all" || s.doctor_id === Number(activeDoctor))
    .filter((s) => !isDoctor || s.doctor_id === user.profileId);

  const doctorsWithHours = [...new Map(schedules.map((s) => [s.doctor_id, s])).values()];
  const doctorsInView = [...new Map(visible.map((s) => [s.doctor_id, s])).values()];
  const specialtyOf = (id) => doctors.find((d) => d.id === id)?.specialty || "";
  const startHour = Math.min(8, ...visible.map((s) => Math.floor(toMinutes(s.start_time) / 60)));
  const endHour = Math.max(17, ...visible.map((s) => Math.ceil(toMinutes(s.end_time) / 60)));
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });

  const layoutDay = (day) => {
    const slots = visible
      .filter((s) => s.day_of_week === day)
      .sort((a, b) => toMinutes(a.start_time) - toMinutes(b.start_time));

    const laneEnds = [];
    const placed = slots.map((slot) => {
      const start = toMinutes(slot.start_time);
      let lane = laneEnds.findIndex((end) => end <= start);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(0);
      }
      laneEnds[lane] = toMinutes(slot.end_time);
      return { slot, lane };
    });

    return { placed, lanes: Math.max(laneEnds.length, 1) };
  };

  if (loading) return <div className="spinner" />;

  return (
    <>
      {doctorId && <Link to="/schedules">← All schedules</Link>}

      <div className="section-head">
        <div>
          <h2>{isDoctor ? "My Schedule" : "Doctor Schedules"}</h2>
          <p className="page-sub">
            Weekly hours, booked in 30-minute slots.{" "}
            {canEdit ? "Click a block to remove it." : "Click a block to book that doctor."}
          </p>
        </div>
        {canEdit && (
          <button className="primary" onClick={() => setShowForm(true)}>+ Add Hours</button>
        )}
      </div>

      {!isDoctor && !doctorId && doctorsWithHours.length > 1 && (
        <div className="toolbar">
          <select style={{ maxWidth: 260 }} value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)}>
            <option value="all">All doctors</option>
            {doctorsWithHours.map((d) => (
              <option key={d.doctor_id} value={d.doctor_id}>
                {d.doctor_name}{specialtyOf(d.doctor_id) && ` · ${specialtyOf(d.doctor_id)}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {visible.length === 0 ? (
        <div className="card empty-state">
          <span className="emoji">🕒</span>
          <p>No schedule has been set yet.</p>
          {canEdit && <button className="primary" onClick={() => setShowForm(true)}>Add working hours</button>}
        </div>
      ) : (
        <>
          <div className="legend">
            {doctorsInView.map((d) => (
              <span key={d.doctor_id}>
                <i className={`dc-${d.doctor_id % 5}`} />
                {d.doctor_name}{specialtyOf(d.doctor_id) && ` · ${specialtyOf(d.doctor_id)}`}
              </span>
            ))}
          </div>

          <div className="week">
            <div className="week-inner">
              <div className="week-head">
                <div />
                {DAYS.map((day) => (
                  <div key={day} className={day === todayName ? "today" : ""}>{day.slice(0, 3)}</div>
                ))}
              </div>

              <div className="week-body" style={{ height: hours.length * ROW }}>
                <div className="week-times">
                  {hours.map((hour) => (
                    <div key={hour}>{hourLabel(hour)}</div>
                  ))}
                </div>

                {DAYS.map((day) => {
                  const { placed, lanes } = layoutDay(day);
                  return (
                    <div key={day} className={`week-col ${day === todayName ? "today" : ""}`}>
                      {placed.map(({ slot, lane }) => {
                        const top = ((toMinutes(slot.start_time) - startHour * 60) / 60) * ROW;
                        const height = ((toMinutes(slot.end_time) - toMinutes(slot.start_time)) / 60) * ROW - 2;
                        const specialty = specialtyOf(slot.doctor_id);
                        return (
                          <button
                            key={slot.id}
                            className={`block dc-${slot.doctor_id % 5}`}
                            style={{ top, height, left: `${(lane / lanes) * 100}%`, width: `${100 / lanes}%` }}
                            title={`${slot.doctor_name}${specialty ? ` · ${specialty}` : ""} · ${slot.start_label} – ${slot.end_label}`}
                            onClick={() => handleBlockClick(slot)}
                          >
                            {!isDoctor && <strong>{slot.doctor_name}</strong>}
                            {!isDoctor && specialty && height >= 50 && <small>{specialty}</small>}
                            <span>{slot.start_label} – {slot.end_label}</span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      <Modal isOpen={showForm} title="Add Working Hours" onClose={() => setShowForm(false)}>
        <form className="form" onSubmit={handleSubmit}>
          {isAdmin && (
            <label>
              Doctor
              <select name="doctor_id" value={form.doctor_id} onChange={handleChange} required>
                <option value="">Select doctor</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </label>
          )}

          <label>
            Day
            <select name="day_of_week" value={form.day_of_week} onChange={handleChange}>
              {DAYS.map((day) => (
                <option key={day}>{day}</option>
              ))}
            </select>
          </label>

          <div className="row">
            <label>Start<input type="time" name="start_time" value={form.start_time} onChange={handleChange} required /></label>
            <label>End<input type="time" name="end_time" value={form.end_time} onChange={handleChange} required /></label>
          </div>

          {error && <p className="error">{error}</p>}
          <div className="form-buttons">
            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="primary">Save Hours</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={toDelete !== null}
        title="Remove these hours?"
        message={`${toDelete?.doctor_name}, ${toDelete?.day_of_week} ${toDelete?.start_label} – ${toDelete?.end_label} will no longer be bookable. Existing appointments are kept.`}
        confirmText="Remove"
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
      <Toast toast={toast} />
    </>
  );
}

export default Schedules;