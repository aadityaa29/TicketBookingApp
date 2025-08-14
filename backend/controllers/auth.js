const User = require('../models/User');
const { getSignedJwtToken } = require('../middleware/auth');

// @desc      Register a new user
// @route     POST /api/auth/register
// @access    Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role
    });

    // Create token
    const token = getSignedJwtToken(user._id);

    res.status(201).json({
      success: true,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc      Login user
// @route     POST /api/auth/login
// @access    Public
// In backend/controllers/auth.js

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    // --- DEBUGGING STEP 1 ---
    console.log(`Attempting to find user with email: ${email}`);
    
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      // --- DEBUGGING STEP 2 ---
      console.log('DEBUG: User not found in database.');
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // --- DEBUGGING STEP 3 ---
    console.log('DEBUG: User found. Hashed password from DB:', user.password);
    console.log('DEBUG: Now comparing with submitted password:', password);

    const isMatch = await user.comparePassword(password);
    
    // --- DEBUGGING STEP 4 ---
    console.log(`DEBUG: Password comparison result (isMatch): ${isMatch}`);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = getSignedJwtToken(user._id);
    res.status(200).json({ success: true, token });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};