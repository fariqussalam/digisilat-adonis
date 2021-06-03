'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Kontingen extends Model {
    static get table () {
        return 'kontingen'
      }
    
    tournament () {
        return this.belongsTo('App/Models/Tournament')
    }
}

module.exports = Kontingen
