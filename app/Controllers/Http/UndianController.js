'use strict'

const ExcelJS = require('exceljs')
const dayjs = require('dayjs')
const _ = require('underscore')
const Undian = use('App/Models/Undian')
const Pesilat = use('App/Models/Pesilat')
const PesilatSeni = use('App/Models/PesilatSeni')
const Kelas = use('App/Models/Kelas')
const KategoriSeni = use('App/Models/KategoriSeni')
const Kontingen = use('App/Models/Kontingen')
const Setting = use('App/Models/Setting')
const PesertaUndian = use('App/Models/PesertaUndian')
const UndianService = use('App/Services/UndianService')
const Tournament = use('App/Models/Tournament')

class UndianController {
    constructor() {
        this.undianService = new UndianService()
    }

    async tanding({ request, view }) {
        const params = request.only(['kelas'])
        const viewData = {}
        const kelas = params.kelas
        const tournament = request.activeTournament
        const kelasList = await Kelas.query().where({ tournament_id: tournament.id }).fetch().then(result => result.toJSON())

        if (!params.kelas) return view.render('undian.tanding', { kelasList: kelasList })

        var pesilatList = await Pesilat.query().where({ tournament_id: tournament.id, kelas_id: kelas }).fetch().then(result => result.toJSON())
        for (var pesilat of pesilatList) {
            pesilat.kelas = await Kelas.find(pesilat.kelas_id)
            pesilat.kontingen = await Kontingen.find(pesilat.kontingen_id)
        }
        const pesilatNamaList = _.pluck(pesilatList, 'nama')
        const undian = await Undian.query().where({ kelas_id: kelas, tournament_id: tournament.id }).first()
        const jumlahPeserta = pesilatList ? pesilatList.length : null

        viewData.kelasList = kelasList
        viewData.kelas = kelas
        viewData.pesilatList = pesilatList
        viewData.undian = undian
        viewData.pesilatNamaList = pesilatNamaList
        viewData.jumlahPeserta = jumlahPeserta

        if (!undian) return view.render('undian.tanding', viewData)

        const pesertaUndian = await PesertaUndian.query().where({ undian_id: undian.id }).fetch().then(result => result.toJSON())
        const pesertaMap = {}
        for (let i = 0; i < pesertaUndian.length; i++) {
            let peserta = pesertaUndian[i]
            pesertaMap[peserta.pesilat_id] = peserta.nomor_undian
        }

        if (pesertaMap) {
            for (let pesilat of pesilatList) {
                let nomor_undian = pesertaMap[pesilat.id]
                pesilat.nomor_undian = nomor_undian ? nomor_undian : '-'
            }
        }

        const templateBagan = await Setting.findBy('setting_type', 'TEMPLATE_BAGAN')
        viewData.templateBagan = templateBagan.setting_value

        return view.render('undian.tanding', viewData)
    }

    async seni({ request, view }) {
        const params = request.only(['kategori'])
        const kategori = params.kategori
        const viewData = {}
        const tournament = request.activeTournament
        const kategoriSeniList = await KategoriSeni.query()
            .where({ tournament_id: tournament.id })
            .fetch()
            .then(result => result.toJSON())
        viewData.kategoriSeniList = kategoriSeniList

        if (!kategori) return view.render('undian.seni', viewData)

        let pesilatList = await PesilatSeni.query()
            .where({
                tournament_id: tournament.id,
                kategori_seni_id: kategori
            })
            .fetch()
            .then(result => {
                return result.toJSON()
            })

        for (let pesilat of pesilatList) {
            pesilat.kategoriSeni = await KategoriSeni.find(pesilat.kategori_seni_id)
            pesilat.kontingen = await Kontingen.find(pesilat.kontingen_id)
        }

        const pesilatNamaList = _.pluck(pesilatList, 'nama')
        const undian = await Undian.query()
            .where({
                kategori_seni_id: kategori,
                tournament_id: tournament.id
            })
            .first()
        const jumlahPeserta = pesilatList ? pesilatList.length : null

        viewData.kategori = kategori
        viewData.pesilatList = pesilatList
        viewData.undian = undian
        viewData.pesilatNamaList = pesilatNamaList
        viewData.jumlahPeserta = jumlahPeserta

        if (!undian) return view.render('undian.seni', viewData)

        const pesertaUndian = await PesertaUndian.query()
            .where({ undian_id: undian.id })
            .fetch()
            .then(result => result.toJSON())
        const pesertaMap = {}
        for (let i = 0; i < pesertaUndian.length; i++) {
            let peserta = pesertaUndian[i]
            pesertaMap[peserta.pesilat_seni_id] = peserta.nomor_undian
        }
        if (pesertaMap) {
            for (let pesilat of pesilatList) {
                let nomor_undian = pesertaMap[pesilat.id]
                pesilat.nomor_undian = nomor_undian ? nomor_undian : '-'
            }
        }

        const templateBagan = await Setting.findBy('setting_type', 'TEMPLATE_BAGAN')
        viewData.templateBagan = templateBagan.setting_value

        return view.render('undian.seni', viewData)
    }

