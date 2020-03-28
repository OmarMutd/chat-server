const NamesService = {
    getAllNames(knex) {
      return knex.select('*').from('chatserver')
    },
    getById(knex, id) {
      return knex.from('chatserver').select('*').where('id', id).first()
    },
    insertName(knex, newName) {
      return knex
        .insert(newName)
        .into('chatserver')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
    deleteName(knex, id) {
      return knex('chatserver')
        .where({ id })
        .delete()
    },
    updateName(knex, id, newNameFields) {
      return knex('chatserver')
        .where({ id })
        .update(newNameFields)
    },
  }
  
  module.exports = NamesService