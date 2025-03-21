const cron = require('node-cron');
const db = require('./db');
const sendEmail = require('./mailer');

const checkMedicamentos = async () => {
  const sql = `
    SELECT m.nombre, m.fechaFin, u.correoElec
    FROM medicamentos m
    JOIN recetas r ON m.idReceta = r.idReceta
    JOIN usuario u ON r.idUsuario = u.idUsuario
    WHERE m.fechaFin >= CURDATE();
  `;

  db.query(sql, async (err, results) => {
    if (err) {
      console.error('Error al verificar medicamentos:', err);
      return;
    }

    for (const medicamento of results) {
      const { nombre, fechaFin, correoElec } = medicamento;
      const subject = `Recordatorio: ${nombre}`;
      const text = `El medicamento ${nombre} ha pasado su fecha de consumo (${fechaFin}). Por favor, verifica si necesitas continuar con el tratamiento.`;

      // Enviar correo electrónico
      sendEmail(correoElec, subject, text);
    }
  });
};

// Programar la tarea para ejecutarse todos los días a las 8:00 AM
cron.schedule('30 17 * * *', () => {
  console.log('Verificando medicamentos...');
  checkMedicamentos();
});

module.exports = checkMedicamentos;