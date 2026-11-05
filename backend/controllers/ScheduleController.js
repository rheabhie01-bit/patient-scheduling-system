import Schedule from "../models/Schedule.js";
import { AppError } from "../middleware/errorMiddleware.js";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default class ScheduleController {
  constructor() {
    this.schedules = new Schedule();
  }

  getAll = async (req, res) => res.json(await this.schedules.findAll());

  add = async (req, res) => {
    const { day_of_week, start_time, end_time } = req.body;
    const doctor_id = req.user.role === "doctor" ? req.user.profileId : req.body.doctor_id;

    if (!doctor_id || !DAYS.includes(day_of_week) || !start_time || !end_time) {
      throw new AppError("Doctor, day, start time and end time are required", 400);
    }
    if (start_time >= end_time) {
      throw new AppError("End time must be later than start time", 400);
    }

    const sameDay = await this.schedules.findForDay(doctor_id, day_of_week);
    const overlaps = sameDay.some(
      (s) => start_time < s.end_time.slice(0, 5) && end_time > s.start_time.slice(0, 5)
    );
    if (overlaps) {
      throw new AppError(`That overlaps an existing ${day_of_week} schedule`, 409);
    }

    const id = await this.schedules.create({ doctor_id, day_of_week, start_time, end_time });
    res.status(201).json(await this.schedules.findById(id));
  };

  remove = async (req, res) => {
    const schedule = await this.schedules.findById(req.params.id);
    if (!schedule) throw new AppError("Schedule not found", 404);

    if (req.user.role === "doctor" && schedule.doctor_id !== req.user.profileId) {
      throw new AppError("This is not your schedule", 403);
    }

    await this.schedules.remove(req.params.id);
    res.json({ message: "Schedule deleted" });
  };
}
