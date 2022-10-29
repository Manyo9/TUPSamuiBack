const express = require('express');
const app = require('../../app');
const router = express.Router();
const authJwt = require('../middleware/authjwt');

const mysqlConnecction = require('../connection/connection');

const jwt = require('jsonwebtoken');
require('dotenv').config();


router.post('/', authJwt.verifyToken, async (req, res) => {
    if (!req.data) {
        res.status(401).json({ "ok": false, "mensaje": "Token inválido." });
        return;
    }
    if (req.data.rol === 'Socio') {
        const { idPuntoVenta, idSocio, idEmpleado, observaciones, detalles } = req.body;
        await mysqlConnecction.beginTransaction();
        mysqlConnecction.query('call spRegistrarPedido(?,?,?,?,@id); select @id as id;', [idPuntoVenta, idSocio, idEmpleado, observaciones],
            async (err, rows, fields) => {
                if (!err) {
                    const idPedido = rows[1][0].id;

                    try {
                        for (const detalle of detalles) {
                            const { idProducto, cantidad, precioUnitario, puntosGanados, comentarios } = detalle;
                            mysqlConnecction.query('call spRegistrarDetallePedido(?,?,?,?,?,?);', [idPedido, idProducto, cantidad, precioUnitario, puntosGanados, comentarios],
                                async (err, rows, fields) => {
                                    if (err) {
                                        console.error(err);
                                        console.log("rollback");
                                        mysqlConnecction.rollback();
                                        res.status(500).json({
                                            "ok": false,
                                            "mensaje": "Error al registrar pedido"

                                        });
                                        return;
                                    }
                                });
                        }
                        res.status(201).json({
                            "ok": true,
                            "mensaje": "Pedido creado con éxito"
                        });
                        await mysqlConnecction.commit();
                    }
                    catch (e) {
                        console.error(e);
                        console.log("rollback");
                        await mysqlConnecction.rollback();
                    }

                } else {
                    console.log(err);
                    console.log("rollback");
                    mysqlConnecction.rollback();
                    res.status(500).json({
                        "ok": false,
                        "mensaje": "Error al registrar pedido"

                    });
                }
            });
    } else {
        res.status(403).json({ "ok": false, "mensaje": "Usted no tiene los permisos requeridos para acceder a este recurso." });
    }
});


module.exports = router