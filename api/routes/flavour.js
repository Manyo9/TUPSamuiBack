const express = require('express');
const app = require('../../app');
const router = express.Router();
const authJwt = require('../middleware/authjwt');

const mysqlConnecction = require('../connection/connection');

const jwt = require('jsonwebtoken');
require('dotenv').config();


router.get('/',(req,res)=>{
    mysqlConnecction.query('call spObtenerGustos();',
    (err,rows,fields) => {
        if(!err){
            res.status(200).json({"ok":true,"resultado":rows});
            console.log(rows);
        } else {
            res.status(500).json({"ok":false,"mensaje":"Error al listar pedidos"})
            console.log(err);
        }
    })
});
router.post('/', authJwt.verifyToken, (req, res) => {
    if (!req.data) {
        res.status(401).json({ "ok": false, "mensaje": "Token inválido." });
        return;
    }
    if (req.data.rol === 'Admin' || req.data.rol === 'Empleado') {
        const { nombre, activo } = req.body;
        mysqlConnecction.query('call spInsertarProducto(?,?)', [nombre,activo],
            (err, rows, fields) => {
                if (!err) {
                    res.status(201).json({
                        "ok": true,
                        "mensaje": "Gusto creado con éxito"
                    });
                } else {
                    console.log(err);
                    res.status(500).json({
                        "ok": false,
                        "mensaje": "Error al crear gusto"
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
    if (req.data.rol === 'Admin' || req.data.rol === 'Empleado' ) {
        mysqlConnecction.query('call spBorrarGusto(?)', [req.params['id']],
            (err, rows, fields) => {
                if (!err) {
                    res.status(200).json({
                        "ok": true,
                        "mensaje": "Gusto eliminado con éxito"
                    });
                } else {
                    console.log(err);
                    res.status(500).json({
                        "ok": false,
                        "mensaje": "Error al eliminar gusto"
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
    if (req.data.rol === 'Admin' || req.data.rol === 'Empleado') {
        const { activo, nombre, id} = req.body;
        mysqlConnecction.query('call spActualizarGusto(?,?,?)', [activo, nombre, id],
            (err, rows, fields) => {
                if (!err) {
                    res.status(201).json({
                        "ok": true,
                        "mensaje": "Gusto actualizado con éxito"
                    });
                } else {
                    console.log(err);
                    res.status(500).json({
                        "ok": false,
                        "mensaje": "Error al actualizar gusto"
                    });
                }
            });
    } else {
        res.status(403).json({ "ok": false, "mensaje": "Usted no tiene los permisos requeridos para acceder a este recurso." });
    }
});
module.exports = router