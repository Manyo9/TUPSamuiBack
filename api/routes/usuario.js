const express = require('express');
const app = require('../../app');
const router = express.Router();
const authJwt = require('../middleware/authjwt');

const mysqlConnecction = require('../connection/connection');

const jwt = require('jsonwebtoken');

router.get('/', 
    [authJwt.verifyToken,
    authJwt.invalidTokenCheck,
    authJwt.isAdmin] , (req, res) => {

    mysqlConnecction.query('select u.id, r.nombre as rol,' +
        ' u.usuario, u.fechaAlta, u.fechaBaja FROM usuarios u' +
        ' join roles r on r.id = u.idRol;',
        (err, rows, fields) => {
            if (!err) {
                res.status(200).json({ "ok": true, "resultado": rows });
            } else {
                res.status(500).json({ "ok": false, "mensaje": "Error al listar usuarios" })
                console.log(err);
            }
        })
});

router.get('/:id',
    [authJwt.verifyToken,
    authJwt.invalidTokenCheck,
    authJwt.checkIdUsuario], (req, res) => {

    mysqlConnecction.query('select u.id, r.nombre as rol,' +
        ' u.usuario, u.fechaAlta, u.fechaBaja FROM usuarios u' +
        ' join roles r on r.id = u.idRol where u.id = ?;', [req.params['id']],
        (err, rows, fields) => {
            if (!err) {
                if (rows.length > 0) {
                    res.status(200).json({ "ok": true, "resultado": rows });
                } else {
                    res.status(404).json({ "ok": false, "resultado": [] });
                }
            } else {
                console.log(err);
            }
    })
});

router.post('/iniciarSesion', (req, res) => {
    const { usuario, contrasenia } = req.body;
    mysqlConnecction.query('call spIniciarSesion(?,?)',
        [usuario, contrasenia],
        (err, rows, fields) => {
            rows = rows[0];
            if (!err) {
                if (rows.length > 0) {
                    let data = JSON.stringify(rows[0]);
                    const token = jwt.sign(data, process.env.SECRET_KEY);
                    res.status(200).json({
                        "ok": true,
                        "resultado": [token]
                    });
                } else {
                    res.status(200).json({
                        "ok": false,
                        "mensaje": "Usuario y/o contraseña incorrectos"
                    });
                }
            } else {
                console.log(err);
            }
        }
    );
})

router.post('/nuevoUsuarioSocio', (req, res) => {
    const { usuario, contrasenia, dni } = req.body;
    mysqlConnecction.query('call spNuevoUsuarioSocio(?, ?, ?)', [usuario, contrasenia, dni],
        (err, rows, fields) => {
            if (rows.affectedRows < 1) {
                res.status(400).json({
                    "ok": false,
                    "mensaje": "Ya existe un usuario para el socio con el dni especificado"
                });
                return;
            }
            if (!err) {
                res.status(201).json({
                    "ok": true,
                    "mensaje": "Usuario creado con éxito"
                });
            } else {
                console.log(err);
                res.status(500).json({
                    "ok": false,
                    "mensaje": "Error al crear usuario"
                });
            }
        });
});

router.post('/nuevoUsuarioAdmin',
    [authJwt.verifyToken,
    authJwt.invalidTokenCheck,
    authJwt.isAdmin], (req, res) => {

    const { usuario, contrasenia } = req.body;
    mysqlConnecction.query('call spNuevoUsuarioAdmin(?, ?)', [usuario, contrasenia],
        (err, rows, fields) => {
            if (!err) {
                res.status(201).json({
                    "ok": true,
                    "mensaje": "Usuario creado con éxito"
                });
            } else {
                console.log(err);
                res.status(500).json({
                    "ok": false,
                    "mensaje": "Error al crear usuario"
                });
            }
        });
});

router.post('/nuevoUsuarioEmpleado',
    [authJwt.verifyToken,
    authJwt.invalidTokenCheck,
    authJwt.isAdmin], (req, res) => {

    const { usuario, contrasenia } = req.body;
    mysqlConnecction.query('call spNuevoUsuarioEmpleado(?, ?)', [usuario, contrasenia],
        (err, rows, fields) => {
            if (!err) {
                res.status(201).json({
                    "ok": true,
                    "mensaje": "Usuario creado con éxito"
                });
            } else {
                console.log(err);
                res.status(500).json({
                    "ok": false,
                    "mensaje": "Error al crear usuario"
                });
            }
        });
});

router.delete('/:id',
    [authJwt.verifyToken,
    authJwt.invalidTokenCheck,
    authJwt.isAdmin], (req, res) => {

    mysqlConnecction.query('call spDarDeBajaUsuario(?,@status); select @status as status;', [req.params['id']],
        (err, rows, fields) => {
            if (!err) {
                const status = rows[1][0].status;
                if (status == 1) {
                    res.status(200).json({
                        "ok": true,
                        "mensaje": "Usuario dado de baja con éxito"
                    });
                } else if (status == 0) {
                    res.status(404).json({
                        "ok": false,
                        "mensaje": "Error al dar de baja usuario"
                    });
                }

            } else {
                console.log(err);
                res.status(500).json({
                    "ok": false,
                    "mensaje": "Error al dar de baja usuario"
                });
            }

        })
});
module.exports = router;