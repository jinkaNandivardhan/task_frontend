import React, { useEffect, useState } from "react";
import api from "./api";
import {
  Plus,
  Trash2,
  Check,
  Edit2,
  Save,
  X,
  Clock,
  CheckCircle,
  Circle
} from "lucide-react";

import "./App.css"; // We'll create this CSS file

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [filter, setFilter] = useState("all"); // all, active, completed
  const [loading, setLoading] = useState(false);

  // Fetch all tasks
  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get("/");
      setTasks(res.data);
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Add task
  const addTask = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;
    
    setLoading(true);
    try {
      await api.post("/", { 
        title,
        createdAt: new Date().toISOString()
      });
      setTitle("");
      loadTasks();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/${id}`);
      loadTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Toggle completed
  const toggleTask = async (task) => {
    setLoading(true);
    try {
      await api.put(`/${task._id}`, { 
        completed: !task.completed,
        completedAt: !task.completed ? new Date().toISOString() : null
      });
      loadTasks();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // Start editing
  const startEdit = (task) => {
    setEditingId(task._id);
    setEditTitle(task.title);
  };

  // Save edit
  const saveEdit = async (id) => {
    if (!editTitle.trim()) return;
    
    setLoading(true);
    try {
      await api.put(`/${id}`, { title: editTitle });
      setEditingId(null);
      setEditTitle("");
      loadTasks();
    } catch (error) {
      console.error("Error editing task:", error);
    }
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  // Stats
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = tasks.filter(task => !task.completed).length;

  // Clear all completed
  const clearCompleted = async () => {
    setLoading(true);
    try {
      const completedTaskIds = tasks
        .filter(task => task.completed)
        .map(task => task._id);
      
      // Delete all completed tasks
      await Promise.all(
        completedTaskIds.map(id => api.delete(`/${id}`))
      );
      
      loadTasks();
    } catch (error) {
      console.error("Error clearing completed tasks:", error);
    }
  };

  return (
    <div className="app-container">
      <div className="app-wrapper">
        {/* Header */}
        <header className="app-header">
          <h1 className="app-title">
            🚀 TaskFlow Pro
          </h1>
          <p className="app-subtitle">
            Organize your day, boost your productivity
          </p>
        </header>

        {/* Main Card */}
        <div className="main-card">
          {/* Stats Bar */}
          <div className="stats-bar">
            <div className="stat-item">
              <div className="stat-value">{tasks.length}</div>
              <div className="stat-label">Total</div>
            </div>
            <div className="stat-item">
              <div className="stat-value stat-pending">{pendingTasks}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-item">
              <div className="stat-value stat-completed">{completedTasks}</div>
              <div className="stat-label">Done</div>
            </div>
          </div>

          {/* Add Task Form */}
          <form onSubmit={addTask} className="add-form">
            <div className="form-row">
              <input
                type="text"
                placeholder="What needs to be done?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="task-input"
              />
              <button
                type="submit"
                disabled={!title.trim() || loading}
                className="add-button"
              >
                <Plus size={20} />
                Add
              </button>
            </div>
          </form>

          {/* Filter Tabs */}
          <div className="filter-tabs">
            {["all", "active", "completed"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`filter-tab ${filter === tab ? 'filter-tab-active' : ''}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Task List */}
          <div className="task-list">
            {loading && filteredTasks.length === 0 ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading tasks...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  {filter === "completed" ? (
                    <CheckCircle size={48} />
                  ) : (
                    <Clock size={48} />
                  )}
                </div>
                <p className="empty-text">
                  {filter === "completed"
                    ? "No completed tasks yet"
                    : filter === "active"
                    ? "All tasks are completed! 🎉"
                    : "Start by adding your first task!"}
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task._id}
                  className={`task-item ${task.completed ? 'task-completed' : ''}`}
                >
                  {/* Toggle Button */}
                  <button
                    onClick={() => toggleTask(task)}
                    className={`toggle-button ${task.completed ? 'toggle-button-completed' : ''}`}
                  >
                    {task.completed ? (
                      <Check size={18} />
                    ) : (
                      <Circle size={18} />
                    )}
                  </button>

                  {/* Task Content */}
                  <div className="task-content">
                    {editingId === task._id ? (
                      <div className="edit-form">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="edit-input"
                          autoFocus
                        />
                        <button
                          onClick={() => saveEdit(task._id)}
                          className="action-button save-button"
                        >
                          <Save size={18} />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="action-button cancel-button"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <span
                          className={`task-title ${task.completed ? 'task-title-completed' : ''}`}
                        >
                          {task.title}
                        </span>
                        {task.createdAt && (
                          <p className="task-date">
                            Added {new Date(task.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="task-actions">
                    {!task.completed && editingId !== task._id && (
                      <button
                        onClick={() => startEdit(task)}
                        className="action-button edit-button"
                      >
                        <Edit2 size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteTask(task._id)}
                      className="action-button delete-button"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          <div className="footer-actions">
            <div className="remaining-tasks">
              {pendingTasks} task{pendingTasks !== 1 ? "s" : ""} remaining
            </div>
            {completedTasks > 0 && (
              <button
                onClick={clearCompleted}
                className="clear-completed-button"
              >
                <Trash2 size={16} />
                Clear completed ({completedTasks})
              </button>
            )}
          </div>
        </div>

        {/* Tips Section */}
        <div className="tips-section">
          <h3 className="tips-title">💡 Quick Tips</h3>
          <p className="tips-text">
            • Click on a task to mark it as complete
            <br />
            • Hover over tasks to see action buttons
            <br />
            • Use filters to organize your view
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;