'use strict'
const TournamentService = use('App/Services/TournamentService');
const KategoriService = use('App/Services/KategoriService');
const Tournament = use('App/Models/Tournament');

class TournamentController {

    constructor() {
        this.tournamentService = new TournamentService
        this.kategoriService = new KategoriService
    }

    async index({ request, view }) {
        const tournamentList = await this.tournamentService.getTournamentList()
        return view.render("tournament.index", { tournamentList })
    }

    async create({ view }) {
        return view.render("tournament.create")
    }

    async save({ request, response }) {
        const params = request.only(["nama", "tempat", "waktu"])
        await this.tournamentService.createTournament(params)

        response.route('TournamentController.index')
    }

    async edit({ request, params,  view }) {
        const tournament = await Tournament.findOrFail(params.id)
        return view.render("tournament.edit", {tournament})
    }

    async update({ request, response }) {
        const params = request.only(["id", "nama", "tempat", "waktu", "url_logo_1", "url_logo_2"])
        if (!params.url_logo_1) {
            params.logo_1 = await this.tournamentService.uploadImage('logo_1', request)
        }
        if (!params.url_logo_2) {
            params.logo_2 = await this.tournamentService.uploadImage('logo_2', request)
        }

        await this.tournamentService.updateTournament(params)
        response.route('TournamentController.index')
    }

    async delete({ request, response }) {
        const params = request.only(["id"])
        await this.tournamentService.deleteTournament(params.id)

        response.route('TournamentController.index')
    }

    async activate({ request, response }) {
        const params = request.only(["id"])
        await this.tournamentService.activateTournament(params.id)

        response.route('TournamentController.index')
    }

}

module.exports = TournamentController
