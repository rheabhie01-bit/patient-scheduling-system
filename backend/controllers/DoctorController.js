import DoctorService from "../services/DoctorService.js";

export default class DoctorController {
  constructor() {
    this.doctorService = new DoctorService();
  }

  getAll = async (req, res) => res.json(await this.doctorService.getAll());

  getOne = async (req, res) => res.json(await this.doctorService.getOne(req.params.id));

  create = async (req, res) => res.status(201).json(await this.doctorService.create(req.body));

  remove = async (req, res) => {
    await this.doctorService.remove(req.params.id);
    res.json({ message: "Doctor deleted" });
  };
}
