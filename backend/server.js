import "dotenv/config";
import express from "express";
import cors from "cors";
import db from "./db.js";
import authRoutes from "./routes/authRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import ErrorMiddleware from "./middleware/errorMiddleware.js";

class Server {
  constructor(port) {
    this.port = port;
    this.app = express();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  setupRoutes() {
    this.app.use("/api/auth", authRoutes);
    this.app.use("/api/patients", patientRoutes);
    this.app.use("/api/doctors", doctorRoutes);
    this.app.use("/api/appointments", appointmentRoutes);
    this.app.use("/api/schedules", scheduleRoutes);

    // these two must stay last
    this.app.use(ErrorMiddleware.notFound);
    this.app.use(ErrorMiddleware.handle);
  }

  async start() {
    try {
      await db.connect();
    } catch (error) {
      console.error("Could not connect to MySQL. Is it running?", error.message);
      process.exit(1);
    }

    this.setupMiddleware();
    this.setupRoutes();
    this.app.listen(this.port, () =>
      console.log(`Server running on http://localhost:${this.port}`)
    );
  }
}

new Server(process.env.PORT || 5000).start();
