'use strict'
const _ = require('underscore')
const s = require('underscore.string')
const PertandinganService = use('App/Services/PertandinganService')
const Kelas = use('App/Models/Kelas')
const KategoriSeni = use('App/Models/KategoriSeni')
const Pesilat = use('App/Models/Pesilat')
const Kontingen = use('App/Models/Kontingen')
const PesilatSeni = use('App/Models/PesilatSeni')
const Pertandingan = use('App/Models/Pertandingan')
const Kualifikasi = use('App/Models/Kualifikasi')
const Eliminasi = use('App/Models/Eliminasi')
const PesilatService = use('App/Services/PesilatService')
const Setting = use ('App/Models/Setting')
const SeniInterface = use('App/DTO/SeniInterface')
const PertandinganSeni = use('App/Models/PertandinganSeni')

class SeniService {
    constructor() {
        this.pesilatService = new PesilatService
        this.pertandinganService = new PertandinganService
    }

    async getPertandinganData(id) {
        var pertandingan = await PertandinganSeni.find(id)
        if (!pertandingan) return null

        var data_pertandingan = JSON.parse(pertandingan.data_pertandingan)
        const pesilat = await this.pesilatService.getPesilatSeni(id)
        const kategori = await KategoriSeni.find(pertandingan.kategori_id).then(r => r.toJSON())

        data_pertandingan.pesilat = pesilat
        data_pertandingan.kategori = kategori
        data_pertandingan.nomor_pool = pertandingan.nomor_pool
        data_pertandingan.nomor_penampil = pertandingan.nomor_penampil

        return data_pertandingan
    }

  
}

module.exports = SeniService
