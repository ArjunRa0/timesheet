/*
 * Filename: server.js
 * Description: Backend server for the PERN Timesheet application.
 * This version includes user authentication, roles, and an approval workflow.
 */

// --- Imports ---
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authMiddleware, requireManager, JWT_SECRET } = require('./middleware');

// --- Configuration ---
const app = express();
const PORT = process.env.PORT || 5000;

// PostgreSQL connection configuration
const pool = new Pool({
  user: 'timesheet_user',
  host: 'localhost',
  database: 'timesheet_db',
  password: 'a_strong_password',
  port: 5433,  
});

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json());


// --- Authentication Routes ---

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
app.post('/api/auth/register', async (req, res) => {
    const { email, password, fullName, role, managerId } = req.body;
    try {
        let user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length > 0) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            "INSERT INTO users (email, password, full_name, role, manager_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, role",
            [email, hashedPassword, fullName, role, managerId || null]
        );

        const payload = { user: { id: newUser.rows[0].id, role: newUser.rows[0].role } };
        jwt.sign(payload, JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


// --- Timesheet Entry Routes (Now Secured) ---

/**
 * @route   GET /api/entries
 * @desc    Get all of the logged-in user's timesheet entries
 * @access  Private
 */
app.get('/api/entries', authMiddleware, async (req, res) => {
  try {
    const allEntries = await pool.query(
      `SELECT *, EXTRACT(EPOCH FROM (end_time - start_time)) / 3600 AS duration_hours 
       FROM timesheet 
       WHERE user_id = $1
       ORDER BY entry_date DESC, start_time DESC`,
      [req.user.id]
    );
    res.json(allEntries.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /api/entries
 * @desc    Add a new timesheet entry for the logged-in user
 * @access  Private
 */
app.post('/api/entries', authMiddleware, async (req, res) => {
  try {
    const { project, task_description, entry_date, start_time, end_time } = req.body;
    const userId = req.user.id;

    if (!project || !entry_date || !start_time || !end_time) {
      return res.status(400).json({ msg: 'Please enter all required fields' });
    }

    const newEntry = await pool.query(
        "INSERT INTO timesheet (project, task_description, entry_date, start_time, end_time, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [project, task_description, entry_date, start_time, end_time, userId]
    );
    res.json(newEntry.rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Note: PUT and DELETE routes would also need to be secured in a full implementation
// by checking if the req.user.id matches the entry's user_id.


// --- Manager Routes ---

/**
 * @route   GET /api/manager/approvals
 * @desc    Get all pending timesheets for employees of the logged-in manager
 * @access  Private (Manager only)
 */
app.get('/api/manager/approvals', authMiddleware, requireManager, async (req, res) => {
    try {
        const pendingEntries = await pool.query(
            `SELECT t.*, u.full_name AS employee_name
             FROM timesheet t
             JOIN users u ON t.user_id = u.id
             WHERE u.manager_id = $1 AND t.status = 'pending'
             ORDER BY t.entry_date ASC`,
            [req.user.id]
        );
        res.json(pendingEntries.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

/**
 * @route   PUT /api/manager/approve/:id
 * @desc    Approve or reject a timesheet entry
 * @access  Private (Manager only)
 */
app.put('/api/manager/approve/:id', authMiddleware, requireManager, async (req, res) => {
    
    const { status } = req.body; // 'approved' or 'rejected'
    const entryId = req.params.id;

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ msg: 'Invalid status.' });
    }

    try {
        // Optional: Verify the entry belongs to an employee of this manager before updating
        const updatedEntry = await pool.query(
            "UPDATE timesheet SET status = $1 WHERE id = $2 RETURNING *",
            [status, entryId]
        );

        if (updatedEntry.rows.length === 0) {
            return res.status(404).json({ msg: 'Entry not found.' });
        }
        res.json(updatedEntry.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


// --- Server Start ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});