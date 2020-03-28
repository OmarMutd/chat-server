'use strict';
const bcrypt = require('bcryptjs')
const css = require('xss');

const NamesService = {
  async validateFields(db, user) {
    const result = {};

    for (const [key,value] of Object.entries(user)) {
      if (value.startsWith(' ') || value.endsWith(' ')) {
        result.error = `${key} cannot start or end with spaces`;
      }
    }
    const foundUser = await db('usersnames').where({user_name: user.user_name}).select('*');
    if (foundUser.length) {
      result.error = 'user name already exists';
    }
    if (user.password.length < 8 || user.password.length > 72) {
      result.error = 'password must be between 8 and 72 characters';

    }
    const regex = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;
    if (!regex.test(user.password)) {
      result.error = 'password must contain at least one of each: upper case, lower case, number and special character';

    }
    return result;
  },

  hashPassword(password){
    return bcrypt.hash(password)

  },
  sanitize(user) {
    const filtered = {};
    for (const [key,value] of Object.entries(user)) {
      filtered[key] = xss(value);
    }
    return filtered;
  },
  insert(db, user) {
    return db('usernames')
    .insert(user)
    .returning('*')
    .then(rows => rows[0]);
  },

};
  
  module.exports = NamesService