'use strict'
const _ = require('underscore')
const s = require('underscore.string')
const PertandinganService = use('App/Services/PertandinganService')
const KategoriSeni = use('App/Models/KategoriSeni')
const PesilatService = use('App/Services/PesilatService')
const PertandinganSeni = use('App/Models/PertandinganSeni')
const moment = require('moment')

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
        data_pertandingan.tanggal_pertandingan = pertandingan.tanggal_pertandingan

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

    async setPengumumanSkor(pertandinganId) {
        var data_pertandingan = await this.getPertandinganData(pertandinganId)
        if (!data_pertandingan) return null

        var skor_seni = this.getSkorSeni(data_pertandingan)
        data_pertandingan.skor_akhir = skor_seni
        
        await this.setPertandinganData(pertandinganId, data_pertandingan)
        const pertandingan = await PertandinganSeni.find(pertandinganId)
        pertandingan.skor_akhir = skor_seni.totalNilai
        pertandingan.tanggal_pertandingan = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
        await pertandingan.save()
        return await this.getPertandinganData(pertandinganId);
    }

    getMaxOfArray(numArray) {
        return Math.max.apply(null, numArray);
    }
    getMinOfArray(numArray) {
        return Math.min.apply(null, numArray);
    }

    getJuriMax(dewanJuri) {
        var totalNilaiArray = []
        for (var i = 1; i <= 5; i++) {
            totalNilaiArray.push(this.getTotalNilai(dewanJuri[i.toString()]));
        }
        var totalNilai = this.getMaxOfArray(totalNilaiArray);
        var juriMax;
        for (var x = 1; x <= 5; x++) {
            var nilai = this.getTotalNilai(dewanJuri[x.toString()]);
            if (totalNilai === nilai) {
                juriMax = dewanJuri[x.toString()];
                return juriMax;
            }
        }
    }

    getJuriMin(excluded, dewanJuri) {
        var totalNilaiArray = []
        for (var i = 1; i <= 5; i++) {
            totalNilaiArray.push(this.getTotalNilai(dewanJuri[i.toString()]));
        }
        var totalNilai = this.getMinOfArray(totalNilaiArray);
        var juriMin;
        for (var x = 1; x <= 5; x++) {
            var isExcluded = excluded != null && excluded.nomorJuri === dewanJuri[x.toString()].nomorJuri
            if (!isExcluded) {
                var nilai = this.getTotalNilai(dewanJuri[x.toString()]);
                if (totalNilai === nilai) {
                    juriMin = dewanJuri[x.toString()];
                    return juriMin;
                }
            }
        }
    }

    getSkorSeni(data_pertandingan) {
        var dewanJuri = data_pertandingan.dewanJuri
        var juriMax = this.getJuriMax(dewanJuri);
        var juriMin = this.getJuriMin(juriMax, dewanJuri);
        var totalNilai = 0
        for (var i = 1; i <= 5; i++) {
            totalNilai += this.getTotalNilai(dewanJuri[i.toString()])
        }
        var nilaiTeratas = this.getTotalNilai(juriMax);
        var nilaiTerendah = this.getTotalNilai(juriMin);
        totalNilai = totalNilai - this.getTotalNilai(juriMax);
        totalNilai = totalNilai - this.getTotalNilai(juriMin);

        return {
            juriTeratas: juriMax,
            juriTerendah: juriMin,
            totalNilai: totalNilai,
            nilaiTeratas: nilaiTeratas,
            nilaiTerendah: nilaiTerendah
        }
    }

    getTotalNilaiJurus(juri) {
        var instance = this
        var totalNilai = 0;
        _.each(juri.daftarNilai, function(jurus) {
            totalNilai += instance.getNilaiJurus(juri, jurus.nomorJurus);
        })
        return totalNilai
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

    getTotalNilaiHukuman(juri) {
        var nilaiHukuman = 0
        _.each(juri.hukuman, function(n) {
            nilaiHukuman += n.nilai
        })
        return nilaiHukuman;
    }

    getTotalNilai(juri) {
      
        var totalNilaiJurus = this.getTotalNilaiJurus(juri)
        var totalNilaiHukuman = this.getTotalNilaiHukuman(juri)
        return totalNilaiJurus + totalNilaiHukuman + juri.kemantapan
    }

  
}

module.exports = SeniService
