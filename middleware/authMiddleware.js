const jwt = require('jsonwebtoken');

// Usa la clave secreta desde el entorno
const SECRET_KEY = process.env.JWT_SECRET;

if (!SECRET_KEY) {
    throw new Error("JWT_SECRET no está definido en el entorno");
}

// Middleware de autenticación
const authenticate = (req, res, next) => {
    const authHeader = req.header('Authorization');
    console.log('Encabezado Authorization:', authHeader);

    const token = authHeader?.split(' ')[1];
    if (!token) {
        console.log('Token no proporcionado');
        return res.status(401).json({ error: 'Token no proporcionado' });
    }

    try {
        console.log('Token recibido:', token);
        const decoded = jwt.verify(token, SECRET_KEY);
        console.log('Token decodificado:', decoded);
        req.user = decoded;
        next();
    } catch (err) {
        console.log('Error al verificar el token:', err.message);
        return res.status(401).json({ error: 'Token inválido' });
    }
};

module.exports = { authenticate };
