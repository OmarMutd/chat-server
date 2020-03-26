const path = require('path')
const logger = require('../logger')
const express = require('express')
const xss = require('xss')
const NamesService = require('./names-service')
const namesRouter = express.Router()
const bodyParser = express.json()

const serializeName = name => ({
    id: name.id,
    password: xss(name.password),
    // date_joined: user.date_joined
  })

  serializeName = (name) => {
    return name.map(this.serializeUser)
  }


  namesRouter
  .route('/')

  .get((req, res, next) => {
    const db = req.app.get('db')
    NamesService.getname(db)
    .then(user => {
      res.json(user)
    })
    .catch(next)
  })

  .post(bodyParser, (req, res, next) => {
    const { name, password } = req.body
    const newUser = { name, password }
    const db = req.app.get('db')

    for (const field of ['name', 'password']) {
      if (!newUser[field]) {
        logger.error(`${field} is required`)
        return res.status(400).send({
          error: { message: `'${field}' is required` }
        })
    }
}

})