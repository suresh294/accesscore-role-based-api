const db = require('../config/database');

const createTask = async (taskData) => {
    const { title, description, user_id } = taskData;
    const result = await db.query(
        'INSERT INTO tasks (title, description, user_id) VALUES ($1, $2, $3) RETURNING *',
        [title, description, user_id]
    );
    return result.rows[0];
};

const getTasks = async (userId, role) => {
    if (role === 'admin') {
        const result = await db.query('SELECT tasks.*, users.name as user_name FROM tasks JOIN users ON tasks.user_id = users.id ORDER BY tasks.created_at DESC');
        return result.rows;
    }
    const result = await db.query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return result.rows;
};

const getTaskById = async (id) => {
    const result = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    return result.rows[0];
};

const updateTask = async (id, taskData) => {
    const allowedFields = ['title', 'description', 'status'];
    const setClauses = [];
    const values = [];
    let idx = 1;

    for (const field of allowedFields) {
        if (taskData[field] !== undefined) {
            setClauses.push(`${field} = $${idx}`);
            values.push(taskData[field]);
            idx++;
        }
    }

    if (setClauses.length === 0) {
        // Nothing to update — return existing task
        return getTaskById(id);
    }

    setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await db.query(
        `UPDATE tasks SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
        values
    );
    return result.rows[0];
};


const deleteTask = async (id) => {
    await db.query('DELETE FROM tasks WHERE id = $1', [id]);
    return true;
};

module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
};
