'use strict'
const _ = require('underscore')
const Undian = use('App/Models/Undian')
const PesertaUndian = use('App/Models/PesertaUndian')
const Kelas = use('App/Models/Kelas')
const PertandinganService = use('App/Services/PertandinganService')
const Pertandingan = use('App/Models/Pertandingan')
const TandingService = use('App/Services/TandingService')
const RekapService = use('App/Services/RekapService')
const fs = require('fs')
const TemplateHandler = require('easy-template-x').TemplateHandler

class JadwalTandingController {
  constructor() {
    this.pertandinganService = new PertandinganService
    this.tandingService = new TandingService
    this.rekapService = new RekapService
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

    try {
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
    } catch (error) {
      return response.route('TournamentController.index')
    }

    return response.route('JadwalTandingController.jadwalTanding')
  }

  async jadwalTanding({ request, view, response }) {
    await this.tandingService.getInfoRonde(request.activeTournament.id)
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

    await Pertandingan.query().where({tournament_id: tournament.id}).update({nomor_gelanggang: null, status: "BELUM_DIMULAI"})

    return response.route('JadwalTandingController.jadwalTanding')
  }

  async bracketInfo({request, response}) {
    const params = request.only(['kelas'])
    const bracketInfo = await this.pertandinganService.getBracketInfo(params.kelas)
    return response.json(bracketInfo)
  }

  async rekapJuara({request, response, view}) {
    const params = request.only(['kelas'])
    const tournament = request.activeTournament
    const kelasList = await this.rekapService.getKelasList(tournament.id)
    
    let juaraList = []
    
    for (var kelas of kelasList) {
      const k = await Kelas.find(kelas).then(res => res.toJSON())
      const rekapJuara = await this.rekapService.getRekapJuara(kelas, tournament.id)
      juaraList.push({
        kelas: k,
        rekapJuara: rekapJuara
      })
    }
    
    return view.render('rekap.rekap-juara', {
      kelasList: kelasList,
      tournament_id: tournament.id,
      tournament: tournament,
      juaraList : _.sortBy(juaraList, m => {m.kelas.nama})
    })
  }

  async rekapMedali({request, view, response}) {
    const tournament = request.activeTournament
    const rekapMedali = await this.rekapService.getRekapMedali(tournament.id)
    // return response.json(rekapMedali)

    return view.render('rekap.rekap-medali', {
      tournament: tournament,
      rekapMedali: rekapMedali
    })
  }

  async cetakSemuaJadwal({request, view, response}) {
    const param = request.only(['kelas'])
    console.log(param)
    const pertandinganList = await this.pertandinganService.getPertandinganList(
      {kelas: param.kelas},
      request.activeTournament.id, true
    )

    console.log(pertandinganList.length)
    let filteredList = pertandinganList.filter(p => p.nomor_partai != null && p.nomor_gelanggang != null)    
    let orderedList = _.map(filteredList, (p) => {
      let dto =  {
        id: p.id,
        ronde: p.ronde,
        kelas: p.kelas.nama,
        jenis: p.jenis,
        nomor_partai: p.nomor_partai,
        kelas_id: p.kelas.id,
        nomor_gelanggang: p.nomor_gelanggang
      }

      dto.merah_nama = p.merah ? p.merah.nama : '-'
      dto.merah_kontingen = p.merah ? p.merah.kontingen.nama : '-'
      dto.biru_nama = p.biru ? p.biru.nama : '-'
      dto.biru_kontingen = p.biru ? p.biru.kontingen.nama : '-'
        
      return dto
    })
    orderedList = _.sortBy(orderedList, 'ronde')
    orderedList = _.sortBy(orderedList, 'nomor_gelanggang')
    orderedList = _.sortBy(orderedList, 'nomor_partai')
    orderedList = _.sortBy(orderedList, 'kelas_id')

    console.log(orderedList.length)

    const templateFile = fs.readFileSync('templates/template-gelanggang-list-all.docx');
    const handler = new TemplateHandler();
    const doc = await handler.process(templateFile, {
      pertandinganList: orderedList
    });
    
    const filename = 'jadwal-tanding-' + new Date().getTime() + '.docx';
    response.response.setHeader('Content-disposition', 'attachment; filename=' + filename);
    response.type('application/octet-stream')
    response.send(doc)
  }

} 

module.exports = JadwalTandingController
