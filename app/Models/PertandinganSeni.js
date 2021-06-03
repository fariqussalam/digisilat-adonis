'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class PertandinganSeni extends Model {
  static get table() {
    return 'pertandingan_seni'
  }
}

module.exports = PertandinganSeni
