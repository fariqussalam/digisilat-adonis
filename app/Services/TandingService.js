'use strict'
const _ = require('underscore')
const s = require('underscore.string')
const PertandinganService = use('App/Services/PertandinganService')
const Kelas = use('App/Models/Kelas')
const Pertandingan = use('App/Models/Pertandingan')
const Kualifikasi = use('App/Models/Kualifikasi')
const Eliminasi = use('App/Models/Eliminasi')
const PesilatService = use('App/Services/PesilatService')
const Setting = use ('App/Models/Setting')

const template_tunggal = use('App/DTO/pertandingan_seni.json')
const template_ganda = use('App/DTO/pertandingan_ganda.json')

class TandingService {
    constructor() {
        this.pesilatService = new PesilatService
        this.pertandinganService = new PertandinganService
    }

    async getPesertaPertandingan(pertandinganId, jenis) {
        if (jenis == 'KUALIFIKASI') {
            const kualifikasi = await Kualifikasi.query().where({ pertandingan_id: pertandinganId }).first()
            const merah = await this.pesilatService.getPesilatTanding(kualifikasi.merah_id)
            const biru = await this.pesilatService.getPesilatTanding(kualifikasi.biru_id)
            return {
                merah,
                biru
            }
        } else if (jenis == 'ELIMINASI') {
            const eliminasi = await Eliminasi.query().where({pertandingan_id: pertandinganId}).first()
            const merah = await this.pertandinganService.findRootPertandingan(eliminasi.pemenang_a_id)
            const biru = await this.pertandinganService.findRootPertandingan(eliminasi.pemenang_b_id)
            return {
                merah,
                biru
            }
        }
        return {}
    }

    async getPertandinganData(pertandinganId) {
        let dataPertandingan = await Pertandingan.query().where({ id: pertandinganId }).first()

        if (!dataPertandingan) return;

        let objPertandingan = JSON.parse(dataPertandingan.data_pertandingan);
        const peserta = await this.getPesertaPertandingan(pertandinganId, dataPertandingan.jenis)
        objPertandingan.biru = peserta.merah
        objPertandingan.kuning = peserta.biru

        const kelas = await Kelas.find(dataPertandingan.kelas_id)
        objPertandingan.kelas = kelas.toJSON()
        objPertandingan.nomor_partai = dataPertandingan.nomor_partai

        if (dataPertandingan.pemenang) objPertandingan.pemenang = dataPertandingan.pemenang
        if (dataPertandingan.alasan_kemenangan) objPertandingan.alasan_kemenangan = dataPertandingan.alasan_kemenangan
        if (dataPertandingan.skor_biru) objPertandingan.skor_biru = dataPertandingan.skor_biru
        if (dataPertandingan.skor_kuning) objPertandingan.skor_kuning = dataPertandingan.skor_kuning
        if (dataPertandingan.updated_at) objPertandingan.updated_at = dataPertandingan.updated_at

        return objPertandingan;
    }

    async setPertandinganData(pertandinganId, data) {
        let stringData = JSON.stringify(data);
        const pertandingan = await Pertandingan.find(pertandinganId)
        pertandingan.data_pertandingan = stringData
        await pertandingan.save()
        return true
    }

    async inputSkor(pertandinganId, pertandinganData, nomorJuri, nilai) {
        pertandinganData.dewanJuri[nomorJuri].penilaian.push(nilai);
        await this.setPertandinganData(pertandinganId, pertandinganData);
        return pertandinganData;
    }

    async hapusSkor(pertandinganId, pertandinganData, nomorJuri, sudut, ronde) {
        var penilaian = pertandinganData.dewanJuri[nomorJuri].penilaian;
        var lastIndex = _(penilaian).findLastIndex(function (n) {
            return n.ronde === ronde && n.sudut === sudut
        });
        if (lastIndex === -1) return null;
        penilaian.splice(lastIndex, 1);
        pertandinganData.dewanJuri[nomorJuri].penilaian = penilaian;
        await this.setPertandinganData(pertandinganId, pertandinganData);
        return pertandinganData;
    }

    async kontrolRonde({ ronde, pertandinganId }) {
        if (ronde > 3) ronde = 3
        if (ronde < 1) ronde = 1

        const data = await this.getPertandinganData(pertandinganId)
        data.ronde = ronde
        await this.setPertandinganData(pertandinganId, data)
        return data.ronde
    }

    async getPoinPertandingan(pertandingan_id) {
        const pertandingan = await Pertandingan.find(pertandingan_id)
        const dataPertandinganString = pertandingan.data_pertandingan

        let dataPertandinganJson, skor_merah = 0, skor_biru = 0;
        try {
            let listJuri = [1, 2, 3, 4, 5]
            dataPertandinganJson = JSON.parse(dataPertandinganString)
            let jsonDewanJuri = dataPertandinganJson.dewanJuri
            _.each(listJuri, (nomorJuri) => {
                let jsonJuri = jsonDewanJuri[nomorJuri.toString()]
                if (!jsonJuri) return
                let nilaiMerah = _.filter(jsonJuri['penilaian'], (nilai) => {
                    return nilai['sudut'] === "merah"
                })
                let nilaiBiru = _.filter(jsonJuri['penilaian'], (nilai) => {
                    return nilai['sudut'] === "biru"
                })
                let totalNilaiMerah = _.reduce(nilaiMerah, (memo, nilai) => { return memo + nilai['nilai'] }, 0)
                let totalNilaiBiru = _.reduce(nilaiBiru, (memo, nilai) => { return memo + nilai['nilai'] }, 0)
                if (totalNilaiMerah > totalNilaiBiru) {
                    skor_merah = skor_merah + 1
                } else if (totalNilaiBiru > totalNilaiMerah) {
                    skor_biru = skor_biru + 1
                }
            })
        }catch(e) {
            dataPertandinganJson = null
            skor_biru = 0
            skor_merah = 0
        }

        return {
            skor_merah,
            skor_biru
        }
    }

    async getInitDataPertandingan(pertandingan) {
        const initData = await Setting.query().where( { setting_type: 'TEMPLATE_TANDING' } ).first()
        const initDataSetup = await this.setupInitData(pertandingan, initData.setting_value)
        return initDataSetup
    }

    async setupInitData(pertandingan, initData) {
        const jsonPertandingan = JSON.parse(initData)
        jsonPertandingan.merah = {}
        const masterData = await this.pertandinganService.getMasterDataPertandingan(pertandingan.toJSON())
        jsonPertandingan.id = masterData.id
        jsonPertandingan.nomor_partai = masterData.nomor_partai
        jsonPertandingan.ronde = masterData.ronde
        jsonPertandingan.biru = masterData.merah
        jsonPertandingan.kuning = masterData.biru
        jsonPertandingan.kelas = masterData.kelas

        return jsonPertandingan
    }

    async getInfoRonde(tournament_id) {
        const rondeList = await Pertandingan.query().select('ronde').where({tournament_id}).orderBy('ronde', 'desc').distinct("ronde").fetch().then(r => r.toJSON())
        if (!rondeList.length < 1) return null

        var info = {}
        if (rondeList.length >= 2) {
            info.final = rondeList[0].ronde
        }
        if (rondeList.length >= 3) {
            info.semiFinal = rondeList[1].ronde
        }
        info.kualifikasi = rondeList[rondeList.length - 1]
        return info
    }
}

module.exports = TandingService
