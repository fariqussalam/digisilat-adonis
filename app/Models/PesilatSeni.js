'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class PesilatSeni extends Model {
  static get table() {
    return 'pesilat_seni'
  }
    anggota () {
        return this.hasMany('App/Models/AnggotaSeni')
      }
    tournament () {
        return this.belongsTo('App/Models/Tournament')
    }
    kontingen () {
        return this.hasOne('App/Models/Kontingen')
      }
}

module.exports = PesilatSeni
