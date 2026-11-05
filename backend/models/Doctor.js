import db from "../db.js";

export default class Doctor {
  constructor() {
    this.baseQuery = `
      SELECT d.id, d.user_id, u.name, u.email, d.specialty, d.phone
      FROM doctors d
      JOIN users u ON u.id = d.user_id`;
  }

  findAll() {
    return db.query(`${this.baseQuery} ORDER BY u.name`);
  }

  async findById(id) {
    const rows = await db.query(`${this.baseQuery} WHERE d.id = ?`, [id]);
    return rows[0];
  }

  async findByUserId(userId) {
    const rows = await db.query(`${this.baseQuery} WHERE d.user_id = ?`, [userId]);
    return rows[0];
  }

  async create({ user_id, specialty, phone }) {
    const result = await db.query(
      "INSERT INTO doctors (user_id, specialty, phone) VALUES (?, ?, ?)",
      [user_id, specialty, phone ?? null]
    );
    return result.insertId;
  }
}
