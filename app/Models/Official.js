'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Official extends Model {
    tournament () {
        return this.belongsTo('App/Models/Tournament')
    }
    kontingen () {
        return this.hasOne('App/Models/Kontingen')
      }
}

module.exports = Official
