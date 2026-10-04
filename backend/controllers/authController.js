const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { isRequired, isValidEmail, isValidPhone } = require('../utils/validation');

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET || 'campus-secret-key',
    { expiresIn: '7d' }
  );
}

async function registerUser(req, res) {
  try {
    const { full_name, student_id, email, phone, password, confirmPassword } = req.body;

    if (!isRequired(full_name) || !isRequired(student_id) || !isRequired(email) || !isRequired(phone) || !isRequired(password)) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid phone number.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Password confirmation does not match.' });
    }

    const [existingUser] = await pool.execute(
      'SELECT id FROM users WHERE email = ? OR student_id = ?',
      [email.trim().toLowerCase(), student_id.trim()]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ success: false, message: 'An account with this email or student ID already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      'INSERT INTO users (full_name, student_id, email, phone, password, role) VALUES (?, ?, ?, ?, ?, ?)',
      [full_name.trim(), student_id.trim(), email.trim().toLowerCase(), phone.trim(), hashedPassword, 'student']
    );

    const userId = result.insertId;
    const [newUser] = await pool.execute(
      'SELECT id, full_name, student_id, email, phone, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    const user = newUser[0];
    const token = createToken(user);

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        student_id: user.student_id,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Something went wrong during registration.' });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!isRequired(email) || !isRequired(password)) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = createToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        student_id: user.student_id,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Something went wrong during login.' });
  }
}

async function getCurrentUser(req, res) {
  try {
    return res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        full_name: req.user.full_name,
        student_id: req.user.student_id,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to fetch current user.' });
  }
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
};
