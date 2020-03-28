const path = require('path')
const logger = require('../logger')

const express = require('express')
const xss = require('xss')
const NamesService = require('./names-service')

const namesRouter = express.Router()
const jsonBodyParser = express.json()


namesRouter
  .post('/', jsonBodyParser, (req, res, next) => {
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
                        const newUser = {
                            user_name,
                            password: hashedPassword,
                            // date_created: 'now()',
                            }
                
                    return NamesService.insertUser(
                    req.app.get('db'),
                    newUser
                    )
                    .then(user => {
                        res
                        .status(201)
                        .location(path.posix.join(req.originalUrl, `/${user.id}`))
                        .json(NamesService.serializeUser(user))
                    })
                })
                    
    res.send('ok')
    
  })
  .catch(next)
})
  
  module.exports = namesRouter;