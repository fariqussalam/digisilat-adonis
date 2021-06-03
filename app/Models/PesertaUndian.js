'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class PesertaUndian extends Model {
    static get table () {
        return 'peserta_undian'
    }
}

module.exports = PesertaUndian
