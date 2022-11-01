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
            res.status(200).json({"ok":true,"resultado":rows[0]});
            console.log(rows);
        } else {
            res.status(500).json({"ok":false,"mensaje":"Error al listar pedidos"})
            console.log(err);
        }
    })
});

router.post('/', 
    [authJwt.verifyToken,
    authJwt.invalidTokenCheck,
    authJwt.isEmployee],

    (req, res) => {

    const { nombre, activo } = req.body;
    mysqlConnecction.query('call spCrearGusto(?,?)', [nombre,activo],
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
});

router.delete('/:id',
    [authJwt.verifyToken,
    authJwt.invalidTokenCheck,
    authJwt.isEmployee],
    (req, res) => {

    mysqlConnecction.query('call spEliminarGusto(?)', [req.params['id']],
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
});

router.put('/', 
    [authJwt.verifyToken,
    authJwt.invalidTokenCheck,
    authJwt.isEmployee],
    (req, res) => {

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
});
module.exports = router