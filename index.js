// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const authRoutes = require('./routes/authRoutes');
const recetaRoutes = require('./routes/recetaRoutes');
const medicamentoRoutes = require('./routes/medicamentoRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(
    session({
      secret: '12345', // Cambia esto por una cadena secreta segura
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false }, // Cambia a true si usas HTTPS
    })
);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/receta', recetaRoutes);
app.use('/api/medicamento', medicamentoRoutes);


// Iniciar servidor
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));