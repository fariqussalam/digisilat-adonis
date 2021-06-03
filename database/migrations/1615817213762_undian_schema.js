'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UndianSchema extends Schema {
  up () {
    this.create('undian', (table) => {
      table.increments()
      table.timestamps()
      table.string('type');
      table.integer('tournament_id').unsigned().references('tournament.id');
      table.integer('kelas_id').unsigned().references('kelas.id');
      table.integer('kategori_seni_id').unsigned().references('kategori_seni.id');
      table.integer('draw_count').notNullable().defaultTo(0);
    })
  }

  down () {
    this.drop('undian')
  }
}

module.exports = UndianSchema
