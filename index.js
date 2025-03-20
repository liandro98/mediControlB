require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const authRoutes = require('./routes/authRoutes');
const recetaRoutes = require('./routes/recetaRoutes');
const medicamentoRoutes = require('./routes/medicamentoRoutes');
const checkMedicamentos = require('./config/cron')

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'https://medicontrol-7f8f6.web.app', // Permitir todos los orígenes
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://medicontrol-7f8f6.web.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
}
);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/receta', recetaRoutes);
app.use('/api/medicamento', medicamentoRoutes);

//Servicio de correo deteni
checkMedicamentos();


// Iniciar servidor
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));