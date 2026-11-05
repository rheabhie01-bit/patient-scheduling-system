import AuthService from "../services/AuthService.js";

export default class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  register = async (req, res) => {
    res.status(201).json(await this.authService.register(req.body));
  };

  login = async (req, res) => {
    const { email, password } = req.body;
    res.json(await this.authService.login(email, password));
  };

  me = async (req, res) => {
    res.json(req.user);
  };
}
