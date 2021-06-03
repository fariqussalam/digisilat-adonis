'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddSettingTypeSchema extends Schema {
  up () {
    this.table('settings', (table) => {
      table.string("setting_type").notNullable()
      table.text("setting_value")
    })
  }

  down () {
    this.table('settings', (table) => {
      table.dropColumn('setting_type')
      table.dropColumn('setting_value')
    })
  }
}

module.exports = AddSettingTypeSchema
