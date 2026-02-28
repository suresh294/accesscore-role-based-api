import { useState } from 'react';
import { Trash2, Edit2, Check, X, Loader2, Zap, CheckCircle } from 'lucide-react';

const TaskItem = ({ task, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [editDesc, setEditDesc] = useState(task.description || '');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);

    const handleSave = async () => {
        if (!editTitle.trim()) return;
        setIsUpdating(true);
        const success = await onUpdate(task.id, { title: editTitle, description: editDesc });
        if (success) setIsEditing(false);
        setIsUpdating(false);
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        setIsDeleting(true);
        await onDelete(task.id);
        setIsDeleting(false);
    };

    const handleComplete = async () => {
        setIsCompleting(true);
        await onUpdate(task.id, { status: 'completed' });
        setIsCompleting(false);
    };

    const statusMap = {
        completed: { label: 'Completed', cls: 'badge-completed' },
        ongoing: { label: 'Ongoing', cls: 'badge-ongoing' },
        pending: { label: 'Pending', cls: 'badge-pending' },
    };

    const statusInfo = statusMap[task.status] || statusMap.ongoing;

    return (
        <div className="task-item fade-in">
            {isEditing ? (
                <div className="task-edit-form">
                    <input
                        type="text"
                        className="task-edit-input"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Task Title"
                    />
                    <textarea
                        className="task-edit-textarea"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="Task description (optional)"
                    />
                    <div className="task-edit-actions">
                        <button
                            onClick={handleSave}
                            disabled={isUpdating}
                            className="btn btn-primary btn-sm"
                            style={{ flex: 1 }}
                        >
                            {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            Save
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="btn btn-secondary btn-sm"
                        >
                            <X size={14} />
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="task-item-header">
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="task-title">{task.title}</div>
                        </div>
                        <div className="task-actions">
                            {task.status !== 'completed' && (
                                <button
                                    className="task-action-btn complete"
                                    onClick={handleComplete}
                                    disabled={isCompleting}
                                    title="Mark as completed"
                                >
                                    {isCompleting ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                                </button>
                            )}
                            <button
                                className="task-action-btn edit"
                                onClick={() => setIsEditing(true)}
                                title="Edit task"
                            >
                                <Edit2 size={15} />
                            </button>
                            <button
                                className="task-action-btn delete"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                title="Delete task"
                            >
                                {isDeleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                            </button>
                        </div>
                    </div>
                    {task.description && (
                        <p className="task-desc">{task.description}</p>
                    )}
                    <div className="task-meta">
                        <span className={`task-status-badge ${statusInfo.cls}`}>{statusInfo.label}</span>
                        <span className="task-date">
                            {new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        {task.user_name && (
                            <span className="task-date">{task.user_name}</span>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default TaskItem;
