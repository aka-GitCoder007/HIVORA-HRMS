# HRMS Hackathon Project

A Human Resource Management System (HRMS) built during the ODDO Hackathon. It features an Admin/HR portal and an Employee portal for managing attendance, leave, payroll, and more.

## Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT, bcrypt
- **Other:** jsPDF & exceljs for reports generation

## Features

- **Authentication:** Secure login for Admins (HR) and Employees with Role-Based Access Control (RBAC).
- **Attendance Management:** Daily check-in/check-out functionality.
- **Leave Management:** Apply for leave and view leave history.
- **Payroll Management:** View and download payslips. Admin can generate payroll summary reports in PDF and Excel formats.
- **Employee Directory:** View and manage employee details.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB

### Setup

1. **Clone the repository**
2. **Setup Backend:**
   - Navigate to the `Backend` directory: `cd Backend`
   - Install dependencies: `npm install`
   - Copy `.env.example` to `.env` and fill in your configuration (MongoDB URI, JWT secret, Email credentials).
   - Start the backend server: `npm run dev`

3. **Setup Frontend:**
   - Navigate to the `frontend` directory: `cd frontend`
   - Install dependencies: `npm install`
   - Start the frontend server: `npm run dev`

4. **Access the application:**
   - Open your browser and go to `http://localhost:3000`

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
