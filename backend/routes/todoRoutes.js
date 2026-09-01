const express = require("express");
const Todo = require("../models/todoModel");
const { protect } = require("../middleware/authMiddleware");
const { validateTodo } = require("../middleware/validationMiddleware");

const router = express.Router();

// Protect ALL task routes using authentication middleware
router.use(protect);

// @route   GET /todos or /api/todos
// @desc    Get all tasks for the logged-in user
// @access  Private
router.get("/", async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json(todos);
  } catch (error) {
    console.error("Fetch Todos Error:", error);
    return res.status(500).json({ error: "Failed to fetch tasks." });
  }
});

// @route   POST /todos or /api/todos
// @desc    Create a new task for the logged-in user
// @access  Private
router.post("/", validateTodo, async (req, res) => {
  try {
    const { text } = req.body;

    // Check for duplicate task for this user
    const existing = await Todo.findOne({
      userId: req.user._id,
      text: text,
    });

    if (existing) {
      return res.status(400).json({ error: "Task already exists." });
    }

    const todo = await Todo.create({
      text: text,
      userId: req.user._id,
    });

    return res.status(201).json(todo);
  } catch (error) {
    console.error("Create Todo Error:", error);
    return res.status(500).json({ error: "Failed to create task." });
  }
});

// @route   PATCH /todos/:id or /api/todos/:id
// @desc    Toggle or update a task status
// @access  Private
router.patch("/:id", async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, userId: req.user._id });

    if (!todo) {
      return res.status(404).json({ error: "Task not found." });
    }

    if (typeof req.body.isChecked === "boolean") {
      todo.isChecked = req.body.isChecked;
    } else {
      todo.isChecked = !todo.isChecked;
    }

    if (req.body.text && typeof req.body.text === "string" && req.body.text.trim().length >= 3) {
      todo.text = req.body.text.trim();
    }

    await todo.save();
    return res.json(todo);
  } catch (error) {
    console.error("Update Todo Error:", error);
    return res.status(500).json({ error: "Failed to update task." });
  }
});

// @route   DELETE /todos/:id or /api/todos/:id
// @desc    Delete a task
// @access  Private
router.delete("/:id", async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!todo) {
      return res.status(404).json({ error: "Task not found or unauthorized." });
    }

    return res.json({ message: "Task deleted successfully.", id: req.params.id });
  } catch (error) {
    console.error("Delete Todo Error:", error);
    return res.status(500).json({ error: "Failed to delete task." });
  }
});

module.exports = router;
