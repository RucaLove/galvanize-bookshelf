'use strict';

const express = require('express');

// eslint-disable-next-line new-cap
const router = express.Router();
const knex = require('../knex');
const jwt = require('jsonwebtoken');
const humps = require('humps');
const bcrypt = require('bcrypt');
// const app = express();
const boom = ('boom');
const logger = require('morgan');

const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
// require('dotenv').config();
// const token = require('./routes/token');

router.get('/token', (req, res, next) => {
  if (req.cookies.token) {
    res.status(200);
    res.send(true);
  }
  else {
    res.status(200);
    res.send(false);
  }
});

router.post('/token', (req, res, next) => {
  knex('users')
    .where('email', req.body.email)
    .then((users) => {
      const match = bcrypt.compareSync(req.body.password, users[0].hashed_password)
      if (match === true) {
        delete users[0].hashed_password;
        const token = jwt.sign(users[0], process.env.JWT_KEY);

        res.cookie('token', token, { httpOnly:true });
        res.status(200);
        res.send(humps.camelizeKeys(users[0]));
      }
    });
});

router.delete('/token', function(req, res, next) {
  res.clearCookie('token');
  res.status(200);
  res.send(true);
});

module.exports = router;
