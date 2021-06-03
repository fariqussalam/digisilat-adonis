'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PesilatSeniSchema extends Schema {
  up () {
    this.create('pesilat_seni', (table) => {
      table.increments()
      table.timestamps()
      table.integer('kategori_seni_id').unsigned().references('kategori_seni.id')
      table.integer('kontingen_id').unsigned().references('kontingen.id')
      table.integer('tournament_id').unsigned().references('tournament.id')
       .onUpdate('CASCADE').onDelete('CASCADE')
    })
  }

  down () {
    this.drop('pesilat_seni')
  }
}

module.exports = PesilatSeniSchema
