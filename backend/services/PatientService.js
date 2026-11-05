import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Patient from "../models/Patient.js";
import { AppError } from "../middleware/errorMiddleware.js";

export default class PatientService {
  constructor() {
    this.users = new User();
    this.patients = new Patient();
  }

  getAll() {
    return this.patients.findAll();
  }

  async getOne(id) {
    const patient = await this.patients.findById(id);
    if (!patient) throw new AppError("Patient not found", 404);
    return patient;
  }

  async create({ name, email, password, age, phone, address }) {
    if (!name || !email || !password || !age || !phone) {
      throw new AppError("Name, email, password, age and phone are required", 400);
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new AppError("Please enter a valid email", 400);
    if (password.length < 6) throw new AppError("Password must be at least 6 characters", 400);
    if (age < 0 || age > 120) throw new AppError("Please enter a valid age", 400);
    if (await this.users.findByEmail(email)) {
      throw new AppError("That email is already registered", 409);
    }

    const hashed = await bcrypt.hash(password, 10);
    const userId = await this.users.create({ name, email, password: hashed, role: "patient" });
    const patientId = await this.patients.create({ user_id: userId, age, phone, address });
    return this.patients.findById(patientId);
  }

  async remove(id) {
    const patient = await this.getOne(id);
    await this.users.remove(patient.user_id); 
  }
}
