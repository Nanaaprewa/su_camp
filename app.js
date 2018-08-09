require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const debug = require('debug')('su-camp:app.js');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
mongoose.connect(
  process.env.MONGODB_URI,
  {
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 5000
    // useNewUrlParser: true
  }
);
const db = mongoose.connection;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;

db.on('connected', () => {
  debug('Mongoose default connection connected');
});

db.on('disconnected', () => {
  debug('Mongoose default connection disconnected');
});

db.on('disconnected', err => {
  debug(`Mongoose default connection error: ${err}`);
});

process.on('SIGINT', function() {
  db.close(function() {
    debug('Mongoose default connection disconnected on app termination');
    process.exit(0);
  });
});
