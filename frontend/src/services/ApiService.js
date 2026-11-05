import api from "./api.js";

class ApiService {
  async get(url) {
    return (await api.get(url)).data;
  }
  async post(url, body) {
    return (await api.post(url, body)).data;
  }
  async patch(url, body) {
    return (await api.patch(url, body)).data;
  }
  async delete(url) {
    return (await api.delete(url)).data;
  }

  // auth
  login(email, password) {
    return this.post("/auth/login", { email, password });
  }
  register(form) {
    return this.post("/auth/register", form);
  }

  // patients
  getPatients() {
    return this.get("/patients");
  }
  addPatient(patient) {
    return this.post("/patients", patient);
  }
  deletePatient(id) {
    return this.delete(`/patients/${id}`);
  }

  // doctors
  getDoctors() {
    return this.get("/doctors");
  }
  addDoctor(doctor) {
    return this.post("/doctors", doctor);
  }
  deleteDoctor(id) {
    return this.delete(`/doctors/${id}`);
  }

  // appointments
  getAppointments() {
    return this.get("/appointments");
  }
  getAvailableSlots(doctorId, date) {
    return this.get(`/appointments/availability?doctor_id=${doctorId}&date=${date}`);
  }
  bookAppointment(appointment) {
    return this.post("/appointments", appointment);
  }
  updateAppointmentStatus(id, status) {
    return this.patch(`/appointments/${id}/status`, { status });
  }
  deleteAppointment(id) {
    return this.delete(`/appointments/${id}`);
  }
  
  // schedules
  getSchedules() {
    return this.get("/schedules");
  }
  addSchedule(schedule) {
    return this.post("/schedules", schedule);
  }
  deleteSchedule(id) {
    return this.delete(`/schedules/${id}`);
  }
}

export default new ApiService();
