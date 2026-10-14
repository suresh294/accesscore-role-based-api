import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import TaskItem from '../components/TaskItem';
import TeamMembers from './TeamMembers';
import SettingsPage from './Settings';
import { Badge, Button, Card, MeshBg } from '../components/UI';
import {
    AlertCircle, BarChart3, CheckCircle2, ChevronRight, Clock, LayoutDashboard,
    ListTodo, LogOut, Menu, Moon, PanelLeftClose, PanelLeftOpen, Plus, RefreshCw,
    Settings as SettingsIcon, Shield, Sun, Users, X,
} from 'lucide-react';

const getStoredTheme = () => localStorage.getItem('accesscore-theme') || 'dark';

const Dashboard = () => {
    const { user, logout, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [tasks, setTasks] = useState([]);
    const [tasksLoading, setTasksLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [error, setError] = useState('');
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [theme, setTheme] = useState(getStoredTheme);

    const fetchTasks = async () => {
        setTasksLoading(true);
        try {
            const response = await API.get('/tasks');
            setTasks(response.data.data || []);
        } catch {
            setError('Unable to load tasks. Please try again.');
        } finally {
            setTasksLoading(false);
        }
    };

    const fetchStats = async () => {
        if (user?.role !== 'admin') return;
        setStatsLoading(true);
        try {
            const response = await API.get('/admin/stats');
            setStats(response.data.data);
        } catch {
            setError('Unable to load dashboard metrics.');
        } finally {
            setStatsLoading(false);
        }
    };

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem('accesscore-theme', theme);
    }, [theme]);

    useEffect(() => {
        fetchTasks();
        fetchStats();
    }, [user?.role]);

    const taskStats = useMemo(() => ({
        totalTasks: tasks.length,
        completedTasks: tasks.filter((task) => task.status === 'completed').length,
        pendingTasks: tasks.filter((task) => task.status !== 'completed').length,
    }), [tasks]);

    const dashboardStats = user?.role === 'admin'
        ? (stats || { totalUsers: 0, totalAdmins: 0, totalTasks: 0, completedTasks: 0, pendingTasks: 0 })
        : taskStats;

    const navItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'tasks', icon: ListTodo, label: 'Tasks' },
        { id: 'team', icon: Users, label: 'Team Members' },
        { id: 'settings', icon: SettingsIcon, label: 'Settings' },
    ];

    const selectTab = (tab) => {
        setActiveTab(tab);
        setMobileNavOpen(false);
        setError('');
    };

    const toggleTheme = () => setTheme((current) => current === 'dark' ? 'light' : 'dark');

    const handleCreate = async (event) => {
        event.preventDefault();
        if (!newTitle.trim()) return;
        setIsCreating(true);
        setError('');
        try {
            const response = await API.post('/tasks', {
                title: newTitle.trim(),
                description: newDesc.trim(),
            });
            setTasks((current) => [response.data.data, ...current]);
            setNewTitle('');
            setNewDesc('');
            await fetchStats();
        } catch {
            setError('Unable to create task. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleUpdate = async (id, updatedData) => {
        try {
            const response = await API.put(`/tasks/${id}`, updatedData);
            setTasks((current) => current.map((task) => task.id === id ? response.data.data : task));
            await fetchStats();
            return true;
        } catch {
            setError('Unable to update task.');
            return false;
        }
    };

    const handleDelete = async (id) => {
        try {
            await API.delete(`/tasks/${id}`);
            setTasks((current) => current.filter((task) => task.id !== id));
            await fetchStats();
        } catch {
            setError('Unable to delete task.');
        }
    };

    return (
        <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <MeshBg />
            <aside className={`sidebar ${mobileNavOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon"><Shield size={20} color="white" /></div>
                    {!sidebarCollapsed && <div><div className="sidebar-logo-text">AccessCore</div><div className="sidebar-logo-sub">Control center</div></div>}
                </div>
                <nav className="sidebar-nav" aria-label="Main navigation">
                    <div className="nav-section-label">Workspace</div>
                    {navItems.map((item) => (
                        <button key={item.id} onClick={() => selectTab(item.id)} className={`nav-btn ${activeTab === item.id ? 'active' : ''}`} title={sidebarCollapsed ? item.label : undefined}>
                            <item.icon size={17} /><span>{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <div className="sidebar-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
                    {!sidebarCollapsed && <div className="sidebar-user-info min-w-0"><div className="sidebar-user-name truncate">{user?.name}</div><div className="sidebar-user-role">{user?.role || 'user'}</div></div>}
                    <button onClick={logout} className="logout-btn" title="Log out" aria-label="Log out"><LogOut size={17} /></button>
                </div>
            </aside>

            <main className="main-content">
                <header className="topbar">
                    <button className="mobile-menu-btn" onClick={() => setMobileNavOpen((open) => !open)} aria-label="Open navigation"><Menu size={20} /></button>
                    <div className="breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>{activeTab === 'dashboard' ? 'Overview' : navItems.find((item) => item.id === activeTab)?.label}</strong></div>
                    <div className="topbar-actions">
                        <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} aria-label="Toggle theme">{theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}</button>
                        <div className="topbar-user"><div className="topbar-user-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div><div><strong>{user?.name}</strong><span>{user?.role || 'user'}</span></div></div>
                    </div>
                </header>

                <div className="page-header dashboard-page-header">
                    <div><div className="eyebrow">AccessCore workspace</div><h1 className="page-title">{activeTab === 'dashboard' ? `Good to see you, ${user?.name?.split(' ')[0] || 'there'}` : navItems.find((item) => item.id === activeTab)?.label}</h1><p className="page-subtitle">{activeTab === 'dashboard' ? 'Here is what is happening across your workspace today.' : activeTab === 'tasks' ? 'Create, track, and organize your work.' : activeTab === 'team' ? 'Manage workspace access and roles.' : 'Manage your account and security.'}</p></div>
                    <button className="sidebar-collapse-btn" onClick={() => setSidebarCollapsed((collapsed) => !collapsed)} title="Toggle sidebar" aria-label="Toggle sidebar">{sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}</button>
                </div>

                {error && <div className="alert alert-error"><AlertCircle size={15} />{error}<button className="alert-dismiss" onClick={() => setError('')} aria-label="Dismiss error"><X size={15} /></button></div>}

                {activeTab === 'dashboard' && (
                    <DashboardOverview stats={dashboardStats} loading={statsLoading || tasksLoading} isAdmin={user?.role === 'admin'} tasks={tasks} onViewTasks={() => selectTab('tasks')} onRetry={() => { fetchTasks(); fetchStats(); }} />
                )}
                {activeTab === 'tasks' && (
                    <TaskWorkspace tasks={tasks} loading={tasksLoading} newTitle={newTitle} newDesc={newDesc} isCreating={isCreating} onTitleChange={setNewTitle} onDescChange={setNewDesc} onCreate={handleCreate} onUpdate={handleUpdate} onDelete={handleDelete} />
                )}
                {activeTab === 'team' && <TeamMembers currentUser={user} />}
                {activeTab === 'settings' && <SettingsPage currentUser={user} onUserUpdated={updateUser} />}
            </main>
        </div>
    );
};

const DashboardOverview = ({ stats, loading, isAdmin, tasks, onViewTasks, onRetry }) => {
    const cards = isAdmin
        ? [
            { label: 'Total members', value: stats.totalUsers, icon: Users, tone: 'blue' },
            { label: 'Administrators', value: stats.totalAdmins, icon: Shield, tone: 'violet' },
            { label: 'Total tasks', value: stats.totalTasks, icon: ListTodo, tone: 'amber' },
            { label: 'Completed tasks', value: stats.completedTasks, icon: CheckCircle2, tone: 'green' },
        ]
        : [
            { label: 'Your tasks', value: stats.totalTasks, icon: ListTodo, tone: 'blue' },
            { label: 'Completed', value: stats.completedTasks, icon: CheckCircle2, tone: 'green' },
            { label: 'In progress', value: stats.pendingTasks, icon: Clock, tone: 'amber' },
        ];

    return (
        <section className="overview-page">
            <div className={`overview-stats ${isAdmin ? 'four-columns' : ''}`}>
                {cards.map((card) => <Card key={card.label} noHover className="overview-stat"><div className={`overview-stat-icon ${card.tone}`}><card.icon size={18} /></div><div><div className="overview-stat-label">{card.label}</div><div className="overview-stat-value">{loading ? <span className="skeleton-number" /> : card.value}</div></div></Card>)}
            </div>
            <div className="overview-grid">
                <Card noHover className="overview-panel">
                    <div className="panel-heading"><div><h2>Task completion</h2><p>Current workspace progress</p></div><BarChart3 size={20} /></div>
                    {loading ? <div className="overview-loading"><span className="skeleton-line wide" /><span className="skeleton-line" /></div> : <div className="completion-visual"><div className="completion-ring" style={{ '--completion': `${stats.totalTasks ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%` }}><strong>{stats.totalTasks ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%</strong><span>complete</span></div><div className="completion-legend"><div><span className="legend-dot green" />Completed<strong>{stats.completedTasks}</strong></div><div><span className="legend-dot amber" />Open<strong>{stats.pendingTasks}</strong></div></div></div>}
                </Card>
                <Card noHover className="overview-panel">
                    <div className="panel-heading"><div><h2>Recent tasks</h2><p>{tasks.length ? 'Your latest workspace activity' : 'No activity yet'}</p></div><button className="panel-link" onClick={onViewTasks}>View all <ChevronRight size={14} /></button></div>
                    {tasks.length ? <div className="recent-task-list">{tasks.slice(0, 4).map((task) => <div className="recent-task" key={task.id}><div className={`recent-task-status ${task.status === 'completed' ? 'complete' : ''}`} /> <div className="min-w-0"><strong className="truncate">{task.title}</strong><span>{task.status === 'completed' ? 'Completed' : 'In progress'}</span></div></div>)}</div> : <div className="honest-empty"><ListTodo size={22} /><span>Create a task to see activity here.</span></div>}
                </Card>
            </div>
            {isAdmin && <div className="overview-note"><Shield size={16} /><span>Administrator view includes organization-wide metrics. User dashboards only show their own task data.</span></div>}
            {!loading && !stats && <Button variant="secondary" icon={RefreshCw} onClick={onRetry}>Retry metrics</Button>}
        </section>
    );
};

const TaskWorkspace = ({ tasks, loading, newTitle, newDesc, isCreating, onTitleChange, onDescChange, onCreate, onUpdate, onDelete }) => (
    <div className="task-workspace">
        <div className="task-create-card card nohover">
            <div className="panel-heading"><div><h2>Create a task</h2><p>Capture the next piece of work for your workspace.</p></div><Plus size={20} /></div>
            <form onSubmit={onCreate}><div className="form-group"><label className="form-label" htmlFor="task-title">Task title</label><input id="task-title" className="form-input" placeholder="e.g. Review access policy" value={newTitle} onChange={(event) => onTitleChange(event.target.value)} required /></div><div className="form-group"><label className="form-label" htmlFor="task-description">Description</label><textarea id="task-description" className="form-textarea" placeholder="Add useful context..." value={newDesc} onChange={(event) => onDescChange(event.target.value)} /></div><Button type="submit" disabled={isCreating || !newTitle.trim()} icon={Plus}>{isCreating ? 'Creating...' : 'Create task'}</Button></form>
        </div>
        <div className="task-list-panel"><div className="panel-heading"><div><h2>Tasks</h2><p>{tasks.length} task{tasks.length !== 1 ? 's' : ''} in view</p></div><Badge variant="blue">{tasks.filter((task) => task.status === 'completed').length} complete</Badge></div>{loading ? <div className="spinner"><div className="spinner-circle" /><span className="spinner-text">Loading tasks...</span></div> : tasks.length === 0 ? <div className="honest-empty large"><ListTodo size={28} /><strong>No tasks yet</strong><span>Create your first task to get started.</span></div> : <div className="task-list">{tasks.map((task) => <TaskItem key={task.id} task={task} onUpdate={onUpdate} onDelete={onDelete} />)}</div>}</div>
    </div>
);

export default Dashboard;
