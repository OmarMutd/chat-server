const path = require('path')
const logger = require('../logger')

const express = require('express')
const xss = require('xss')
const NamesService = require('./names-service')

const namesRouter = express.Router()
const jsonBodyParser = express.json()

const serializeName = name => ({
    id: name.id,
    name: xss(name.name),
  })


namesRouter
.route('/names')
.get((req, res, next) => {
    NamesService.getAllNames(req.app.get('db'))
      .then(names => {
        res.json(names.map(serializeName))
      })
      .catch(next)
  })
  .post(jsonBodyParser, (req, res, next) => {
    const { password, name } = req.body

    for (const field of ['name', 'password'])
        if (!req.body[field])
            return res.status(400).json({
            error: `Missing '${field}' in request body`
            })

        const passwordError = NamesService.validatePassword(password)
    
        if (passwordError)
            return res.status(400).json({ error: passwordError })

        NamesService.hasUserWithUserName(
            req.app.get('db'),
            name
        )
            .then(hasUserWithUserName => {
            if (hasUserWithUserName)
                return res.status(400).json({ error: `Name already taken` })

                return NamesService.hashPassword(password)
                    .then(hashedPassword => {
                        const newName = {
                            name,
                            password: hashedPassword,
                            // date_created: 'now()',
                            }
                
                    return NamesService.insertUser(
                    req.app.get('db'),
                    newName
                    )
                    .then(name => {
                        res
                        .status(201)
                        .location(path.posix.join(req.originalUrl, `/${name.id}`))
                        .json(NamesService.serializeName(name))
                    })
                })

    
  })
  .catch(next)
})
  
  module.exports = namesRouter;