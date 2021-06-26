'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddJenisSeniSchema extends Schema {
  up () {
    this.table('kategori_seni', (table) => {
      table.string("jenis")
    })
  }

  down () {
    this.table('add_jenis_senis', (table) => {
      table.dropColumn("jenis")
    })
  }
}

module.exports = AddJenisSeniSchema
