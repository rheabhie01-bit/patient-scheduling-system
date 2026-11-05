import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Modal, { ConfirmModal, Toast, useToast } from "../components/Modal.jsx";
import apiService from "../services/ApiService.js";

const emptyForm = { name: "", email: "", password: "", specialty: "", phone: "" };

function Doctors() {
  const { user } = useAuth();
  const isAdmin = user.role === "admin";
  const navigate = useNavigate();
  const { toast, showToast } = useToast();
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const loadDoctors = async () => {
    try {
      setDoctors(await apiService.getDoctors());
    } catch (err) {
      showToast(err.message, "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await apiService.addDoctor(form);
      setForm(emptyForm);
      setError("");
      setShowForm(false);
      showToast("Doctor added");
      loadDoctors();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await apiService.deleteDoctor(toDelete.id);
      showToast("Doctor deleted");
      loadDoctors();
    } catch (err) {
      showToast(err.message, "error");
    }
    setToDelete(null);
  };

  const visible = doctors.filter((d) =>
    `${d.name} ${d.specialty}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="spinner" />;

  return (
    <>
      <div className="section-head">
        <div>
          <h2>Doctors</h2>
          <p className="page-sub">{doctors.length} available</p>
        </div>
        {isAdmin && (
          <button className="primary" onClick={() => setShowForm(true)}>+ Add Doctor</button>
        )}
      </div>

      <div className="toolbar">
        <input className="search" placeholder="  Search by name or specialty" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {visible.length === 0 && (
        <div className="card empty-state">
          <span className="emoji">🩺</span>
          <p>{search ? "No doctors match your search." : "No doctors yet."}</p>
        </div>
      )}

      <div className="card-grid">
        {visible.map((d) => (
          <div key={d.id} className="card doctor-card">
            <div className="doctor-top">
              <div>
                <h3>{d.name}</h3>
                <span className="chip">{d.specialty}</span>
              </div>
            </div>
            <p className="muted-text">📞 {d.phone || "No phone listed"}</p>
            <div className="form-buttons">
              <button
                className="primary small"
                onClick={() => navigate("/appointments", { state: { openForm: true, doctorId: d.id } })}
              >
                Book
              </button>
              <Link to={`/schedules/${d.id}`} className="button small">Schedule</Link>
              {isAdmin && <button className="danger small" onClick={() => setToDelete(d)}>Delete</button>}
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showForm} title="Add Doctor" onClose={() => setShowForm(false)}>
        <form className="form" onSubmit={handleSubmit}>
          <label>Full name<input name="name" placeholder="Dr. Juan Dela Cruz" value={form.name} onChange={handleChange} required /></label>
          <label>Email<input name="email" type="email" value={form.email} onChange={handleChange} required /></label>
          <label>Password<input name="password" type="password" minLength="6" placeholder="At least 6 characters" value={form.password} onChange={handleChange} required /></label>
          <label>Specialty<input name="specialty" placeholder="e.g. Cardiology" value={form.specialty} onChange={handleChange} required /></label>
          <label>Phone (optional)<input name="phone" value={form.phone} onChange={handleChange} /></label>
          {error && <p className="error">{error}</p>}
          <div className="form-buttons">
            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="primary">Save Doctor</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={toDelete !== null}
        title="Delete doctor?"
        message={`${toDelete?.name}, their schedule and all of their appointments will be removed. This can't be undone.`}
        confirmText="Delete doctor"
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
      <Toast toast={toast} />
    </>
  );
}

export default Doctors;