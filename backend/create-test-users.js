const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  user: 'timesheet_user',
  host: 'localhost',
  database: 'timesheet_db',
  password: 'a_strong_password',
  port: 5433,
});

async function createTestUsers() {
  try {
    // Create a manager first
    const managerPassword = await bcrypt.hash('password123', 10);
    const managerResult = await pool.query(
      "INSERT INTO users (email, password, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id",
      ['manager@company.com', managerPassword, 'Sarah Manager', 'manager']
    );
    const managerId = managerResult.rows[0].id;

    // Create employees under this manager
    const employeePassword = await bcrypt.hash('password123', 10);
    
    await pool.query(
      "INSERT INTO users (email, password, full_name, role, manager_id) VALUES ($1, $2, $3, $4, $5)",
      ['employee1@company.com', employeePassword, 'Bob Employee', 'employee', managerId]
    );

    await pool.query(
      "INSERT INTO users (email, password, full_name, role, manager_id) VALUES ($1, $2, $3, $4, $5)",
      ['employee2@company.com', employeePassword, 'Alice Employee', 'employee', managerId]
    );

    // Create another manager
    await pool.query(
      "INSERT INTO users (email, password, full_name, role) VALUES ($1, $2, $3, $4)",
      ['manager2@company.com', managerPassword, 'Mike Manager', 'manager']
    );

    console.log('Test users created successfully!');
    console.log('\nTest Users:');
    console.log('Manager: manager@company.com / password123');
    console.log('Manager 2: manager2@company.com / password123');
    console.log('Employee 1: employee1@company.com / password123');
    console.log('Employee 2: employee2@company.com / password123');

  } catch (err) {
    console.error('Error creating test users:', err.message);
  } finally {
    await pool.end();
  }
}

createTestUsers(); 