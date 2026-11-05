import jwt from "jsonwebtoken";
import { AppError } from "./errorMiddleware.js";

export default class AuthMiddleware {
  static verifyToken(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) return next(new AppError("Please log in first", 401));

    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new AppError("Your session expired, please log in again", 401));
    }
  }

  static allowRoles(...roles) {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return next(new AppError("You are not allowed to do that", 403));
      }
      next();
    };
  }
}
