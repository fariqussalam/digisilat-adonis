'use strict'
const Kontingen = use('App/Models/Kontingen')
const Kelas = use('App/Models/Kelas')
const KategoriSeni = use('App/Models/KategoriSeni')
const Jabatan = use('App/Models/Jabatan')

class KategoriService {

  async createKategori({nama, type}, tournament_id) {
    const Kategori = await this.getKategoriFactory(type)
    const kategori = new Kategori()
    kategori.tournament_id = tournament_id
    kategori.nama = nama
    await kategori.save()
  }

  async updateKategori({id, nama, type}) {
    const Kategori = await this.getKategoriFactory(type)
    const kategori = await Kategori.findOrFail(id)
    kategori.merge({nama: nama})
    await kategori.save()
  }

  async deleteKategori({ id, type }) {
    const Kategori = await this.getKategoriFactory(type)
    const kategori = await Kategori.findOrFail(id)
    await kategori.delete()
  }

  async getKategoriList(tournament_id) {
    const kategoriTypes = await this.getKategoriTypes()
    for (let type of kategoriTypes) {
      type.list = await this.getKategoriListByType(type.type, tournament_id)
    }
    return kategoriTypes
  }

  async getKategoriListByType(type, tournament_id) {
    const Kategori = await this.getKategoriFactory(type)
    return await Kategori.query().where(
      {tournament_id: tournament_id}
    ).fetch().then((list) => {
      return list.toJSON()
    })
  }

  async getKategoriFactory(type) {
    const KategoriFactory = {
      "KONTINGEN": Kontingen,
      "KELAS": Kelas,
      "SENI": KategoriSeni,
      "JABATAN": Jabatan
    }
    return KategoriFactory[type]
  }

  async getKategoriTypes() {
    return [
      {
        type: "KONTINGEN",
        name: "Kontingen",
      },
      {
        type: "KELAS",
        name: "Kelas"
      },
      {
        type: "SENI",
        name: "Kategori Seni"
      },
      {
        type: "JABATAN",
        name: "Jabatan"
      }
    ]
  }
}

module.exports = KategoriService
