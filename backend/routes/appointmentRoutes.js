import express from "express";
import AppointmentController from "../controllers/AppointmentController.js";
import AuthMiddleware from "../middleware/authMiddleware.js";
import ErrorMiddleware from "../middleware/errorMiddleware.js";

const router = express.Router();
const controller = new AppointmentController();
const run = ErrorMiddleware.asyncHandler;

router.use(AuthMiddleware.verifyToken);

router.get("/", run(controller.getAll));
router.get("/availability", run(controller.availability));
router.post("/", AuthMiddleware.allowRoles("admin", "patient"), run(controller.book));
router.patch("/:id/status", run(controller.changeStatus));
router.delete("/:id", AuthMiddleware.allowRoles("admin"), run(controller.remove));

export default router;
