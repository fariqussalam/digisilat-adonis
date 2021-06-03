'use strict'
const TournamentService = use('App/Services/TournamentService')
const KategoriService = use('App/Services/KategoriService');

class KategoriController {

  constructor() {
    this.tournamentService = new TournamentService
    this.kategoriService = new KategoriService
  }

  async index({ request, view }) {
    const kategoriList = await this.kategoriService.getKategoriList(request.activeTournament.id)
    return view.render("kategori.index", { typeList: kategoriList })
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

}

module.exports = KategoriController
