const express = require('express');
const app = require('../../app');
const router = express.Router();
const authJwt = require('../middleware/authjwt');

const mysqlConnecction = require('../connection/connection');

const jwt = require('jsonwebtoken');
require('dotenv').config();


router.get('/', [authJwt.verifyToken, authJwt.invalidTokenCheck], (req, res) => {
    mysqlConnecction.query('call spObtenerPromociones();',
        (err, rows, fields) => {
            if (!err) {
                res.status(200).json({ "ok": true, "resultado": rows[0] });
                console.log(rows);
            } else {
                res.status(500).json({ "ok": false, "mensaje": "Error al listar promociones" })
                console.log(err);
            }
        })
});
router.get('/detalles/:id', [authJwt.verifyToken, authJwt.invalidTokenCheck], (req, res) => {
    mysqlConnecction.query('call spObtenerDetallesPromocion(?);', [req.params['id']],
        (err, rows, fields) => {
            if (!err) {
                res.status(200).json({ "ok": true, "resultado": rows[0] });
                console.log(rows);
            } else {
                res.status(500).json({ "ok": false, "mensaje": "Error al listar detalles de promocion" })
                console.log(err);
            }
        })
});
router.post('/', [authJwt.verifyToken, authJwt.invalidTokenCheck, authJwt.isEmployee], async (req, res) => {

    const { nombre, descripcion, precioPuntos, detalles, fechaDesde, fechaHasta } = req.body;
    await mysqlConnecction.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
    await mysqlConnecction.beginTransaction();
    mysqlConnecction.query('call spRegistrarPromocion(?,?,?,?,?,@id); select @id as id;', [nombre, descripcion, precioPuntos, fechaDesde, fechaHasta],
        async (err, rows, fields) => {
            if (!err) {
                const idPromocion = rows[1][0].id;

                try {
                    for (const detalle of detalles) {
                        const { producto, cantidad} = detalle;
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


module.exports = router