'use strict'
const _ = require('underscore')
const Undian = use('App/Models/Undian')
const PesertaUndian = use('App/Models/PesertaUndian')
const Kelas = use('App/Models/Kelas')
const Kontingen = use('App/Models/Kontingen')
const KategoriSeni = use('App/Models/KategoriSeni')
const Pesilat = use('App/Models/Pesilat')
const PesilatSeni = use('App/Models/PesilatSeni')

class UndianService {

    async undi({ kategori, type }, tournament) {
        if (type == 'tanding') await this.tanding(kategori, tournament)
        else await this.seni(kategori, tournament)

        return { success: true }
    }

    async tanding(kategori, tournament) {
       const kelas = await Kelas.find(kategori)
       let pesilatList = await Pesilat.query().where({
           kelas_id: kelas.id,
           tournament_id: tournament.id
        }).fetch().then((result) => result.toJSON())
        shuffleArray(pesilatList)
      
        const undian = await Undian.findOrCreate({
            kelas_id: kelas.id,
            tournament_id: tournament.id
        })
        undian.type = 'tanding'
        undian.draw_count = undian.draw_count ? undian.draw_count + 1 : 1
        await undian.save()

        for (let i = 0; i < pesilatList.length; i++) {
            let pesilat = pesilatList[i]
            let pesertaUndian = await PesertaUndian.query().where({
                undian_id: undian.id,
                pesilat_id: pesilat.id
            }).first()
            if (!pesertaUndian) {
                pesertaUndian = new PesertaUndian()
                pesertaUndian.undian_id = undian.id
                pesertaUndian.pesilat_id = pesilat.id
            } 
            pesertaUndian.nomor_undian = i + 1
            await pesertaUndian.save()
        }
      
    }

    async seni(kategori, tournament) {
        const kategoriSeni = await KategoriSeni.find(kategori)
        let pesilatList = await PesilatSeni.query().where({
            kategori_seni_id: kategoriSeni.id,
            tournament_id: tournament.id
         }).fetch().then((result) => result.toJSON())
         shuffleArray(pesilatList)
 
         const undian = await Undian.findOrCreate({
             kategori_seni_id: kategoriSeni.id,
             tournament_id: tournament.id
         })
         undian.type = 'seni'
         undian.draw_count = undian.draw_count ? undian.draw_count + 1 : 1
         await undian.save()
         for (let i = 0; i < pesilatList.length; i++) {
             let pesilat = pesilatList[i]
             let pesertaUndian = await PesertaUndian.query().where({
                undian_id: undian.id,
                pesilat_seni_id: pesilat.id
            }).first()
            if (!pesertaUndian) {
                pesertaUndian = new PesertaUndian()
                pesertaUndian.undian_id = undian.id
                pesertaUndian.pesilat_seni_id = pesilat.id
            } 
            pesertaUndian.nomor_undian = i + 1
            await pesertaUndian.save()
         }
    }

    async collectPesertaUndian(undianId) {
        const undian = await Undian.findOrFail(undianId)
        const pesertaUndian = await PesertaUndian.query().where({ undian_id: undian.id })
        .fetch().then(result => result.toJSON())

        const pesertaList = []
        for (var pu of pesertaUndian) {
            const id = undian.type == 'tanding' ? pu.pesilat_id : pu.pesilat_seni_id
            const pesilat = undian.type == 'tanding' ? await Pesilat.findOrFail(id) : await PesilatSeni.findOrFail(id)
            const kontingen = await Kontingen.find(pesilat.kontingen_id)
            pesertaList.push({
                nomor_undian: pu.nomor_undian,
                nama: pesilat.nama,
                kontingen: kontingen.nama
            })
        }

        return pesertaList
    }
}

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

module.exports = UndianService
