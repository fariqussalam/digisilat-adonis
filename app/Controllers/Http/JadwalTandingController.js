'use strict'
const _ = require('underscore')
const Undian = use('App/Models/Undian')
const PesertaUndian = use('App/Models/PesertaUndian')
const Kelas = use('App/Models/Kelas')
const PertandinganService = use('App/Services/PertandinganService')
const Pertandingan = use('App/Models/Pertandingan')

class JadwalTandingController {
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

  async jadwalTanding({ request, view, response }) {
    const params = request.only(['kelas'])
    const kelas = params.kelas
    const tournament_id = request.activeTournament.id
    const kelasList = await Kelas.query().where({ tournament_id }).fetch().then((result) => result.toJSON())
    const pertandinganList = await this.pertandinganService.getPertandinganList({ kelas: params.kelas }, tournament_id, true)
    const jumlah_gelanggang = request.activeTournament.jumlah_gelanggang

    const gelanggangMap = {}
    if (jumlah_gelanggang > 0) {
      for (let i = 1; i <= jumlah_gelanggang; i++) {
        gelanggangMap[i] = _.where(pertandinganList, { nomor_gelanggang: i })
      }
    }

    const rondePertandinganList = []
    const rondeList = _.sortBy(_.uniq(_.map(pertandinganList, function (p) {return p.ronde})), (num) => num)
    _.each(rondeList, (ronde) => {
      const pertandingans = _.where(pertandinganList, { ronde: ronde })
      rondePertandinganList.push({
        ronde: ronde,
        pertandinganList: pertandingans
      })
    })

    // return response.json(rondePertandinganList)
    return view.render('jadwal.tanding', {
      kelasList,
      kelas,
      rondePertandinganList,
      gelanggangMap
    })
  }

  async updateGelanggang({ request, response }) {
    const params = request.only(['jumlah_gelanggang'])
    if (!params.jumlah_gelanggang) {
      return response.route('JadwalTandingController.jadwalTanding')
    }

    const tournament = await request.activeTournament
    tournament.jumlah_gelanggang = params.jumlah_gelanggang
    await tournament.save()

    response.route('JadwalTandingController.jadwalTanding')
  }

  async updatePartai({ request, response }) {
    const params = request.only(['id', 'nomor_gelanggang', 'nomor_partai'])

    const pertandingan = await Pertandingan.find(params.id)
    pertandingan.nomor_gelanggang = params.nomor_gelanggang
    pertandingan.nomor_partai = params.nomor_partai
    await pertandingan.save()

    response.route('JadwalTandingController.jadwalTanding')
  }

  async resetGelanggang({request, response}) {

    const tournament = await request.activeTournament
    tournament.jumlah_gelanggang = 0
    await tournament.save()

    await Pertandingan.query().where({tournament_id: tournament.id}).update({nomor_gelanggang: null})

    return response.route('JadwalTandingController.jadwalTanding')
  }


}

module.exports = JadwalTandingController
