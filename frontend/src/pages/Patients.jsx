import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import Modal, { ConfirmModal, Toast, useToast } from "../components/Modal.jsx";
import apiService from "../services/ApiService.js";

const emptyForm = { name: "", email: "", password: "", age: "", phone: "", address: "" };
const cancelText = (a) => (a.cancelled_by ? `Cancelled by ${a.cancelled_by}` : "Cancelled");

function Patients() {
  const { user } = useAuth();
  const isAdmin = user.role === "admin";
  const { toast, showToast } = useToast();
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [toCancel, setToCancel] = useState(null);

  const loadPatients = async () => {
    try {
      setPatients(await apiService.getPatients());
    } catch (err) {
      showToast(err.message, "error");
    }
    setLoading(false);
  };

  const loadAppointments = async () => {
    try {
      setAppointments(await apiService.getAppointments());
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  useEffect(() => {
    loadPatients();
    loadAppointments();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await apiService.addPatient(form);
      setForm(emptyForm);
      setError("");
      setShowForm(false);
      showToast("Patient added");
      loadPatients();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await apiService.deletePatient(toDelete.id);
      showToast("Patient deleted");
      loadPatients();
      loadAppointments();
    } catch (err) {
      showToast(err.message, "error");
    }
    setToDelete(null);
  };

  const handleCancel = async () => {
    try {
      await apiService.updateAppointmentStatus(toCancel.id, "Cancelled");
      setAppointments(
        appointments.map((a) =>
          a.id === toCancel.id ? { ...a, status: "Cancelled", cancelled_by: user.role } : a
        )
      );
      showToast(`${toCancel.patient_name}'s appointment has been cancelled`);
    } catch (err) {
      showToast(err.message, "error");
    }
    setToCancel(null);
  };

  const appointmentsFor = (patientId) =>
    appointments
      .filter((a) => a.patient_id === patientId && (a.status === "Scheduled" || a.status === "Cancelled"))
      .sort((a, b) => (a.status === b.status ? 0 : a.status === "Scheduled" ? -1 : 1));

  const visible = patients.filter((p) =>
    `${p.name} ${p.email} ${p.phone}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="spinner" />;

  return (
    <>
      <div className="section-head">
        <div>
          <h2>Patients</h2>
          <p className="page-sub">{patients.length} registered</p>
        </div>
        {isAdmin && (
          <button className="primary" onClick={() => setShowForm(true)}>+ Add Patient</button>
        )}
      </div>

      <div className="toolbar">
        <input className="search" placeholder="  Search by name, email or phone" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {visible.length === 0 ? (
        <div className="card empty-state">
          <span className="emoji">🧑</span>
          <p>{search ? "No patients match your search." : "No patients yet."}</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Patient</th><th>Age</th><th>Phone</th><th>Address</th><th>Appointment</th>
                {isAdmin && <th></th>}
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => {
                const list = appointmentsFor(p.id);
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="person">
                        <div className={`avatar av-${p.id % 5}`}>{p.name.charAt(0)}</div>
                        <div>{p.name}<small>{p.email}</small></div>
                      </div>
                    </td>
                    <td>{p.age}</td>
                    <td>{p.phone}</td>
                    <td>{p.address || "—"}</td>
                    <td>
                      {list.length === 0 && <span className="muted-text">No booked appointment</span>}
                      {list.map((a) => (
                        <div key={a.id} className="person" style={{ marginBottom: 6 }}>
                          <div style={a.status === "Cancelled" ? { textDecoration: "line-through", opacity: 0.7 } : undefined}>
                            <strong>{a.date_label}</strong>
                            <span className="cell-sub">{a.time_label}</span>
                          </div>
                          {a.status === "Scheduled" ? (
                            <button className="warn small" onClick={() => setToCancel(a)}>Cancel</button>
                          ) : (
                            <span className="badge cancelled">{cancelText(a)}</span>
                          )}
                        </div>
                      ))}
                    </td>
                    {isAdmin && (
                      <td>
                        <button className="danger small" onClick={() => setToDelete(p)}>Delete</button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showForm} title="Add Patient" onClose={() => setShowForm(false)}>
        <form className="form" onSubmit={handleSubmit}>
          <label>Full name<input name="name" value={form.name} onChange={handleChange} required /></label>
          <label>Email<input name="email" type="email" value={form.email} onChange={handleChange} required /></label>
          <label>Password<input name="password" type="password" minLength="6" placeholder="At least 6 characters" value={form.password} onChange={handleChange} required /></label>
          <div className="row">
            <label>Age<input name="age" type="number" min="0" max="120" value={form.age} onChange={handleChange} required /></label>
            <label>Phone<input name="phone" value={form.phone} onChange={handleChange} required /></label>
          </div>
          <label>Address (optional)<input name="address" value={form.address} onChange={handleChange} /></label>
          {error && <p className="error">{error}</p>}
          <div className="form-buttons">
            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="primary">Save Patient</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={toDelete !== null}
        title="Delete patient?"
        message={`${toDelete?.name} and all of their appointments will be removed. This can't be undone.`}
        confirmText="Delete patient"
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />

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

export default Patients;