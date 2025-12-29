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

import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch all tasks (FIXED)
  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get("/");

      // ✅ GUARANTEE tasks is always an array
      const data = res.data;
      const safeTasks = Array.isArray(data)
        ? data
        : Array.isArray(data?.tasks)
        ? data.tasks
        : [];

      setTasks(safeTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
      setTasks([]); // safety fallback
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Add task
  const addTask = async (e) => {
    e?.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await api.post("/", {
        title,
        createdAt: new Date().toISOString()
      });
      setTitle("");
      await loadTasks();
    } catch (error) {
      console.error("Error adding task:", error);
    }
    setLoading(false);
  };

  // Delete task
  const deleteTask = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/${id}`);
      await loadTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
    setLoading(false);
  };

  // Toggle completed
  const toggleTask = async (task) => {
    setLoading(true);
    try {
      await api.put(`/${task._id}`, {
        completed: !task.completed,
        completedAt: !task.completed ? new Date().toISOString() : null
      });
      await loadTasks();
    } catch (error) {
      console.error("Error updating task:", error);
    }
    setLoading(false);
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
      await loadTasks();
    } catch (error) {
      console.error("Error editing task:", error);
    }
    setLoading(false);
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  // 🔹 Filter tasks (SAFE)
  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  // 🔹 Stats (SAFE)
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = tasks.filter(t => !t.completed).length;

  // Clear completed
  const clearCompleted = async () => {
    setLoading(true);
    try {
      const completedIds = tasks
        .filter(task => task.completed)
        .map(task => task._id);

      await Promise.all(
        completedIds.map(id => api.delete(`/${id}`))
      );

      await loadTasks();
    } catch (error) {
      console.error("Error clearing completed:", error);
    }
    setLoading(false);
  };

  return (
    <div className="app-container">
      <div className="app-wrapper">
        <header className="app-header">
          <h1 className="app-title">🚀 TaskFlow Pro</h1>
          <p className="app-subtitle">
            Organize your day, boost your productivity
          </p>
        </header>

        <div className="main-card">
          {/* Stats */}
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

          {/* Add Task */}
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

          {/* Filters */}
          <div className="filter-tabs">
            {["all", "active", "completed"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`filter-tab ${filter === tab ? "filter-tab-active" : ""}`}
              >
                {tab[0].toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tasks */}
          <div className="task-list">
            {loading && filteredTasks.length === 0 ? (
              <div className="loading-state">Loading tasks...</div>
            ) : filteredTasks.length === 0 ? (
              <div className="empty-state">
                {filter === "completed" ? <CheckCircle size={48} /> : <Clock size={48} />}
                <p>No tasks found</p>
              </div>
            ) : (
              filteredTasks.map(task => (
                <div key={task._id} className={`task-item ${task.completed ? "task-completed" : ""}`}>
                  <button onClick={() => toggleTask(task)}>
                    {task.completed ? <Check size={18} /> : <Circle size={18} />}
                  </button>

                  <div className="task-content">
                    {editingId === task._id ? (
                      <>
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                        />
                        <button onClick={() => saveEdit(task._id)}>
                          <Save size={16} />
                        </button>
                        <button onClick={cancelEdit}>
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <span>{task.title}</span>
                      </>
                    )}
                  </div>

                  <div className="task-actions">
                    {!task.completed && editingId !== task._id && (
                      <button onClick={() => startEdit(task)}>
                        <Edit2 size={16} />
                      </button>
                    )}
                    <button onClick={() => deleteTask(task._id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="footer-actions">
            <span>{pendingTasks} remaining</span>
            {completedTasks > 0 && (
              <button onClick={clearCompleted}>
                Clear completed ({completedTasks})
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;