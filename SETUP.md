# Quick Setup Guide

## 1. Database Setup

```bash
# Create database
createdb gear_guard_db

# Run schema
psql -U postgres -d gear_guard_db -f database/schema.sql
```

## 2. Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gear_guard_db
DB_USER=postgres
DB_PASSWORD=your_password_here
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

## 3. Install Dependencies

```bash
npm install
cd client
npm install
cd ..
```

## 4. Run the Application

```bash
# From root directory
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend app on http://localhost:3000

## 5. First User

Register a new user through the Sign Up page at http://localhost:3000/signup

## Features Overview

- ✅ Login/Signup pages matching wireframe
- ✅ Dashboard with summary boxes (Overdue, Upcoming, Completed)
- ✅ Equipment management with search and filters
- ✅ Maintenance Teams management
- ✅ Work Centers management
- ✅ Equipment Categories management
- ✅ Maintenance Requests with Kanban board (drag & drop)
- ✅ Calendar view for preventive maintenance
- ✅ Reports page with pivot data
- ✅ Smart buttons on equipment (Maintenance button with badge)
- ✅ Auto-fill logic when selecting equipment
- ✅ Request workflow: New → In Progress → Repaired/Scrap
- ✅ Scrap logic that marks equipment as unusable

## Important Notes

- All dates use ISO format for storage
- Equipment tracking supports filtering by department, employee, and category
- Maintenance requests auto-fill team and category from equipment
- Calendar view shows only preventive maintenance requests
- Kanban board supports drag-and-drop between stages

