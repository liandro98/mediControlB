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
  origin: [
    'https://medicontrol-7f8f6.web.app', // Tu app web
    'capacitor://localhost',  // Para la app en Android
    'http://localhost',       // Para pruebas en navegador
    'http://10.0.2.2:3000'    // Para emulador Android
  ], // Permitir todos los orígenes
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  credentials: true
}));
app.use((req, res, next) => {
  console.log("Request recibido desde:", req.headers.origin);  // 🛠️ Ver origen real
  next();

  const allowedOrigins = [
    'https://medicontrol-7f8f6.web.app',
    'capacitor://localhost',
    'http://localhost',
    'http://10.0.2.2:3000'
  ];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
}
);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/receta', recetaRoutes);
app.use('/api/medicamento', medicamentoRoutes);

//Servicio de correo deteni
//checkMedicamentos();


// Iniciar servidor
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));