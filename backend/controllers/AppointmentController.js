import AppointmentService from "../services/AppointmentService.js";

export default class AppointmentController {
  constructor() {
    this.appointmentService = new AppointmentService();
  }

  getAll = async (req, res) => res.json(await this.appointmentService.getAll(req.user));

  availability = async (req, res) => {
    const { doctor_id, date } = req.query;
    res.json(await this.appointmentService.getAvailableSlots(doctor_id, date));
  };

  book = async (req, res) =>
    res.status(201).json(await this.appointmentService.book(req.user, req.body));

  changeStatus = async (req, res) =>
    res.json(
      await this.appointmentService.changeStatus(req.user, req.params.id, req.body.status)
    );

  remove = async (req, res) => {
    await this.appointmentService.remove(req.params.id);
    res.json({ message: "Appointment deleted" });
  };
}
