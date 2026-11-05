import express from "express";
import DoctorController from "../controllers/DoctorController.js";
import AuthMiddleware from "../middleware/authMiddleware.js";
import ErrorMiddleware from "../middleware/errorMiddleware.js";

const router = express.Router();
const controller = new DoctorController();
const run = ErrorMiddleware.asyncHandler;

router.use(AuthMiddleware.verifyToken);

router.get("/", run(controller.getAll));
router.get("/:id", run(controller.getOne));
router.post("/", AuthMiddleware.allowRoles("admin"), run(controller.create));
router.delete("/:id", AuthMiddleware.allowRoles("admin"), run(controller.remove));

export default router;
