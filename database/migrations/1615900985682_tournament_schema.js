'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class TournamentSchema extends Schema {
  up () {
    this.table('tournament', (table) => {
      // alter table
      table.boolean('jadwal_generated').defaultTo(0)
    })
  }

  down () {
    this.table('tournament', (table) => {
      // reverse alternations
      table.dropColumn('jadwal_generated')
    })
  }
}

module.exports = TournamentSchema
