'use strict'
const Kelas = use('App/Models/Kelas')
const KategoriSeni = use('App/Models/KategoriSeni')
const Pesilat = use('App/Models/Pesilat')
const Kontingen = use('App/Models/Kontingen')
const Jabatan = use('App/Models/Jabatan')
const PesilatSeni = use('App/Models/PesilatSeni')
const Official = use('App/Models/Official')

class PesilatService {

  async getPesilatTandingList(tournament_id) {
    const pesilatList = []
    const pesilats = await Pesilat.query().where({tournament_id}).fetch().then((result) => {
      return result.toJSON()
    })

    for (let i = 0; i < pesilats.length; i++) {
      let pesilat = pesilats[i];
      const kelas = await Kelas.find(pesilat.kelas_id)
      const kontingen = await Kontingen.find(pesilat.kontingen_id)
      pesilat.kelas = kelas
      pesilat.kontingen = kontingen
      pesilatList.push(pesilat)
    }

    return pesilatList
  }

  async getPesilatSeniList(tournament_id) {
    const pesilatList = []
    const pesilats = await PesilatSeni.query().where({tournament_id}).fetch().then((result) => {
      return result.toJSON()
    })

    for (let i = 0; i < pesilats.length; i++) {
      let pesilat = pesilats[i];
      const kategoriSeni = await KategoriSeni.find(pesilat.kategori_seni_id)
      const kontingen = await Kontingen.find(pesilat.kontingen_id)
      pesilat.kategoriSeni = kategoriSeni
      pesilat.kontingen = kontingen
      pesilatList.push(pesilat)
    }

    return pesilatList
  }

  async getOfficialList(tournament_id) {
    const officialList = []
    const officials = await Official.query().where({tournament_id}).fetch().then((result) => {
      return result.toJSON()
    })

    for (let i = 0; i < officials.length; i++) {
      let official = officials[i];
      const jabatan = await Jabatan.find(official.jabatan_id)
      const kontingen = await Kontingen.find(official.kontingen_id)
      official.jabatan = jabatan
      official.kontingen = kontingen
      officialList.push(official)
    }

    return officialList
  }

  async getPesilatTanding(id) {
    if (!id) return null
    const pesilat = await Pesilat.find(id).then((result) => result ? result.toJSON() : null)
    if (!pesilat) return null

    pesilat.kelas = await Kelas.find(pesilat.kelas_id).then((result) => result ? result.toJSON() : null)
    pesilat.kontingen = await Kontingen.find(pesilat.kontingen_id).then((result) => result.toJSON())

    return pesilat
  }

  async getPesilatSeni(id) {
    if (!id) return null
    const pesilat = await PesilatSeni.find(id).then((result) => result.toJSON())
    if (!pesilat) return null

    pesilat.kategori_seni = await KategoriSeni.find(pesilat.kategori_seni_id).then((result) => result.toJSON())
    pesilat.kontingen = await Kontingen.find(pesilat.kontingen_id).then((result) => result.toJSON())

    return pesilat
  }

  async createPesilat({nama, kontingen_id, kelas_id, tournament_id}) {
    const pesilat = new Pesilat()
    pesilat.nama = nama
    pesilat.kontingen_id = kontingen_id
    pesilat.kelas_id = kelas_id
    pesilat.tournament_id = tournament_id
    await pesilat.save()
  }

  async createPesilatSeni({nama, kontingen_id, kategori_id, tournament_id}) {
    const pesilat = new PesilatSeni()
    pesilat.nama = nama
    pesilat.kontingen_id = kontingen_id
    pesilat.kategori_seni_id = kategori_id
    pesilat.tournament_id = tournament_id
    await pesilat.save()
  }
}

module.exports = PesilatService
