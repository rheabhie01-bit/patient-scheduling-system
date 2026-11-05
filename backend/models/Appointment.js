import db from "../db.js";

export default class Appointment {
  constructor() {
    // the *_label columns are already formatted for the screen
    this.baseQuery = `
      SELECT a.id, a.patient_id, a.doctor_id, a.appointment_date, a.appointment_time,
             DATE_FORMAT(a.appointment_date, '%a, %b %e') AS date_label,
             DATE_FORMAT(a.appointment_date, '%b') AS month_label,
             DAY(a.appointment_date) AS day_number,
             TIME_FORMAT(a.appointment_time, '%l:%i %p') AS time_label,
             a.reason, a.status, a.cancelled_by,
             pu.name AS patient_name, du.name AS doctor_name, d.specialty
      FROM appointments a
      JOIN patients p ON p.id = a.patient_id
      JOIN users pu ON pu.id = p.user_id
      JOIN doctors d ON d.id = a.doctor_id
      JOIN users du ON du.id = d.user_id`;
    this.order = "ORDER BY a.appointment_date, a.appointment_time";
  }

  findAll() {
    return db.query(`${this.baseQuery} ${this.order}`);
  }

  findByPatient(patientId) {
    return db.query(`${this.baseQuery} WHERE a.patient_id = ? ${this.order}`, [patientId]);
  }

  findByDoctor(doctorId) {
    return db.query(`${this.baseQuery} WHERE a.doctor_id = ? ${this.order}`, [doctorId]);
  }

  async findById(id) {
    const rows = await db.query(`${this.baseQuery} WHERE a.id = ?`, [id]);
    return rows[0];
  }

  // times like "10:00" that a doctor is already booked for on a date
  async findTakenTimes(doctorId, date) {
    const rows = await db.query(
      `SELECT TIME_FORMAT(appointment_time, '%H:%i') AS time
       FROM appointments
       WHERE doctor_id = ? AND appointment_date = ? AND status = 'Scheduled'`,
      [doctorId, date]
    );
    return rows.map((row) => row.time);
  }

  async isSlotTaken(doctorId, date, time) {
    const rows = await db.query(
      `SELECT id FROM appointments
       WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ?
       AND status = 'Scheduled'`,
      [doctorId, date, time]
    );
    return rows.length > 0;
  }

  async isPatientBusy(patientId, date, time) {
    const rows = await db.query(
      `SELECT id FROM appointments
       WHERE patient_id = ? AND appointment_date = ? AND appointment_time = ?
       AND status = 'Scheduled'`,
      [patientId, date, time]
    );
    return rows.length > 0;
  }

  async create({ patient_id, doctor_id, appointment_date, appointment_time, reason }) {
    const result = await db.query(
      `INSERT INTO appointments
       (patient_id, doctor_id, appointment_date, appointment_time, reason)
       VALUES (?, ?, ?, ?, ?)`,
      [patient_id, doctor_id, appointment_date, appointment_time, reason ?? null]
    );
    return result.insertId;
  }

  updateStatus(id, status, cancelledBy = null) {
    return db.query("UPDATE appointments SET status = ?, cancelled_by = ? WHERE id = ?", [
      status,
      status === "Cancelled" ? cancelledBy : null,
      id,
    ]);
  }

  remove(id) {
    return db.query("DELETE FROM appointments WHERE id = ?", [id]);
  }
}