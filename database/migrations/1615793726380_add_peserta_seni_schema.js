'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddPesertaSeniSchema extends Schema {
  up () {
    this.table('pesilat_seni', (table) => {
      table.string('nama')
    })
  }

  down () {
    this.table('pesilat_seni', (table) => {
      table.dropColumn('nama')
    })
  }
}

module.exports = AddPesertaSeniSchema
