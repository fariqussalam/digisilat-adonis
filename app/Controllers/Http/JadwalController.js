'use strict'
const _ = require('underscore')
const Undian = use('App/Models/Undian')
const PesertaUndian = use('App/Models/PesertaUndian')
const Kelas = use('App/Models/Kelas')
const KategoriSeni = use('App/Models/KategoriSeni')
const PertandinganService = use('App/Services/PertandinganService')
const Pertandingan = use('App/Models/Pertandingan')
const PertandinganSeni = use('App/Models/PertandinganSeni')
const PertandinganStatus = use('App/Enums/PertandinganStatus')
const Tournament = use('App/Models/Tournament')

class JadwalController {
  constructor() {
    this.pertandinganService = new PertandinganService
  }

  async generateJadwal({ request, params, response }) {

    const tournament = request.activeTournament
    if (tournament.jadwal_generated) {
      return response.route('/')
    }

    let undianList = []
    const kelasList = await Kelas.query().where({
      tournament_id: tournament.id
    }).fetch().then((result) => result.toJSON())

    for (let i = 0; i < kelasList.length; i++) {
      const kelas = kelasList[i];
      let undian = await Undian.query().where({
        kelas_id: kelas.id,
        tournament_id: tournament.id
      }).first()

      if (undian) {
        let jsonUndian = undian.toJSON()
        let pesertaUndian = await PesertaUndian.query().where({ undian_id: undian.id }).fetch().then(result => result.toJSON())
        let undianMap = {}
        for (let i = 0; i < pesertaUndian.length; i++) {
          let peserta = pesertaUndian[i];
          undianMap[peserta.pesilat_id] = peserta.nomor_undian;
        }
        jsonUndian.peserta = undianMap
        jsonUndian.jumlahPeserta = _.size(pesertaUndian)
        undianList.push(jsonUndian)
      }
    }

    const resp = []

    for (let i = 0; i < undianList.length; i++) {
      const undian = undianList[i]
      const pertandinganList = await this.pertandinganService.generateJadwal({ undian: undian }, tournament)
      resp.push({
        undian,
        pertandinganList
      })
    }

    response.json({ resp })
  }

  async generateJadwalSeni({ request, params, response }) {
    console.log("Generate Jadwal Seni Action")
    const tournament = request.activeTournament
    if (tournament.jadwal_seni_generated) {
      return response.route('/')
    }

    const undianList = await Undian.query().where({
      tournament_id: tournament.id,
      type: "seni"
    }).fetch().then((result) => result.toJSON())


    console.log("Generating undian seni for undianList of : ", undianList.length)
    for (const undian of undianList) {
      const kategoriSeni = await KategoriSeni.findOrFail(undian.kategori_seni_id)
      const pesertaUndianList = await PesertaUndian.query().where({ undian_id: undian.id }).fetch().then(result => result.toJSON())

      for (const pesertaUndian of pesertaUndianList) {
        let pertandinganSeni = new PertandinganSeni()
        pertandinganSeni.status = PertandinganStatus.BELUM_DIMULAI
        pertandinganSeni.tournament_id = tournament.id
        pertandinganSeni.kategori_id = kategoriSeni.id
        pertandinganSeni.peserta_undian_id = pesertaUndian.id
        pertandinganSeni.nomor_penampil = pesertaUndian.nomor_undian
        pertandinganSeni.pesilat_seni_id = pesertaUndian.pesilat_seni_id
        await pertandinganSeni.save()
      }
    }
    console.log("Finish generating undian seni")

    //update tournament
    const tourney = await Tournament.find(tournament.id)
    tourney.jadwal_seni_generated = true
    await tourney.save()


    response.json({ ok: "ok" })
  }

  async jadwalTanding({ request, view, response }) {
    const params = request.only(['kelas'])
    const kelas = params.kelas
    const tournament_id = request.activeTournament.id
    const kelasList = await Kelas.query().where({ tournament_id }).fetch().then((result) => result.toJSON())
    const pertandinganList = await this.pertandinganService.getPertandinganList({ kelas: params.kelas }, tournament_id)
    const jumlah_gelanggang = request.activeTournament.jumlah_gelanggang

    const gelanggangMap = {}
    if (jumlah_gelanggang > 0) {
      for (let i = 1; i <= jumlah_gelanggang; i++) {
        gelanggangMap[i] = _.where(pertandinganList, { nomor_gelanggang: i })
      }
    }

    // return response.json(pertandinganList)
    return view.render('jadwal.tanding', {
      kelasList,
      pertandinganList,
      kelas,
      gelanggangMap
    })
  }

  async jadwalSeni({ request, view, response }) {
    const params = request.only(['kategori'])
    const kategori = params.kategori
    const tournament_id = request.activeTournament.id
    const kategoriList = await KategoriSeni.query().where({ tournament_id }).fetch().then((result) => result.toJSON())
    const pertandinganList = await this.pertandinganService.getPertandinganSeniList({ kategori: params.kategori }, tournament_id)
    const jumlah_pool = request.activeTournament.jumlah_pool

    const poolMap = {}
    if (jumlah_pool > 0) {
      for (let i = 1; i <= jumlah_pool; i++) {
        poolMap[i] = _.where(pertandinganList, { nomor_pool: i })
      }
    }

    // return response.json(pertandinganList)
    return view.render('jadwal.seni', {
      kategoriList,
      pertandinganList,
      kategori,
      poolMap
    })
  }

  async updateGelanggang({ request, response }) {
    const params = request.only(['jumlah_gelanggang'])
    if (!params.jumlah_gelanggang) {
      return response.route('JadwalController.jadwalTanding')
    }

    const tournament = await request.activeTournament
    tournament.jumlah_gelanggang = params.jumlah_gelanggang
    await tournament.save()

    response.route('JadwalController.jadwalTanding')
  }

  async updatePool({ request, response }) {
    const params = request.only(['jumlah_pool'])
    if (!params.jumlah_pool) {
      return response.route('JadwalController.jumlah_pool')
    }

    const tournament = await request.activeTournament
    tournament.jumlah_pool = params.jumlah_pool
    await tournament.save()

    response.route('JadwalController.jadwalSeni')
  }

  async updatePartai({ request, response }) {
    const params = request.only(['id', 'nomor_gelanggang', 'nomor_partai'])

    const pertandingan = await Pertandingan.find(params.id)
    pertandingan.nomor_gelanggang = params.nomor_gelanggang
    pertandingan.nomor_partai = params.nomor_partai
    await pertandingan.save()

    response.route('JadwalController.jadwalTanding')
  }

  async resetGelanggang({request, response}) {

    const tournament = await request.activeTournament
    tournament.jumlah_gelanggang = 0
    await tournament.save()

    await Pertandingan.query().where({tournament_id: tournament.id}).update({nomor_gelanggang: null})

    return response.route('JadwalController.jadwalTanding')
  }

  async resetPool({request, response}) {

    const tournament = await request.activeTournament
    tournament.jumlah_pool = 0
    await tournament.save()

    await PertandinganSeni.query().where({tournament_id: tournament.id}).update({nomor_pool: null})

    return response.route('JadwalController.jadwalSeni')
  }

}

module.exports = JadwalController
