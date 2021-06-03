'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class TournamentSchema extends Schema {
  up () {
    this.create('tournament', (table) => {
      table.increments()
      table.timestamps()
      table.string('nama').notNullable()
      table.string('tempat')
      table.string('waktu')
      table.boolean('is_active').notNullable().defaultTo(false)
      table.text("logo_1")
      table.text("logo_2")
    })
  }

  down () {
    this.drop('tournament')
  }
}

module.exports = TournamentSchema
