const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(cors());

// RUTAS
const userRoute = require('./api/routes/user');
app.use('/usuarios',userRoute);

const productRoute = require('./api/routes/product');
app.use('/productos',productRoute);

const orderRoute = require('./api/routes/order');
app.use('/pedidos',orderRoute);

const flavourRoute = require('./api/routes/flavour');
app.use('/sabores',flavourRoute);

module.exports = app;