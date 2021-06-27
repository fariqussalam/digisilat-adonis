'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class KunciUndianSchema extends Schema {
  up () {
    this.table('undian', (table) => {
      table.boolean('is_locked').defaultTo(false)
    })
    
  }

  down () {
    this.table('undian', (table) => {
      table.dropColumn('is_locked')
    })
  }
}

module.exports = KunciUndianSchema
