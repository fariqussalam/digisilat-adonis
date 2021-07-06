'use strict'
const _ = require('underscore')
const Tournament = use('App/Models/Tournament')
const short = require('short-uuid')
const Helpers = use('Helpers')
const Database = use('Database')

class TournamentService {
  async getTournamentList () {
    return await Tournament.all().then(res => res.toJSON())
  }

  async createTournament ({ nama, tempat, waktu }) {
    const tournament = new Tournament()
    tournament.nama = nama
    tournament.tempat = tempat
    tournament.waktu = waktu
    await tournament.save()
  }

  async updateTournament ({ id, nama, tempat, waktu, logo_1, logo_2 }) {
    const tournament = await Tournament.findOrFail(id)
    tournament.nama = nama
    tournament.tempat = tempat
    tournament.waktu = waktu
    tournament.logo_1 = logo_1
    tournament.logo_2 = logo_2
    await tournament.save()
  }

  async deleteTournament (id) {
    const tournament = await Tournament.findOrFail(id)
    if (tournament) await tournament.delete()
  }

  async activateTournament (id) {
    await Tournament.query().update({ is_active: false })
    const tournament = await Tournament.findOrFail(id)
    tournament.is_active = true
    await tournament.save()
  }

  async uploadImage (name, request) {
    const publicPath = Helpers.publicPath()
    const image = request.file(name, {
      types: ['image'],
      size: '10mb'
    })
    if (!image) return null

    let uuid = short()
      .new()
      .substring(0, 12)
    const fileName = uuid + '-' + image.clientName
    await image.move(publicPath + '/uploads', {
      name: fileName,
      overwrite: true
    })

    if (!image.moved()) {
      console.log(image.error())
      return null
    }

    return '/uploads/' + fileName
  }

  getKategoriTypes () {
    const typeList = [
      {
        type: 'KONTINGEN',
        name: 'Kontingen'
      },
      {
        type: 'KELAS',
        name: 'Kelas'
      },
      {
        type: 'SENI',
        name: 'Kategori Seni'
      },
      {
        type: 'JABATAN',
        name: 'Jabatan'
      }
    ]
    return typeList
  }

  mapKategori (types, typeList) {
    for (let type of types) {
      type.list = typeList[type.type]
    }

    return types
  }

  async deleteTournamentData (tournament_id) {
    const tournament = await Tournament.find(tournament_id)
    const tableList = [
      'pertandingan',
      'pertandingan_seni',
      'undian',
      'pesilat_seni',
      'pesilat',
      'officials',
      'kontingen',
      'jabatan',
      'kelas',
      'kategori_seni'
    ]

    _.each(tableList, async table => {
      await Database.table(table)
        .where('tournament_id', tournament.id)
        .del()
    })
  }
}

module.exports = TournamentService
