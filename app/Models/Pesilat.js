'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Pesilat extends Model {

  static get table() {
    return 'pesilat'
  }
  
    kontingen () {
        return this.belongsTo('App/Models/Kontingen')
      }
    kelas () {
        return this.belongsTo('App/Models/Kelas')
      }
    tournament () {
        return this.belongsTo('App/Models/Tournament')
    }
}

module.exports = Pesilat
