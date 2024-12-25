const express = require('express');
const router = express.Router();
const { registerUser, loginUser, deleteMyAccount, recoverMyAccount, updateMyProfile } = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');

// Route to register a new user
router.post('/register', registerUser);

// Route to log in an existing user
router.post('/login', loginUser);

// Route to delete the authenticated user's account
router.delete('/me', authenticate, deleteMyAccount);

// Route to recover the authenticated user's account
router.put('/recover', authenticate, recoverMyAccount);

// Route to update the authenticated user's profile
router.put('/me', authenticate, updateMyProfile);

module.exports = router;
