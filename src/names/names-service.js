const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;
const bcrypt = require('bcryptjs');
const xss = require('xss');

const NamesService = {
  getAllNames(knex) {
    return knex.select('*').from('usernames');
  },

  getById(knex, id) {
    return knex.from('usernames').select('*').where('id', id).first();
  },

  hasUserWithUserName(db, name) {
      return db('usernames')
      .where({ name })
      .first()
      .then((name) => !!name)
  },
  insertUser(db, newName) {
      return db
      .insert(newName)
      .into('usernames')
      .returning('*')
      .then(([name]) => name);
  },

  deleteName(knex, name) {
    return knex('usernames')
      .where({ name })
      .del();
  },

  changePassword(knex,password,newpassword, id)   {
    // console.log("NEWPASSWORD:", newpassword);
    return knex('usernames')
    .where({id})
    .update({ password: newpassword })
  },

  validatePassword(password) {
    if (password.length < 8) {
      return 'Password must be 8 or more characters';
    }
    if (password.length > 72) {
      return 'Password must be less than 72 characters';
    }
  if (password.startsWith(' ') || password.endsWith(' ')) {
      return 'Password must not start or end with empty spaces';
  }
  if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return 'Password must contain 1 upper case, lower case, number and special character';
      }
      return null;
  },
  
  hashPassword(password) {
      return bcrypt.hash(password, 12);
      },

  serializeName(name) {
      return {
      id: name.id,
      name: xss(name.name),
      };
  },
};

module.exports = NamesService;