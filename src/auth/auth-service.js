const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')
const AuthService = {
    getUserWithUserName(table, name) {
        return table('usernames')
            .where({ name })
            .first()
    },
      comparePasswords(password, hash) {
            return bcrypt.compare(password, hash)
          },
             createJwt(subject, payload) {
                 return jwt.sign(payload, config.JWT_SECRET, {
                   subject,
                   algorithm: 'HS256',
                 })
               },

    parseBasicToken(token) {
        return Buffer
            .from(token, 'base64')
            .toString()
            .split(':')
    },
     verifyJwt(token) {
         return jwt.verify(token, config.JWT_SECRET, {
           algorithms: ['HS256'],
         })
       },

}

module.exports = AuthService
