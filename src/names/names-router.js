const path = require('path')
const logger = require('../logger')

const express = require('express')
const xss = require('xss')
const NamesService = require('./names-service')

const namesRouter = express.Router()
const jsonParser = express.json()

const serializeName = name => ({
    id: name.id,
    password: xss(name.password)
    // date_joined: name.date_joined
  })



  namesRouter
  .route('/')

  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    NamesService.getById(db)
    .then(name => {
      res.json(name.map(serializeName))
    })
    .catch(next)
  })

  .post(jsonParser, (req, res, next) => {
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

  namesRouter
  .route('/names/:name_id')

  .all((req, res, next) => {
    const { name_id } = req.params
    const db = req.app.get('db')
    NamesService.getById(db, name_id)
      .then(name => {
        if (!name) {
          logger.error(`Name with id ${name_id} does not exist.`)
          return res.status(404).json({
            error: { message: `Name does not exist` }
          })
        }
        res.name = name
        next()
      })
      .catch(next)
  })

  .get((req, res) => {
    res.json(res.name)
  })

  .delete((req, res, next) => {
    const { name_id } = req.params
    const db = req.app.get('db')
    NamesService.deleteName(db, name_id)
      .then(() => {
        logger.info(`Name with id ${nane_id} has been deleted.`)
        res.status(204).end()
      })
      .catch(next)
    })

  .patch(jsonParser, (req, res, next) => {
    const { password, name } = req.body
    const newName = { name, password }

    const numberOfValues = Object.values(newName).filter(Boolean).length
    if (numberOfValues === 0) {
      logger.error(`Can't update, missing fields!`)
      return res.status(400).json({
        error: {
          message: `Both password & name are required'.`
        }
      })
    }

    const { name_id } = req.params
    const db = req.app.get('db')

    NamesService.updateName(db, newName, name_id)
      .then(() => {
        res.status(204).end()
      })
      .catch(next)

  })

  module.exports = namesRouter