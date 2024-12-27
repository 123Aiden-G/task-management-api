const Task = require('../models/task');

/**
 * @desc Get all tasks with optional filters, pagination, and sorting
 * @route GET /api/tasks
 * @access Private (Requires authentication)
 */
const getAllTasks = async (req, res) => {
  try {
    const { status, dueDate, category, page = 1, limit = 10, sortBy = 'createdAt:asc' } = req.query;

    const filter = { deleted: false }; // Exclude soft-deleted tasks
    if (status) filter.status = status;
    if (dueDate) filter.dueDate = { $lte: new Date(dueDate) };
    if (category) filter.category = category;

    const skip = (page - 1) * limit;
    const sortCriteria = {};
    const [sortField, sortOrder] = sortBy.split(':');
    sortCriteria[sortField] = sortOrder === 'desc' ? -1 : 1;

    const tasks = await Task.find({ ...filter, assignedTo: req.user.id })
      .populate({
        path: 'assignedTo',
        match: { deleted: false }, // Exclude soft-deleted users
        select: 'name email'
      })
      .sort(sortCriteria)
      .skip(skip)
      .limit(parseInt(limit));

    const totalTasks = await Task.countDocuments({ ...filter, assignedTo: req.user.id });

    res.status(200).json({
      success: true,
      data: tasks,
      pagination: {
        total: totalTasks,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalTasks / limit)
      },
      message: 'Tasks retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve tasks'
    });
  }
};

/**
 * @desc Create a new task
 * @route POST /api/tasks
 * @access Private (Requires authentication)
 */
const createTask = async (req, res) => {
  try {
    const { title, description, status, dueDate, category, priority } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title and category are required'
      });
    }

    const newTask = new Task({
      title,
      description,
      status,
      dueDate,
      category,
      priority,
      assignedTo: req.user.id,
    });
    const savedTask = await newTask.save();

    // Remove email notification logic
    // sendNotification(req.user.email, 'New Task Assigned', `You have been assigned a new task: ${title}`);

    res.status(201).json({
      success: true,
      data: savedTask,
      message: 'Task created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to create task'
    });
  }
};

/**
 * @desc Update an existing task
 * @route PUT /api/tasks/:taskId
 * @access Private (Requires authentication)
 */
const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, assignedTo: req.user.id, deleted: false },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or not authorized to update'
      });
    }
    res.status(200).json({
      success: true,
      data: updatedTask,
      message: 'Task updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to update task'
    });
  }
};

/**
 * @desc Permanently delete a task
 * @route DELETE /api/tasks/:taskId
 * @access Private (Requires authentication)
 */
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findOneAndDelete({ _id: taskId, assignedTo: req.user.id, deleted: false });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or not authorized to delete'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to delete task'
    });
  }
};

/**
 * @desc Add a comment to a task
 * @route POST /api/tasks/:taskId/comments
 * @access Private (Requires authentication)
 */
const addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { comment } = req.body;
    console.log(`Adding comment to task ${taskId}:`, comment); // Log the comment being added

    const task = await Task.findById(taskId);
    if (!task || task.deleted) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    task.comments.push({ user: req.user.id, comment });
    await task.save();
    console.log('Updated task with new comment:', task); // Log the updated task

    res.status(201).json({
      success: true,
      data: task,
      message: 'Comment added successfully'
    });
  } catch (error) {
    console.error('Error adding comment:', error); // Log any errors
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to add comment'
    });
  }
};

/**
 * @desc Assign a task to another user
 * @route PUT /api/tasks/:taskId/assign
 * @access Private (Requires authentication)
 */
const assignTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { userId } = req.body; // Remove userEmail from the request body
    const task = await Task.findById(taskId);
    if (!task || task.deleted) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    task.assignedTo = userId;
    await task.save();

    // Remove email notification logic
    // sendNotification(userEmail, 'Task Assigned', `You have been assigned a new task: ${task.title}`);

    res.status(200).json({
      success: true,
      data: task,
      message: 'Task assigned successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to assign task'
    });
  }
};

module.exports = {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  addComment,
  assignTask,
};
