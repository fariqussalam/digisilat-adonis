'use strict'
const _ = require('underscore')
var s = require("underscore.string");

const Tournament = use('App/Models/Tournament')
const Kelas = use('App/Models/Kelas')
const Pertandingan = use('App/Models/Pertandingan')
const PertandinganSeni = use('App/Models/PertandinganSeni')
const Kualifikasi = use('App/Models/Kualifikasi')
const Eliminasi = use('App/Models/Eliminasi')
const Setting = use('App/Models/Setting')
const PesilatService = use('App/Services/PesilatService')
const KategoriSeni = use('App/Models/KategoriSeni')
const Kontingen = use('App/Models/Kontingen')
const PesilatSeni = use('App/Models/PesilatSeni')
const Undian = use('App/Models/Undian')
const UndianService = use('App/Services/UndianService')
const PertandinganService = use('App/Services/PertandinganService')
const Database = use('Database')

class RekapService {

  constructor() {
    this.pesilatService = new PesilatService
    this.undianService = new UndianService
    this.pertandinganService = new PertandinganService
  }

  async getRekapJuara(kelas_id, tournament_id) {
    try{
      const kelas = await Kelas.findOrFail(kelas_id).then(k => k.toJSON())
      const tournament = await Tournament.findOrFail(tournament_id).then(t => t.toJSON())

      const rondeTertinggi = await Database.distinct("ronde").from("pertandingan").where({
          kelas_id: kelas.id,
          tournament_id: tournament_id
      }).orderBy('ronde', 'desc').limit(2)

      if (rondeTertinggi.length < 1) {
        return {}
      }

      let rondeFinal = rondeTertinggi[0], rondeSemiFinal = rondeTertinggi[1]  

      const pertandinganFinalList = await Database.from("pertandingan").where({
        kelas_id: kelas.id,
        tournament_id: tournament_id,
        ronde: rondeFinal.ronde
      })

      const pertandinganSemiFinalList = await Database.from("pertandingan").where({
        kelas_id: kelas.id,
        tournament_id: tournament_id,
        ronde: rondeSemiFinal.ronde
      })

      const juaraList = []
      let juaraMap = {}
      const pertandinganFinal = pertandinganFinalList[0]
      const eliminasiFinal = await Eliminasi.query().where({pertandingan_id: pertandinganFinal.id}).first()
      const merahFinal = await this.pertandinganService.findRootPertandingan(eliminasiFinal.pemenang_a_id)
      const biruFinal = await this.pertandinganService.findRootPertandingan(eliminasiFinal.pemenang_b_id)

      if (merahFinal == null || biruFinal == null) {
        return {}
      }

      if (pertandinganFinal) {
        if (pertandinganFinal.pemenang == "MERAH") {
          juaraList.push({
            nomorJuara: 1,
            pesilat: merahFinal
          })
          juaraList.push({
            nomorJuara: 2,
            pesilat: biruFinal
          })
        } else if (pertandinganFinal.pemenang == "BIRU") {
          juaraList.push({
            nomorJuara: 1,
            pesilat: biruFinal
          })
          juaraList.push({
            nomorJuara: 2,
            pesilat: merahFinal
          })
        }
      }

      const semiFinalis = []
      for (const semiFinal of pertandinganSemiFinalList) {
        const eliminasi = await Eliminasi.query().where({pertandingan_id: semiFinal.id}).first()
        if (eliminasi) {
          const semiFinalisMerah = await this.pertandinganService.findRootPertandingan(eliminasi.pemenang_a_id)
          const semiFinalisBiru = await this.pertandinganService.findRootPertandingan(eliminasi.pemenang_b_id)
          semiFinalis.push(semiFinalisMerah)
          semiFinalis.push(semiFinalisBiru)
        }
      }

      for (const sm of semiFinalis) {
        if (sm.id) {
          if (sm.id != merahFinal.id && sm.id != biruFinal.id)  {
            juaraList.push({
              nomorJuara: 3,
              pesilat: sm
            })
          }
        }
      }

      let juara1 = _.find(juaraList, {nomorJuara: 1})
      let juara2 = _.find(juaraList, {nomorJuara: 2})
      let juara3 = _.where(juaraList, {nomorJuara: 3})
    
      return {
          kelas,
          tournament,
          juaraList,
          juara1, 
          juara2,
          juara3
      }
    }catch(eror) {
      return {}
    }
    
  }

