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
const PesilatService = use('App/Services/PesilatService')
const Setting = use ('App/Models/Setting')

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
        }
        return {}
    }

    async getPertandinganData(pertandinganId) {
        let dataPertandingan = await Pertandingan.query().where({ id: pertandinganId }).first()

        if (!dataPertandingan) return;

        let objPertandingan = JSON.parse(dataPertandingan.data_pertandingan);
        const peserta = await this.getPesertaPertandingan(pertandinganId, dataPertandingan.jenis)
        objPertandingan.merah = peserta.merah
        objPertandingan.biru = peserta.biru

        const kelas = await Kelas.find(dataPertandingan.kelas_id)
        objPertandingan.kelas = kelas.toJSON()
        objPertandingan.nomor_partai = dataPertandingan.nomor_partai

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
        return await this.getPertandinganData(pertandinganId);
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
        return await this.getPertandinganData(pertandinganId);
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
        return {
            skor_merah: 5,
            skor_biru: 0
        }
    }

    async getInitDataPertandingan(pertandingan) {
        const initData = await Setting.query().where( { setting_type: 'TEMPLATE_TANDING' } ).first()
        const initDataSetup = await this.setupInitData(pertandingan, initData.setting_value)
        return initDataSetup
    }

    async setupInitData(pertandingan, initData) {
        const jsonPertandingan = JSON.parse(initData)
        const masterData = await this.pertandinganService.getMasterDataPertandingan(pertandingan.toJSON())
        jsonPertandingan.id = masterData.id
        jsonPertandingan.nomor_partai = masterData.nomor_partai
        jsonPertandingan.ronde = masterData.ronde
        jsonPertandingan.merah = masterData.merah
        jsonPertandingan.biru = masterData.biru
        jsonPertandingan.kelas = masterData.kelas

        return jsonPertandingan
    }
}

module.exports = TandingService
