import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import dbConfig from "./config/db.js";

const folder = path.dirname(fileURLToPath(import.meta.url));
const SQL_FILE = path.resolve(folder, "../database/patient_scheduling.sql");

class Database {
  constructor(config) {
    this.config = config;
    this.pool = null;
  }

  async connect() {
    await this.createFromSqlFile();

    this.pool = mysql.createPool({
      ...this.config,
      dateStrings: true, 
      waitForConnections: true,
      connectionLimit: 10,
    });
    console.log("MySQL connected");
  }

  async createFromSqlFile() {
    const { database, ...serverConfig } = this.config;
    const setup = await mysql.createConnection({
      ...serverConfig,
      multipleStatements: true,
    });

    const [rows] = await setup.query(
      `SELECT COUNT(*) AS total FROM information_schema.tables
       WHERE table_schema = ? AND table_name = 'users'`,
      [database]
    );

    if (rows[0].total === 0) {
      const sql = await fs.readFile(SQL_FILE, "utf8");
      await setup.query(sql);
      console.log("Database created from patient_scheduling.sql");
    }

    await setup.end();
  }

  async query(sql, params = []) {
    const [rows] = await this.pool.execute(sql, params);
    return rows;
  }
}

export default new Database(dbConfig);
