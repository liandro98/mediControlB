const db = require('../config/db');

exports.obtenerMedicamentos = (req, res) => {
    const idUsuario = req.user.idUsuario;

    const sql = `
             SELECT m.nombre, m.dosis, m.cada, m.fechaInicio, m.fechaFin
            FROM medicamentos m
            JOIN recetas r ON m.idReceta = r.idReceta
            WHERE r.idUsuario = ?
    `;

    db.query(sql, [idUsuario], (err, results) => {
        if(err){
            console.error('Error al obtener medicamentos: ', err);
            return res.status(500).json({error: 'Error al obtener medicamentos'});
        }
        res.json(results);
    })
}


// Obtener estadísticas de medicamentos
exports.obtenerEstadisticas = (req, res) => {
    const idUsuario = req.user.idUsuario;

    // Consulta 1: Total de medicamentos recetados
    const sqlTotalMedicamentos = `
        SELECT COUNT(*) AS totalMedicamentos
        FROM medicamentos m
        JOIN recetas r ON m.idReceta = r.idReceta
        WHERE r.idUsuario = ?;
    `;

    // Consulta 2: Estadísticas por medicamento
    const sqlEstadisticasPorMedicamento = `
        SELECT 
            nombre, 
            COUNT(nombre) AS vecesRecetado,
            AVG(DATEDIFF(fechaFin, fechaInicio)) AS duracionPromedio
        FROM medicamentos m
        JOIN recetas r ON m.idReceta = r.idReceta
        WHERE r.idUsuario = ?
        GROUP BY nombre
        ORDER BY vecesRecetado DESC;
    `;

    // Consulta 3: Medicamentos próximos a expirar
    const sqlProximosExpirar = `
        SELECT nombre, fechaFin
        FROM medicamentos m
        JOIN recetas r ON m.idReceta = r.idReceta
        WHERE r.idUsuario = ? AND fechaFin >= CURDATE()
        ORDER BY fechaFin ASC
        LIMIT 5;
    `;

    // Ejecutar todas las consultas
    Promise.all([
        db.promise().query(sqlTotalMedicamentos, [idUsuario]),
        db.promise().query(sqlEstadisticasPorMedicamento, [idUsuario]),
        db.promise().query(sqlProximosExpirar, [idUsuario])
    ])
    .then(([totalResult, estadisticasResult, proximosExpirarResult]) => {
        const totalMedicamentos = totalResult[0][0].totalMedicamentos;
        const medicamentosRecetados = estadisticasResult[0];
        const proximosExpirar = proximosExpirarResult[0];

        res.json({
            totalMedicamentos,
            medicamentosRecetados,
            proximosExpirar
        });
    })
    .catch((err) => {
        console.error('Error al obtener estadísticas:', err);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    });
};