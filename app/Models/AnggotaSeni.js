'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class AnggotaSeni extends Model {
    static get table () {
        return 'anggota_seni'
      }

    pesertaSeni () {
        return this.belongsTo('App/Models/PesilatSeni')
      }
}

module.exports = AnggotaSeni
