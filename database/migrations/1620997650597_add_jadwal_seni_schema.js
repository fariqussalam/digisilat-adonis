'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddJadwalSeniSchema extends Schema {
  up () {
    this.table('tournament', (table) => {
      // alter table
      table.boolean('jadwal_seni_generated').defaultTo(0)
      table.integer('jumlah_pool')
    })
  }

  down () {
    this.table('tournament', (table) => {
      // reverse alternations
      table.dropColumn('jadwal_seni_generated')
      table.dropColumn('jumlah_pool')
    })
  }
}

module.exports = AddJadwalSeniSchema
