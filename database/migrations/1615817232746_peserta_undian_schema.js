'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PesertaUndianSchema extends Schema {
  up () {
    this.create('peserta_undian', (table) => {
      table.increments()
      table.timestamps()
      table.integer('undian_id').unsigned().references('undian.id')
      table.integer('pesilat_id').unsigned().references('pesilat.id')
      table.integer('pesilat_seni_id').unsigned().references('pesilat_seni.id')
      table.integer('nomor_undian').notNullable()
    })
  }

  down () {
    this.drop('peserta_undian')
  }
}

module.exports = PesertaUndianSchema
