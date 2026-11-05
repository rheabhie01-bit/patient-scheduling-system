import { useEffect, useState } from "react";
import apiService from "../services/ApiService.js";

function AppointmentForm({ doctors, patients, schedules, defaultDoctorId, defaultDate, onSubmit, onCancel, error, submitting }) {
  const [form, setForm] = useState({
    patient_id: "",
    doctor_id: defaultDoctorId ? String(defaultDoctorId) : "",
    appointment_date: defaultDate || "",
    appointment_time: "",
    reason: "",
  });
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

  useEffect(() => {
    if (!form.doctor_id || !form.appointment_date) {
      setSlots([]);
      return;
    }

    const loadSlots = async () => {
      setLoadingSlots(true);
      try {
        setSlots(await apiService.getAvailableSlots(form.doctor_id, form.appointment_date));
      } catch {
        setSlots([]);
      }
      setLoadingSlots(false);
    };
    loadSlots();
  }, [form.doctor_id, form.appointment_date]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const changed = { ...form, [name]: value };

    if (name === "doctor_id" || name === "appointment_date") changed.appointment_time = "";
    setForm(changed);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  const doctorSchedules = schedules.filter((s) => s.doctor_id === Number(form.doctor_id));
  const workingDays = doctorSchedules
    .map((s) => `${s.day_of_week.slice(0, 3)} ${s.start_label}–${s.end_label}`)
    .join(" · ");

  return (
    <form className="form" onSubmit={handleSubmit}>
      {patients.length > 0 && (
        <label>
          Patient
          <select name="patient_id" value={form.patient_id} onChange={handleChange} required>
            <option value="">Select patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </label>
      )}

      <label>
        Doctor
        <select name="doctor_id" value={form.doctor_id} onChange={handleChange} required>
          <option value="">Select doctor</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>{d.name} · {d.specialty}</option>
          ))}
        </select>
      </label>

      {form.doctor_id && (
        <p className="hint">
          {doctorSchedules.length === 0 ? "This doctor has no schedule yet." : `🕒 Works: ${workingDays}`}
        </p>
      )}

      <label>
        Date
        <input
          type="date"
          name="appointment_date"
          min={today}
          value={form.appointment_date}
          onChange={handleChange}
          required
        />
      </label>

      {form.doctor_id && form.appointment_date && (
        <div>
          <span className="field-title">Pick a time</span>
          {loadingSlots && <p className="muted-text">Checking availability...</p>}
          {!loadingSlots && slots.length === 0 && (
            <p className="empty-slots">No free slots on this day. Try another date.</p>
          )}
          <div className="slots">
            {slots.map((slot) => (
              <button
                type="button"
                key={slot.value}
                className={`slot ${form.appointment_time === slot.value ? "active" : ""}`}
                onClick={() => setForm({ ...form, appointment_time: slot.value })}
              >
                {slot.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <label>
        Reason for visit
        <textarea
          name="reason"
          rows="3"
          value={form.reason}
          onChange={handleChange}
          placeholder="e.g. Fever and cough for two days"
        />
      </label>

      {error && <p className="error">{error}</p>}

      <div className="form-buttons">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit" className="primary" disabled={!form.appointment_time || submitting}>
          {submitting ? "Booking..." : "Confirm Booking"}
        </button>
      </div>
    </form>
  );
}

export default AppointmentForm;
