'use strict'
const TournamentService = use('App/Services/TournamentService')
const KategoriService = use('App/Services/KategoriService');
const KategoriSeni = use('App/Models/KategoriSeni')
const s = use('underscore.string')

class KategoriController {

  constructor() {
    this.tournamentService = new TournamentService
    this.kategoriService = new KategoriService
  }

  async index({ request, view }) {
    const kategoriList = await this.kategoriService.getKategoriList(request.activeTournament.id)
    const kategoriSeniList = await this.kategoriService.getKategoriSeniList(request.activeTournament.id)
    return view.render("kategori.index", { typeList: kategoriList, kategoriSeniList: kategoriSeniList })
  }

  async save({ request, response }) {
    const params = request.only(["nama", "type"]);
    await this.kategoriService.createKategori(params, request.activeTournament.id)
    response.route('KategoriController.index')
  }

  async update({ request, response }) {
    const params = request.only(["id", "nama", "type"]);
    await this.kategoriService.updateKategori(params)
    response.route('KategoriController.index')
  }

  async delete({ request, response }) {
    const params = request.only(["id", "type"]);
    await this.kategoriService.deleteKategori(params)
    response.route('KategoriController.index')
  }

  async createSeni({request, view, response}) {
    return view.render('kategori.create_seni')
  }

  async saveSeni({request, response}) {
    const params = request.only(['nama', 'jenis'])
    const kategori = new KategoriSeni()
    kategori.nama = params.nama
    kategori.jenis = params.jenis
    kategori.tournament_id = request.activeTournament.id
    await kategori.save()
    response.route('KategoriController.index')
  }

  async editSeni({request, view, params}) {
    const kategori = await KategoriSeni.findOrFail(params.id)
    return view.render('kategori.edit_seni', {kategori})
  }

  async updateSeni({request, response}) {
    const params = request.only(['id', 'nama', 'jenis'])
    const kategori = await KategoriSeni.find(params.id)
    kategori.nama = params.nama
    kategori.jenis = params.jenis    
    await kategori.save()
    response.route('KategoriController.index')
  }

  async deleteSeni({response, params}) {
    const kategori = await KategoriSeni.find(params.id)
    await kategori.delete()
    response.route('KategoriController.index')
  }

  async manualUpdateKategori({request, response}) {
    const kategoriList = await KategoriSeni.all()
    var count = 0
    for (var kategori of kategoriList.rows) {
      var jenis;
      
      if (kategori.nama != null && s.include(kategori.nama, "Tunggal")) jenis = "TUNGGAL"
      else if (kategori.nama != null && s.include(kategori.nama, "Ganda")) jenis = "GANDA"
      else if (kategori.nama != null && s.include(kategori.nama, "Regu")) jenis = "REGU"
      
      if (jenis) {
        kategori.jenis = jenis
        await kategori.save()
        count++
      }
    }

    response.json({success: true, count: count})
  }

}

module.exports = KategoriController
