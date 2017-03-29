'use strict';

const express = require('express');

// eslint-disable-next-line new-cap
const router = express.Router();
const knex = require('../knex');
const humps = require('humps')


router.get('/books', (req, res, next) => {
    knex('books')
        .orderBy('title', 'asc')
        .then((books) => {
            res.send(humps.camelizeKeys(books));
        })
        .catch((err) => {
            next(err);
        });
});

router.get('/books/:id', (req, res, next) => {
    knex('books')
        .orderBy('id', req.params.id)
        .then((books) => {
            if (!books) {
                return next();
            }
            res.send(humps.camelizeKeys(books[0]));
        })
        .catch((err) => {
            next(err);
        });
});

router.post('/books', (req, res, next) => {
    knex('books')
        .then((books) => {
            if (!books) {
                const err = new Error('book does not exist');
                err.status = 400;
                throw err;
            }
            knex('books')
                .insert({
                    'id': req.body.id,
                    'title': req.body.title,
                    'author': req.body.author,
                    'genre': req.body.genre,
                    'description': req.body.description,
                    'cover_url': req.body.coverUrl,
                    'created_at': req.body.createdAt,
                    'updated_at': req.body.updatedAt
                })
                .returning('*')
                .then((books1) => {
                    res.json(humps.camelizeKeys(books1[0]));
                })
        })
        .catch((err) => {
            next(err);
        });
});

router.patch('/books/:id', (req, res, next) => {
    knex('books')
        .where('id', req.params.id)
        .update({
            id: req.body.id,
            title: req.body.title,
            author: req.body.author,
            genre: req.body.genre,
            description: req.body.description,
            cover_url: req.body.coverUrl,
        })
        .returning('*')
        .then((book) => {
          res.json(humps.camelizeKeys(book[0]));
        })
});

router.delete('/books/:id', (req, res, next) => {
    let book;

    knex('books')
        .where('id', req.params.id)
        .first()
        .then((row) => {
            if (!row) {
                return next();
            }

            book = row;

            return knex('books')
                .del()
                .where('id', req.params.id);
        })
        .then(() => {
            delete book.id;
            res.send(humps.camelizeKeys(book));
        })
        .catch((err) => {
            next(err);
        });
});

module.exports = router;
