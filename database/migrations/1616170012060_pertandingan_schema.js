'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PertandinganSchema extends Schema {
  up () {
    this.create('pertandingan', (table) => {
      table.increments()
      table.timestamps()
      table.datetime('tanggal_pertandingan')
      table.integer('skor_merah')
      table.integer('skor_biru')
      table.string('pemenang')
      table.string('alasan_kemenangan')
      table.string('status')
      table.integer('tournament_id').unsigned().references('tournament.id')
      table.integer('kelas_id').unsigned().references('kelas.id')
      table.integer('ronde')
      table.text('data_pertandingan')
    })
  }

  down () {
    this.drop('pertandingan')
  }
}

module.exports = PertandinganSchema
