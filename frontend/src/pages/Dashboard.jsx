import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import TaskItem from '../components/TaskItem';
import { MeshBg } from '../components/UI';
import {
    LogOut, Plus, CheckCircle2, LayoutDashboard, Loader2,
    AlertCircle, Users, Settings, Clock, ListTodo
} from 'lucide-react';

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('tasks');

    const { user, logout } = useAuth();

    useEffect(() => { fetchTasks(); }, []);

    const fetchTasks = async () => {
        try {
            const res = await API.get('/tasks');
            setTasks(res.data.data || []);
            setLoading(false);
        } catch {
            setError('Failed to load tasks. Please refresh.');
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newTitle.trim()) return;
        setIsCreating(true);
        setError('');
        try {
            const res = await API.post('/tasks', { title: newTitle.trim(), description: newDesc.trim() });
            setTasks([res.data.data, ...tasks]);
            setNewTitle('');
            setNewDesc('');
        } catch {
            setError('Failed to create task. Please try again.');
        }
        setIsCreating(false);
    };

    const handleUpdate = async (id, updatedData) => {
        try {
            const res = await API.put(`/tasks/${id}`, updatedData);
            setTasks(tasks.map(t => t.id === id ? res.data.data : t));
            return true;
        } catch {
            setError('Failed to update task.');
            return false;
        }
    };

    const handleDelete = async (id) => {
        try {
            await API.delete(`/tasks/${id}`);
            setTasks(tasks.filter(t => t.id !== id));
        } catch {
            setError('Failed to delete task.');
        }
    };

    const completedCount = tasks.filter(t => t.status === 'completed').length;
    const pendingCount = tasks.filter(t => t.status !== 'completed').length;

    const navItems = [
        { id: 'tasks', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'team', icon: Users, label: 'Team Members' },
        { id: 'settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <MeshBg />

            {/* SIDEBAR */}
            <aside className="sidebar">
                {/* Logo */}
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">
                        <ListTodo size={20} color="white" />
                    </div>
                    <div>
                        <div className="sidebar-logo-text">AccessCore</div>
                        <div className="sidebar-logo-sub">System Active</div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`nav-btn ${activeTab === item.id ? 'active' : ''}`}
                        >
                            <item.icon size={17} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* User Footer */}
                <div className="sidebar-footer" style={{ marginTop: 'auto' }}>
                    <div className="sidebar-avatar">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="sidebar-user-info min-w-0">
                        <div className="sidebar-user-name truncate">{user?.name}</div>
                        <div className="sidebar-user-role">{user?.role || 'user'}</div>
                    </div>
                    <button onClick={logout} className="logout-btn" title="Log out">
                        <LogOut size={17} />
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="main-content">
                {/* Page Header */}
                <div className="page-header">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h2 className="page-title">
                                {activeTab === 'tasks' ? 'Dashboard' : activeTab === 'team' ? 'Team Members' : 'Settings'}
                            </h2>
                            <p className="page-subtitle">
                                {activeTab === 'tasks'
                                    ? `${tasks.length} task${tasks.length !== 1 ? 's' : ''} total`
                                    : 'Coming soon'}
                            </p>
                        </div>
                        <button
                            onClick={logout}
                            style={{ display: 'none' }}
                            className="btn btn-secondary"
                        >
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                        <AlertCircle size={15} />
                        {error}
                        <button
                            onClick={() => setError('')}
                            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5' }}
                        >
                            ✕
                        </button>
                    </div>
                )}

                {activeTab === 'tasks' ? (
                    <div className="dashboard-grid">
                        {/* LEFT COLUMN */}
                        <div>
                            {/* Stats */}
                            <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                                <div className="stat-card">
                                    <div className="stat-label">
                                        <Clock size={13} style={{ color: '#60a5fa' }} />
                                        Pending
                                    </div>
                                    <div className="stat-value" style={{ color: '#60a5fa' }}>{pendingCount}</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">
                                        <CheckCircle2 size={13} style={{ color: '#34d399' }} />
                                        Done
                                    </div>
                                    <div className="stat-value" style={{ color: '#34d399' }}>{completedCount}</div>
                                </div>
                            </div>

                            {/* Create Task */}
                            <div className="card nohover create-section">
                                <h3>
                                    <Plus size={16} style={{ color: '#60a5fa' }} />
                                    Create New Task
                                </h3>
                                <form onSubmit={handleCreate}>
                                    <div className="form-group">
                                        <label className="form-label">Task Title *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Enter task title..."
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            className="form-textarea"
                                            placeholder="Optional description..."
                                            value={newDesc}
                                            onChange={(e) => setNewDesc(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isCreating || !newTitle.trim()}
                                        className="btn btn-primary btn-full"
                                    >
                                        {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                        {isCreating ? 'Adding...' : 'Add Task'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* RIGHT COLUMN - TASK LIST */}
                        <div>
                            <div className="task-section-header">
                                <h3 className="task-section-title">Task List</h3>
                                {tasks.length > 0 && (
                                    <span className="task-count-badge">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
                                )}
                            </div>

                            {loading ? (
                                <div className="spinner">
                                    <div className="spinner-circle" />
                                    <span className="spinner-text">Loading tasks...</span>
                                </div>
                            ) : tasks.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-state-icon">
                                        <CheckCircle2 size={28} style={{ color: '#334155' }} />
                                    </div>
                                    <div className="empty-state-title">No Tasks Yet</div>
                                    <div className="empty-state-sub">Create your first task using the form on the left to get started.</div>
                                </div>
                            ) : (
                                <div className="task-list">
                                    {tasks.map(task => (
                                        <TaskItem
                                            key={task.id}
                                            task={task}
                                            onUpdate={handleUpdate}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                        <div style={{
                            width: 70, height: 70,
                            background: 'rgba(15,23,42,0.8)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '20px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                        }}>
                            <Settings size={28} style={{ color: '#334155' }} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>
                            Coming Soon
                        </h2>
                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>This section is under development.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
