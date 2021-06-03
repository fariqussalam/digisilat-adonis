'use strict'
const Pesilat = use('App/Models/Pesilat')
const PesilatSeni = use('App/Models/PesilatSeni')
const Official = use('App/Models/Official')
const Kelas = use('App/Models/Kelas')
const Kontingen = use('App/Models/Kontingen')
const Jabatan = use('App/Models/Jabatan')
const KategoriSeni = use('App/Models/KategoriSeni')
const PesilatService = use('App/Services/PesilatService')
const KategoriService = use('App/Services/KategoriService')

class PesertaController {

   constructor() {
    this.pesilatService = new PesilatService
    this.kategoriService = new KategoriService
  }

  async tanding({request, view}) {
    const tournament = request.activeTournament
    const pesilatList = await this.pesilatService.getPesilatTandingList(tournament.id)
    return view.render('peserta.tanding', {
      pesilatList
    })
  }

  async seni({request, view}) {
    const tournament = request.activeTournament
    const pesilatList = await this.pesilatService.getPesilatSeniList(tournament.id)
    return view.render('peserta.seni', {
      pesilatList
    })
  }

  async official({request, view}) {
    const tournament = request.activeTournament
    const officialList = await this.pesilatService.getOfficialList(tournament.id)
    return view.render('peserta.official', {
      officialList
    })
  }

  async create({request, params, view}) {
    const tournament = request.activeTournament
    const type = params.type

    const kontingenList = await this.kategoriService.getKategoriListByType("KONTINGEN", tournament.id)
    const kelasList = await this.kategoriService.getKategoriListByType("KELAS", tournament.id)
    const seniList = await this.kategoriService.getKategoriListByType("SENI", tournament.id)
    const jabatanList = await this.kategoriService.getKategoriListByType("JABATAN", tournament.id)

    return view.render('peserta.create', {
      kontingenList,
      kelasList,
      seniList,
      jabatanList,
      type
    })
  }

  async save({request, response}) {
    const tournament = request.activeTournament
    const typeProps = {
      'tanding': ["nama", "kelas", "kontingen"],
      'seni': ["nama", "kategoriSeni", "kontingen"],
      'official': ["nama", "jabatan", "kontingen"],
    }

    const type = request.input('type')
    const params = request.only(typeProps[type])

    if (type == 'tanding') {
      const pesilat = new Pesilat()
      pesilat.nama = params.nama
      pesilat.kontingen_id = params.kontingen
      pesilat.kelas_id = params.kelas
      pesilat.tournament_id = tournament.id
      await pesilat.save()
      return response.route('PesertaController.tanding')
    } else if (type == 'seni') {
      const pesilat = new PesilatSeni()
      pesilat.nama = params.nama
      pesilat.kontingen_id = params.kontingen
      pesilat.kategori_seni_id = params.kategoriSeni
      pesilat.tournament_id = tournament.id
      await pesilat.save()
      return response.route('PesertaController.seni')
    } else {
      const official = new Official()
      official.nama = params.nama
      official.kontingen_id = params.kontingen
      official.jabatan_id = params.jabatan
      official.tournament_id = tournament.id
      await official.save()
      return response.route('PesertaController.official')
    }


  }

  async edit({request, params, view}) {
    const tournament = request.activeTournament
    const type = params.type
    let pesilat

    if (type == 'tanding') {
      pesilat = await Pesilat.find(params.id)
    } else if (type == 'seni') {
      pesilat = await PesilatSeni.find(params.id)
    } else {
      pesilat = await Official.find(params.id)
    }

    const kontingenList = await Kontingen.query().where({tournament_id: tournament.id}).fetch().then((result) => result.toJSON())
    const kelasList = await Kelas.query().where({tournament_id: tournament.id}).fetch().then((result) => result.toJSON())
    const seniList = await KategoriSeni.query().where({tournament_id: tournament.id}).fetch().then((result) => result.toJSON())
    const jabatanList = await Jabatan.query().where({tournament_id: tournament.id}).fetch().then((result) => result.toJSON())

    return view.render('peserta.edit', {
      pesilat,
      kontingenList,
      kelasList,
      seniList,
      jabatanList,
      type
    })
  }

  async update({request, response}) {
    const tournament = request.activeTournament
    const typeProps = {
      'tanding': ["id", "nama", "kelas", "kontingen"],
      'seni': ["id", "nama", "kategoriSeni", "kontingen"],
      'official': ["id", "nama", "jabatan", "kontingen"],
    }

    const type = request.input('type')
    const params = request.only(typeProps[type])
    let pesilat

    if (type == 'tanding') {
      pesilat = await Pesilat.find(params.id)
    } else if (type == 'seni') {
      pesilat = await PesilatSeni.find(params.id)
    } else {
      pesilat = await Official.find(params.id)
    }

    if (type == 'tanding') {
      pesilat.nama = params.nama
      pesilat.kontingen_id = params.kontingen
      pesilat.kelas_id = params.kelas
      pesilat.tournament_id = tournament.id
      await pesilat.save()
      return response.route('PesertaController.tanding')
    } else if (type == 'seni') {
      pesilat.nama = params.nama
      pesilat.kontingen_id = params.kontingen
      pesilat.kategori_seni_id = params.kategoriSeni
      pesilat.tournament_id = tournament.id
      await pesilat.save()
      return response.route('PesertaController.seni')
    } else {
      pesilat.nama = params.nama
      pesilat.kontingen_id = params.kontingen
      pesilat.jabatan_id = params.jabatan
      pesilat.tournament_id = tournament.id
      await pesilat.save()
      return response.route('PesertaController.official')
    }
  }


  async delete({request, response}) {

    const params = request.only(['id', 'type'])
    const type = params.type
    if (type == 'tanding') {
      const pesilat = await Pesilat.find(params.id)
      await pesilat.delete()
      return response.route('PesertaController.tanding')
    } else if (type == 'seni') {
      const pesilat = await PesilatSeni.find(params.id)
      await pesilat.delete()
      return response.route('PesertaController.seni')
    } else {
      const pesilat = await Official.find(params.id)
      await pesilat.delete()
      return response.route('PesertaController.official')
    }
  }

}

module.exports = PesertaController
