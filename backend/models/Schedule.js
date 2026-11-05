import db from "../db.js";

export default class Schedule {
  constructor() {
    this.baseQuery = `
      SELECT s.id, s.doctor_id, s.day_of_week, s.start_time, s.end_time,
             TIME_FORMAT(s.start_time, '%l:%i %p') AS start_label,
             TIME_FORMAT(s.end_time, '%l:%i %p') AS end_label,
             u.name AS doctor_name, d.specialty
      FROM schedules s
      JOIN doctors d ON d.id = s.doctor_id
      JOIN users u ON u.id = d.user_id`;
    this.dayOrder = `FIELD(s.day_of_week, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')`;
  }

  findAll() {
    return db.query(`${this.baseQuery} ORDER BY u.name, ${this.dayOrder}, s.start_time`);
  }

  async findById(id) {
    const rows = await db.query(`${this.baseQuery} WHERE s.id = ?`, [id]);
    return rows[0];
  }

  findForDay(doctorId, day) {
    return db.query(`${this.baseQuery} WHERE s.doctor_id = ? AND s.day_of_week = ?`, [
      doctorId,
      day,
    ]);
  }

  async create({ doctor_id, day_of_week, start_time, end_time }) {
    const result = await db.query(
      "INSERT INTO schedules (doctor_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)",
      [doctor_id, day_of_week, start_time, end_time]
    );
    return result.insertId;
  }

  remove(id) {
    return db.query("DELETE FROM schedules WHERE id = ?", [id]);
  }
}
