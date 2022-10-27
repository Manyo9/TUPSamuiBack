const express = require('express');
const app = require('../../app');
const router = express.Router();

const mysqlConnecction = require('../connection/connection');

const jwt = require('jsonwebtoken');


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
router.post('/', verifyToken, (req, res) => {
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
function verifyToken(req, res, next) {
    if (!req.headers.authorization) return res.status(401).json({ "ok": false, "mensaje": "No autorizado" });
    let token = req.headers.authorization.split(' ')[1];

    if (token === '' || token === null) {
        return res.status(401).json({ "ok": false, "mensaje": "Token inválido" });
    }
    let contenido = jwt.verify(token, 'testsamuihelados'); // aprender como manejar si se pasa un token invalido
    req.data = contenido;
    next();
}

module.exports = router;