'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class KualifikasiSchema extends Schema {
  up () {
    this.create('kualifikasi', (table) => {
      table.increments()
      table.timestamps()
      table.integer('merah_id').unsigned().references('pesilat.id')
      table.integer('biru_id').unsigned().references('pesilat.id')
      table.integer('pertandingan_id').unsigned().references('pertandingan.id')
    })
  }

  down () {
    this.drop('kualifikasi')
  }
}

module.exports = KualifikasiSchema
