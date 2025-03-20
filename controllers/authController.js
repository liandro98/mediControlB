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
        // Verificar si el usuario ya existe
        const [user] = await db.promise().query('SELECT * FROM usuario WHERE googleId = ?', [uid]);

        let idUsuario;
        if (user.length === 0) {
            // Si el usuario no existe, crearlo
            const [result] = await db.promise().query(
                'INSERT INTO usuario (googleId, correoElec, nombreCompleto, usuario) VALUES (?, ?, ?, ?)',
                [uid, email, nombre, email]
            );
            idUsuario = result.insertId; // Obtener el ID del nuevo usuario
        } else {
            // Si el usuario ya existe, usar su ID
            idUsuario = user[0].idUsuario;
        }

        // Generar un token JWT
        const token = jwt.sign(
            { idUsuario, nombreCompleto: nombre }, 
            SECRET_KEY, // Clave secreta
            { expiresIn: '1h' } // Tiempo de expiración
        );

        // Devolver el token y la información del usuario
        res.status(200).json({
            message: 'Autenticación exitosa',
            token,
            user: {
                idUsuario,
                usuario: email,
                nombreCompleto: nombre,
                correoElec: email
            }
        });
    } catch (error) {
        console.error('Error en la autenticación con Google:', error);
        res.status(500).json({ error: 'Error en la autenticación' });
    }
};

exports.premium = async (req, res) => {
    const { idUsuario } = req.user; // Obtener el ID del usuario autenticado
  
    try {
      // Actualizar el estado de la suscripción premium
      const sql = "UPDATE usuario SET esPremium = 1 WHERE idUsuario = ?";
      db.query(sql, [idUsuario], (err, result) => {
        if (err) {
          console.error('Error al actualizar la suscripción premium:', err);
          return res.status(500).json({ error: 'Error al actualizar la suscripción premium' });
        }
        res.status(200).json({ message: 'Suscripción premium activada con éxito' });
      });
    } catch (error) {
      console.error('Error en la activación de la suscripción premium:', error);
      res.status(500).json({ error: 'Error en la activación de la suscripción premium' });
    }
  }

exports.obtenerPremium = async (req, res) => {
    const idUsuario = req.user.idUsuario; // Obtener el ID del usuario autenticado

  try {
    // Consultar el estado de la suscripción premium
    const sql = "SELECT esPremium FROM usuario WHERE idUsuario = ?";
    db.query(sql, [idUsuario], (err, results) => {
      if (err) {
        console.error('Error al obtener el estado premium:', err);
        return res.status(500).json({ error: 'Error al obtener el estado premium' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const esPremium = results[0].esPremium === 1; // Convertir a booleano
      res.json(esPremium); // Devolver el estado de la suscripción premium
    });
  } catch (error) {
    console.error('Error en la consulta del estado premium:', error);
    res.status(500).json({ error: 'Error en la consulta del estado premium' });
  }
}