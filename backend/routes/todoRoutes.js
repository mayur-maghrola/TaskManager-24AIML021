const express = require("express");
const Todo = require("../models/todoModel");
const { protect } = require("../middleware/authMiddleware");
const { validateTodo } = require("../middleware/validationMiddleware");
const cache = require("../utils/cache");
const taskEvents = require("../events");

const router = express.Router();

// Helper to invalidate task cache on write operations
const invalidateTaskCache = (userId) => {
  if (userId) {
    cache.del(`all_tasks_${userId}`);
  }
  cache.del("all_tasks");
  console.log(`[CACHE] Invalidated task cache for user: ${userId || "global"}`);
};

// Protect ALL task routes using authentication middleware
router.use(protect);

// @route   GET /todos or /api/todos (and /tasks or /api/tasks)
// @desc    Get all tasks for the logged-in user (Cached)
// @access  Private
router.get("/", async (req, res) => {
  try {
    const cacheKey = req.user ? `all_tasks_${req.user._id}` : "all_tasks";

    // Step 3: Check cache first
    const cached = cache.get(cacheKey) || cache.get("all_tasks");
    if (cached) {
      console.log(`[CACHE HIT] Returning tasks from cache (${cacheKey})`);
      res.setHeader("X-Cache", "HIT");
      return res.json(cached);
    }

    // Cache miss: fetch from database
    console.log(`[CACHE MISS] Fetching tasks from DB for ${cacheKey}`);
    const todos = await Todo.find({ userId: req.user._id }).sort({ createdAt: -1 });

    // Store in cache (TTL 60 seconds as configured in cache instance)
    cache.set(cacheKey, todos);
    cache.set("all_tasks", todos);

    res.setHeader("X-Cache", "MISS");
    return res.json(todos);
  } catch (error) {
    console.error("Fetch Todos Error:", error);
    return res.status(500).json({ error: "Failed to fetch tasks." });
  }
});

// @route   POST /todos or /api/todos (and /tasks or /api/tasks)
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
      title: req.body.title || text,
      userId: req.user._id,
    });

    // Invalidate cache after successful create
    invalidateTaskCache(req.user._id);

    // Prepare task object with title and assigned user for notification event
    const taskPayload = {
      ...todo.toObject(),
      title: todo.title || todo.text,
      assignedUser: req.user.username || req.user.email || req.user._id,
    };

    // Respond immediately before event handler finishes executing
    console.log(`[API] Response sent at ${new Date().toISOString()}`);
    res.status(201).json(todo);

    // Emit task-created event asynchronously
    taskEvents.emit("task-created", taskPayload);
  } catch (error) {
    console.error("Create Todo Error:", error);
    return res.status(500).json({ error: "Failed to create task." });
  }
});

// Shared update handler for PUT and PATCH
const updateTodoHandler = async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, userId: req.user._id });

    if (!todo) {
      return res.status(404).json({ error: "Task not found." });
    }

    if (typeof req.body.isChecked === "boolean") {
      todo.isChecked = req.body.isChecked;
    } else if (req.body.isChecked !== undefined) {
      todo.isChecked = !todo.isChecked;
    }

    if (req.body.text && typeof req.body.text === "string" && req.body.text.trim().length >= 3) {
      todo.text = req.body.text.trim();
    }

    const allowedStatuses = ["Pending", "Ongoing", "Completed"];
    if (req.body.status && allowedStatuses.includes(req.body.status)) {
      todo.status = req.body.status;
    }

    await todo.save();

    // Step 4: Invalidate cache after successful update
    invalidateTaskCache(req.user._id);

    return res.json(todo);
  } catch (error) {
    console.error("Update Todo Error:", error);
    return res.status(500).json({ error: "Failed to update task." });
  }
};

// @route   PATCH /todos/:id or /tasks/:id
// @desc    Update task status or text
// @access  Private
router.patch("/:id", updateTodoHandler);

// @route   PUT /todos/:id or /tasks/:id
// @desc    Update task (PUT method)
// @access  Private
router.put("/:id", updateTodoHandler);

// @route   DELETE /todos/:id or /tasks/:id
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

    // Step 4: Invalidate cache after successful delete
    invalidateTaskCache(req.user._id);

    return res.json({ message: "Task deleted successfully.", id: req.params.id });
  } catch (error) {
    console.error("Delete Todo Error:", error);
    return res.status(500).json({ error: "Failed to delete task." });
  }
});

module.exports = router;
