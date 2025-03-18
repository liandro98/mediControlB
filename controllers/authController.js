const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const SECRET_KEY = process.env.SECRET_KEY;

exports.register = async (req, res) => {
    try {
        const {usuario, clave, nombreCompleto, correoElec} = req.body;
        const hashedPassword = await bcrypt.hash(clave, 10);

        const sql = "INSERT INTO usuario (usuario, clave, nombreCompleto, correoElec) VALUES (?, ?, ?, ?)";

        db.query(sql, [usuario, hashedPassword, nombreCompleto, correoElec], (err, result) => {
            if(err){
                return res.status(500).json({error:'Error en el registro'});
            }
            res.status(201).json({message : 'Usuario registrado con exito'});
        });
    } catch (error) {
        res.status(500).json({error : 'Error en el registro'}); 
    }
}

exports.login = (req, res) => {
    const {usuario, clave } = req.body;

    const sql = "SELECT * FROM usuario WHERE usuario = ?"

    db.query(sql, [usuario], async (err, results) => {
        if(err || results.length === 0) {
            return res.status(400).json({error: 'Usuario no encontrado'});
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(clave, user.clave);
        if(!isMatch){
            return res.status(400).json({error: 'Contraseña correcta'});
        }

        const token = jwt.sign({idUsuario: user.idUsuario, nombreCompleto : user.nombreCompleto}, SECRET_KEY, {expiresIn:'1h'});
        res.json({token, user : {idUsuario : user.idUsuario, usuario : user.usuario, nombreCompleto : user.nombreCompleto, correoElec : user.nombreCompleto}});
    });
}

exports.googleAuth = async (req, res) => {
    const { uid, email, nombre } = req.body;

    try {
        const [user] = await db.promise().query('SELECT * FROM usuario WHERE googleId = ?', [uid]);

        if(user.length === 0){
            await db.promise().query('INSERT INTO usuario (googleId, correoElec, nombreCompleto, usuario) VALUES (?,?,?,?)',
                [uid, email, nombre, email]);
        }

        req.session.user = {uid, email, nombre};
        res.status(200).json({message : 'Autenticacion exitosa', user : req.session.user });
    } catch (error) {
        console.error('Error en la autenticacion con Google: ', error);
        res.status(500).json({error : 'Error en la autenticacion'});
        
    }
}