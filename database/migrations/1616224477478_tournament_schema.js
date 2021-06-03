'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class TournamentSchema extends Schema {
  up () {
    this.table('tournament', (table) => {
      table.integer('jumlah_gelanggang')
    })
  }

  down () {
    this.table('tournament', (table) => {
      table.dropColumn('jumlah_gelanggang')
    })
  }
}

module.exports = TournamentSchema
