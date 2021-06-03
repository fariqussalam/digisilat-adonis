'use strict'
const _ = require('underscore')

const Tournament = use('App/Models/Tournament')
const Kelas = use('App/Models/Kelas')
const Pertandingan = use('App/Models/Pertandingan')
const PertandinganSeni = use('App/Models/PertandinganSeni')
const Kualifikasi = use('App/Models/Kualifikasi')
const Eliminasi = use('App/Models/Eliminasi')
const Setting = use('App/Models/Setting')
const PesilatService = use('App/Services/PesilatService')
const KategoriSeni = use('App/Models/KategoriSeni')
const Kontingen = use('App/Models/Kontingen')
const PesilatSeni = use('App/Models/PesilatSeni')

class PertandinganService {

  constructor() {
    this.pesilatService = new PesilatService
  }

  async generateJadwal({ undian }, tournament) {
    const bagan = await this.getTemplateBagan(undian.jumlahPeserta);
    const mappedMatchups = await this.mapMatchups(undian, bagan);
    const kelas = await Kelas.find(undian.kelas_id)

    let sisaPeserta = undian.jumlahPeserta
    let ronde = 1
    let matchups = mappedMatchups
    const pertandinganList = []
    while (sisaPeserta > 1) {
      matchups = await this.createMatchups(matchups, ronde, tournament, kelas)
      for (const m of matchups) {
        pertandinganList.push(m)
      }
      sisaPeserta = matchups.length
      matchups = _.chunk(matchups, 2)
      ronde++;
    }

    console.log(`Finished Generating : ${pertandinganList.length} Pertandingan`)
    const t = await Tournament.find(tournament.id)
    t.jadwal_generated = true
    await t.save()
    return pertandinganList
  }

  async getTemplateBagan(jumlahPeserta) {
    if (!jumlahPeserta) return null;

    let templateBaganSetting = await Setting.findBy('setting_type', 'TEMPLATE_BAGAN')
    let templateBagan = JSON.parse(templateBaganSetting.setting_value)
    let bagan = templateBagan.brackets[jumlahPeserta]

    return {
      jumlahPeserta: bagan.jumlah,
      matchups: bagan.data.teams
    }
  }

  async getPertandinganList({kelas, nomor_gelanggang}, tournament_id) {
    const queryParams = {tournament_id}
    if (kelas != "all" && kelas != null) {
      queryParams.kelas_id = kelas
    }
    if (nomor_gelanggang) {
      queryParams.nomor_gelanggang = nomor_gelanggang
    }

    const responseList = []
    const pertandinganList = await Pertandingan.query().where(queryParams).fetch().then((result) => result.toJSON())
    for (let p of pertandinganList){
      const resp = await this.prosesPertandingan(p)
      if (resp) {
        resp.kelas = await Kelas.find(p.kelas_id)
        resp.status = await this.getPertandinganStatus(p.status)
        responseList.push(resp)
      }
    }

    return responseList
  }

  async getPertandinganSeniList({kategori, nomor_pool}, tournament_id) {
    const queryParams = {tournament_id}
    if (kategori != "all" && kategori != null) {
      queryParams.kategori_id = kategori
    }
    if (nomor_pool) {
      queryParams.nomor_pool = nomor_pool
    }

    const responseList = []
    const pertandinganList = await PertandinganSeni.query().where(queryParams).fetch().then((result) => result.toJSON())
    for (const pertandingan of pertandinganList) {
      const resp = await this.prosesPertandinganSeni(pertandingan)
      if (resp) {
        responseList.push(resp)
      }
    }
    return pertandinganList
  }

  async prosesPertandinganSeni(pertandingan) {
    pertandingan.status = await this.getPertandinganStatus(pertandingan.status)
    pertandingan.kategori = await KategoriSeni.findOrFail(pertandingan.kategori_id)
    pertandingan.pesilat = await PesilatSeni.find(pertandingan.pesilat_seni_id)
    pertandingan.kontingen = await Kontingen.find(pertandingan.pesilat.kontingen_id)
    return pertandingan
  }

  async prosesPertandingan(pertandingan) {
    if (pertandingan.jenis == 'KUALIFIKASI') {
      const kualifikasi = await Kualifikasi.query().where({pertandingan_id: pertandingan.id}).first()
      if (!kualifikasi) return null
      if (!kualifikasi.merah_id && !kualifikasi.biru_id) return null

      if (kualifikasi.merah_id == null) pertandingan.merah = "BYE"
      if (kualifikasi.biru_id == null) pertandingan.biru = "BYE"
      pertandingan.merah = await this.pesilatService.getPesilatTanding(kualifikasi.merah_id)
      pertandingan.biru = await this.pesilatService.getPesilatTanding(kualifikasi.biru_id)
      return pertandingan
    } else if (pertandingan.jenis == 'ELIMINASI') {
      const eliminasi = await Eliminasi.query().where({pertandingan_id: pertandingan.id}).first()
      if (!eliminasi) return null

      // console.log(`pertandingan id : ${pertandingan.id}`)
      // console.log(`a id : ${eliminasi.pemenang_a_id}`)
      // console.log(`b id : ${eliminasi.pemenang_b_id}`)
      const merah = await this.findRootPertandingan(eliminasi.pemenang_a_id)
      const biru = await this.findRootPertandingan(eliminasi.pemenang_b_id)

      if (!merah || !biru) {
        return null
      }

      pertandingan.merah = merah
      pertandingan.biru = biru
      return pertandingan
    }
  }

