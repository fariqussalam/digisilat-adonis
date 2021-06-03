'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Undian extends Model {
    static get table () {
        return 'undian'
    }
}

module.exports = Undian
