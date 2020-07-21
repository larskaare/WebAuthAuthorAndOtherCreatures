var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/quote');

var app = express();

var corsOptions = {
    origin: 'http://localhost:3100/',
    methods: "GET",
    optionsSuccessStatus: 200 
  };

app.use(cors(corsOptions));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/quote', indexRouter);

module.exports = app;
