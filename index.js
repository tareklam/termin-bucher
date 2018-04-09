/**
 * Created by joe on 04/07/16.
 */
"use strict";

import express from 'express'
import knex from './data/index'
import * as validator from "email-validator";
import cors from 'cors'


import "./appts"

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/hello', (req, res) => res.send('hello from cloudfront!'))
app.get('/health', (req, res) => res.send('Healthy!'))

app.get('/', (req, res) => res.send('Hello new !'))


app.post('/email', (req, res) => {


    if (validator.validate(req.body.email)) {
      knex.table('users').insert({email: req.body.email})
        .then(r => res.send(r))
        .catch((err) => {
          res.send(err);
        });
    }
  }
)


app.get('/email', (req, res) => {
    if (validator.validate(req.body.email)) {
      knex.table('users').delete({email: req.body.email})
        .then(r => res.send(r))
        .catch((err) => {
          console.error(err)
          // res.

        });
    }
  }
)


app.get('/db', (req, res) => {
    knex.raw('select 1+1 as result')
      .then(r => res.send(r))
      .catch((err) => {
        res.error(err, result);
      });
  }
)

const port = 3000
app.listen(port, () => console.log(`Example app listening on  ${port}!`))

