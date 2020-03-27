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
    // date_joined: name.date_joined
  })

  serializeName = (name) => {
    return name.map(this.serializeName)
  }


  namesRouter
  .route('/')

  .get((req, res, next) => {
    const db = req.app.get('db')
    NamesService.getname(db)
    .then(name => {
      res.json(name)
    })
    .catch(next)
  })

  .post(bodyParser, (req, res, next) => {
    const { name, password } = req.body
    const newName = { name, password }
    const db = req.app.get('db')

    for (const field of ['name', 'password']) {
      if (!newName[field]) {
        logger.error(`${field} is required`)
        return res.status(400).send({
          error: { message: `'${field}' is required` }
        })
    }
}

NamesService.insertName(db, newName)
      .then(name => {
        logger.info(`Name with id ${name.id} created.`)
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `${name.id}`))
          .json(serializeName(name))
      })
      .catch(next)
  })