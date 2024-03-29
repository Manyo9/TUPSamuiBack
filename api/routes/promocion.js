const express = require('express');
const app = require('../../app');
const router = express.Router();
const authJwt = require('../middleware/authjwt');

const mysqlConnecction = require('../connection/connection');

const jwt = require('jsonwebtoken');
require('dotenv').config();

// Este inclye las no vigentes
router.get('/',
    [authJwt.verifyToken,
    authJwt.invalidTokenCheck,
    authJwt.isEmployee], (req, res) => {
        mysqlConnecction.query('call spObtenerPromociones();',
            (err, rows, fields) => {
                if (!err) {
                    res.status(200).json({ "ok": true, "resultado": rows[0] });
                } else {
                    res.status(500).json({ "ok": false, "mensaje": "Error al listar promociones" })
                    console.log(err);
                }
            })
    });

router.get('/detalles/:id',
    (req, res) => {
        mysqlConnecction.query('call spObtenerDetallesPromocion(?);', [req.params['id']],
            (err, rows, fields) => {
                if (!err) {
                    res.status(200).json({ "ok": true, "resultado": rows[0] });
                } else {
                    res.status(500).json({ "ok": false, "mensaje": "Error al listar detalles de promocion" })
                    console.log(err);
                }
            })
    });

router.post('/',
    [authJwt.verifyToken,
    authJwt.invalidTokenCheck,
    authJwt.isEmployee],
    async (req, res) => {

        const { nombre, descripcion, precioPuntos, detalles, fechaDesde, fechaHasta } = req.body;
        await mysqlConnecction.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
        await mysqlConnecction.beginTransaction();
        mysqlConnecction.query('call spRegistrarPromocion(?,?,?,?,?,@id); select @id as id;',
            [nombre, descripcion, precioPuntos, new Date(fechaDesde), new Date(fechaHasta)],
            async (err, rows, fields) => {
                if (!err) {
                    const idPromocion = rows[1][0].id;

                    try {
                        for (const detalle of detalles) {
                            const { producto, cantidad } = detalle;
                            mysqlConnecction.query('call spRegistrarDetallePromocion(?,?,?);', [idPromocion, producto.id, cantidad],
                                async (err, rows, fields) => {
                                    if (err) {
                                        console.error(err);
                                        console.log("rollback");
                                        mysqlConnecction.rollback();
                                        res.status(500).json({
                                            "ok": false,
                                            "mensaje": "Error al registrar promocion"

                                        });
                                        return;
                                    }
                                });
                        }
                        res.status(201).json({
                            "ok": true,
                            "mensaje": "Promocion creada con éxito"
                        });
                        await mysqlConnecction.commit();
                    }
                    catch (e) {
                        console.error(e);
                        console.log("rollback");
                        res.status(500).json({
                            "ok": false,
                            "mensaje": "Error al registrar promocion"

                        });
                        await mysqlConnecction.rollback();
                    }

                } else {
                    console.log(err);
                    console.log("rollback");
                    mysqlConnecction.rollback();
                    res.status(500).json({
                        "ok": false,
                        "mensaje": "Error al registrar promocion"

                    });
                }
            });
    });

router.get('/vigentes', (req, res) => {
    mysqlConnecction.query('call spObtenerPromocionesVigentes();',
        (err, rows, fields) => {
            if (!err) {
                res.status(200).json({ "ok": true, "resultado": rows[0] });
            } else {
                res.status(500).json({ "ok": false, "mensaje": "Error al listar promociones" })
                console.log(err);
            }
        })
});

router.delete('/:id',
    [
        authJwt.verifyToken,
        authJwt.invalidTokenCheck,
        authJwt.isEmployee
    ], (req, res) => {

        mysqlConnecction.query('call spTerminarPromocion(?)', [req.params['id']],
            (err, rows, fields) => {
                if (!err) {
                    res.status(200).json({
                        "ok": true,
                        "mensaje": "Promoción terminada con éxito"
                    });
                } else {
                    console.log(err);
                    res.status(500).json({
                        "ok": false,
                        "mensaje": "Error al terminada promoción"
                    });
                }
            });
    });

router.put('/',
    [
        authJwt.verifyToken,
        authJwt.invalidTokenCheck,
        authJwt.isEmployee
    ],
    (req, res) => {
        const { id, nombre, descripcion, precioPuntos, fechaDesde, fechaHasta } = req.body;
        mysqlConnecction.query('call spEditarPromocion(?,?,?,?,?,?)', [id, nombre, descripcion, precioPuntos, new Date(fechaDesde), new Date(fechaHasta)],
            (err, rows, fields) => {
                if (!err) {
                    res.status(201).json({
                        "ok": true,
                        "mensaje": "Promocion actualizada con éxito"
                    });
                } else {
                    console.log(err);
                    res.status(500).json({
                        "ok": false,
                        "mensaje": "Error al actualizar promocion"
                    });
                }
            });
    });

router.post('/canjearPuntos',
    [
        authJwt.verifyToken,
        authJwt.invalidTokenCheck
    ], (req, res) => {
        if (!req.data.idSocio) {
            res.status(403).json({ "ok": false, "mensaje": "Usted no tiene los permisos requeridos para acceder a este recurso." });
            return;
        }
        mysqlConnecction.query('call spCanjearPuntos(?,?)', [req.body.id, req.data.idSocio],
            (err, rows, fields) => {
                if (!err) {
                    res.status(201).json({
                        "ok": true,
                        "mensaje": "Canje registrado con éxito"
                    });
                } else {
                    console.log(err);
                    res.status(500).json({
                        "ok": false,
                        "mensaje": "Error al registrar canje"
                    });
                }
            });
    });
module.exports = router