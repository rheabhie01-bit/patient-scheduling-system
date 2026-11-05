import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import PatientService from "./PatientService.js";
import { AppError } from "../middleware/errorMiddleware.js";

export default class AuthService {
  constructor() {
    this.users = new User();
    this.patients = new Patient();
    this.doctors = new Doctor();
    this.patientService = new PatientService();
  }

  async register(data) {
    const patient = await this.patientService.create(data);
    return this.createSession({
      id: patient.user_id,
      name: patient.name,
      email: patient.email,
      role: "patient",
      profileId: patient.id,
    });
  }

  async login(email, password) {
    const user = await this.users.findByEmail(email || "");
    const passwordMatches = user && (await bcrypt.compare(password || "", user.password));

    if (!passwordMatches) throw new AppError("Wrong email or password", 401);

    return this.createSession({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileId: await this.findProfileId(user),
    });
  }

  async findProfileId(user) {
    if (user.role === "patient") return (await this.patients.findByUserId(user.id))?.id ?? null;
    if (user.role === "doctor") return (await this.doctors.findByUserId(user.id))?.id ?? null;
    return null;
  }

  createSession(user) {
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1d" });
    return { token, user };
  }
}
