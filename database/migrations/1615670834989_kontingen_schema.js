'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class KontingenSchema extends Schema {
  up () {
    this.create('kontingen', (table) => {
      table.increments()
      table.timestamps()
      table.string('nama').notNullable()
      table.integer('tournament_id').unsigned().references('tournament.id')
        .onUpdate('CASCADE').onDelete('CASCADE');
    })
  }

  down () {
    this.drop('kontingen')
  }
}

module.exports = KontingenSchema