  async findRootPertandingan(pertandingan_id) {
    const pertandingan = await Pertandingan.find(pertandingan_id)
    if (!pertandingan) return null

    if (pertandingan.jenis == "ELIMINASI") {
      const eliminasi = await Eliminasi.query().where({pertandingan_id: pertandingan.id}).first()
      if (!eliminasi) return null
      if (!eliminasi.pemenang_a_id || !eliminasi.pemenang_b_id) return null

      if (pertandingan.pemenang == "MERAH") {
        return await this.findRootPertandingan(eliminasi.pemenang_a_id)
      } else if (pertandingan.pemenang == "BIRU") {
        return await this.findRootPertandingan(eliminasi.pemenang_b_id)
      }

    } else {
      const kualifikasi = await Kualifikasi.query().where({pertandingan_id: pertandingan.id}).first()
      if (!kualifikasi) return null
      if (!kualifikasi.merah_id || !kualifikasi.biru_id) return null

      if (pertandingan.pemenang == "MERAH") {
        return await this.pesilatService.getPesilatTanding(kualifikasi.merah_id)
      } else if (pertandingan.pemenang == "BIRU") {
        return await this.pesilatService.getPesilatTanding(kualifikasi.biru_id)
      }

    }
    return null

  }

  async getPertandinganStatus(status) {
    const pertandinganStatus = {
      "BELUM_DIMULAI": {
        name: "BELUM_DIMULAI",
        value: "Belum Dimulai"
      },
      "BERJALAN": {
        name: "BERJALAN",
        value: "Sedang Berjalan"
      },
      "SELESAI": {
        name: "SELESAI",
        value: "Selesai"
      }
    }

    return pertandinganStatus[status]
  }

  async getPertandinganGelanggang(nomor_gelanggang, tournament) {
    const pertandinganList = await this.getPertandinganList({nomor_gelanggang}, tournament.id)
    return pertandinganList
  }

  async getPertandinganAktif(nomor_gelanggang, tournament) {
    const pertandinganList = await this.getPertandinganGelanggang(nomor_gelanggang, tournament)

    const pertandinganAktif = _.find(pertandinganList, (el) => {
          return el.status.name == 'BERJALAN'
    })
    if (!pertandinganAktif) return null

    return pertandinganAktif
  }

  async mapMatchups(undian, bagan) {
    let mappedMatchups = []
    for (const matchups of bagan.matchups) {
      let mappedTeam = []
      for (const team of matchups) {
        if (team) {
          let nomorUndian = team.substring(team.indexOf(":") + 1)
          let peserta = _.findKey(undian.peserta, (peserta) => {
            return peserta == nomorUndian
          })
          mappedTeam.push(peserta)
        } else {
          mappedTeam.push(team)
        }
      }
      mappedMatchups.push(mappedTeam)
    }

    return mappedMatchups
  }

  async createMatchups(matchups, ronde, tournament, kelas) {
    console.log("Creating Ronde " + ronde);
    let match_rounds = [];
    let i = 1;
    for (const matchup of matchups) {

      const pertandingan = new Pertandingan()
      pertandingan.status = "BELUM_DIMULAI"
      pertandingan.tournament_id = tournament.id
      pertandingan.kelas_id = kelas.id
      pertandingan.ronde = ronde
      await pertandingan.save()

      if (ronde == 1) {
        pertandingan.jenis = "KUALIFIKASI"
        await pertandingan.save()
        const kualifikasi = new Kualifikasi()
        kualifikasi.pertandingan_id = pertandingan.id
        kualifikasi.merah_id = parseInt(matchup[0])
        kualifikasi.biru_id = parseInt(matchup[1])
        await kualifikasi.save()
        match_rounds.push({
          pertandingan: pertandingan.toJSON(),
          kualifikasi: kualifikasi.toJSON()
        })
      } else {
        pertandingan.jenis = "ELIMINASI"
        await pertandingan.save()
        const eliminasi = new Eliminasi()
        eliminasi.pertandingan_id = pertandingan.id
        eliminasi.pemenang_a_id = matchup[0].pertandingan.id
        eliminasi.pemenang_b_id = matchup[1].pertandingan.id
        await eliminasi.save()
        match_rounds.push({
          pertandingan : pertandingan.toJSON(),
          eliminasi : eliminasi.toJSON()
        })
      }
      i++
    }
    return match_rounds
  }

  /**
     * Master Data :
    	- id, nomor_partai
    	- ronde
    	- pesilat merah
    	- pesilat biru
    	- kelas
     */
  async getMasterDataPertandingan(pertandingan) {
    const rootPertandingan = await this.prosesPertandingan(pertandingan)
    let masterData = {}
    masterData.id = pertandingan.id
    masterData.nomor_partai = pertandingan.nomor_partai
    masterData.ronde = pertandingan.ronde
    masterData.merah = rootPertandingan.merah
    masterData.biru =  rootPertandingan.biru
    masterData.kelas = await Kelas.find(pertandingan.kelas_id).then((k)  =>  k.toJSON())
    return masterData
  }

  /**
   * Seni
   */
  async getPertandinganPool(nomor_pool, tournament) {
    const pertandinganList = await this.getPertandinganSeniList({nomor_pool}, tournament.id)
    return pertandinganList
  }

  async getPertandinganSeniAktif(nomor_pool, tournament) {
    const pertandinganList = await this.getPertandinganPool(nomor_pool, tournament)

    const pertandinganAktif = _.find(pertandinganList, (el) => {
          return el.status.name == 'BERJALAN'
    })
    if (!pertandinganAktif) return null

    return pertandinganAktif
  }
}

module.exports = PertandinganService