    async undi({ request, response }) {
        const params = request.only(['kategori', 'type'])
        await this.undianService.undi(params, request.activeTournament)
        response.route('UndianController.tanding')
    }

    async undiBaru({ request, response }) {
        const params = request.only(['kategori', 'type', 'jumlah_bagan'])
        // console.log("params adalah", params)
        await this.undianService.undi(params, request.activeTournament)
        response.route('UndianController.tanding')
    }

    async bagan({ view }) {
        const templateBagan = await Setting.findBy('setting_type', 'TEMPLATE_BAGAN')
        return view.render('undian.bagan', { templateBagan: templateBagan.setting_value })
    }

    async exportExcel({ request, response }) {
        console.log('Starting Export For Undian With Kelas ID :', request.only(['id']))

        const { id } = request.only(['id'])
        const undian = await Undian.find(id)
        const kelas = await Kelas.find(undian.kelas_id)
        const turnamen = await Tournament.find(undian.tournament_id)
        const pesertaList = await this.undianService.collectPesertaUndian(id)
        const jumlahPeserta = pesertaList.length

        const workbook = new ExcelJS.Workbook()
        const filename = 'templates/template-bagan-digisilat.xlsx'
        await workbook.xlsx.readFile(filename)

        const nameSheet = 'D_' + jumlahPeserta
        const baganSheet = 'B_' + jumlahPeserta
        const sheet = workbook.getWorksheet(nameSheet)
        if (!sheet) {
            console.log('No Sheet Found')
            return null
        }

        console.log(`Writing Data Start For Bagan ${kelas.nama}. Exporting...`)
        sheet.eachRow(function (row, rowNumber) {
            if (rowNumber > 2) {
                const nomor_undian = row.getCell('A').value
                const pesilat = _.find(pesertaList, p => p.nomor_undian == nomor_undian)
                row.getCell('B').value = pesilat.nama
                row.getCell('C').value = pesilat.kontingen
            }
        })

        let deleted = []
        workbook.eachSheet(function (worksheet, sheetId) {
            if (worksheet.name != nameSheet && worksheet.name != baganSheet) {
                deleted.push(sheetId)
            }
        })

        for (var d of deleted) {
            workbook.removeWorksheet(d)
        }

        console.log("Writing Data Done. Exporting...")
        const timestamp = dayjs().format('YYYYMMDDHHmmss')
        let exportedFilename = `exported/Bagan-${turnamen.nama}-${kelas.nama}-${timestamp}.xlsx`
        await workbook.xlsx.writeFile(exportedFilename)
        console.log(`File Exported ${exportedFilename}`)

        return response.json({
            filename: exportedFilename
        })
    }

    async kunciUndian({ request, response }) {
        const params = request.get()

        const undian = await Undian.findOrFail(params.id)
        if (undian) {
            undian.is_locked = true
            await undian.save()
        }

        if (params.tipe == 'tanding') {
            response.redirect('/undian/tanding?kelas=' + undian.kelas_id)
        } else {
            response.redirect('/undian/seni?kategori=' + undian.kategori_seni_id)
        }
    }
}

module.exports = UndianController
