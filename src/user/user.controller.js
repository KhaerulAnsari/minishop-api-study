const express = require('express');
const { sendError, sendSuccess } = require('../utils/response');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const {
  getAllUsers,
  getUserById,
  registerUser,
  loginUser,
  updateUser,
  deleteUserById
} = require('./user.service');

const router = express.Router();

// Public routes
router.post('/register', async (req, res) => {
  try {
    const userData = req.body;
    const user = await registerUser(userData);
    return sendSuccess(res, 201, 'User registered successfully', user);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    return sendSuccess(res, 200, 'Login successful', result);
  } catch (error) {
    return sendError(res, 401, error.message);
  }
});

// Protected routes (require authentication)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.user.userId);
    const user = await getUserById(userId);
    return sendSuccess(res, 200, 'Profile retrieved successfully', user);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.user.userId);
    const userData = req.body;
    const user = await updateUser(userId, userData);
    return sendSuccess(res, 200, 'Profile updated successfully', user);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

// Admin only routes
router.get('/', authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
  try {
    const users = await getAllUsers();
    return sendSuccess(res, 200, 'Users retrieved successfully', users);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

router.get('/:id', authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await getUserById(userId);
    return sendSuccess(res, 200, 'User retrieved successfully', user);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

router.put('/:id', authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const userData = req.body;
    const user = await updateUser(userId, userData);
    return sendSuccess(res, 200, 'User updated successfully', user);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

router.delete('/:id', authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    await deleteUserById(userId);
    return sendSuccess(res, 200, 'User deleted successfully');
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

module.exports = router;