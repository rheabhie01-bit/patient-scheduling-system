import express from "express";
import AuthController from "../controllers/AuthController.js";
import AuthMiddleware from "../middleware/authMiddleware.js";
import ErrorMiddleware from "../middleware/errorMiddleware.js";

const router = express.Router();
const controller = new AuthController();
const run = ErrorMiddleware.asyncHandler;

router.post("/register", run(controller.register));
router.post("/login", run(controller.login));
router.get("/me", AuthMiddleware.verifyToken, run(controller.me));

export default router;
