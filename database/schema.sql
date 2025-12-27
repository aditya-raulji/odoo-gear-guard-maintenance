-- Database Schema for GearGuard Maintenance Tracker

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table (extended from base auth)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equipment Categories table
CREATE TABLE IF NOT EXISTS equipment_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    responsible_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance Teams table
CREATE TABLE IF NOT EXISTS maintenance_teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance Team Members (many-to-many relationship)
CREATE TABLE IF NOT EXISTS maintenance_team_members (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES maintenance_teams(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(team_id, user_id)
);

-- Work Centers table
CREATE TABLE IF NOT EXISTS work_centers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100),
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    cost DECIMAL(10, 2) DEFAULT 0,
    cost_per_hour DECIMAL(10, 2) DEFAULT 0,
    capacity DECIMAL(10, 2) DEFAULT 1.0,
    daily_target DECIMAL(10, 2) DEFAULT 8.0,
    work_rate DECIMAL(10, 2) DEFAULT 1.0,
    hourly_rate DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equipment table
CREATE TABLE IF NOT EXISTS equipment (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    serial_number VARCHAR(255),
    category_id INTEGER REFERENCES equipment_categories(id) ON DELETE SET NULL,
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    employee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    maintenance_team_id INTEGER REFERENCES maintenance_teams(id) ON DELETE SET NULL,
    location VARCHAR(255),
    purchase_date DATE,
    warranty_date DATE,
    type_model VARCHAR(255),
    setup_date DATE,
    description TEXT,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    is_scrapped BOOLEAN DEFAULT FALSE,
    scrapped_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance Requests table
CREATE TABLE IF NOT EXISTS maintenance_requests (
    id SERIAL PRIMARY KEY,
    task_name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Corrective', 'Preventive')),
    subject TEXT,
    equipment_id INTEGER REFERENCES equipment(id) ON DELETE SET NULL,
    assigned_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    due_date TIMESTAMP,
    scheduled_date TIMESTAMP,
    priority VARCHAR(20) CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    stage VARCHAR(50) DEFAULT 'New' CHECK (stage IN ('New', 'In Progress', 'Repaired', 'Scrap')),
    team_id INTEGER REFERENCES maintenance_teams(id) ON DELETE SET NULL,
    work_center_id INTEGER REFERENCES work_centers(id) ON DELETE SET NULL,
    maintenance_type VARCHAR(100),
    duration DECIMAL(10, 2),
    frequency VARCHAR(50),
    hours_spent DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_equipment_category ON equipment(category_id);
CREATE INDEX idx_equipment_department ON equipment(department_id);
CREATE INDEX idx_equipment_employee ON equipment(employee_id);
CREATE INDEX idx_equipment_team ON equipment(maintenance_team_id);
CREATE INDEX idx_requests_equipment ON maintenance_requests(equipment_id);
CREATE INDEX idx_requests_team ON maintenance_requests(team_id);
CREATE INDEX idx_requests_stage ON maintenance_requests(stage);
CREATE INDEX idx_requests_due_date ON maintenance_requests(due_date);
CREATE INDEX idx_requests_scheduled_date ON maintenance_requests(scheduled_date);
CREATE INDEX idx_requests_type ON maintenance_requests(type);

-- Insert default company
INSERT INTO companies (name) VALUES ('My Company (Our Company)') ON CONFLICT DO NOTHING;

-- Insert default department
INSERT INTO departments (name, company_id) 
SELECT 'General', id FROM companies WHERE name = 'My Company (Our Company)' LIMIT 1
ON CONFLICT DO NOTHING;

