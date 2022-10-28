const jwt = require("jsonwebtoken");
require('dotenv').config();

function verifyToken(req, res, next) {
    if (!req.headers.authorization) return res.status(401).json({ "ok": false, "mensaje": "No autorizado" });
    let token = req.headers.authorization.split(' ')[1];

    if (token === '' || token === null) {
        return res.status(401).json({ "ok": false, "mensaje": "Token vacío" });
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

const authJwt = {
  verifyToken,
};

module.exports = authJwt;
