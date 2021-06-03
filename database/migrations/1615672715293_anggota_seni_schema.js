'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AnggotaSeniSchema extends Schema {
  up () {
    this.create('anggota_seni', (table) => {
      table.increments()
      table.timestamps()
      table.string('nama').notNullable()
      table.integer('pesilat_seni_id').unsigned().references('pesilat_seni.id')
    })
  }

  down () {
    this.drop('anggota_seni')
  }
}

module.exports = AnggotaSeniSchema
