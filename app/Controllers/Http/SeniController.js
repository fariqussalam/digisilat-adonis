'use strict'
const _ = require('underscore')
const s = require('underscore.string')
const moment = require('moment')
const PertandinganService = use('App/Services/PertandinganService')
const Pertandingan = use('App/Models/Pertandingan')

const SeniHalaman = {
  "DEWAN": {
    name: "DEWAN",
    label: "Dewan Pertandingan"
  },
  "DISPLAY": {
    name: "DISPLAY",
    label: "Display Pertandingan"
  },
  "JURI": {
    name: "JURI",
    label: "Juri Pertandingan"
  },
  "TIMER": {
    name: "TIMER",
    label: "Timer Pertandingan"
  },
}
const SeniHalamanList = _.values(SeniHalaman)
const Halaman = {
  map: SeniHalaman,
  list: SeniHalamanList
}

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
    const page = `seni.${params.halaman}`

    return view.render(page, {
      nomor_pool: params.nomor_pool,
      pertandingan: pertandingan,
      tournament: tournament,
      request_params: request_params
    })
  }

}

module.exports = SeniController
