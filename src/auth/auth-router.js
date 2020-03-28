const express = require('express')

const authRouter = express.Router()
const jsonBodyParser = express.json()
const AuthService = require('./auth-service')

authRouter
.post('/login', jsonBodyParser, (req, res, next) => {
const { name, password } = req.body
const loginUser = { name, password }

for (const [key, value] of Object.entries(loginUser))
  if (value == null)
    return res.status(400).json({
      error: `Missing '${key}' in request body`
    })
AuthService.getUserWithUserName(
req.app.get('db'),
loginUser.name
)
.then(dbUser => {
  if (!dbUser)
    return res.status(400).json({
      error: 'Incorrect user_name or password',
    })
          return AuthService.comparePasswords(loginUser.password, dbUser.password)
            .then(compareMatch => {
              if (!compareMatch)
                return res.status(400).json({
                  error: 'Incorrect user_name or password',
                })
                  
      const sub = dbUser.name
      const payload = { name: dbUser.id }
      res.send({
        authToken: AuthService.createJwt(sub, payload),
      })
                          })
              })
              .catch(next)
        })

module.exports = authRouter