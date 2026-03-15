# DoctorSetu - Doctor Appointment System

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Start MongoDB
Make sure MongoDB is running on your system:
```bash
mongod
```

### 3. Configure Environment
The `.env` file is already created with default settings. Update if needed.

### 4. Start the Server
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

### 5. Access the Application
Open your browser and go to:
```
http://localhost:3000/doctor-login.html
```

## Features

### Doctor Login/Signup
- Mobile number + OTP verification
- OTP is displayed in server console
- JWT token authentication

### Doctor Profile
- Complete profile with personal details
- Medical degree and qualifications
- Profile photo upload
- Address information

### Doctor Dashboard
- Beautiful modern UI with sidebar navigation
- Real-time appointment management
- Statistics cards (Pending, Confirmed, Total)
- View all appointment requests
- Confirm/Cancel appointments
- 30-second lock rule after confirmation
- Click on any appointment to view patient details
- Auto-refresh every 10 seconds

### Appointment Management
- Pending appointments can be confirmed
- Confirmed appointments can be cancelled within 30 seconds
- After 30 seconds, appointments are locked
- View patient health problems and details

## API Endpoints

### Authentication
- POST `/api/doctor/auth/send-otp` - Send OTP
- POST `/api/doctor/auth/verify-otp` - Verify OTP and login

### Profile
- GET `/api/doctor/profile` - Get doctor profile
- POST `/api/doctor/profile` - Update doctor profile

### Appointments
- GET `/api/doctor/appointments` - Get all appointments
- POST `/api/doctor/appointments/:id/confirm` - Confirm appointment
- DELETE `/api/doctor/appointments/:id/cancel` - Cancel appointment
- GET `/api/doctor/patient/:id` - Get patient details

## Tech Stack
- **Backend**: Node.js, Express
- **Database**: MongoDB, Mongoose
- **Authentication**: JWT
- **File Upload**: Multer
- **Frontend**: HTML, CSS, JavaScript
- **Icons**: Font Awesome

## Testing

To test the system, you'll need to create some sample appointments in MongoDB. You can use MongoDB Compass or the mongo shell to insert test data.
