'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Pertandingan extends Model {
  static get table() {
    return 'pertandingan'
  }
}

module.exports = Pertandingan
