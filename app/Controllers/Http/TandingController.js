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

    return response.route('JadwalTandingController.jadwalTanding')
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

    let dontOverride = true
    if (params.halaman == "display") {
      dontOverride = false
    }
    return view.render(page, {
      nomor_gelanggang: params.nomor_gelanggang,
      pertandingan: pertandingan,
      tournament: tournament,
      request_params: request_params,
      current_url: request.url(),
      dontOverride: dontOverride
    })
  }

  async pengumumanPemenang({request, response, view}) {
    const params = request.only(['pertandingan_id', 'sudut', 'alasan', 'skor_merah', 'skor_biru'])
    const pertandingan = await Pertandingan.findOrFail(params.pertandingan_id)
    const alasanKemenangan = params.alasan.toLowerCase()
    pertandingan.pemenang = params.sudut.toUpperCase()
    pertandingan.alasan_kemenangan = params.alasan
    pertandingan.tanggal_pertandingan = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")

    try {
      const poinMerah = params.skor_merah
      const poinBiru = params.skor_biru
      pertandingan.skor_merah = parseInt(poinMerah)
      pertandingan.skor_biru = parseInt(poinBiru)
    } catch (e) {
      pertandingan.skor_merah = null
      pertandingan.skor_biru = null
    }

    await pertandingan.save()
    
    return response.json({success: true})
  }

  async pengumumanPemenangBaru({request, response, view}) {
  const {url, pertandingan_id, sudut, alasan_kemenangan, poin_biru, poin_kuning} = request.all() 
  const pertandingan = await Pertandingan.findOrFail(pertandingan_id)
    const alasanKemenangan = alasan_kemenangan.toLowerCase()
    pertandingan.pemenang = sudut.toUpperCase()
    pertandingan.alasan_kemenangan = alasan_kemenangan
    pertandingan.tanggal_pertandingan = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")

    if (alasanKemenangan == 'menang angka') {
      try {
        pertandingan.skor_merah = parseInt(poin_biru)
        pertandingan.skor_biru = parseInt(poin_kuning)

        let keys_seri = _.pick(request.all(), (value, key, obj) => key.includes('pemenang_juri_'))
        if (keys_seri) {
          
          let hasil_seri = []
          _.mapObject(keys_seri, function(val, key) {
            let nomor_juri = key.split("_")[2];
            hasil_seri.push({
              nomor_juri: nomor_juri,
              pemenang: val
            })
            return null
          })
  
          const data_pertandingan = JSON.parse(pertandingan.data_pertandingan)
          data_pertandingan.hasil_seri = hasil_seri
          pertandingan.data_pertandingan = JSON.stringify(data_pertandingan)
        }
      } catch (e) {
        console.log(e.message)
      }
    } else {
      if (sudut.toUpperCase() == "BIRU") {
        pertandingan.skor_merah = 1
        pertandingan.skor_biru = 0
      } else if (sudut.toUpperCase() == "KUNING") {
        pertandingan.skor_merah = 0
        pertandingan.skor_biru = 1
      }
    }
    
    await pertandingan.save()
    // console.log(pertandingan.toJSON())
    
    response.redirect(url)
    return
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
