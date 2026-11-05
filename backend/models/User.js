import db from "../db.js";

export default class User {
  async findByEmail(email) {
    const rows = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0];
  }

  async create({ name, email, password, role }) {
    const result = await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, password, role]
    );
    return result.insertId;
  }

  remove(id) {
    return db.query("DELETE FROM users WHERE id = ?", [id]);
  }
}
