CREATE DATABASE IF NOT EXISTS patient_scheduling;
USE patient_scheduling;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','doctor','patient') NOT NULL DEFAULT 'patient',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  age INT NOT NULL,
  phone VARCHAR(30) NOT NULL,
  address VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS doctors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  specialty VARCHAR(100) NOT NULL,
  phone VARCHAR(30),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doctor_id INT NOT NULL,
  day_of_week ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  reason VARCHAR(255),
  status ENUM('Scheduled','Completed','Cancelled') NOT NULL DEFAULT 'Scheduled',
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

USE patient_scheduling;

ALTER TABLE appointments
  ADD COLUMN cancelled_by VARCHAR(20) NULL DEFAULT NULL;

-- Sample accounts: adminClinic@gmail.com / admin123, mariaClinic@gmail.com and joseClini@gmail.com / doctor123
INSERT INTO users (name, email, password, role) VALUES
  ('Clinic Admin', 'adminClinic@gmail.com', '$2a$10$Ian9kp46DxPI9XlgUeljj.dAoLNxEwSYuhbH5VMitrPoeto0YfujC', 'admin'),
  ('Dr. Maria Santos', 'mariaClinic@gmail.com', '$2a$10$qyjFLa8YCSB232RnjPd3NuSvDQbvrnHf9QtkxTknxtv9FUC0AnNQm', 'doctor'),
  ('Dr. Jose Reyes', 'joseClini@gmail.com', '$2a$10$qyjFLa8YCSB232RnjPd3NuSvDQbvrnHf9QtkxTknxtv9FUC0AnNQm', 'doctor');

INSERT INTO doctors (user_id, specialty, phone) VALUES
  (2, 'General Medicine', '09171234567'),
  (3, 'Pediatrics', '09179876543');

INSERT INTO schedules (doctor_id, day_of_week, start_time, end_time) VALUES
  (1, 'Monday', '09:00', '12:00'),
  (1, 'Wednesday', '09:00', '12:00'),
  (1, 'Friday', '13:00', '16:00'),
  (2, 'Tuesday', '10:00', '15:00'),
  (2, 'Thursday', '10:00', '15:00');
