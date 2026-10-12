import React, { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route, NavLink, Link } from "react-router-dom";
import {
  Plus,
  Trash2,
  AlertTriangle,
  ClipboardList,
  LogOut,
  User as UserIcon,
  Clock,
  RefreshCw,
  CheckCircle2,
  ChevronRight,
  LayoutList,
  FolderGit2,
  LifeBuoy,
} from "lucide-react";
import Auth from "./components/Auth";
import ResetPassword from "./components/ResetPassword";
import LoadingFallback from "./components/LoadingFallback";

// Step 3: Convert route imports to lazy imports with React.lazy()
const Projects = lazy(() => import("./pages/Projects"));
const Contact = lazy(() => import("./pages/Contact"));
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
          <button className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-delete" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

const STATUS_ORDER = ["Pending", "Ongoing", "Completed"];

const STATUS_CONFIG = {
  Pending: { color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", Icon: Clock, label: "Pending" },
  Ongoing: { color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe", Icon: RefreshCw, label: "Ongoing" },
  Completed: { color: "#10b981", bg: "#ecfdf5", border: "#a7f3d0", Icon: CheckCircle2, label: "Completed" },
};

function TodoItem({ todo, onDeleteRequest, onToggle, onStatusChange }) {
  const currentStatus = todo.status || "Pending";
  const cfg = STATUS_CONFIG[currentStatus];
  const { Icon } = cfg;

  function cycleStatus() {
    const nextIndex = (STATUS_ORDER.indexOf(currentStatus) + 1) % STATUS_ORDER.length;
    onStatusChange(todo._id, STATUS_ORDER[nextIndex]);
  }

  return (
    <li className="todo-item-container">
      <div className="label-container" style={{ borderLeftColor: cfg.color }}>
        <input
          type="checkbox"
          className="checkbox-input"
          checked={todo.isChecked}
          onChange={() => onToggle(todo._id)}
        />
        <span className={`checkbox-label ${todo.isChecked ? "checked" : ""}`}>
          {todo.text}
        </span>
        <button
          className="status-badge"
          onClick={cycleStatus}
          title="Click to change status"
          style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}
        >
          <Icon size={13} strokeWidth={2.2} />
          {cfg.label}
          <ChevronRight size={12} strokeWidth={2.5} style={{ opacity: 0.7 }} />
        </button>
        <div className="delete-icon-container">
          <Trash2 className="delete-icon" size={17} onClick={() => onDeleteRequest(todo._id)} />
        </div>
      </div>
    </li>
  );
}

function TasksView({ user, handleLogout }) {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const fetchTodos = async () => {
    if (!user || !user.token) return;
    try {
      const res = await fetch(API, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (res.status === 401) {
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
        setTodos((prev) =>
          prev.map((t) => (t._id === id ? { ...t, isChecked: target.isChecked } : t))
        );
        if (res.status === 401) handleLogout();
      }
    } catch (err) {
      console.error("Toggle error:", err);
      setTodos((prev) =>
        prev.map((t) => (t._id === id ? { ...t, isChecked: target.isChecked } : t))
      );
    }
  }

  async function handleStatusChange(id, newStatus) {
    const target = todos.find((t) => t._id === id);
    if (!target) return;

    setTodos((prev) =>
      prev.map((t) => (t._id === id ? { ...t, status: newStatus } : t))
    );

    try {
      const res = await fetch(`${API}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        setTodos((prev) =>
          prev.map((t) => (t._id === id ? { ...t, status: target.status } : t))
        );
        if (res.status === 401) handleLogout();
      }
    } catch (err) {
      console.error("Status change error:", err);
      setTodos((prev) =>
        prev.map((t) => (t._id === id ? { ...t, status: target.status } : t))
      );
    }
  }

  const counts = {
    All: todos.length,
    Pending: todos.filter((t) => (t.status || "Pending") === "Pending").length,
    Ongoing: todos.filter((t) => (t.status || "Pending") === "Ongoing").length,
    Completed: todos.filter((t) => (t.status || "Pending") === "Completed").length,
  };

  const filteredTodos =
    activeFilter === "All"
      ? todos
      : todos.filter((t) => (t.status || "Pending") === activeFilter);

  const TABS = [
    { key: "All", label: "All", Icon: LayoutList, color: "#4c63b6" },
    { key: "Pending", label: "Pending", Icon: Clock, color: "#f59e0b" },
    { key: "Ongoing", label: "Ongoing", Icon: RefreshCw, color: "#3b82f6" },
    { key: "Completed", label: "Completed", Icon: CheckCircle2, color: "#10b981" },
  ];

  return (
    <div>
      {confirmId && (
        <ConfirmModal
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-7" style={{ margin: "0 auto" }}>
          <div className="app-card">
            <h1 className="todos-heading">
              <ClipboardList size={30} /> Task Manager
            </h1>

            {error && (
              <div className="error-msg">
                <AlertTriangle size={15} /> {error}
              </div>
            )}
            <div className="input-row">
              <input
                type="text"
                className="todo-user-input"
                placeholder="What needs to be done?"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
              <button className="btn-add" onClick={handleAdd}>
                <Plus size={16} /> Add
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
              {TABS.map(({ key, label, Icon, color }) => (
                <button
                  key={key}
                  className={`filter-tab ${activeFilter === key ? "filter-tab--active" : ""}`}
                  style={activeFilter === key ? { borderColor: color, color } : {}}
                  onClick={() => setActiveFilter(key)}
                >
                  <Icon size={13} strokeWidth={2.2} />
                  {label}
                  <span
                    className="filter-tab-count"
                    style={activeFilter === key ? { background: color, color: "#fff" } : {}}
                  >
                    {counts[key]}
                  </span>
                </button>
              ))}
            </div>

            <h2 className="todo-items-heading">
              <span className="todo-items-heading-subpart">
                {activeFilter === "All" ? "All" : activeFilter}
              </span>{" "}
              Tasks
              <span className="task-count">{filteredTodos.length}</span>
            </h2>

            {filteredTodos.length === 0 ? (
              <p className="empty-msg">
                {todos.length === 0
                  ? "No tasks yet. Add one above!"
                  : `No ${activeFilter.toLowerCase()} tasks.`}
              </p>
            ) : (
              <ul className="todo-items-container">
                {filteredTodos.map((todo) => (
                  <TodoItem
                    key={todo._id}
                    todo={todo}
                    onDeleteRequest={setConfirmId}
                    onToggle={handleToggle}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("task_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const pathname = window.location.pathname;
  const isResetPasswordPage = pathname.startsWith("/reset-password/");
  const resetToken = isResetPasswordPage ? pathname.split("/reset-password/")[1] : null;

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem("task_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("task_user");
  };

  if (isResetPasswordPage && resetToken) {
    return (
      <div className="todos-bg-container">
        <div className="container" style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
          <h1 className="todos-heading" style={{ marginBottom: "20px" }}>
            <ClipboardList size={32} /> Task Manager
          </h1>
          <ResetPassword
            token={resetToken}
            onBackToLogin={() => {
              window.location.href = "/";
            }}
          />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="todos-bg-container">
        <div className="container" style={{ maxWidth: "520px", margin: "0 auto", padding: "20px" }}>
          <h1 className="todos-heading" style={{ marginBottom: "20px" }}>
            <ClipboardList size={32} /> Task Manager
          </h1>
          <Auth onAuthSuccess={handleAuthSuccess} />
        </div>
      </div>
    );
  }

  return (
    <div className="app-root-layout">
      {/* Top Navigation Bar */}
      <nav className="main-navbar">
        <div className="nav-inner">
          <Link to="/" className="nav-brand">
            <ClipboardList size={22} color="#4c63b6" />
            <span>Task Manager</span>
            <span className="nav-badge-pill">v2.0</span>
          </Link>

          <div className="nav-links">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              <LayoutList size={16} /> Tasks
            </NavLink>
            <NavLink
              to="/projects"
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              <FolderGit2 size={16} /> Projects
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              <LifeBuoy size={16} /> Contact & Support
            </NavLink>
          </div>

          <div className="nav-user-meta">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                color: "#4c63b6",
                fontWeight: "600",
              }}
            >
              <UserIcon size={16} /> {user.username}
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "1px solid #c5cae9",
                borderRadius: "6px",
                padding: "4px 10px",
                color: "#e53935",
                fontSize: "12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontWeight: "600",
              }}
            >
              <LogOut size={13} /> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area with Routes */}
      <div className="todos-bg-container">
        <div className="container" style={{ maxWidth: "1140px", margin: "0 auto", padding: "0 20px" }}>
          {/* Optimized: Wrap Routes block with Suspense and meaningful fallback UI */}
          <Suspense fallback={<LoadingFallback message="Loading page component..." />}>
            <Routes>
              <Route
                path="/"
                element={<TasksView user={user} handleLogout={handleLogout} />}
              />
              <Route path="/projects" element={<Projects />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
