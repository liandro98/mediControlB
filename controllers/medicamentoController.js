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