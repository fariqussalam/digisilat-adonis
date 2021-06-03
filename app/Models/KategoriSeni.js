'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class KategoriSeni extends Model {
    static get table () {
        return 'kategori_seni'
      }
      tournament () {
        return this.belongsTo('App/Models/Tournament')
      }
}

module.exports = KategoriSeni
