# CareSchedule — Patient Scheduling System

React + Express + MySQL, with three roles: admin, doctor and patient.

## Run
    cd backend  && npm install && npm start     # http://localhost:5000
    cd frontend && npm install && npm run dev   # http://localhost:5173

Start MySQL first. On the first run the backend builds the database from
`database/patient_scheduling.sql` by itself (you can also import that file manually).
If your MySQL has a password, set it in `backend/.env`. Keep `DB_NAME=patient_scheduling`.

## Sample accounts
| Role    | Email             | Password  |
|---------|-------------------|-----------|
| Admin   | admin@clinic.com  | admin123  |
| Doctor  | maria@clinic.com  | doctor123 |
| Doctor  | jose@clinic.com   | doctor123 |
| Patient | use the Register page |       |

Change the sample passwords and `JWT_SECRET` in `backend/.env` before real use.

## What it does
- **Patients** register, browse doctors, book a free 30-minute slot, and cancel their own appointments.
- **Doctors** manage their weekly hours and mark appointments done or cancelled.
- **Admins** manage patients, doctors, schedules and every appointment.
- Appointments appear in a month calendar (with a list view), and schedules in a weekly timetable.
- Booking shows only real free slots. Double bookings, past times, times outside a
  doctor's hours and overlapping schedules are all blocked.
