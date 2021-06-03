'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PertandinganSeniSchema extends Schema {
  up () {
    this.create('pertandingan_seni', (table) => {
      table.increments()
      table.timestamps()
      table.datetime("tanggal_pertandingan")
      table.string("skor_akhir")
      table.boolean("diskualifikasi").defaultTo(false)
      table.string("status")
      table.integer('tournament_id').unsigned().references('tournament.id')
      table.integer('kategori_id').unsigned().references('kategori_seni.id')
      table.text("data_pertandingan")
      table.integer("nomor_pool")
      table.integer("peserta_undian_id").unsigned().references('peserta_undian.id')
      table.string("nomor_penampil")
      table.integer("pesilat_seni_id").unsigned().references('pesilat_seni.id')
    })
  }

  down () {
    this.drop('pertandingan_seni')
  }
}

module.exports = PertandinganSeniSchema
