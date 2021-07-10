'use strict'
const _ = require('underscore')
const s = require('underscore.string')
const PertandinganService = use('App/Services/PertandinganService')
const KategoriSeni = use('App/Models/KategoriSeni')
const PesilatService = use('App/Services/PesilatService')
const PertandinganSeni = use('App/Models/PertandinganSeni')
const moment = require('moment')

const template_tunggal = use('App/DTO/pertandingan_seni.json')
const template_ganda = use('App/DTO/pertandingan_ganda.json')
const template_regu = use('App/DTO/pertandingan_regu.json')

class SeniService {
    constructor() {
        this.pesilatService = new PesilatService
        this.pertandinganService = new PertandinganService
    }

    async getPertandinganData(id) {
        var pertandingan = await PertandinganSeni.find(id)
        if (!pertandingan) return null

        var data_pertandingan = JSON.parse(pertandingan.data_pertandingan)
        const pesilat = await this.pesilatService.getPesilatSeni(pertandingan.pesilat_seni_id)
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

    async getInitDataPertandinganSeni(pertandingan) {
        const tipeSeni = await this.pertandinganService.getTipeSeni(pertandingan.kategori_id)
        var init_data
        if (tipeSeni == 'tunggal') init_data = template_tunggal
        else if (tipeSeni == 'ganda') init_data = template_ganda
        else if (tipeSeni == 'regu') init_data = template_regu

        const master_data = await this.pertandinganService.getMasterDataPertandinganSeni(pertandingan.toJSON())
        master_data.dewanJuri = init_data.dewanJuri

        if (tipeSeni == 'tunggal') {
            for (var juri in master_data.dewanJuri) {
                master_data.dewanJuri[juri].daftarNilai = this.nilaiTunggalTemplate()
            }
        }

        if (tipeSeni == 'regu') {
            for (var juri in master_data.dewanJuri) {
                master_data.dewanJuri[juri].daftarNilai = this.nilaiReguTemplate()
            }
        }
     
        return master_data
    }

    nilaiTunggalTemplate() {
        var daftarNilai = [
            7, 6, 5, 7, 6, 8, 11, 7, 6, 12, 6, 5, 5, 9
        ]
        var jurusTunggal = []
        for (var i = 0; i < daftarNilai.length; i++) {
            jurusTunggal.push({
                nomorJurus: i+1,
                jumlahNilai: daftarNilai[i]
            })
        }
        return jurusTunggal
    }

    nilaiReguTemplate() {
        var daftarNilai = [
            9, 9, 10, 9, 7, 8, 9, 11, 9, 4, 8, 7
        ]
        var jurusTunggal = []
        for (var i = 0; i < daftarNilai.length; i++) {
            jurusTunggal.push({
                nomorJurus: i+1,
                jumlahNilai: daftarNilai[i]
            })
        }
        return jurusTunggal
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

    async setPengumumanSkor(pertandinganId, type) {
        if (type == 'tunggal') {
            return await this.setPengumumanSkorTunggal(pertandinganId)
        } else if (type == 'ganda') {
            return await this.setPengumumanSkorGanda(pertandinganId)
        } else if (type == 'regu') {
            return await this.setPengumumanSkorRegu(pertandinganId)
        }
        return null
    }

    async setPengumumanSkorTunggal(pertandinganId, type) {
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

    async setPengumumanSkorRegu(pertandinganId, type) {
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

    async setPengumumanSkorGanda(pertandinganId, type) {
        var data_pertandingan = await this.getPertandinganData(pertandinganId)
        if (!data_pertandingan) return null

        var skor_seni = this.getSkorGanda(data_pertandingan)
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

    /*
    Ganda
     */
    async inputSkorGanda(pertandinganId, pertandinganData, nomorJuri, nilai, kategoriNilai) {
        if (kategoriNilai == 'teknik-serang-bela') {
            pertandinganData.dewanJuri[nomorJuri].nilaiSerangBela = nilai
        } else if (kategoriNilai == 'kekompakan') {
            pertandinganData.dewanJuri[nomorJuri].nilaiKemantapan = nilai
        } else if (kategoriNilai == 'penghayatan') {
            pertandinganData.dewanJuri[nomorJuri].nilaiPenghayatan = nilai
        }
        
        await this.setPertandinganData(pertandinganId, pertandinganData);
        return await this.getPertandinganData(pertandinganId);
    }

    async inputSkorHukumanGanda(pertandinganId, pertandinganData, nomorJuri, kategori) {
        try {
            pertandinganData.dewanJuri[nomorJuri].nilaiHukuman[kategori] +=1
            await this.setPertandinganData(pertandinganId, pertandinganData);
        }catch(e){
            console.log(e)
        }
        return await this.getPertandinganData(pertandinganId);
    }

    async hapusHukumanGanda(pertandinganId, pertandinganData, nomorJuri) {
        try {
            for (var jenisHukuman in pertandinganData.dewanJuri[nomorJuri].nilaiHukuman) {
                pertandinganData.dewanJuri[nomorJuri].nilaiHukuman[jenisHukuman] = 0
            }
            await this.setPertandinganData(pertandinganId, pertandinganData);
        }catch(e){
            console.log(e)
        }
        return await this.getPertandinganData(pertandinganId);
    }

    getSkorGanda(data_pertandingan) {
        var dewanJuri = data_pertandingan.dewanJuri
        var juriMax = this.getJuriMaxGanda(dewanJuri);
        var juriMin = this.getJuriMinGanda(juriMax, dewanJuri);
        var totalNilai = 0
        for (var i = 1; i <= 5; i++) {
            totalNilai += this.getTotalNilaiGanda(dewanJuri[i.toString()])
        }
        var nilaiTeratas = this.getTotalNilaiGanda(juriMax);
        var nilaiTerendah = this.getTotalNilaiGanda(juriMin);
        totalNilai = totalNilai - this.getTotalNilaiGanda(juriMax);
        totalNilai = totalNilai - this.getTotalNilaiGanda(juriMin);

        return {
            juriTeratas: juriMax,
            juriTerendah: juriMin,
            totalNilai: totalNilai,
            nilaiTeratas: nilaiTeratas,
            nilaiTerendah: nilaiTerendah
        }
    }

    getTotalNilaiGanda(juri) {
        var totalNilaiHukuman = this.hitungNilaiHukuman(juri.nilaiHukuman)
        return juri.nilaiSerangBela + juri.nilaiKemantapan + juri.nilaiPenghayatan - totalNilaiHukuman
    }

    hitungNilaiHukuman(nilaiHukuman) {
        var total = 0;
        _.each(nilaiHukuman, function(jumlah, nama) {
            var nilai = nama === "w-10" ? 10 : 5;
            var jumlahNilai = jumlah * nilai;
            total += jumlahNilai;
        })
        return total;
    }

    getJuriMaxGanda(dewanJuri) {
        var totalNilaiArray = []
        for (var i = 1; i <= 5; i++) {
            totalNilaiArray.push(this.getTotalNilaiGanda(dewanJuri[i.toString()]));
        }
        var totalNilai = this.getMaxOfArray(totalNilaiArray);
        var juriMax;
        for (var x = 1; x <= 5; x++) {
            var nilai = this.getTotalNilaiGanda(dewanJuri[x.toString()]);
            if (totalNilai === nilai) {
                juriMax = dewanJuri[x.toString()];
                return juriMax;
            }
        }
    }

    getJuriMinGanda(excluded, dewanJuri) {
        var totalNilaiArray = []
        for (var i = 1; i <= 5; i++) {
            totalNilaiArray.push(this.getTotalNilaiGanda(dewanJuri[i.toString()]));
        }
        var totalNilai = this.getMinOfArray(totalNilaiArray);
        var juriMin;
        for (var x = 1; x <= 5; x++) {
            var isExcluded = excluded != null && excluded.nomorJuri === dewanJuri[x.toString()].nomorJuri
            if (!isExcluded) {
                var nilai = this.getTotalNilaiGanda(dewanJuri[x.toString()]);
                if (totalNilai === nilai) {
                    juriMin = dewanJuri[x.toString()];
                    return juriMin;
                }
            }
        }
    }

  
}

module.exports = SeniService
