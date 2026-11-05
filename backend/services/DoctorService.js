import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import { AppError } from "../middleware/errorMiddleware.js";

export default class DoctorService {
  constructor() {
    this.users = new User();
    this.doctors = new Doctor();
  }

  getAll() {
    return this.doctors.findAll();
  }

  async getOne(id) {
    const doctor = await this.doctors.findById(id);
    if (!doctor) throw new AppError("Doctor not found", 404);
    return doctor;
  }

  async create({ name, email, password, specialty, phone }) {
    if (!name || !email || !password || !specialty) {
      throw new AppError("Name, email, password and specialty are required", 400);
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new AppError("Please enter a valid email", 400);
    if (password.length < 6) throw new AppError("Password must be at least 6 characters", 400);
    if (await this.users.findByEmail(email)) {
      throw new AppError("That email is already registered", 409);
    }

    const hashed = await bcrypt.hash(password, 10);
    const userId = await this.users.create({ name, email, password: hashed, role: "doctor" });
    const doctorId = await this.doctors.create({ user_id: userId, specialty, phone });
    return this.doctors.findById(doctorId);
  }

  async remove(id) {
    const doctor = await this.getOne(id);
    await this.users.remove(doctor.user_id);
  }
}