 async getKelasList(tournament_id) {
   const tournament = await Tournament.find(tournament_id)

   const kelasList = await Database.distinct("kelas_id").from("pertandingan").where({tournament_id: tournament.id})
   
   if (kelasList.length > 0) {
    return _.map(kelasList, 'kelas_id')
   } else return []
   
 }

 async getRekapMedali(tournament_id) {
  const tournament = await Tournament.find(tournament_id)
  const kelasList = await Database.distinct("kelas_id").from("pertandingan").where({tournament_id: tournament.id})
  const kontingenList = await Database.select("id", "nama").from("kontingen")
  .where({tournament_id: tournament.id}).orderBy("nama", "asc")

  for (var k of kelasList) {
    const kelas = await Kelas.find(k.kelas_id)
    k.nama = kelas.nama
  }
  let rekapList = {}
  for (var k of kontingenList) {
    rekapList[k.id] = {
      kontingen: k,
      medali: []
    }
  }
  
  for (var k of kelasList) {

    const rekapJuara = await this.getRekapJuara(k.kelas_id, tournament.id)
    if (rekapJuara.juara1) {
      const kontingen_id = rekapJuara.juara1.pesilat.kontingen_id
      
      rekapList[kontingen_id].medali.push({
        jenisMedali: "emas",
        pesilat: {
          id: rekapJuara.juara1.pesilat.id,
          nama: rekapJuara.juara1.pesilat.nama
        },
        kelas: rekapJuara.juara1.pesilat.kelas_id,
      })
    }
    if (rekapJuara.juara2) {
      const kontingen_id = rekapJuara.juara2.pesilat.kontingen_id
      rekapList[kontingen_id].medali.push({
        jenisMedali: "perak",
        pesilat: {
          id: rekapJuara.juara2.pesilat.id,
          nama: rekapJuara.juara2.pesilat.nama,
        },
        kelas: rekapJuara.juara2.pesilat.kelas_id,
      })
    }
    if (rekapJuara.juara3) {
      
      for (var j of rekapJuara.juara3) {
        const kontingen_id = j.pesilat.kontingen_id
        rekapList[kontingen_id].medali.push({
          jenisMedali: "perunggu",
          pesilat: {
            id: j.pesilat.id,
            nama: j.pesilat.nama
          },
          kelas: j.pesilat.kelas_id,
        })
      }
     
    }
  }

  for (var k of kontingenList) {
    rekapList[k.id].jumlah = {
      emas: 0,
      perunggu: 0,
      perak: 0
    }
    const medali = rekapList[k.id].medali
    const group = _.countBy(medali, 'jenisMedali')
    if (group.emas) {
      rekapList[k.id]['jumlah']['emas'] = group.emas
    }
    if (group.perunggu) {
      rekapList[k.id]['jumlah']['perunggu'] = group.perunggu
    }
    if (group.perak) {
      rekapList[k.id]['jumlah']['perak'] = group.perak
    }
    const jumlahPerKelas = {}
    for (var j of kelasList) {
      
      const jumlahKelas = _.where(medali, {kelas: j.kelas_id})
      
      const groupJumlahKelas = _.countBy(jumlahKelas, "jenisMedali")
      
      if (groupJumlahKelas) {
        jumlahPerKelas[j.kelas_id] = groupJumlahKelas
      }
      
    }
    rekapList[k.id].jumlahPerKelas = jumlahPerKelas
  }

  return {
    tournament,
    kelasList,
    kontingenList,
    rekapList
  }
 }
 
}

module.exports = RekapService
