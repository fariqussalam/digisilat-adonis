'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PesilatSchema extends Schema {
  up () {
    this.create('pesilat', (table) => {
      table.increments()
      table.timestamps()
      table.string('nama').notNullable()
      table.integer('kontingen_id').unsigned().references('kontingen.id')
      table.integer('kelas_id').unsigned().references('kelas.id')
      table.integer('tournament_id').unsigned().references('tournament.id')
      .onUpdate('CASCADE').onDelete('CASCADE')
    })
  }

  down () {
    this.drop('pesilat')
  }
}

module.exports = PesilatSchema
