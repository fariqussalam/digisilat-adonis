'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class OfficialSchema extends Schema {
  up () {
    this.create('officials', (table) => {
      table.increments()
      table.timestamps()
      table.string('nama').notNullable()
      table.integer('kontingen_id').unsigned().references('kontingen.id')
      table.integer('jabatan_id').unsigned().references('jabatan.id')
      table.integer('tournament_id').unsigned().references('tournament.id')
      .onUpdate('CASCADE').onDelete('CASCADE')
    })
  }

  down () {
    this.drop('officials')
  }
}

module.exports = OfficialSchema
