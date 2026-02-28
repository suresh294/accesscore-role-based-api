const asyncHandler = require('express-async-handler');
const taskModel = require('../models/taskModel');

// @desc    Create new task
// @route   POST /api/v1/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    if (!title) {
        res.status(400);
        throw new Error('Task title is required');
    }

    const task = await taskModel.createTask({
        title,
        description,
        user_id: req.user.id,
    });

    res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: task
    });
});

// @desc    Get all tasks (User's own or all for Admin)
// @route   GET /api/v1/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
    const tasks = await taskModel.getTasks(req.user.id, req.user.role);
    res.status(200).json({
        success: true,
        message: 'Tasks retrieved successfully',
        count: tasks.length,
        data: tasks
    });
});

// @desc    Get single task
// @route   GET /api/v1/tasks/:id
// @access  Private
const getTask = asyncHandler(async (req, res) => {
    const task = await taskModel.getTaskById(req.params.id);

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    // Check ownership (Admin can see all)
    if (task.user_id !== req.user.id && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to access this task');
    }

    res.status(200).json({
        success: true,
        message: 'Task retrieved successfully',
        data: task
    });
});

// @desc    Update task
// @route   PUT /api/v1/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
    let task = await taskModel.getTaskById(req.params.id);

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    // Check ownership
    if (task.user_id !== req.user.id && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to update this task');
    }

    const updatedTask = await taskModel.updateTask(req.params.id, req.body);
    res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: updatedTask
    });
});

// @desc    Delete task
// @route   DELETE /api/v1/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
    const task = await taskModel.getTaskById(req.params.id);

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    // Check ownership
    if (task.user_id !== req.user.id && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to delete this task');
    }

    await taskModel.deleteTask(req.params.id);
    res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
        data: null
    });
});

module.exports = {
    createTask,
    getTasks,
    getTask,
    updateTask,
    deleteTask,
};
