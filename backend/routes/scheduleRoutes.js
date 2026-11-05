import express from "express";
import ScheduleController from "../controllers/ScheduleController.js";
import AuthMiddleware from "../middleware/authMiddleware.js";
import ErrorMiddleware from "../middleware/errorMiddleware.js";

const router = express.Router();
const controller = new ScheduleController();
const run = ErrorMiddleware.asyncHandler;

router.use(AuthMiddleware.verifyToken);

router.get("/", run(controller.getAll));
router.post("/", AuthMiddleware.allowRoles("admin", "doctor"), run(controller.add));
router.delete("/:id", AuthMiddleware.allowRoles("admin", "doctor"), run(controller.remove));

export default router;
