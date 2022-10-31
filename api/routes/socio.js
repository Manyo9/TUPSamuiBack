const express = require('express');
const app = require('../../app');
const router = express.Router();
const authJwt = require('../middleware/authjwt');

const mysqlConnecction = require('../connection/connection');

const jwt = require('jsonwebtoken');
require('dotenv').config();


router.get('/', [authJwt.verifyToken, authJwt.invalidTokenCheck, authJwt.isEmployee], (req, res) => {
    mysqlConnecction.query('call spObtenerSocios();',
        (err, rows, fields) => {
            if (!err) {
                res.status(200).json({ "ok": true, "resultado": rows[0]});
                console.log(rows[0]);
            } else {
                res.status(500).json({ "ok": false, "mensaje": "Error al listar socios" })
                console.log(err);
            }
        })
});

router.post('/', (req, res) => {
    const { idUsuario, nombre, apellido, domicilio, email, dni, telefono } = req.body;
    mysqlConnecction.query('call spRegistrarSocio(?,?,?,?,?,?,?)', [idUsuario, nombre, apellido, domicilio, email, dni, telefono],
        (err, rows, fields) => {
            if (!err) {
                res.status(201).json({
                    "ok": true,
                    "mensaje": "Socio registrado con éxito"
                });
            } else {
                console.log(err);
                res.status(500).json({
                    "ok": false,
                    "mensaje": "Error al registrar socio"
                });
            }
        });

});

router.delete('/:id', 
    [authJwt.verifyToken,
     authJwt.invalidTokenCheck,
     authJwt.checkIdSocio],
    (req, res) => {    
    mysqlConnecction.query('call spDarDeBajaSocio(?,@status); select @status as status;', [req.params['id']],
        (err, rows, fields) => {
            if (!err) {
                const status = rows[1][0].status;
                if (status == 1) {
                    res.status(200).json({
                        "ok": true,
                        "mensaje": "Socio dado de baja con éxito"
                    });
                } else if (status == 0){
                    res.status(404).json({
                        "ok": false,
                        "mensaje": `No se encontró al socio con id ${req.params['id']}`
                    });
                }

            } else {
                console.log(err);
                res.status(500).json({
                    "ok": false,
                    "mensaje": "Error al dar de baja socio"
                });
            }
        })
});

module.exports = router