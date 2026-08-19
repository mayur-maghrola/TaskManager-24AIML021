const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/AWDF");

const todoSchema = new mongoose.Schema({
    text: { type: String, required: true },
    isChecked: { type: Boolean, default: false }
});

const Todo = mongoose.model("Todo", todoSchema);

// GET all todos
app.get("/todos", async (req, res) => {
    const todos = await Todo.find();
    res.json(todos);
});

// POST new todo
app.post("/todos", async (req, res) => {
    const { text } = req.body;
    if (!text || text.trim().length < 3)
        return res.status(400).json({ error: "Task must be at least 3 characters." });

    const exists = await Todo.findOne({ text: text.trim() });
    if (exists)
        return res.status(400).json({ error: "Task already exists." });

    const todo = await Todo.create({ text: text.trim() });
    res.status(201).json(todo);
});

// DELETE a todo
app.delete("/todos/:id", async (req, res) => {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
