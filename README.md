# GearGuard: The Ultimate Maintenance Tracker

A comprehensive maintenance management system built with React, Node.js, and PostgreSQL.

## Features

- **Equipment Management**: Track assets by department and employee with comprehensive details
- **Maintenance Teams**: Define teams and assign technicians
- **Maintenance Requests**: Handle both Corrective (breakdown) and Preventive (routine) maintenance
- **Kanban Board**: Drag-and-drop interface for managing request stages
- **Calendar View**: Visualize preventive maintenance schedules
- **Dashboard**: Overview of overdue, upcoming, and completed tasks
- **Reports**: Analyze requests by team or equipment category
- **Smart Auto-fill**: Automatic team and category assignment based on equipment selection

## Tech Stack

- **Frontend**: React, Tailwind CSS, React Router, React Beautiful DnD
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Authentication**: JWT

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd odoo-gear-guard-maintenance
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Database Setup**
   - Create a PostgreSQL database
   - Run the schema file:
     ```bash
     psql -U postgres -d your_database_name -f database/schema.sql
     ```

4. **Environment Variables**
   - Copy `.env.example` to `.env`
   - Update the following variables:
     ```
     PORT=5000
     DB_HOST=localhost
     DB_PORT=5432
     DB_NAME=gear_guard_db
     DB_USER=postgres
     DB_PASSWORD=your_password
     JWT_SECRET=your_secret_key
     CLIENT_URL=http://localhost:3000
     ```

5. **Run the application**
   ```bash
   npm run dev
   ```

   This will start both the backend (port 5000) and frontend (port 3000) concurrently.

### Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context (Auth)
│   │   └── utils/         # Utility functions
│   └── public/
├── server/                # Node.js backend
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   └── config/           # Configuration files
├── database/             # Database schema
└── README.md
```

## Key Workflows

### Flow 1: The Breakdown (Corrective Maintenance)
1. User creates a request for broken equipment
2. System auto-fills team and category from equipment record
3. Request starts in "New" stage
4. Manager/technician assigns themselves
5. Stage moves to "In Progress"
6. Technician records hours spent and marks as "Repaired"

### Flow 2: The Routine Checkup (Preventive Maintenance)
1. Manager creates preventive request
2. Sets scheduled date
3. Request appears in Calendar View
4. Technician can see and manage scheduled tasks

## Features Implementation

- ✅ Equipment tracking by department and employee
- ✅ Maintenance team management
- ✅ Maintenance request lifecycle
- ✅ Auto-fill logic for requests
- ✅ Kanban board with drag & drop
- ✅ Calendar view for preventive maintenance
- ✅ Dashboard with statistics
- ✅ Reports (pivot/graph)
- ✅ Smart buttons on equipment forms
- ✅ Scrap logic for equipment

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/equipment` - Get all equipment
- `GET /api/maintenance-requests` - Get all requests
- `GET /api/dashboard/stats` - Get dashboard statistics
- And more...

## License

MIT
