const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const SECRET_KEY = process.env.JWT_SECRET;

if (!SECRET_KEY) {
    throw new Error("JWT_SECRET no está definido en el entorno");
}

exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
    }

    try {
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                console.error('Error al verificar el usuario:', err);
                return res.status(500).json({ error: 'Error al verificar el usuario' });
            }

            if (results.length > 0) {
                return res.status(409).json({ error: 'El correo ya está registrado' }); // 409 Conflict
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            db.query(
                'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                [name, email, hashedPassword],
                (err) => {
                    if (err) {
                        console.error('Error al registrar usuario:', err);
                        return res.status(500).json({ error: 'Error al registrar usuario' });
                    }
                    res.status(201).json({ message: 'Usuario registrado con éxito' });
                }
            );
        });
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    try {
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err || results.length === 0) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            const user = results[0];
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
            res.json({ token, userId: user.id });

        });
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }

};

exports.updateProfile = async (req, res) => {
    const userId = req.user.userId;  // ⚠️ el campo viene de tu JWT y authMiddleware
    const { name, email, password } = req.body;

    if (!name && !email && !password) {
        return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
    }

    const updateFields = [];
    const values = [];

    if (name) {
        updateFields.push('name = ?');
        values.push(name);
    }

    if (email) {
        updateFields.push('email = ?');
        values.push(email);
    }

    if (password && password.trim().length > 0) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateFields.push('password = ?');
        values.push(hashedPassword);
    }

    values.push(userId); // Para la cláusula WHERE

    const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('❌ Error al actualizar el perfil:', err);
            return res.status(500).json({ error: 'Error al actualizar el perfil' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ name, email });
    });
};

