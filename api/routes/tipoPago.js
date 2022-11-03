const express = require('express');
const app = require('../../app');
const router = express.Router();
const authJwt = require('../middleware/authjwt');

const mysqlConnecction = require('../connection/connection');

const jwt = require('jsonwebtoken');
require('dotenv').config();


router.get('/',(req,res)=>{
    mysqlConnecction.query('call spObtenerTiposPago();',
    (err,rows,fields) => {
        if(!err){
            res.status(200).json({"ok":true,"resultado":rows[0]});
        } else {
            res.status(500).json({"ok":false,"mensaje":"Error al listar tipos de pago"})
            console.log(err);
        }
    })
});

module.exports = router