const express = require('express');
const router = express.Router();
const { createTask, getAllTasks, updateTask, deleteTask, addComment, assignTask } = require('../controllers/taskController');
const authenticate = require('../middleware/authenticate');

// Route to create a new task
router.post('/', authenticate, createTask);

// Route to get all tasks with pagination and sorting
router.get('/', authenticate, getAllTasks);

// Route to update an existing task
router.put('/:taskId', authenticate, updateTask);

// Route to delete a task
router.delete('/:taskId', authenticate, deleteTask);

// Route to add a comment to a task
router.post('/:taskId/comments', authenticate, addComment);

// Route to assign a task to another user
router.put('/:taskId/assign', authenticate, assignTask);

module.exports = router;
