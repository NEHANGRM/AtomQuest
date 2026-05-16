# ATOMQUEST Goal Setting & Tracking Portal

A COMPLETE production-style web application for the ATOMQUEST hackathon.

## Features
- **Role-based Access Control**: Employee, Manager, Admin.
- **Goal Management**: Create goal sheets, set UoM, calculate weightages.
- **Quarterly Tracking**: Enter achievements per quarter and track progress.
- **Manager Workflows**: Approve, reject, or return goal sheets.
- **Admin Dashboard**: Audit logs, analytics, and goal unlocking.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui, Recharts.
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT.

## Installation & Setup

1. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Backend Environment Variables**
   Create a `.env` file in the `backend` folder based on `.env.example`:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=super_secret_key
   CLIENT_URL=http://localhost:5173
   ```

3. **Seed Database (Important!)**
   ```bash
   npm run seed
   ```
   This creates demo accounts:
   - Admin: `admin@atomquest.com` / `password123`
   - Manager: `manager@atomquest.com` / `password123`
   - Employee: `employee@atomquest.com` / `password123`

4. **Start Backend**
   ```bash
   npm run dev
   ```

5. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

6. **Start Frontend**
   ```bash
   npm run dev
   ```
   Access the app at `http://localhost:5173`.