'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Kualifikasi extends Model {
  static get table() {
    return 'kualifikasi'
  }
}

module.exports = Kualifikasi
