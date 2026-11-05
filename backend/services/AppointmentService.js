import Appointment from "../models/Appointment.js";
import Schedule from "../models/Schedule.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import { AppError } from "../middleware/errorMiddleware.js";

const STATUSES = ["Scheduled", "Completed", "Cancelled"];
const SLOT_MINUTES = 30; 

export default class AppointmentService {
  constructor() {
    this.appointments = new Appointment();
    this.schedules = new Schedule();
    this.patients = new Patient();
    this.doctors = new Doctor();
  }


  toMinutes(time) {
    const [hours, minutes] = time.split(":");
    return Number(hours) * 60 + Number(minutes);
  }

  toTime(minutes) {
    const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
    const mins = String(minutes % 60).padStart(2, "0");
    return `${hours}:${mins}`;
  }

  toLabel(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = String(minutes % 60).padStart(2, "0");
    return `${hours % 12 || 12}:${mins} ${hours >= 12 ? "PM" : "AM"}`;
  }

  dayName(date) {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { weekday: "long" });
  }

  today() {
    return new Date().toLocaleDateString("en-CA");
  }

  minutesNow() {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }

  async resolveProfileId(user) {
    if (user.profileId) return user.profileId;

    if (user.role === "patient") return (await this.patients.findByUserId(user.id))?.id ?? null;
    if (user.role === "doctor") return (await this.doctors.findByUserId(user.id))?.id ?? null;
    return null;
  }

  async getAll(user) {
    if (user.role === "patient") {
      const patientId = await this.resolveProfileId(user);
      return patientId ? this.appointments.findByPatient(patientId) : [];
    }
    if (user.role === "doctor") {
      const doctorId = await this.resolveProfileId(user);
      return doctorId ? this.appointments.findByDoctor(doctorId) : [];
    }
    return this.appointments.findAll();
  }

  async getAvailableSlots(doctorId, date) {
    if (!doctorId || !/^\d{4}-\d{2}-\d{2}$/.test(date || "")) {
      throw new AppError("Doctor and date are required", 400);
    }
    if (date < this.today()) return [];

    const schedules = await this.schedules.findForDay(doctorId, this.dayName(date));
    const taken = await this.appointments.findTakenTimes(doctorId, date);
    const passedUntil = date === this.today() ? this.minutesNow() : -1;

    const slots = [];
    for (const schedule of schedules) {
      const start = this.toMinutes(schedule.start_time);
      const end = this.toMinutes(schedule.end_time);

      for (let time = start; time + SLOT_MINUTES <= end; time += SLOT_MINUTES) {
        if (time <= passedUntil || taken.includes(this.toTime(time))) continue;
        slots.push({ value: this.toTime(time), label: this.toLabel(time) });
      }
    }
    return slots.sort((a, b) => a.value.localeCompare(b.value));
  }

  async book(user, data) {
    const { doctor_id, appointment_date, appointment_time, reason } = data;

    let patientId;
    if (user.role === "patient") {
      patientId = await this.resolveProfileId(user);
      if (!patientId) {
        throw new AppError("No patient profile is linked to this account. Please contact the admin.", 400);
      }
    } else {
      patientId = data.patient_id;
    }

    if (!patientId || !doctor_id || !appointment_date || !appointment_time) {
      throw new AppError("Please fill in all required fields", 400);
    }

    this.checkNotInPast(appointment_date, appointment_time);
    await this.checkDoctorSchedule(doctor_id, appointment_date, appointment_time);

    if (await this.appointments.isSlotTaken(doctor_id, appointment_date, appointment_time)) {
      throw new AppError("That slot was just taken, please pick another time", 409);
    }
    if (await this.appointments.isPatientBusy(patientId, appointment_date, appointment_time)) {
      throw new AppError("The patient already has an appointment at that time", 409);
    }

    const id = await this.appointments.create({
      patient_id: patientId,
      doctor_id,
      appointment_date,
      appointment_time,
      reason,
    });
    return this.appointments.findById(id);
  }

  checkNotInPast(date, time) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new AppError("Invalid date", 400);
    if (date < this.today()) throw new AppError("Please choose a date from today onwards", 400);
    if (date === this.today() && this.toMinutes(time) <= this.minutesNow()) {
      throw new AppError("That time has already passed", 400);
    }
  }

  async checkDoctorSchedule(doctorId, date, time) {
    const day = this.dayName(date);
    const schedules = await this.schedules.findForDay(doctorId, day);
    const wanted = this.toMinutes(time);

    const fits = schedules.some((schedule) => {
      const start = this.toMinutes(schedule.start_time);
      const end = this.toMinutes(schedule.end_time);
      return wanted >= start && wanted + SLOT_MINUTES <= end && (wanted - start) % SLOT_MINUTES === 0;
    });

    if (!fits) {
      throw new AppError(`The doctor is not available on ${day} at ${this.toLabel(wanted)}`, 400);
    }
  }

  async changeStatus(user, id, status) {
    if (!STATUSES.includes(status)) throw new AppError("Invalid status", 400);

    const appointment = await this.appointments.findById(id);
    if (!appointment) throw new AppError("Appointment not found", 404);

    if (user.role === "patient") {
      const patientId = await this.resolveProfileId(user);
      const isOwner = appointment.patient_id === patientId;
      if (!isOwner || status !== "Cancelled") {
        throw new AppError("Patients can only cancel their own appointments", 403);
      }
    }
    if (user.role === "doctor") {
      const doctorId = await this.resolveProfileId(user);
      if (appointment.doctor_id !== doctorId) {
        throw new AppError("This is not your appointment", 403);
      }
    }

    const cancelledBy = status === "Cancelled" ? user.role : null;
    await this.appointments.updateStatus(id, status, cancelledBy);
    return this.appointments.findById(id);
  }

  async remove(id) {
    await this.appointments.remove(id);
  }
}