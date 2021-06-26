'use strict'
const _ = require('underscore')
const s = require('underscore.string')
const PertandinganService = use('App/Services/PertandinganService')
const KategoriSeni = use('App/Models/KategoriSeni')
const PesilatService = use('App/Services/PesilatService')
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

    async setPertandinganData(pertandinganId, data) {
        let stringData = JSON.stringify(data);
        const pertandingan = await PertandinganSeni.find(pertandinganId)
        pertandingan.data_pertandingan = stringData
        await pertandingan.save()

        return true
    }

    async inputSkorPengurangan(pertandinganId, pertandinganData, nomorJuri, nilai) {
        var juri = pertandinganData.dewanJuri[nomorJuri]
        var currentNilai = this.getNilaiJurus(juri, nilai.nomorJurus)
        if (currentNilai < 1) return false;
        pertandinganData.dewanJuri[nomorJuri].pengurangan.push(nilai);
        await this.setPertandinganData(pertandinganId, pertandinganData);
        return await this.getPertandinganData(pertandinganId);
    }

    async inputSkorKemantapan(pertandinganId, pertandinganData, nomorJuri, nilai) {
        pertandinganData.dewanJuri[nomorJuri].kemantapan = nilai
        await this.setPertandinganData(pertandinganId, pertandinganData);
        return await this.getPertandinganData(pertandinganId);
    }

    async inputSkorHukuman(pertandinganId, pertandinganData, nomorJuri, hukuman) {
        pertandinganData.dewanJuri[nomorJuri].hukuman.push(hukuman)
        await this.setPertandinganData(pertandinganId, pertandinganData);
        return await this.getPertandinganData(pertandinganId);
    }

    async hapusSkorHukuman(pertandinganId, pertandinganData, nomorJuri) {
        pertandinganData.dewanJuri[nomorJuri].hukuman = []
        await this.setPertandinganData(pertandinganId, pertandinganData);
        return await this.getPertandinganData(pertandinganId);
    }

    async setDiskualifikasi(pertandinganId, pertandinganData, nomorJuri) {
        pertandinganData.dewanJuri[nomorJuri].diskualifikasi = true
        await this.setPertandinganData(pertandinganId, pertandinganData);
        return await this.getPertandinganData(pertandinganId);
    }

    getNilaiJurus(juri, nomorJurus) {
        var jurus = _.filter(juri.daftarNilai, function(n) {
            return n.nomorJurus.toString() === nomorJurus.toString()
        })
        var jumlahNilai = jurus[0].jumlahNilai;
        var penguranganJurus = _.filter(juri.pengurangan, function(n) {
            return n.nomorJurus.toString() === nomorJurus.toString()
        })
        _.each(penguranganJurus, function(n) {
            jumlahNilai += n.nilai;
        })
        return jumlahNilai
    }

  
}

module.exports = SeniService
