const express = require('express');
const app = require('../../app');
const router = express.Router();
const authJwt = require('../middleware/authjwt');

const mysqlConnecction = require('../connection/connection');

const jwt = require('jsonwebtoken');
require('dotenv').config();

// Todos los activos o no activos, para empleados
router.get('/',
    [authJwt.verifyToken,
    authJwt.invalidTokenCheck,
    authJwt.isEmployee]

    , (req, res) => {
        mysqlConnecction.query('call spObtenerProductos();',
            (err, rows, fields) => {
                if (!err) {
                    res.status(200).json({ "ok": true, "resultado": rows[0] });
                } else {
                    res.status(500).json({ "ok": false, "mensaje": "Error al listar productos" })
                    console.log(err);
                }
            })
    });
// Todos los activos o no activos, para empleados
router.get('/activos'
    , (req, res) => {
        mysqlConnecction.query('call spObtenerProductosActivos();',
            (err, rows, fields) => {
                if (!err) {
                    res.status(200).json({ "ok": true, "resultado": rows[0] });
                } else {
                    res.status(500).json({ "ok": false, "mensaje": "Error al listar productos" })
                    console.log(err);
                }
            })
    });
router.get('/:id',
    [authJwt.verifyToken,
    authJwt.invalidTokenCheck,
    authJwt.isEmployee],
    (req, res) => {
        mysqlConnecction.query('call spObtenerProductoPorID(?)', [req.params['id']],
            (err, rows, fields) => {
                if (!err) {
                    if (rows.length > 0) {
                        res.status(200).json({ "ok": true, "resultado": rows[0] });
                    } else {
                        res.status(404).json({ "ok": false, "resultado": [] });
                    }
                } else {
                    console.log(err);
                }
            })
    });

router.post('/',
    [authJwt.verifyToken,
    authJwt.invalidTokenCheck,
    authJwt.isEmployee], (req, res) => {

        const { nombre, precio, descripcion, observaciones, activo, disponible, puntosGanados, urlImagen } = req.body;
        mysqlConnecction.query('call spInsertarProducto(?,?,?,?,?,?,?,?)', [nombre, precio, descripcion, observaciones, activo, disponible, puntosGanados, urlImagen],
            (err, rows, fields) => {
                if (!err) {
                    res.status(201).json({
                        "ok": true,
                        "mensaje": "Producto creado con éxito"
                    });
                } else {
                    console.log(err);
                    res.status(500).json({
                        "ok": false,
                        "mensaje": "Error al crear producto"
                    });
                }
            });
    });

router.put('/',
    [authJwt.verifyToken,
    authJwt.invalidTokenCheck,
    authJwt.isEmployee],
    (req, res) => {
        const { id, nombre, precio, descripcion, observaciones, activo, puntosGanados, urlImagen } = req.body;
        mysqlConnecction.query('call spActualizarProducto(?,?,?,?,?,?,?,?)', [id, nombre, precio, descripcion, observaciones, activo, puntosGanados, urlImagen],
            (err, rows, fields) => {
                if (!err) {
                    res.status(201).json({
                        "ok": true,
                        "mensaje": "Producto actualizado con éxito"
                    });
                } else {
                    console.log(err);
                    res.status(500).json({
                        "ok": false,
                        "mensaje": "Error al actualizar producto"
                    });
                }
            });
    });

router.delete('/:id',
    [authJwt.verifyToken,
    authJwt.invalidTokenCheck,
    authJwt.isEmployee], (req, res) => {

        mysqlConnecction.query('call spBorrarProducto(?)', [req.params['id']],
            (err, rows, fields) => {
                if (!err) {
                    res.status(200).json({
                        "ok": true,
                        "mensaje": "Producto eliminado con éxito"
                    });
                } else {
                    console.log(err);
                    res.status(500).json({
                        "ok": false,
                        "mensaje": "Error al eliminar producto"
                    });
                }
            });
    });
router.post('/reporte',
    [
        authJwt.verifyToken,
        authJwt.invalidTokenCheck,
        authJwt.isEmployee
    ], (req, res) => {
        const { fechaDesde, fechaHasta } = req.body;
        mysqlConnecction.query('call spReporteProductos(?,?)', [new Date(fechaDesde), new Date(fechaHasta)],
            (err, rows, fields) => {
                if (!err) {
                    res.status(200).json({
                        "ok": true,
                        "mensaje": "Reporte generado con éxito",
                        "resultado": rows[0]
                    });
                } else {
                    console.log(err);
                    res.status(500).json({
                        "ok": false,
                        "mensaje": "Error al generar reporte"
                    });
                }
            });
        
});
module.exports = router;