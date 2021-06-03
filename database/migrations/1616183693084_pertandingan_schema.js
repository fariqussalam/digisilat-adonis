'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PertandinganSchema extends Schema {
  up () {
    this.table('pertandingan', (table) => {
      // alter table
      table.string("jenis")
    })
  }

  down () {
    this.table('pertandingan', (table) => {
      // reverse alternations
      table.dropColumn('jenis')
    })
  }
}

module.exports = PertandinganSchema
