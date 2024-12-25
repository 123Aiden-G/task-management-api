const bcrypt = require('bcryptjs'); // Ensure this is bcryptjs
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Task = require('../models/task');
const e = require('cors');

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to register user'
    });
  }
};

/**
 * @desc Log in an existing user
 * @route POST /api/auth/login
 * @access Public
 */
const loginUser = async (req, res) => {
  try {
    console.log('req.body:', req.body); // Log the request body
    const { email, password } = req.body;
    console.log(email, password);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email, deleted: false });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('User:', user); // Log the stored hashed password

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch); // Log the result of password comparison
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Generated JWT token:', token); // Log the generated JWT token

    res.json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      message: 'User logged in successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to log in user'
    });
  }
};

/**
 * @desc Permanently delete the authenticated user's account and associated tasks
 * @route DELETE /api/auth/me
 * @access Private (Requires authentication)
 */
const deleteMyAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete the user account
    user.deleted = true;
    user.deletedAt = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Your account has been deleted successfully. You have 30 days to recover it.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to delete account'
    });
  }
};

/**
 * @desc Recover the authenticated user's account
 * @route PUT /api/auth/recover
 * @access Private (Requires authentication)
 */
const recoverMyAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user || !user.deleted) {
      return res.status(404).json({
        success: false,
        message: 'User not found or account is not deleted'
      });
    }

    // Recover the user account
    user.deleted = false;
    user.deletedAt = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Your account has been recovered successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to recover account'
    });
  }
};

/**
 * @desc Update the authenticated user's profile
 * @route PUT /api/auth/me
 * @access Private (Requires authentication)
 */
const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(userId);
    const { name, password, email } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== userId) {
        return res.status(400).json({
          success: false,
          message: 'Email is already registered'
        });
      }
      console.log(`Email updated from ${user.email} to ${email}`); // Log the email update
      user.email = email;
    }

    if (name) {
      if (name.length < 3 || name.length > 50) {
        return res.status(400).json({
          success: false,
          message: 'Name must be between 3 and 50 characters'
        });
      }
      user.name = name;
    }

    if (password) {
      if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/.test(password)) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character'
        });
      }
      // const salt = await bcrypt.genSalt(10);
      user.password = password;
    }
    console.log('Hashed password:', user.password); // Log the hashed password

    await user.save();
    console.log('User saved:', user.password); // Log the saved user

    // Issue a new JWT token after updating the profile
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Generated new JWT token:', token); // Log the generated new JWT token

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      token, // Include the new token in the response
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to update profile'
    });
  }
};

module.exports = { registerUser, loginUser, deleteMyAccount, recoverMyAccount, updateMyProfile };





