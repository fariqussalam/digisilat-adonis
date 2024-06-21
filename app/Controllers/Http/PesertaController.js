'use strict'
const _ = require('underscore')
const Pesilat = use('App/Models/Pesilat')
const PesilatSeni = use('App/Models/PesilatSeni')
const Official = use('App/Models/Official')
const Kelas = use('App/Models/Kelas')
const Kontingen = use('App/Models/Kontingen')
const Jabatan = use('App/Models/Jabatan')
const KategoriSeni = use('App/Models/KategoriSeni')
const PesilatService = use('App/Services/PesilatService')
const KategoriService = use('App/Services/KategoriService')
const Helpers = use('Helpers')
const ExcelJS = require('exceljs')

class PesertaController {

  constructor() {
    this.pesilatService = new PesilatService
    this.kategoriService = new KategoriService
  }

  async tanding({ request, view }) {
    const tournament = request.activeTournament
    const pesilatList = await this.pesilatService.getPesilatTandingList(tournament.id)
    return view.render('peserta.tanding', {
      pesilatList
    })
  }

  async seni({ request, view }) {
    const tournament = request.activeTournament
    const pesilatList = await this.pesilatService.getPesilatSeniList(tournament.id)
    return view.render('peserta.seni', {
      pesilatList
    })
  }

  async official({ request, view }) {
    const tournament = request.activeTournament
    const officialList = await this.pesilatService.getOfficialList(tournament.id)
    return view.render('peserta.official', {
      officialList
    })
  }

