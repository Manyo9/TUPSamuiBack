const express = require('express');
const app = require('../../app');
const router = express.Router();
const authJwt = require('../middleware/authjwt');

const mysqlConnecction = require('../connection/connection');

const jwt = require('jsonwebtoken');
require('dotenv').config();

router.post('/',
    [authJwt.verifyToken,
    authJwt.invalidTokenCheck],
    (req, res) => {
        const { idPedido, tipoPago, codigoAutorizacion, montoCobrado } = req.body;
        mysqlConnecction.query('select idSocio from pedidos where id = ?;', [idPedido],
            (err, rows, fields) => {
                const idSocio = rows[0].idSocio;
                //   Puede pagar/cobrar la persona que hizo el pedido o un admin o un empleado
                if ((req.data.idSocio && req.data.idSocio == idSocio) || req.data.rol === 'Admin' || req.data.rol === 'Empleado') {
                    mysqlConnecction.query('call spCobrar(?,?,?,?,?)',
                        [
                            idPedido, tipoPago,
                            req.data.idEmpleado ? req.data.idEmpleado : null,
                            codigoAutorizacion, montoCobrado
                        ],
                        (err, rows, fields) => {
                            if (!err) {
                                res.status(201).json({
                                    "ok": true,
                                    "mensaje": "Cobro registrado con éxito"
                                });
                            } else {
                                console.log(err);
                                res.status(500).json({
                                    "ok": false,
                                    "mensaje": "Error al registrar cobro"
                                });
                            }
                        });
                } else {
                    res.status(403).json({ "ok": false, "mensaje": "Usted no tiene los permisos requeridos para acceder a este recurso." });
                }
            });


    });

module.exports = router