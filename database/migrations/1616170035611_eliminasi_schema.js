'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class EliminasiSchema extends Schema {
  up () {
    this.create('eliminasi', (table) => {
      table.increments()
      table.timestamps()
      table.integer('pertandingan_id').unsigned().references('pertandingan.id')
      table.integer('pemenang_a_id').unsigned().references('pertandingan.id')
      table.integer('pemenang_b_id').unsigned().references('pertandingan.id')
    })
  }

  down () {
    this.drop('eliminasi')
  }
}

module.exports = EliminasiSchema
