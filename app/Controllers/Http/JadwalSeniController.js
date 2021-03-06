'use strict'
const _ = require('underscore')
const Undian = use('App/Models/Undian')
const PesertaUndian = use('App/Models/PesertaUndian')
const KategoriSeni = use('App/Models/KategoriSeni')
const PertandinganService = use('App/Services/PertandinganService')
const PertandinganSeni = use('App/Models/PertandinganSeni')
const PertandinganStatus = use('App/Enums/PertandinganStatus')
const Tournament = use('App/Models/Tournament')
const fs = require('fs')
const TemplateHandler = require('easy-template-x').TemplateHandler

class JadwalSeniController {
  constructor () {
    this.pertandinganService = new PertandinganService()
  }

  async generateJadwalSeni ({ request, params, response }) {
    console.log('Generate Jadwal Seni Action')
    const tournament = request.activeTournament
    if (tournament.jadwal_seni_generated) {
      return response.route('/')
    }

    const undianList = await Undian.query()
      .where({
        tournament_id: tournament.id,
        type: 'seni'
      })
      .fetch()
      .then(result => result.toJSON())

    try {
      console.log(
        'Generating undian seni for undianList of : ',
        undianList.length
      )
      for (const undian of undianList) {
        const kategoriSeni = await KategoriSeni.findOrFail(
          undian.kategori_seni_id
        )
        const pesertaUndianList = await PesertaUndian.query()
          .where({ undian_id: undian.id })
          .fetch()
          .then(result => result.toJSON())

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
      console.log('Finish generating undian seni')

      //update tournament
      const tourney = await Tournament.find(tournament.id)
      tourney.jadwal_seni_generated = true
      await tourney.save()
    } catch (error) {
      return response.route('TournamentController.index')
    }

    return response.route('JadwalSeniController.jadwalSeni')
  }

  async jadwalSeni ({ request, view, response }) {
    const params = request.only(['kategori'])
    const kategori = params.kategori
    const tournament_id = request.activeTournament.id
    const kategoriList = await KategoriSeni.query()
      .where({ tournament_id })
      .fetch()
      .then(result => result.toJSON())
    const pertandinganList = await this.pertandinganService.getPertandinganSeniList(
      { kategori: params.kategori },
      tournament_id
    )
    const jumlah_pool = request.activeTournament.jumlah_pool

    const poolMap = {}
    if (jumlah_pool > 0) {
      for (let i = 1; i <= jumlah_pool; i++) {
        poolMap[i] = _.where(pertandinganList, { nomor_pool: i })
      }
    }

    return view.render('jadwal.seni', {
      kategoriList,
      pertandinganList,
      kategori,
      poolMap
    })
  }

  async updatePool ({ request, response }) {
    const params = request.only(['jumlah_pool'])
    if (!params.jumlah_pool) {
      return response.route('JadwalSeniController.jadwalSeni')
    }

    const tournament = await request.activeTournament
    tournament.jumlah_pool = params.jumlah_pool
    await tournament.save()

    response.route('JadwalSeniController.jadwalSeni')
  }

  async updatePartaiSeni ({ request, response }) {
    const params = request.only(['id', 'nomor_pool', 'nomor_penampil'])
    const pertandinganSeni = await PertandinganSeni.find(params.id)
    pertandinganSeni.nomor_pool = params.nomor_pool
    pertandinganSeni.nomor_penampil = params.nomor_penampil
    await pertandinganSeni.save()

    response.route('JadwalSeniController.jadwalSeni')
  }

  async resetPool ({ request, response }) {
    const tournament = await request.activeTournament
    tournament.jumlah_pool = 0
    await tournament.save()
    await PertandinganSeni.query()
      .where({ tournament_id: tournament.id })
      .update({ nomor_pool: null })
    return response.route('JadwalSeniController.jadwalSeni')
  }


  async resetNomorPenampil ({ request, response }) {
    const tournament = await request.activeTournament
    await PertandinganSeni.query()
        .where({ tournament_id: tournament.id })
        .update({ nomor_penampil: null })
    return response.route('JadwalSeniController.jadwalSeni')
  }

  async cetakJadwal({ request, params, response}) {
    const param = request.only(['kategori'])
    const pertandinganList = await this.pertandinganService.getPertandinganSeniList(
      {kategori: param.kategori, nomor_pool: params.nomor_pool},
      request.activeTournament.id
    )

    let orderedList = _.map(pertandinganList, (p) => {
      return {
        id: p.id,
        kategori: p.kategori.nama,
        kontingen: p.kontingen.nama,
        nomor_penampil: p.nomor_penampil,
        pesilat: p.pesilat.nama,
        kategori_id: p.kategori.id
      }
    })
    orderedList = _.sortBy(orderedList, 'nomor_penampil')
    orderedList = _.sortBy(orderedList, 'kategori_id')

    const templateFile = fs.readFileSync('templates/template-pool-list.docx');
    const handler = new TemplateHandler();
    const doc = await handler.process(templateFile, {
      nomor_pool: params.nomor_pool,
      pertandinganList: orderedList
    });
    
    response.response.setHeader('Content-disposition', 'attachment; filename=' + 'pool-' + params.nomor_pool + '.docx');
    response.type('application/octet-stream')
    response.send(doc)
  }

  async cetakSemuaJadwal({ request, params, response}) {
    const param = request.only(['kategori'])
    const pertandinganList = await this.pertandinganService.getPertandinganSeniList(
      {kategori: param.kategori, nomor_pool: "not_null"},
      request.activeTournament.id
    )

    let orderedList = _.map(pertandinganList, (p) => {
      return {
        id: p.id,
        kategori: p.kategori.nama,
        kontingen: p.kontingen.nama,
        nomor_penampil: p.nomor_penampil,
        pesilat: p.pesilat.nama,
        kategori_id: p.kategori.id,
        nomor_pool: p.nomor_pool
      }
    })
    orderedList = _.sortBy(orderedList, 'nomor_penampil')
    orderedList = _.sortBy(orderedList, 'nomor_pool')
    orderedList = _.sortBy(orderedList, 'kategori_id')

    const poolMap = _.groupBy(orderedList, 'nomor_pool')
    console.log(poolMap)
    const poolList = []
    _.each(_.keys(poolMap), function(k, idx) {
      let pertandinganList = poolMap[k]
      poolList.push({
        idx: idx + 1,
        pertandinganList: pertandinganList,
        nomor_pool: k
      })
    })

    const templateFile = fs.readFileSync('templates/template-pool-list.docx');
    const handler = new TemplateHandler();
    const doc = await handler.process(templateFile, {
      pool: poolList
    });
    
    response.response.setHeader('Content-disposition', 'attachment; filename=' + 'jadwal-seni.docx');
    response.type('application/octet-stream')
    response.send(doc)
  }

  async lihatJadwal({ request, params, view, response}) {
    const pertandinganList = await this.pertandinganService.getPertandinganSeniList(
      {nomor_pool: params.nomor_pool},
      request.activeTournament.id
    )

    let orderedList = _.map(pertandinganList, (p) => {
      return {
        id: p.id,
        kategori: p.kategori.nama,
        kontingen: p.kontingen.nama,
        nomor_penampil: p.nomor_penampil,
        pesilat: p.pesilat.nama,
        kategori_id: p.kategori.id
      }
    })
    orderedList = _.sortBy(orderedList, 'nomor_penampil')
    orderedList = _.sortBy(orderedList, 'kategori_id')
    return view.render('seni.jadwal', {
      nomor_pool: params.nomor_pool,
      pertandinganList: orderedList
    })

  }
}

module.exports = JadwalSeniController
