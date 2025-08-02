-- Create the users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'employee',
    manager_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the timesheet table
CREATE TABLE IF NOT EXISTS timesheet (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    project VARCHAR(255) NOT NULL,
    task_description TEXT,
    entry_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_timesheet_user_id ON timesheet(user_id);
CREATE INDEX IF NOT EXISTS idx_timesheet_entry_date ON timesheet(entry_date);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Insert sample data with the CORRECT bcrypt hash for 'password123'
-- This hash was generated using bcrypt with salt rounds 10
INSERT INTO users (email, password, full_name, role) VALUES 
('admin@company.com', '$2b$10$W0vWZCLf2lVpQdBuoCQAsuYDzh13wSWnHIWrWIU04aQnsdwyY..fi', 'Admin User', 'manager'),
('john.doe@company.com', '$2b$10$W0vWZCLf2lVpQdBuoCQAsuYDzh13wSWnHIWrWIU04aQnsdwyY..fi', 'John Doe', 'employee'),
('jane.smith@company.com', '$2b$10$W0vWZCLf2lVpQdBuoCQAsuYDzh13wSWnHIWrWIU04aQnsdwyY..fi', 'Jane Smith', 'employee');