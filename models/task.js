// Import necessary modules
const mongoose = require('mongoose'); // Mongoose library for interacting with MongoDB

/**
 * @desc Task Schema: Defines the structure for Task documents in MongoDB
 * Fields:
 * - title: The name or title of the task (required).
 * - description: Additional details about the task.
 * - status: The current status of the task (e.g., "pending", "in-progress", "completed").
 * - dueDate: The deadline for the task.
 * - category: A label or grouping for the task (e.g., "work", "personal").
 * - assignedTo: A reference to the user assigned to the task.
 * - comments: An array of comments for the task, each with a user reference, comment text, and timestamp.
 * - priority: The priority level of the task (e.g., "low", "medium", "high").
 * - deleted: A boolean indicating if the task is deleted.
 * - deletedAt: The timestamp when the task was deleted.
 * - archived: A boolean indicating if the task is archived.
 * - timestamps: Automatically adds 'createdAt' and 'updatedAt' fields.
 */
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'], // Title is mandatory
    trim: true, // Remove extra whitespaces
  },
  description: {
    type: String,
    trim: true, // Remove extra whitespaces
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'], // Limit possible values
    default: 'pending', // Default status
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
    validate: {
      validator: function (value) {
        return value >= new Date().setHours(0, 0, 0, 0); // Start of today
      },
      message: 'Due date must be today or in the future',
    },
  },
  category: {
    type: String, // Category for the task (e.g., "work", "personal")
    required: [true, 'Task category is required'], // Category is mandatory
    trim: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId, // Reference to a user
    ref: 'User', // Links to the 'User' model
    required: [true, 'Task must be assigned to a user'], // A task must be assigned to a user
  },
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      comment: {
        type: String,
        required: true,
        trim: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  archived: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true, // Automatically manage 'createdAt' and 'updatedAt'
});

taskSchema.pre('save', function(next) {
  if (this.dueDate <= Date.now()) {
    return next(new Error('Due date cannot be in the past'));
  }
  next();
});

// Create and export the Task model
const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
