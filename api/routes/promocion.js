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
    mysqlConnecction.query('call spObtenerPromociones(?);', [req.params['id']],
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


module.exports = router