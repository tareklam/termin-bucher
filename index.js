/**
 * Created by joe on 04/07/16.
 */
"use strict";

const express = require('express')
const app = express()
import knex from './data/index'

var validator = require("email-validator");


require('dotenv').load();
require("./appts");

app.get('/health', (req, res) => res.send('Healthy!'))

app.get('/', (req, res) => res.send('Hello new !'))


app.post('/email', (req, res) => {
    if (validator.validate(req.body.email)) {
      knex.table('users').insert({email: req.body.email})
        .then(r => res.send(r))
        .catch((err) => {
          res.error(err, result);
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

