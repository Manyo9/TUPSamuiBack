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
    let idPuntoVenta;
    let idSocio;
    let idEmpleado;
    // Para socios el punto de venta es via web y se manda el idSocio
    if (req.data.rol === 'Socio') {
        idPuntoVenta = 2;
        idSocio = req.data.idSocio;
        idEmpleado = null;
    //Para empleados y admins el punto de venta es la sucursal y se manda un idEmpleado    
    } else if (req.data.rol === 'Admin' | req.data.rol === 'Empleado') {
        idPuntoVenta = 1;
        idEmpleado = req.data.idEmpleado;
        idSocio = null;
    }
    else {
        res.status(403).json({ "ok": false, "mensaje": "Usted no tiene los permisos requeridos para acceder a este recurso." });
        return
    }
    const { detalles, observaciones } = req.body;
    await mysqlConnecction.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
    await mysqlConnecction.beginTransaction();
    mysqlConnecction.query('call spRegistrarPedido(?,?,?,?,@id); select @id as id;', [idPuntoVenta, idSocio, idEmpleado, observaciones],
        async (err, rows, fields) => {
            if (!err) {
                const idPedido = rows[1][0].id;

                try {
                    for (const detalle of detalles) {
                        const { producto, cantidad, precioUnitario, puntosGanados, comentarios } = detalle;
                        mysqlConnecction.query('call spRegistrarDetallePedido(?,?,?,?,?,?);', [idPedido, producto.id, cantidad, precioUnitario, puntosGanados, comentarios],
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
});


module.exports = router