const express = require('express');
const app = require('../../app');
const router = express.Router();

const mysqlConnecction = require('../connection/connection');

const jwt = require('jsonwebtoken');

router.get('/', verifyToken,(req,res)=>{
    if(req.data.rol === 'Admin'){
        mysqlConnecction.query('select u.id, r.nombre as rol,'+
        ' u.usuario, u.fechaAlta, u.fechaBaja FROM usuarios u'+
        ' join roles r on r.id = u.idRol;',
        (err,rows,fields) => {
            if(!err){
                res.status(200).json({"ok":true,"resultado":rows});
            } else {
                res.status(500).json({"ok":false,"mensaje":"Error al listar usuarios"})
                console.log(err);
            }
        })
    } else {
        res.status(403).json({"ok":false,"mensaje":"Usted no tiene los permisos requeridos para acceder a este recurso."});
    }
});

router.get('/:id', verifyToken,(req,res)=>{
    if(req.data.id == req.params['id'] || req.data.rol === 'Admin'){
        mysqlConnecction.query('select u.id, r.nombre as rol,'+
        ' u.usuario, u.fechaAlta, u.fechaBaja FROM usuarios u'+
        ' join roles r on r.id = u.idRol where u.id = ?;',[req.params['id']],
        (err,rows,fields) => {
            if(!err){
                if(rows.length > 0){
                res.status(200).json({"ok":true,"resultado":rows});
                } else {
                    res.status(404).json({"ok":false,"resultado":[]});
                }
            } else {
                console.log(err);
            }
        })
    } else {
        res.status(403).json({"ok":false,"mensaje":"Usted no tiene los permisos requeridos para acceder a este recurso."});
    }
});

router.post('/iniciarSesion', (req, res) => {
    const {usuario, contrasenia} = req.body;
    mysqlConnecction.query('call spIniciarSesion(?,?)',
    [usuario, contrasenia],
    (err,rows,fields) => {
        rows=rows[0];
        if(!err){
            if(rows.length > 0){
                let data = JSON.stringify(rows[0]);
                const token = jwt.sign(data, process.env.SECRET_KEY);
                res.status(200).json({"ok":true,
                "resultado":[token]});
            } else {
                res.status(200).json({"ok":false,
                "mensaje":"Usuario y/o contraseña incorrectos"});
            }
        } else {
            console.log(err);
        }
    }
    );
})

router.post('/nuevoUsuarioSocio', (req, res) => {
    const {usuario, contrasenia} = req.body;
    mysqlConnecction.query('call spNuevoUsuarioSocio(?, ?)',[usuario, contrasenia],
    (err,rows,fields) => {
        if(!err){
            res.status(201).json({"ok":true,
            "mensaje":"Usuario creado con éxito"});
        } else {
            console.log(err);
            res.status(500).json({"ok":false,
            "mensaje":"Error al crear usuario"});
        }
    });
});

router.post('/nuevoUsuarioAdmin', verifyToken, (req, res) => {
    if(req.data.rol === 'Admin'){
        const {usuario, contrasenia} = req.body;
        mysqlConnecction.query('call spNuevoUsuarioAdmin(?, ?)',[usuario, contrasenia],
        (err,rows,fields) => {
            if(!err){
                res.status(201).json({"ok":true,
                "mensaje":"Usuario creado con éxito"});
            } else {
                console.log(err);
                res.status(500).json({"ok":false,
                "mensaje":"Error al crear usuario"});
            }
        });
    } else {
        res.status(403).json({"ok":false,"mensaje":"Usted no tiene los permisos requeridos para acceder a este recurso."});
    }
});

function verifyToken(req, res, next) {
    if (!req.headers.authorization) return res.status(401).json({ "ok": false, "mensaje": "No autorizado" });
    let token = req.headers.authorization.split(' ')[1];

    if (token === '' || token === null) {
        return res.status(401).json({ "ok": false, "mensaje": "Token inválido" });
    }
    let contenido = jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return undefined;
        } else {
            return decoded;
        }
    });
    req.data = contenido;
    next();
}

module.exports = router;