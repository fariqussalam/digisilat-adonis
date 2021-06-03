'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class KategoriSeniSchema extends Schema {
  up () {
    this.create('kategori_seni', (table) => {
      table.increments()
      table.timestamps()
      table.string('nama').notNullable()
      table.integer('tournament_id').unsigned().references('tournament.id')
        .onUpdate('CASCADE').onDelete('CASCADE');
    })
  }

  down () {
    this.drop('kategori_seni')
  }
}

module.exports = KategoriSeniSchema
