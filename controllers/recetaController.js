
const db = require('../config/db');

exports.guardarReceta = (req, res) => {
    const { consultorio, doctor, fecha, diagnostico, telefono, direccion, medicamentos } = req.body;
    const idUsuario = req.user.idUsuario;

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
};