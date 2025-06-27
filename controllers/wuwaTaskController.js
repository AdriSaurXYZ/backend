const db = require('../db');

function formatLocalDateTime(date) {
    const d = new Date(date);
    const pad = n => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

exports.getTasks = (req, res) => {
    const { userId } = req.user;

    db.query(
        `SELECT wuwa_tasks.*, categories.name AS categoryName
         FROM wuwa_tasks
         LEFT JOIN categories ON wuwa_tasks.category_id = categories.id
         WHERE wuwa_tasks.user_id = ?`,
        [userId],
        (err, results) => {
            if (err) {
                console.error('Error al obtener tareas WUWA:', err);
                return res.status(500).send('Error al obtener tareas');
            }
            res.json(results);
        }
    );
};

exports.createTask = (req, res) => {
    const { userId } = req.user;
    const { title, description, status, categoryName, start_date, due_date } = req.body;
    const imageFile = req.file;

    const taskStatus = status || 'pending';
    let imageUrl = imageFile ? imageFile.path : null;

    db.query(
        'SELECT id FROM categories WHERE user_id = ? AND name = ?',
        [userId, categoryName],
        (err, results) => {
            if (err) return res.status(500).send('Error al buscar categoría');

            let categoryId;

            const insertTask = () => {
                const formattedStartDate = formatLocalDateTime(start_date);
                const formattedDueDate = due_date ? new Date(due_date).toISOString().slice(0, 19).replace('T', ' ') : null;

                db.query(
                    `INSERT INTO wuwa_tasks 
                     (user_id, title, description, status, start_date, due_date, category_id, image_url) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [userId, title, description, taskStatus, formattedStartDate, formattedDueDate, categoryId, imageUrl],
                    (err, result) => {
                        if (err) return res.status(500).send('Error al crear tarea');

                        db.query(
                            `SELECT wuwa_tasks.*, categories.name AS categoryName
                             FROM wuwa_tasks
                             LEFT JOIN categories ON wuwa_tasks.category_id = categories.id
                             WHERE wuwa_tasks.id = ?`,
                            [result.insertId],
                            (err, taskResults) => {
                                if (err) return res.status(500).send('Error al obtener la tarea creada');
                                res.status(201).json(taskResults[0]);
                            }
                        );
                    }
                );
            };

            if (results.length > 0) {
                categoryId = results[0].id;
                insertTask();
            } else {
                db.query(
                    'INSERT INTO categories (user_id, name) VALUES (?, ?)',
                    [userId, categoryName],
                    (err, result) => {
                        if (err) return res.status(500).send('Error al crear categoría');
                        categoryId = result.insertId;
                        insertTask();
                    }
                );
            }
        }
    );
};

exports.updateTask = (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;

    db.query(
        'UPDATE wuwa_tasks SET title = ?, description = ? WHERE id = ?',
        [title, description, id],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Error al actualizar la tarea' });
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Tarea no encontrada' });
            res.json({ message: 'Tarea actualizada correctamente' });
        }
    );
};

exports.updateTaskStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    db.query(
        'UPDATE wuwa_tasks SET status = ? WHERE id = ?',
        [status, id],
        (err, result) => {
            if (err) return res.status(500).send('Error al actualizar tarea');
            res.send({ message: 'Tarea actualizada correctamente' });
        }
    );
};

exports.deleteTask = (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    db.query('DELETE FROM wuwa_tasks WHERE id = ? AND user_id = ?', [id, userId], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error interno al eliminar la tarea' });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Tarea no encontrada o no autorizada' });
        res.json({ message: `Tarea eliminada correctamente` });
    });
};

exports.updateTaskCategory = (req, res) => {
    const taskId = req.params.id;
    const { category } = req.body;
    const { userId } = req.user;

    if (!category) return res.status(400).json({ message: 'Nombre de la categoría requerido' });

    db.query(
        'SELECT id FROM categories WHERE user_id = ? AND name = ?',
        [userId, category],
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Error interno' });

            const update = (categoryId) => {
                db.query(
                    'UPDATE wuwa_tasks SET category_id = ? WHERE id = ?',
                    [categoryId, taskId],
                    (err) => {
                        if (err) return res.status(500).json({ message: 'Error al actualizar la tarea' });
                        res.json({ message: 'Categoría de la tarea actualizada correctamente' });
                    }
                );
            };

            if (results.length > 0) {
                update(results[0].id);
            } else {
                db.query(
                    'INSERT INTO categories (user_id, name) VALUES (?, ?)',
                    [userId, category],
                    (err, result) => {
                        if (err) return res.status(500).json({ message: 'Error al crear categoría' });
                        update(result.insertId);
                    }
                );
            }
        }
    );
};
