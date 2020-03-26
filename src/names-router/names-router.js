const path = require('path')
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

  serializeUsers = (users) => {
    return users.map(this.serializeUser)
  }