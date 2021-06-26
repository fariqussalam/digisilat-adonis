'use strict'
const _ = require('underscore')
const s = require('underscore.string')
const PertandinganService = use('App/Services/PertandinganService')
const PertandinganSeni = use('App/Models/PertandinganSeni')
const Halaman = use('App/Enums/SeniHalaman')

class SeniController {
  constructor() {
    this.pertandinganService = new PertandinganService
  }

  async pool({request, params, response, view}) {
    const tournament = request.activeTournament
    const nomor_pool = params.nomor_pool
    const pertandinganList = await this.pertandinganService.getPertandinganPool(nomor_pool, tournament)

    const pertandinganAktif = _.find(pertandinganList, (el) => { return el.status.name == 'BERJALAN' })

    return view.render('seni.admin', {
      nomor_pool: nomor_pool,
      halaman: Halaman.list,
      pertandinganList: pertandinganList,
      pertandinganAktif: pertandinganAktif
    })
  }

  async halaman({request, params, response, view}) {
    const request_params = request.get()
    const tournament = request.activeTournament
    const pertandingan = await this.pertandinganService.getPertandinganSeniAktif(params.nomor_pool, tournament)
    const tipeSeni = await this.pertandinganService.getTipeSeni(pertandingan.kategori_id)
    const page = `seni.${tipeSeni}.${params.halaman}`

    return view.render(page, {
      nomor_pool: params.nomor_pool,
      pertandingan: pertandingan,
      tournament: tournament,
      request_params: request_params
    })
  }

  async mulaiPertandingan({request, response}) {
    const params = request.only(['id', 'nomor_pool', 'status'])
    const pertandingan = await PertandinganSeni.find(params.id)

    if (!params.status) {
      const otherPertandingan = await PertandinganSeni.query().where({
        nomor_pool: params.nomor_pool
      }).fetch()
      for (let p of otherPertandingan.rows) {
        p.status = "BELUM_DIMULAI"
        await p.save()
      }
      
      pertandingan.status = "BERJALAN"
      await pertandingan.save()
    } else {
      pertandingan.status = params.status
      await pertandingan.save()
    }

    //init data pertandingan
    if (pertandingan.data_pertandingan == null || s.isBlank(pertandingan.data_pertandingan)) {
      // let initDataPertandingan = await this.tandingService.getInitDataPertandinganSeni(pertandingan)
      pertandingan.data_pertandingan = JSON.stringify({})
      await pertandingan.save()
    }

    return response.route('JadwalController.jadwalSeni')
  }

}

module.exports = SeniController