  async create({ request, params, view }) {
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

  async save({ request, response }) {
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

  async edit({ request, params, view }) {
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

    const kontingenList = await Kontingen.query().where({ tournament_id: tournament.id }).fetch().then((result) => result.toJSON())
    const kelasList = await Kelas.query().where({ tournament_id: tournament.id }).fetch().then((result) => result.toJSON())
    const seniList = await KategoriSeni.query().where({ tournament_id: tournament.id }).fetch().then((result) => result.toJSON())
    const jabatanList = await Jabatan.query().where({ tournament_id: tournament.id }).fetch().then((result) => result.toJSON())

    return view.render('peserta.edit', {
      pesilat,
      kontingenList,
      kelasList,
      seniList,
      jabatanList,
      type
    })
  }

  async update({ request, response }) {
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

  async delete({ request, response }) {
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

  async createGroup({ request, params, view }) {
    const tournament_id = request.activeTournament.id
    const type = params.type
    const kelasList = await this.kategoriService.getKelasList(tournament_id)
    const kontingenList = await this.kategoriService.getKontingenList(tournament_id)

    return view.render('peserta.create-group-tanding.edge', {
      type,
      kelasList,
      kontingenList
    })
  }

  async saveGroup({ request, params, response }) {
    const tournament_id = request.activeTournament.id
    const type = params.type
    const form = request.only(['kontingen', 'nama', 'kelas'])
    const kontingen = await Kontingen.find(form.kontingen)

    if (!kontingen) {
      response.route('PesertaController.createGroup', { type: type })
    }

    const pesertaList = []
    const kelasParams = form.kelas
    const namaParams = form.nama
    _.each(namaParams, (nama, idx) => {
      if (kelasParams[idx] != null) {
        pesertaList.push({
          nama: nama,
          kelas_id: kelasParams[idx]
        })
      }
    })

    _.each(pesertaList, async (p) => {
      await this.pesilatService.createPesilat({
        nama: p.nama,
        kelas_id: p.kelas_id,
        kontingen_id: kontingen.id,
        tournament_id: tournament_id
      })
    })

    response.route('PesertaController.tanding')
  }

  async createSeniGroup({ request, params, view }) {
    const tournament_id = request.activeTournament.id
    const type = params.type
    const kategoriList = await this.kategoriService.getKategoriListByType("SENI", tournament_id)
    const kontingenList = await this.kategoriService.getKontingenList(tournament_id)

    return view.render('peserta.create-group-seni.edge', {
      type,
      kategoriList,
      kontingenList
    })
  }

  async saveSeniGroup({ request, response }) {
    const tournament_id = request.activeTournament.id
    const form = request.only(['kontingen', 'nama', 'kategori'])
    const kontingen = await Kontingen.find(form.kontingen)

    if (!kontingen) {
      response.route('PesertaController.createSeniGroup')
    }

    const pesertaList = []
    const kategoriParams = form.kategori
    const namaParams = form.nama
    _.each(namaParams, (nama, idx) => {
      if (kategoriParams[idx] != null) {
        pesertaList.push({
          nama: nama,
          kategori_id: kategoriParams[idx]
        })
      }
    })

    _.each(pesertaList, async (p) => {
      await this.pesilatService.createPesilatSeni({
        nama: p.nama,
        kategori_id: p.kategori_id,
        kontingen_id: kontingen.id,
        tournament_id: tournament_id
      })
    })

    response.route('PesertaController.seni')
  }

  async tandingImportTemplate({ request, params, view, response }) {
    const filePath = Helpers.publicPath("import_tanding.xlsx")
    response.download(filePath)
  }

  async tandingImport({ request, params, view, response }) {
    return view.render('peserta.tanding-import.edge', {
      type: "tanding"
    })
  }

  async tandingImportSave({ request, params, view, response }) {
    let excelFile = request.file('file')
    const tournament_id = request.activeTournament.id

    await excelFile.move(Helpers.tmpPath('uploads'), {
      name: `data-pesilat-${new Date().getTime()}.${excelFile.subtype}`
    })

    if (!excelFile.moved()) {
      return response.status(500).json({ error: excelFile.error() })
    }

    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(Helpers.tmpPath('uploads') + '/' + excelFile.fileName)

    const worksheet = workbook.getWorksheet(1)

    for (let i = 1; i <= worksheet.rowCount; i++) {
      if (i == 1) {
        continue
      }

      const row = worksheet.getRow(i)

      let nama_idx = 0
      let kelas_idx = 1
      let kontingen_idx = 2

      let values = row.values
      values.shift()

      const kelas = await Kelas.findOrCreate({
        nama: values[kelas_idx],
        tournament_id: tournament_id,
      })

      const kontingen = await Kontingen.findOrCreate({
        nama: values[kontingen_idx],
        tournament_id: tournament_id,
      })

      const pesilat = await Pesilat.findOrCreate({
        nama: values[nama_idx],
        tournament_id: tournament_id,
        kelas_id: kelas.id,
        kontingen_id: kontingen.id,
      })
    }

    response.route('PesertaController.tandingImport')
  }

  async seniImportTemplate({ request, params, view, response }) {
    const filePath = Helpers.publicPath("import_seni.xlsx")
    response.download(filePath)
  }

  async seniImport({ request, params, view, response }) {
    return view.render('peserta.seni-import.edge', {
      type: "seni"
    })
  }

  async seniImportSave({ request, params, view, response }) {
    let excelFile = request.file('file')
    const tournament_id = request.activeTournament.id

    await excelFile.move(Helpers.tmpPath('uploads'), {
      name: `data-pesilat-${new Date().getTime()}.${excelFile.subtype}`
    })

    if (!excelFile.moved()) {
      return response.status(500).json({ error: excelFile.error() })
    }

    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(Helpers.tmpPath('uploads') + '/' + excelFile.fileName)

    const worksheet = workbook.getWorksheet(1)

    for (let i = 1; i <= worksheet.rowCount; i++) {
      if (i == 1) {
        continue
      }

      const row = worksheet.getRow(i)

      let nama_idx = 0
      let kategori_idx = 1
      let kontingen_idx = 2

      let values = row.values
      values.shift()

      const kategori = await KategoriSeni.findOrCreate({
        nama: values[kategori_idx],
        tournament_id: tournament_id,
      })

      const kontingen = await Kontingen.findOrCreate({
        nama: values[kontingen_idx],
        tournament_id: tournament_id,
      })

      const pesilat = await PesilatSeni.findOrCreate({
        nama: values[nama_idx],
        tournament_id: tournament_id,
        kategori_seni_id: kategori.id,
        kontingen_id: kontingen.id,
      })
    }

    response.route('PesertaController.seniImport')
  }

}

module.exports = PesertaController
