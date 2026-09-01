import React, { useState, useEffect } from "react";
import { Plus, Trash2, AlertTriangle, ClipboardList, LogOut, User as UserIcon } from "lucide-react";
import Auth from "./components/Auth";
import "./App.css";

const API = "http://localhost:3000/api/todos";

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
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("task_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [error, setError] = useState("");

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem("task_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setTodos([]);
    localStorage.removeItem("task_user");
  };

  const fetchTodos = async () => {
    if (!user || !user.token) return;
    try {
      const res = await fetch(API, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (res.status === 401) {
        // Token expired or invalid
        handleLogout();
        setError("Session expired. Please log in again.");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch tasks.");
      }

      const data = await res.json();
      setTodos(data);
    } catch (err) {
      console.error("Fetch todos error:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    if (user && user.token) {
      fetchTodos();
    }
  }, [user]);

  async function handleAdd() {
    const text = input.trim();
    if (text.length < 3) {
      setError("Task must be at least 3 characters.");
      return;
    }
    if (todos.some((t) => t.text.toLowerCase() === text.toLowerCase())) {
      setError("Task already exists.");
      return;
    }
    setError("");

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          handleLogout();
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error(data.error || "Failed to add task.");
      }

      setTodos((prev) => [data, ...prev]);
      setInput("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleConfirmDelete() {
    if (!confirmId) return;
    try {
      const res = await fetch(`${API}/${confirmId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          handleLogout();
          throw new Error("Session expired.");
        }
        const data = await res.json();
        throw new Error(data.error || "Failed to delete task.");
      }

      setTodos((prev) => prev.filter((t) => t._id !== confirmId));
      setConfirmId(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggle(id) {
    const target = todos.find((t) => t._id === id);
    if (!target) return;

    // Optimistic UI update
    setTodos((prev) =>
      prev.map((t) => (t._id === id ? { ...t, isChecked: !t.isChecked } : t))
    );

    try {
      const res = await fetch(`${API}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ isChecked: !target.isChecked }),
      });

      if (!res.ok) {
        // Rollback on failure
        setTodos((prev) =>
          prev.map((t) => (t._id === id ? { ...t, isChecked: target.isChecked } : t))
        );
        if (res.status === 401) handleLogout();
      }
    } catch (err) {
      console.error("Toggle error:", err);
      // Rollback
      setTodos((prev) =>
        prev.map((t) => (t._id === id ? { ...t, isChecked: target.isChecked } : t))
      );
    }
  }

  if (!user) {
    return (
      <div className="todos-bg-container">
        <div className="container">
          <h1 className="todos-heading" style={{ marginBottom: "20px" }}>
            <ClipboardList size={32} /> Task Manager
          </h1>
          <Auth onAuthSuccess={handleAuthSuccess} />
        </div>
      </div>
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#4c63b6", fontWeight: "600" }}>
                  <UserIcon size={18} /> Hello, {user.username}
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    background: "none",
                    border: "1px solid #c5cae9",
                    borderRadius: "6px",
                    padding: "4px 10px",
                    color: "#e53935",
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontWeight: "600",
                  }}
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>

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
