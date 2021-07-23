'use strict'
const s = require('underscore.string')
const _ = require('underscore')
const Database = use('Database')
const TournamentService = use('App/Services/TournamentService');
const KategoriService = use('App/Services/KategoriService');
const Tournament = use('App/Models/Tournament');
const Kontingen = use('App/Models/Kontingen');
const Kelas = use('App/Models/Kelas');
const KategoriSeni = use('App/Models/KategoriSeni');
const Pesilat = use('App/Models/Pesilat');
const PesilatSeni = use('App/Models/PesilatSeni');
const seed_data = use('App/DTO/seed_data.json');

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
       
        try {
            await this.tournamentService.deleteTournamentData(params.id)
            await this.tournamentService.deleteTournament(params.id)
        } catch (error) {
            console.log(error)
        }
        response.route('TournamentController.index')
    }

    async activate({ request, response }) {
        const params = request.only(["id"])
        await this.tournamentService.activateTournament(params.id)

        response.route('TournamentController.index')
    }

    async seed({request, params, response}) {
        const tournament = await Tournament.find(params.id)
        if (!tournament || !seed_data) {
            return response.route('TournamentController.index')
        }

        const kontingenList = _.map(seed_data.kontingen, (kontingen) => {
            return {tournament_id: tournament.id, nama: kontingen}
        })
        const kelasList = _.map(seed_data.kelas, (kelas) => {
            return {tournament_id: tournament.id, nama: kelas}
        })
        const seniList = _.map(seed_data.kategori_seni, (kat) => {
            let jenis;
            if (s.include(kat, "tunggal")) {
                jenis = "TUNGGAL"
            } else if (s.include(kat, "ganda")) {
                jenis = "GANDA"
            } else if (s.include(kat, "regu")) {
                jenis = "REGU"
            }
            return {tournament_id: tournament.id, nama: kat, jenis: jenis}
        })

     
        const trx = await Database.beginTransaction()
        try {
            await Kontingen.createMany(kontingenList, trx)
            await Kelas.createMany(kelasList, trx)
            await KategoriSeni.createMany(seniList, trx)
            trx.commit()
    
            _.each(seed_data.peserta, async (p) => {
                const kontingen = await Kontingen.query().where({tournament_id: tournament.id, nama: p.kontingen}).first()
                const kelas = await Kelas.query().where({tournament_id: tournament.id, nama: p.kelas}).first()
                if (kontingen && kelas) {
                    const pesilat = new Pesilat()
                    pesilat.nama = p.nama
                    pesilat.kelas_id = kelas.id
                    pesilat.kontingen_id = kontingen.id
                    pesilat.tournament_id = tournament.id
                    await pesilat.save()
                }            
            })
    
            _.each(seed_data.peserta_seni, async (p) => {
                const kontingen = await Kontingen.query().where({tournament_id: tournament.id, nama: p.kontingen}).first()
                const kategori_seni = await KategoriSeni.query().where({tournament_id: tournament.id, nama: p.kategori_seni}).first()
                if (kontingen && kategori_seni) {
                    const pesilat = new PesilatSeni()
                    pesilat.nama = p.nama
                    pesilat.kategori_seni_id = kategori_seni.id
                    pesilat.kontingen_id = kontingen.id
                    pesilat.tournament_id = tournament.id
                    await pesilat.save()
                }            
            })
           
        } catch (error) {
            console.log("Error Seed", e)
            trx.rollback()
        }
      

        return response.json({success: true})
    }

    async deleteData({request, response}) {
        const params = request.only(['id'])

        try {
            await this.tournamentService.deleteTournamentData(params.id)
            return response.json({success: true})
        } catch (error) {
            return response.json({success: false})    
        }
    }

}

module.exports = TournamentController
