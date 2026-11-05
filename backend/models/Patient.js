import db from "../db.js";

export default class Patient {
  constructor() {
    this.baseQuery = `
      SELECT p.id, p.user_id, u.name, u.email, p.age, p.phone, p.address
      FROM patients p
      JOIN users u ON u.id = p.user_id`;
  }

  findAll() {
    return db.query(`${this.baseQuery} ORDER BY u.name`);
  }

  async findById(id) {
    const rows = await db.query(`${this.baseQuery} WHERE p.id = ?`, [id]);
    return rows[0];
  }

  async findByUserId(userId) {
    const rows = await db.query(`${this.baseQuery} WHERE p.user_id = ?`, [userId]);
    return rows[0];
  }

  async create({ user_id, age, phone, address }) {
    const result = await db.query(
      "INSERT INTO patients (user_id, age, phone, address) VALUES (?, ?, ?, ?)",
      [user_id, age, phone, address ?? null]
    );
    return result.insertId;
  }
}
