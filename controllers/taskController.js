const db = require('../db');

function formatLocalDateTime(date) {
    const d = new Date(date);
    const pad = n => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

exports.createTask = (req, res) => {
    const { userId } = req.user;
    const { title, description, status, categoryName, start_date, due_date } = req.body;
    const imageFile = req.file;

    console.log('📩 Body recibido:', req.body);
    console.log('📷 Archivo recibido (req.file):', req.file);

    const taskStatus = status || 'pending';

    let imageUrl = null;
    if (imageFile) {
        imageUrl = imageFile.path;
        console.log('🖼️ URL de imagen asignada:', imageUrl);
    }

    console.log('🔍 Buscando categoría:', categoryName);

    db.query(
        'SELECT id FROM categories WHERE user_id = ? AND name = ?',
        [userId, categoryName],
        (err, results) => {
            if (err) {
                console.error('❌ Error al buscar categoría:', err);
                return res.status(500).send('Error al buscar categoría');
            }

            let categoryId;
            if (results.length > 0) {
                categoryId = results[0].id;
                insertTask();
            } else {
                console.log('📁 Categoría no encontrada, creando nueva...');
                db.query(
                    'INSERT INTO categories (user_id, name) VALUES (?, ?)',
                    [userId, categoryName],
                    (err, result) => {
                        if (err) {
                            console.error('❌ Error al crear categoría:', err);
                            return res.status(500).send('Error al crear categoría');
                        }
                        categoryId = result.insertId;
                        insertTask();
                    }
                );
            }

            function insertTask() {
                const formattedStartDate = formatLocalDateTime(start_date);
                // Elimina tu formateador personalizado
                const formattedDueDate = due_date ? new Date(due_date).toISOString().slice(0, 19).replace('T', ' ') : null;


                console.log('⏰ start_date:', start_date, '➡️', formattedStartDate);
                console.log('⏰ due_date:', due_date, '➡️', formattedDueDate);

                db.query(
                    `INSERT INTO tasks 
                    (user_id, title, description, status, start_date, due_date, category_id, image_url) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [userId, title, description, taskStatus, formattedStartDate, formattedDueDate, categoryId, imageUrl],
                    (err, result) => {
                        if (err) {
                            console.error('❌ Error al crear tarea:', err);
                            return res.status(500).send('Error al crear tarea');
                        }

                        console.log('✅ Tarea insertada, buscando para retornar...');
                        db.query(
                            `SELECT tasks.*, categories.name AS categoryName
                             FROM tasks
                             LEFT JOIN categories ON tasks.category_id = categories.id
                             WHERE tasks.id = ?`,
                            [result.insertId],
                            (err, taskResults) => {
                                if (err) {
                                    console.error('❌ Error al obtener la tarea creada:', err);
                                    return res.status(500).send('Error al obtener la tarea creada');
                                }

                                console.log('📦 Tarea final:', taskResults[0]);
                                res.status(201).json(taskResults[0]);
                            }
                        );
                    }
                );
            }
        }
    );
};


exports.getTasks = (req, res) => {
    const { userId } = req.user;

    db.query(
        `SELECT tasks.*, categories.name AS categoryName
         FROM tasks
                  LEFT JOIN categories ON tasks.category_id = categories.id
         WHERE tasks.user_id = ?`,
        [userId],
        (err, results) => {
            if (err) {
                console.error('Error al obtener tareas:', err);
                return res.status(500).send('Error al obtener tareas');
            }
            res.json(results);
        }
    );
};

exports.updateTaskStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    db.query(
        'UPDATE tasks SET status = ? WHERE id = ?',
        [status, id],
        (err, result) => {
            if (err) {
                console.error('Error al actualizar el estado de la tarea:', err);
                return res.status(500).send('Error al actualizar la tarea');
            }
            res.send({ message: 'Tarea actualizada correctamente' });
        }
    );
};

exports.updateTask = (req, res) => {
    const taskId = req.params.id;
    const { title, description } = req.body;

    db.query(
        'UPDATE tasks SET title = ?, description = ? WHERE id = ?',
        [title, description, taskId],
        (err, result) => {
            if (err) {
                console.error('Error al actualizar la tarea:', err);
                return res.status(500).json({ message: 'Error al actualizar la tarea' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Tarea no encontrada' });
            }

            res.json({ message: 'Tarea actualizada correctamente' });
        }
    );
};

// DELETE /tasks/:id
exports.deleteTask = (req, res) => {
    const taskId = req.params.id;

    const { userId } = req.user;
    db.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId], (err, result) => {
        if (err) {
            console.error('Error al eliminar la tarea:', err);
            return res.status(500).json({ message: 'Error interno al eliminar la tarea' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: `Tarea con ID ${taskId} no encontrada o no autorizada` });
        }

        res.json({ message: `Tarea con ID ${taskId} eliminada correctamente` });
    });
};

exports.updateTaskCategory = (req, res) => {
    const taskId = req.params.id;
    const { category } = req.body;
    const { userId } = req.user;

    if (!category) {
        return res.status(400).json({ message: 'Nombre de la categoría requerido' });
    }

    // Buscar o crear la categoría
    db.query(
        'SELECT id FROM categories WHERE user_id = ? AND name = ?',
        [userId, category],
        (err, results) => {
            if (err) {
                console.error('Error al buscar categoría:', err);
                return res.status(500).json({ message: 'Error interno' });
            }

            const proceedWithUpdate = (categoryId) => {
                db.query(
                    'UPDATE tasks SET category_id = ? WHERE id = ?',
                    [categoryId, taskId],
                    (err, result) => {
                        if (err) {
                            console.error('Error al actualizar categoría de la tarea:', err);
                            return res.status(500).json({ message: 'Error al actualizar la tarea' });
                        }

                        res.json({ message: 'Categoría de la tarea actualizada correctamente' });
                    }
                );
            };

            if (results.length > 0) {
                proceedWithUpdate(results[0].id);
            } else {
                // Crear la categoría si no existe
                db.query(
                    'INSERT INTO categories (user_id, name) VALUES (?, ?)',
                    [userId, category],
                    (err, result) => {
                        if (err) {
                            console.error('Error al crear nueva categoría:', err);
                            return res.status(500).json({ message: 'Error interno al crear la categoría' });
                        }
                        proceedWithUpdate(result.insertId);
                    }
                );
            }
        }
    );
};
