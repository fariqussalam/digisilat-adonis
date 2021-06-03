'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Jabatan extends Model {
    static get table () {
        return 'jabatan'
      }
      tournament () {
        return this.belongsTo('App/Models/Tournament')
      }
}

module.exports = Jabatan
