'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class KelasSchema extends Schema {
  up () {
    this.create('kelas', (table) => {
      table.increments()
      table.timestamps()
      table.string('nama').notNullable()
      table.integer('tournament_id').unsigned().references('tournament.id')
        .onUpdate('CASCADE').onDelete('CASCADE');
    })
  }

  down () {
    this.drop('kelas')
  }
}

module.exports = KelasSchema
