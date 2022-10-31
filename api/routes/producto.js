const express = require('express');
const app = require('../../app');
const router = express.Router();
const authJwt = require('../middleware/authjwt');

const mysqlConnecction = require('../connection/connection');

const jwt = require('jsonwebtoken');
require('dotenv').config();


router.get('/', (req, res) => {
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
router.get('/:id', (req, res) => {
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
router.post('/', authJwt.verifyToken, (req, res) => {
    if (!req.data) {
        res.status(401).json({ "ok": false, "mensaje": "Token inválido." });
        return;
    }
    if (req.data.rol === 'Admin') {
        const { nombre, precio, descripcion, observaciones, activo, puntosGanados, urlImagen } = req.body;
        mysqlConnecction.query('call spInsertarProducto(?,?,?,?,?,?,?)', [nombre, precio, descripcion, observaciones, activo, puntosGanados, urlImagen],
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
    } else {
        res.status(403).json({ "ok": false, "mensaje": "Usted no tiene los permisos requeridos para acceder a este recurso." });
    }
});
router.put('/', authJwt.verifyToken, (req, res) => {
    if (!req.data) {
        res.status(401).json({ "ok": false, "mensaje": "Token inválido." });
        return;
    }
    if (req.data.rol === 'Admin') {
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
    } else {
        res.status(403).json({ "ok": false, "mensaje": "Usted no tiene los permisos requeridos para acceder a este recurso." });
    }
});
router.delete('/:id', authJwt.verifyToken, (req, res) => {
    if (!req.data) {
        res.status(401).json({ "ok": false, "mensaje": "Token inválido." });
        return;
    }
    if (req.data.rol === 'Admin') {
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
    } else {
        res.status(403).json({ "ok": false, "mensaje": "Usted no tiene los permisos requeridos para acceder a este recurso." });
    }
});

module.exports = router;