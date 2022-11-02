const express = require('express');
const app = require('../../app');
const router = express.Router();
const authJwt = require('../middleware/authjwt');

const mysqlConnecction = require('../connection/connection');

const jwt = require('jsonwebtoken');
require('dotenv').config();


router.get('/',
    [authJwt.verifyToken,
    authJwt.invalidTokenCheck,
    authJwt.isEmployee], (req, res) => {
        mysqlConnecction.query('call spObtenerSocios();',
            (err, rows, fields) => {
                if (!err) {
                    res.status(200).json({ "ok": true, "resultado": rows[0] });
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
                    } else if (status == 0) {
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

router.get('/:id',
    [authJwt.verifyToken,
    authJwt.invalidTokenCheck],
    (req, res) => {
        if (req.data.rol === 'Admin' || req.data.rol === 'Empleado' || req.params['id'] == req.data.idSocio) {
            mysqlConnecction.query('call spObtenerSocioById(?);', req.params['id'],
                (err, rows, fields) => {
                    if (!err) {
                        res.status(200).json({ "ok": true, "resultado": rows[0] });
                        console.log(rows[0]);
                    } else {
                        res.status(500).json({ "ok": false, "mensaje": "Error al listar socios" })
                        console.log(err);
                    }
                })
        } else {
            res.status(403).json({ "ok": false, "mensaje": "Usted no tiene los permisos requeridos para acceder a este recurso." });
        }
    });

//para 
router.put('/',
    [
        authJwt.verifyToken,
        authJwt.invalidTokenCheck
    ],    
    (req, res) => {
        //Si se quiere que admin y empleado puedan modificar DNI hay que crear otra ruta con otro sp
        if (req.data.rol === 'Admin' || req.data.rol === 'Empleado' || req.params['id'] == req.data.idSocio) {
        const { id, nombre, apellido, domicilio, email, telefono } = req.body;
        mysqlConnecction.query('call spModificarSocio(?,?,?,?,?,?)', [ nombre, apellido, domicilio, email, telefono, id],
        (err, rows, fields) => {
            if (!err) {
                res.status(200).json({
                    "ok": true,
                    "mensaje": "Socio actualizado con éxito"
                });
            } else {
                console.log(err);
                res.status(500).json({
                    "ok": false,
                    "mensaje": "Error al actualizar socio"
                });
            }
        });
        } else {
            res.status(403).json({ "ok": false, "mensaje": "Usted no tiene los permisos requeridos para acceder a este recurso." });
        }
    });


    router.post('/nuevos', [authJwt.verifyToken,authJwt.invalidTokenCheck,authJwt.isEmployee],(req, res) => {
        const { fechaDesde, fechaHasta } = req.body;
        mysqlConnecction.query('call spObtenerCantSociosNuevos(?, ?)', [ fechaDesde, fechaHasta],
            (err, rows, fields) => {
                if (!err) {
                    res.status(201).json({
                        "ok": true,
                        "resultado": rows[0],
                        "mensaje": "Reporte socio cantidad de socios nuevos generado con éxito"
                    });
                } else {
                    console.log(err);
                    res.status(500).json({
                        "ok": false,
                        "mensaje": "Error al generar reporte socio"
                    });
                }
            });
    
    });


    router.post('/bajas', [authJwt.verifyToken,authJwt.invalidTokenCheck,authJwt.isEmployee],(req, res) => {
        const { fechaDesde, fechaHasta } = req.body;
        mysqlConnecction.query('call spObtenerCantSociosBaja(?, ?)', [ fechaDesde, fechaHasta],
            (err, rows, fields) => {
                if (!err) {
                    res.status(201).json({
                        "ok": true,
                        "resultado": rows[0],
                        "mensaje": "Reporte socio cantidad de bajas generado con éxito"
                    });
                } else {
                    console.log(err);
                    res.status(500).json({
                        "ok": false,
                        "mensaje": "Error al generar reporte socio"
                    });
                }
            });
    
    });

    router.post('/pedidos', [authJwt.verifyToken,authJwt.invalidTokenCheck,authJwt.isEmployee],(req, res) => {
        const { fechaDesde, fechaHasta } = req.body;
        mysqlConnecction.query('call spCantPedidosPeriodo(?, ?)', [ fechaDesde, fechaHasta],
            (err, rows, fields) => {
                if (!err) {
                    res.status(201).json({
                        "ok": true,
                        "resultado": rows[0],
                        "mensaje": "Reporte socio cantidad de pedidos generado con éxito"
                    });
                } else {
                    console.log(err);
                    res.status(500).json({
                        "ok": false,
                        "mensaje": "Error al generar reporte socio"
                    });
                }
            });
    
    });

module.exports = router