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
    } else {
        knex('favorites')
            .join('books', 'books.id', 'book_id')
            .then((favs) => {
                res.send(humps.camelizeKeys(favs));
            });
    }
});

router.get('/favorites/check', (req, res, next) => {
    if (!req.cookies.token) {
        return next(boom.create(401, 'Unauthorized'));
    } else {
        let id = +req.query.bookId;
        knex('favorites')
            .where('id', id)
            .then((favs) => {
                if (!favs.length) {
                    res.send(false);
                } else {
                    res.send(true);
                }
            })
    }
});

router.post('/favorites', (req, res, next) => {
    if (!req.cookies.token) {
        return next(boom.create(401, 'Unauthorized'))
    }
    knex.raw("select setval('favorites_id_seq', (select max(id) from favorites))")
        .then(
            knex('favorites')
            .insert({
                id: req.body.id,
                book_id: req.body.bookId,
                user_id: 1
            })
            .returning('*')
            .then((favs1) => {
                res.send(humps.camelizeKeys(favs1[0]));
            })
        );
});

router.delete('/favorites', (req, res, next) => {
    if (!req.cookies.token) {
        return next(boom.create(401, 'Unauthorized'))
    }
    knex('favorites')
        .returning(['book_id', 'user_id'])
        .where('book_id', req.body.bookId)
        .del()
        .then((favs) => {
            delete favs[0].id;
            res.send(humps.camelizeKeys(favs[0]));
        })
});

module.exports = router;
