require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY;

// Middleware
app.use(express.json());
app.use(cors());

// Conexión a MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error('Error conectando a MySQL:', err);
    } else {
        console.log('MySQL conectado');
    }
});

// Registro de usuario
app.post('/register', async (req, res) => {
    try {
        const { usuario, clave, nombreCompleto, correoElec } = req.body;
        const hashedPassword = await bcrypt.hash(clave, 10);

        const sql = "INSERT INTO usuario (usuario, clave, nombreCompleto, correoElec) VALUES (?, ?, ?, ?)";
        db.query(sql, [usuario, hashedPassword, nombreCompleto, correoElec], (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Error en el registro' });
            }
            res.status(201).json({ message: 'Usuario registrado con éxito' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Error en el registro' });
    }
});

// Login de usuario
app.post('/login', (req, res) => {
    const { usuario, clave } = req.body;
    const sql = "SELECT * FROM usuario WHERE usuario = ?";
    
    db.query(sql, [usuario], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(400).json({ error: 'Usuario no encontrado' });
        }
        
        const user = results[0];
        const isMatch = await bcrypt.compare(clave, user.clave);
        if (!isMatch) {
            return res.status(400).json({ error: 'Contraseña incorrecta' });
        }

        const token = jwt.sign({ idUsuario: user.idUsuario }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token, user: { idUsuario: user.idUsuario, usuario: user.usuario, nombreCompleto: user.nombreCompleto, correoElec: user.correoElec } });
    });
});

// Middleware de autenticación
const authMiddleware = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ error: 'Acceso denegado' });

    try {
        const verified = jwt.verify(token, SECRET_KEY);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Token no válido' });
    }
};

// Gurardar recetas y medicamentos

app.post('/api/recetas', authMiddleware, (req, res) => {
    const { consultorio, doctor, fecha, diagnostico, telefono, direccion, medicamentos } = req.body;
    const idUsuario = req.user.idUsuario; // Obtener el ID del usuario autenticado

    // Insertar la receta
    const sqlReceta = `
        INSERT INTO recetas (consultorio, doctor, fecha, diagnostico, telefono, direccion, idUsuario)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sqlReceta, [consultorio, doctor, fecha, diagnostico, telefono, direccion, idUsuario], (err, result) => {
        if (err) {
            console.error('Error al insertar receta:', err);
            return res.status(500).json({ error: 'Error al guardar la receta' });
        }

        const idReceta = result.insertId;

        // Insertar los medicamentos
        const sqlMedicamento = `
            INSERT INTO medicamentos (nombre, dosis, cada, fechaInicio, fechaFin, idReceta)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        medicamentos.forEach(medicamento => {
            db.query(sqlMedicamento, [
                medicamento.nombre,
                medicamento.dosis,
                medicamento.cada,
                medicamento.fechaInicio,
                medicamento.fechaFin,
                idReceta
            ], (err, result) => {
                if (err) {
                    console.error('Error al insertar medicamento:', err);
                    return res.status(500).json({ error: 'Error al guardar los medicamentos' });
                }
            });
        });

        res.status(201).json({ message: 'Receta y medicamentos guardados con éxito', idReceta });
    });
});

// Ruta protegida de prueba
app.get('/protected', authMiddleware, (req, res) => {
    res.json({ message: 'Acceso permitido', user: req.user });
});

// Iniciar servidor
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
