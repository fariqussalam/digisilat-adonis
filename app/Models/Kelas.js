'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Kelas extends Model {
    static get table () {
        return 'kelas'
      }

    tournament () {
        return this.belongsTo('App/Models/Tournament')
      }
}

module.exports = Kelas
