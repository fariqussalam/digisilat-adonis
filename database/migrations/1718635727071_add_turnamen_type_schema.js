'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddTurnamenTypeSchema extends Schema {
  up() {
    this.table('tournament', (table) => {
      table.string('tournament_type').defaultTo("IPSI")
    })

  }

  down() {
    this.table('tournament', (table) => {
      table.dropColumn('tournament_type')
    })
  }
}

module.exports = AddTurnamenTypeSchema
