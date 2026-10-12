import React, { useState } from "react";
import {
  FolderGit2,
  Calendar,
  CheckCircle2,
  Clock,
  Users,
  PlusCircle,
  Tag,
  BarChart3,
  ExternalLink,
  Search,
} from "lucide-react";

const INITIAL_PROJECTS = [
  {
    id: 1,
    title: "Enterprise Cloud Migration",
    description: "Migrating legacy infrastructure, microservices, and databases to multi-region cloud cluster.",
    category: "DevOps",
    status: "In Progress",
    progress: 68,
    dueDate: "2026-11-15",
    teamSize: 6,
    tags: ["AWS", "Docker", "Kubernetes", "PostgreSQL"],
  },
  {
    id: 2,
    title: "Mobile App UX Redesign",
    description: "Revamping user journeys, onboarding flows, dark mode theming, and accessibility compliance.",
    category: "Design",
    status: "Review",
    progress: 92,
    dueDate: "2026-10-30",
    teamSize: 4,
    tags: ["Figma", "Design System", "A11y"],
  },
  {
    id: 3,
    title: "OAuth2 & MFA Security Audit",
    description: "Zero-trust verification, JWT rotation enhancements, vulnerability mitigation, and penetration test fixes.",
    category: "Security",
    status: "Completed",
    progress: 100,
    dueDate: "2026-10-05",
    teamSize: 3,
    tags: ["Security", "JWT", "Audit", "PenTest"],
  },
  {
    id: 4,
    title: "AI Task Prioritization Engine",
    description: "Building predictive ML models to rank urgent backlog items and optimize team sprint allocations.",
    category: "Data Science",
    status: "Planning",
    progress: 25,
    dueDate: "2026-12-01",
    teamSize: 5,
    tags: ["Python", "TensorFlow", "FastAPI"],
  },
];

export default function Projects() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("Development");

  const filtered = projects.filter((p) => {
    const matchesFilter = filter === "All" || p.status === filter;
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newProj = {
      id: Date.now(),
      title: newTitle.trim(),
      description: newDesc.trim() || "No description provided.",
      category: newCategory,
      status: "In Progress",
      progress: 0,
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      teamSize: 1,
      tags: [newCategory, "Sprint 1"],
    };

    setProjects([newProj, ...projects]);
    setNewTitle("");
    setNewDesc("");
    setShowModal(false);
  };

  const statusColors = {
    Completed: { bg: "#ecfdf5", text: "#059669", border: "#a7f3d0" },
    "In Progress": { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" },
    Review: { bg: "#fef3c7", text: "#d97706", border: "#fde68a" },
    Planning: { bg: "#f3e8ff", text: "#7c3aed", border: "#ddd6fe" },
  };

  return (
    <div className="projects-container">
      <div className="projects-header">
        <div>
          <h2 className="projects-title">
            <FolderGit2 className="title-icon" size={26} />
            Workspaces & Projects
          </h2>
          <p className="projects-subtitle">
            Track collaborative initiatives, milestones, and deliverables.
          </p>
        </div>
        <button className="btn-add-project" onClick={() => setShowModal(true)}>
          <PlusCircle size={18} /> New Project
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="projects-stats-grid">
        <div className="stat-card">
          <div className="stat-val">{projects.length}</div>
          <div className="stat-label">Total Projects</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ color: "#2563eb" }}>
            {projects.filter((p) => p.status === "In Progress").length}
          </div>
          <div className="stat-label">Active Sprints</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ color: "#059669" }}>
            {projects.filter((p) => p.status === "Completed").length}
          </div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ color: "#7c3aed" }}>
            {Math.round(
              projects.reduce((acc, curr) => acc + curr.progress, 0) / (projects.length || 1)
            )}%
          </div>
          <div className="stat-label">Avg. Progress</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="projects-controls">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search projects by name, tech or domain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-pill-group">
          {["All", "In Progress", "Review", "Completed", "Planning"].map((tab) => (
            <button
              key={tab}
              className={`filter-pill ${filter === tab ? "active" : ""}`}
              onClick={() => setFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="projects-grid">
        {filtered.map((proj) => {
          const style = statusColors[proj.status] || statusColors["In Progress"];
          return (
            <div key={proj.id} className="project-card">
              <div className="project-card-top">
                <span
                  className="project-status-badge"
                  style={{
                    backgroundColor: style.bg,
                    color: style.text,
                    borderColor: style.border,
                  }}
                >
                  {proj.status}
                </span>
                <span className="project-category">{proj.category}</span>
              </div>

              <h3 className="project-card-title">{proj.title}</h3>
              <p className="project-card-desc">{proj.description}</p>

              <div className="progress-section">
                <div className="progress-labels">
                  <span>Completion</span>
                  <span className="progress-pct">{proj.progress}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${proj.progress}%`,
                      backgroundColor:
                        proj.progress === 100
                          ? "#10b981"
                          : proj.progress > 50
                          ? "#3b82f6"
                          : "#f59e0b",
                    }}
                  />
                </div>
              </div>

              <div className="project-tags">
                {proj.tags.map((tag) => (
                  <span key={tag} className="project-tag">
                    <Tag size={10} /> {tag}
                  </span>
                ))}
              </div>

              <div className="project-card-footer">
                <div className="footer-meta">
                  <Calendar size={13} />
                  <span>Due {proj.dueDate}</span>
                </div>
                <div className="footer-meta">
                  <Users size={13} />
                  <span>{proj.teamSize} members</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for New Project */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box project-modal-box">
            <h3 className="modal-title">Create New Project</h3>
            <form onSubmit={handleAddProject}>
              <div className="form-group" style={{ textAlign: "left", marginBottom: "12px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  className="todo-user-input"
                  style={{ width: "100%", marginTop: "4px" }}
                  placeholder="e.g. Real-time Notifications Service"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ textAlign: "left", marginBottom: "12px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>
                  Description
                </label>
                <textarea
                  className="todo-user-input"
                  style={{ width: "100%", marginTop: "4px", minHeight: "80px" }}
                  placeholder="Goals, deliverables, requirements..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ textAlign: "left", marginBottom: "16px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>
                  Domain / Category
                </label>
                <select
                  className="todo-user-input"
                  style={{ width: "100%", marginTop: "4px" }}
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  <option value="Development">Development</option>
                  <option value="DevOps">DevOps & Cloud</option>
                  <option value="Design">UI/UX Design</option>
                  <option value="Security">Security & Compliance</option>
                  <option value="Research">Research & ML</option>
                </select>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-add"
                  style={{ padding: "8px 18px" }}
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
