'use strict'
const _ = require('underscore')
const s = require('underscore.string')
const moment = require('moment')
const puppeteer = require('puppeteer')
const PertandinganService = use('App/Services/PertandinganService')
const TandingService = use('App/Services/TandingService')
const Pertandingan = use('App/Models/Pertandingan')
const Halaman = use('App/Enums/TandingHalaman')

class TandingController {
  constructor() {
    this.pertandinganService = new PertandinganService
    this.tandingService = new TandingService
  }

  async mulaiPertandingan({request, response}) {
    const params = request.only(['id', 'nomor_gelanggang', 'status'])
    const pertandingan = await Pertandingan.find(params.id)

    if (!params.status) {
      const otherPertandingan = await Pertandingan.query().where({
        nomor_gelanggang: params.nomor_gelanggang,
        status: "BERJALAN"
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
      let initDataPertandingan = await this.tandingService.getInitDataPertandingan(pertandingan)
      pertandingan.data_pertandingan = JSON.stringify(initDataPertandingan)
      await pertandingan.save()
    }

    return response.route('JadwalController.jadwalTanding')
  }

  async gelanggang({request, params, response, view}) {
    const tournament = request.activeTournament
    const nomor_gelanggang = params.nomor_gelanggang
    const pertandinganList = await this.pertandinganService.getPertandinganGelanggang(nomor_gelanggang, tournament)

    const pertandinganAktif = _.find(pertandinganList, (el) => {
      return el.status.name == 'BERJALAN'
    })

    return view.render('tanding.admin', {
      nomor_gelanggang: nomor_gelanggang,
      halaman: Halaman.list,
      pertandinganList: pertandinganList,
      pertandinganAktif: pertandinganAktif
    })
  }

  async halaman({request, params, response, view}) {
    const request_params = request.get()
    const tournament = request.activeTournament
    const pertandingan = await this.pertandinganService.getPertandinganAktif(params.nomor_gelanggang, tournament)
    const page = `tanding.${params.halaman}`

    return view.render(page, {
      nomor_gelanggang: params.nomor_gelanggang,
      pertandingan: pertandingan,
      tournament: tournament,
      request_params: request_params,
      current_url: request.url()
    })
  }

  async pengumumanPemenang({request, response, view}) {
    const params = request.only(['pertandingan_id', 'sudut', 'alasan', 'skor_merah', 'skor_biru'])
    const pertandingan = await Pertandingan.findOrFail(params.pertandingan_id)
    const alasanKemenangan = params.alasan.toLowerCase()
    pertandingan.pemenang = params.sudut.toUpperCase()
    pertandingan.alasan_kemenangan = params.alasan
    pertandingan.tanggal_pertandingan = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
    // pertandingan.status = "SELESAI"

    try {
      const poinMerah = params.skor_merah
      const poinBiru = params.skor_biru
      pertandingan.skor_merah = parseInt(poinMerah)
      pertandingan.skor_biru = parseInt(poinBiru)
    } catch (e) {
      pertandingan.skor_merah = null
      pertandingan.skor_biru = null
    }

    if (alasanKemenangan === 'menang angka') {
      // const poin = await this.tandingService.getPoinPertandingan(pertandingan.id)
      // console.log(poin)
      // if (poin) {
      //   pertandingan.skor_merah = poin.skor_merah
      //   pertandingan.skor_biru = poin.skor_biru
      // }
    }
    await pertandingan.save()

    return response.json({success: true})
  }

  async exportToPdf({request, response, view}) {
    const params = request.only(['printed_url'])
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1645, height: 868 });
    await page.goto(params.printed_url, {waitUntil: 'networkidle2'});
    const pdf = await page.pdf({ printBackground: true, landscape: true, scale: 0.6 });
    await browser.close();
    response.type('application/octet-stream')
    response.send(pdf)
  }

}

module.exports = TandingController
