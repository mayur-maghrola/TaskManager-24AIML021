import React, { useState, useEffect } from "react";
import { Plus, Trash2, AlertTriangle, ClipboardList } from "lucide-react";
import "./App.css";

const API = "http://localhost:3000/todos";

function ConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <AlertTriangle className="modal-icon" size={36} />
        <h2 className="modal-title">Delete Task?</h2>
        <p className="modal-msg">This action cannot be undone.</p>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="btn-delete" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function TodoItem({ todo, onDeleteRequest, onToggle }) {
  return (
    <li className="todo-item-container d-flex flex-row">
      <input
        type="checkbox"
        className="checkbox-input"
        checked={todo.isChecked}
        onChange={() => onToggle(todo._id)}
      />
      <div className="label-container d-flex flex-row">
        <label className={`checkbox-label ${todo.isChecked ? "checked" : ""}`}>
          {todo.text}
        </label>
        <div className="delete-icon-container">
          <Trash2 className="delete-icon" size={17} onClick={() => onDeleteRequest(todo._id)} />
        </div>
      </div>
    </li>
  );
}

export default function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(API).then((r) => r.json()).then(setTodos);
  }, []);

  async function handleAdd() {
    const text = input.trim();
    if (text.length < 3) { setError("Task must be at least 3 characters."); return; }
    if (todos.some((t) => t.text === text)) { setError("Task already exists."); return; }
    setError("");

    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const newTodo = await res.json();
    setTodos((prev) => [...prev, newTodo]);
    setInput("");
  }

  async function handleConfirmDelete() {
    await fetch(`${API}/${confirmId}`, { method: "DELETE" });
    setTodos((prev) => prev.filter((t) => t._id !== confirmId));
    setConfirmId(null);
  }

  function handleToggle(id) {
    setTodos((prev) =>
      prev.map((t) => (t._id === id ? { ...t, isChecked: !t.isChecked } : t))
    );
  }

  return (
    <div className="todos-bg-container">
      {confirmId && (
        <ConfirmModal
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="app-card">
              <h1 className="todos-heading"><ClipboardList size={30} /> Task Manager</h1>

              {error && <div className="error-msg"><AlertTriangle size={15} /> {error}</div>}
              <div className="input-row">
                <input
                  type="text"
                  className="todo-user-input"
                  placeholder="What needs to be done?"
                  value={input}
                  onChange={(e) => { setInput(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />
                <button className="btn-add" onClick={handleAdd}>
                  <Plus size={16} /> Add
                </button>
              </div>

              <h2 className="todo-items-heading">
                My <span className="todo-items-heading-subpart">Tasks</span>
                <span className="task-count">{todos.length}</span>
              </h2>

              {todos.length === 0 ? (
                <p className="empty-msg">No tasks yet. Add one above!</p>
              ) : (
                <ul className="todo-items-container">
                  {todos.map((todo) => (
                    <TodoItem
                      key={todo._id}
                      todo={todo}
                      onDeleteRequest={setConfirmId}
                      onToggle={handleToggle}
                    />
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
