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

    async undi({ kategori, type, jumlah_bagan }, tournament) {
        if (type == 'tanding') await this.tanding(kategori, tournament, jumlah_bagan)
        else await this.seni(kategori, tournament, jumlah_bagan)

        return { success: true }
    }

    async tanding(kategori, tournament, jumlah_bagan) {
        if (jumlah_bagan && jumlah_bagan.length > 0) {
            const kelas = await Kelas.find(kategori)
            let idx = 1
            // let idxPeserta = 1
            let pesilatList = await Pesilat.query().where({
                kelas_id: kelas.id,
                tournament_id: tournament.id
            }).fetch().then((result) => result.toJSON())
            shuffleArray(pesilatList)
            for (const jumlah of jumlah_bagan) {
                console.log("start undian untuk bagan " + jumlah)
                const kelasBaru = new Kelas()
                kelasBaru.nama = kelas.nama + " " + idx.toString()
                kelasBaru.tournament_id = tournament.id
                await kelasBaru.save()
                console.log("kelas baru :  ", kelasBaru.id, kelasBaru.nama)
                let jumlahInt = parseInt(jumlah, 10);
                let result = getFirstNAndRemaining(pesilatList, jumlahInt)
                pesilatList = result.remaining
                let anggotaBagan = result.firstN
                // shuffleArray(anggotaBagan)
                const undian = await Undian.findOrCreate({
                    kelas_id: kelasBaru.id,
                    tournament_id: tournament.id
                })

                undian.type = 'tanding'
                undian.draw_count = undian.draw_count ? undian.draw_count + 1 : 1
                await undian.save()

                for (let i = 0; i < anggotaBagan.length; i++) {
                    let pesilat = anggotaBagan[i]
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

                    const newPesilat = await Pesilat.find(pesilat.id)
                    newPesilat.kelas_id = kelasBaru.id
                    await newPesilat.save()

                    // idxPeserta += 1
                }
                idx += 1
            }
        } else {
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
    }

    async seni(kategori, tournament, jumlah_bagan) {
        if (jumlah_bagan && jumlah_bagan.length > 0) {
            const kategoriSeni = await KategoriSeni.find(kategori)
            let idx = 1
            // let idxPeserta = 1
            let pesilatList = await PesilatSeni.query().where({
                kategori_seni_id: kategoriSeni.id,
                tournament_id: tournament.id
            }).fetch().then((result) => result.toJSON())
            shuffleArray(pesilatList)
            for (const jumlah of jumlah_bagan) {
                console.log("start undian untuk bagan " + jumlah)
                const kategoriBaru = new KategoriSeni()
                kategoriBaru.nama = kategoriSeni.nama + " " + idx.toString()
                kategoriBaru.tournament_id = tournament.id
                await kategoriBaru.save()
                console.log("kategori baru :  ", kategoriBaru.id, kategoriBaru.nama)
                let jumlahInt = parseInt(jumlah, 10);
                let result = getFirstNAndRemaining(pesilatList, jumlahInt)
                pesilatList = result.remaining
                let anggotaBagan = result.firstN
                // shuffleArray(anggotaBagan)

                const undian = await Undian.findOrCreate({
                    kategori_seni_id: kategoriBaru.id,
                    tournament_id: tournament.id
                })
                undian.type = 'seni'
                undian.draw_count = undian.draw_count ? undian.draw_count + 1 : 1
                await undian.save()
                for (let i = 0; i < anggotaBagan.length; i++) {
                    let pesilat = anggotaBagan[i]
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

                    const newPesilat = await PesilatSeni.find(pesilat.id)
                    newPesilat.kategori_seni_id = kategoriBaru.id
                    await newPesilat.save()

                    // idxPeserta += 1
                }
                idx += 1
            }
        } else {
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
                pesilat_id: pesilat.id,
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

function getFirstNAndRemaining(arr, n) {
    // Get the first n elements
    let firstN = arr.slice(0, n);

    // Get the remaining elements
    let remaining = arr.slice(n);

    return {
        firstN: firstN,
        remaining: remaining
    };
}

module.exports = UndianService
