import PatientService from "../services/PatientService.js";

export default class PatientController {
  constructor() {
    this.patientService = new PatientService();
  }

  getAll = async (req, res) => res.json(await this.patientService.getAll());

  getOne = async (req, res) => res.json(await this.patientService.getOne(req.params.id));

  create = async (req, res) => res.status(201).json(await this.patientService.create(req.body));

  remove = async (req, res) => {
    await this.patientService.remove(req.params.id);
    res.json({ message: "Patient deleted" });
  };
}
