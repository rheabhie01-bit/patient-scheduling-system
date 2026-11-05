import express from "express";
import PatientController from "../controllers/PatientController.js";
import AuthMiddleware from "../middleware/authMiddleware.js";
import ErrorMiddleware from "../middleware/errorMiddleware.js";

const router = express.Router();
const controller = new PatientController();
const run = ErrorMiddleware.asyncHandler;

router.use(AuthMiddleware.verifyToken);

router.get("/", AuthMiddleware.allowRoles("admin", "doctor"), run(controller.getAll));
router.get("/:id", AuthMiddleware.allowRoles("admin", "doctor"), run(controller.getOne));
router.post("/", AuthMiddleware.allowRoles("admin"), run(controller.create));
router.delete("/:id", AuthMiddleware.allowRoles("admin"), run(controller.remove));

export default router;
