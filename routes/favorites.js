'use strict';

const express = require('express');

// eslint-disable-next-line new-cap
const router = express.Router();
const knex = require('../knex');
const humps = require('humps');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const boom = require('boom')

router.get('/favorites', (req, res, next) => {
  if (!req.cookies.token) {
    return next(boom.create(401, 'Unauthorized'))
  }
  else {
    knex('favorites')
    .join('books', 'books.id', 'book_id')
    .then((favs) => {
      res.send(humps.camelizeKeys(favs));
    })
  }
});

router.get('/favorites/check', (req, res, next) => {
  if (!req.cookies.token) {
    return next(boom.create(401, 'Unauthorized'));
  }
  else {
    let id = +req.query.bookId;
    knex('favorites')
    .where('id', id)
    .then((favs) => {
      if (!favs.length) {
          res.send(false);
      }
      else {
        res.send(true);
      }
    })
  }
});

router.post('/favorites', (req, res, next) => {
  if (!req.cookies.token) {
    return next(boom.create(401, 'Unauthorized'))
  }
  else {
    knex('favorites')
    .then((favs) => {
      knex('favorites')
        .insert({
          id: req.body.id,
          book_id: req.body.bookId,
          user_id: req.body.userId
        })
        .returning('*')
        .then((favs1) => {
          res.json(humps.camelizeKeys(favs1[0]));
        })
    })
  }
});

module.exports = router;
