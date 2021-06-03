'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddGelanggangSchema extends Schema {
  up () {
    this.table('pertandingan', (table) => {
      table.integer('nomor_gelanggang')
      table.string('nomor_partai')
    })
  }

  down () {
    this.table('pertandingan', (table) => {
      table.dropColumn('nomor_gelanggang')
      table.dropColumn('nomor_partai')
    })
  }
}

module.exports = AddGelanggangSchema
