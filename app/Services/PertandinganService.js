'use strict'
const _ = require('underscore')
var s = require("underscore.string");

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
const Undian = use('App/Models/Undian')
const UndianService = use('App/Services/UndianService')

class PertandinganService {

  constructor() {
    this.pesilatService = new PesilatService
    this.undianService = new UndianService
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

  async getPertandinganList({ kelas, nomor_gelanggang }, tournament_id, without_data) {
    const queryParams = { tournament_id }
    if (kelas != "all" && kelas != null && kelas != '') {
      queryParams.kelas_id = kelas
    }
    if (nomor_gelanggang && nomor_gelanggang != "not_null") {
      queryParams.nomor_gelanggang = nomor_gelanggang
    }

    const responseList = []
    const pertandinganList = await Pertandingan.query().where(queryParams).fetch().then((result) => result.toJSON())
    for (let p of pertandinganList) {
      const resp = await this.prosesPertandingan(p)
      if (resp) {
        if (without_data) {
          resp.data_pertandingan = null
        }
        resp.kelas = await Kelas.find(p.kelas_id)
        resp.status = await this.getPertandinganStatus(p.status)
        responseList.push(resp)
      }
    }

    return responseList
  }

  async getPertandinganSeniList({ kategori, nomor_pool }, tournament_id) {
    const queryParams = { tournament_id }
    if (kategori != "all" && kategori != null && kategori != '') {
      queryParams.kategori_id = kategori
    }
    if (nomor_pool && nomor_pool != "not_null") {
      queryParams.nomor_pool = nomor_pool
    }

    const responseList = []

    let pertandinganList;
    if (nomor_pool === "not_null") {
      pertandinganList = await PertandinganSeni.query().where(queryParams).whereNotNull("nomor_pool").fetch().then((result) => result.toJSON())
    } else {
      pertandinganList = await PertandinganSeni.query().where(queryParams).fetch().then((result) => result.toJSON())
    }


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
      const kualifikasi = await Kualifikasi.query().where({ pertandingan_id: pertandingan.id }).first()
      if (!kualifikasi) return null
      if (!kualifikasi.merah_id && !kualifikasi.biru_id) return null

      if (kualifikasi.merah_id == null) pertandingan.merah = "BYE"
      if (kualifikasi.biru_id == null) pertandingan.biru = "BYE"
      pertandingan.merah = await this.pesilatService.getPesilatTanding(kualifikasi.merah_id)
      pertandingan.biru = await this.pesilatService.getPesilatTanding(kualifikasi.biru_id)
      return pertandingan
    } else if (pertandingan.jenis == 'ELIMINASI') {
      const eliminasi = await Eliminasi.query().where({ pertandingan_id: pertandingan.id }).first()
      if (!eliminasi) return null

      // console.log(`pertandingan id : ${pertandingan.id}`)
      // console.log(`a id : ${eliminasi.pemenang_a_id}`)
      // console.log(`b id : ${eliminasi.pemenang_b_id}`)
      const merah = await this.findRootPertandingan(eliminasi.pemenang_a_id)
      // console.log("merah", merah)
      const biru = await this.findRootPertandingan(eliminasi.pemenang_b_id)
      // console.log("biru", biru)

      if (merah && merah.isBye) {
        const updateBiru = await Pertandingan.find(pertandingan.id)
        updateBiru.pemenang = "BIRU"
        updateBiru.status = "SELESAI"
        await updateBiru.save()
      } else if (biru && biru.isBye) {
        const updateMerah = await Pertandingan.find(pertandingan.id)
        updateMerah.pemenang = "MERAH"
        updateMerah.status = "SELESAI"
        await updateMerah.save()
      }


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
      const eliminasi = await Eliminasi.query().where({ pertandingan_id: pertandingan.id }).first()
      if (!eliminasi) return null
      if (!eliminasi.pemenang_a_id || !eliminasi.pemenang_b_id) return null

      if (pertandingan.pemenang == "MERAH") {
        return await this.findRootPertandingan(eliminasi.pemenang_a_id)
      } else if (pertandingan.pemenang == "BIRU") {
        return await this.findRootPertandingan(eliminasi.pemenang_b_id)
      }

    } else {
      const kualifikasi = await Kualifikasi.query().where({ pertandingan_id: pertandingan.id }).first()
      if (!kualifikasi) return null
      if (!kualifikasi.merah_id && !kualifikasi.biru_id) return { isBye: true }

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
    const pertandinganList = await this.getPertandinganList({ nomor_gelanggang }, tournament.id)
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

    try {
      for (const matchup of matchups) {
        const pertandingan = new Pertandingan()
        pertandingan.status = "BELUM_DIMULAI"
        pertandingan.tournament_id = tournament.id
        pertandingan.kelas_id = kelas.id
        pertandingan.ronde = ronde
        await pertandingan.save()

        if (ronde == 1) {
          // console.log("creating kualifikasi", matchup)
          pertandingan.jenis = "KUALIFIKASI"
          await pertandingan.save()
          const kualifikasi = new Kualifikasi()
          kualifikasi.pertandingan_id = pertandingan.id
          kualifikasi.merah_id = parseInt(matchup[0]) ? parseInt(matchup[0]) : null
          kualifikasi.biru_id = parseInt(matchup[1]) ? parseInt(matchup[1]) : null

          if (kualifikasi.merah_id == null || isNaN(kualifikasi.merah_id)) {
            pertandingan.pemenang = "BIRU"
            pertandingan.status = "SELESAI"
            pertandingan.alasan_kemenangan = "Menang BYE"
            await pertandingan.save()
          } else if (kualifikasi.biru_id == null || isNaN(kualifikasi.biru_id)) {
            pertandingan.pemenang = "MERAH"
            pertandingan.status = "SELESAI"
            pertandingan.alasan_kemenangan = "Menang BYE"
            await pertandingan.save()
          }
          await kualifikasi.save()
          match_rounds.push({
            pertandingan: pertandingan.toJSON(),
            kualifikasi: kualifikasi.toJSON()
          })
        } else {
          // console.log("creating eliminasi")
          pertandingan.jenis = "ELIMINASI"
          await pertandingan.save()
          const eliminasi = new Eliminasi()
          eliminasi.pertandingan_id = pertandingan.id
          eliminasi.pemenang_a_id = matchup[0].pertandingan.id
          eliminasi.pemenang_b_id = matchup[1].pertandingan.id
          await eliminasi.save()
          match_rounds.push({
            pertandingan: pertandingan.toJSON(),
            eliminasi: eliminasi.toJSON()
          })
        }
        i++
      }
    } catch (exception) {
      console.error("error: ", exception)
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
    masterData.biru = rootPertandingan.biru
    masterData.kelas = await Kelas.find(pertandingan.kelas_id).then((k) => k.toJSON())
    return masterData
  }

  /**
   * Master Data Seni :
   - id, nomor_partai
   - ronde
   - pesilat merah
   - pesilat biru
   - kelas
   */
  async getMasterDataPertandinganSeni(pertandingan) {
    var master_data = {
      id: null,
      nomor_pool: null,
      nomor_penampil: null,
      pesilat: null,
      kategori: null,
      tanggal_pertandingan: null,
      skor_akhir: "",
      diskualifikasi: false
    }
    master_data.id = pertandingan.id
    master_data.nomor_pool = pertandingan.nomor_pool
    master_data.nomor_penampil = pertandingan.nomor_penampil
    master_data.pesilat = await this.pesilatService.getPesilatSeni(pertandingan.pesilat_seni_id)
    master_data.kategori = await KategoriSeni.find(pertandingan.kategori_id).then((k) => k.toJSON())
    master_data.tanggal_pertandingan = pertandingan.tanggal_pertandingan
    master_data.skor_akhir = pertandingan.skor_akhir
    master_data.diskualifikasi = pertandingan.diskualifikasi

    return master_data
  }

  /**
   * Seni
   */
  async getPertandinganPool(nomor_pool, tournament) {
    const pertandinganList = await this.getPertandinganSeniList({ nomor_pool }, tournament.id)
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

  async getTipeSeni(kategori_id) {
    const kategori = await KategoriSeni.findOrFail(kategori_id)
    const nama = kategori.nama.toLowerCase()
    let tipeSeni
    if (s.include(nama, 'tunggal')) {
      tipeSeni = 'tunggal'
    } else if (s.include(nama, 'ganda')) {
      tipeSeni = 'ganda'
    } else if (s.include(nama, 'regu')) {
      tipeSeni = 'tunggal'
    } else if (s.include(nama, 'trio')) {
      tipeSeni = 'ganda'
    }

    if (kategori.jenis == 'TUNGGAL') tipeSeni = "tunggal"
    else if (kategori.jenis == 'GANDA') tipeSeni = "ganda"
    else if (kategori.jenis == 'REGU') tipeSeni = 'tunggal'

    return tipeSeni
  }

  async mapUndianToBagan(pesertaUndian, matchups) {
    let new_matchups = []
    _.each(matchups, (match) => {
      let new_match = []
      _.each(match, m => {
        if (m != null && m.length > 0) {
          const nomor = s.words(m, ":")[1]
          const pasanganUndian = _.find(pesertaUndian, p => { return p.nomor_undian == nomor })
          if (pasanganUndian) {
            new_match.push(pasanganUndian)
          }
        } else {
          new_match.push(m)
        }
      })
      new_matchups.push(new_match)
    })
    return new_matchups
  }

  async getFirstRoundMatchups(teams) {
    const firstRoundResult = []
    for (const team of teams) {
      if (team[0] == null && team[1] == null) {
        var res = {
          winner: null,
          result: [null, null],
          pertandingan_id: null
        }
        firstRoundResult.push(res)
      } else if (team[0] == null || team[1] == null) {
        var res = {
          winner: null,
          result: [null, null],
          pertandingan_id: null
        }
        if (team[1] == null) {
          res.winner = team[0].pesilat_id
          const kualifikasi = await Kualifikasi.query().where({ merah_id: res.winner, biru_id: null }).first()
          if (kualifikasi) res.pertandingan_id = kualifikasi.pertandingan_id
        }
        else if (team[0] == null) {
          res.winner = team[1].pesilat_id
          const kualifikasi = await Kualifikasi.query().where({ merah_id: null, biru_id: res.winner }).first()
          if (kualifikasi) res.pertandingan_id = kualifikasi.pertandingan_id
        }
        firstRoundResult.push(res)
      } else {
        let merah_id = team[0] == null ? null : team[0].pesilat_id
        let biru_id = team[1] == null ? null : team[1].pesilat_id
        const kualifikasi = await Kualifikasi.query().where({ merah_id: merah_id, biru_id: biru_id }).first()
        if (kualifikasi) {
          const pertandingan = await Pertandingan.find(kualifikasi.pertandingan_id)
          var res = {
            winner: null,
            result: [null, null],
            pertandingan_id: pertandingan.id
          }
          if (pertandingan.skor_merah != null && pertandingan.skor_biru != null) {
            if (pertandingan.skor_merah >= pertandingan.skor_biru) {
              res.winner = merah_id
            } else if (pertandingan.skor_merah < pertandingan.skor_biru) {
              res.winner = biru_id
            }
            res.result = [pertandingan.skor_merah, pertandingan.skor_biru]
          } else {
            if (pertandingan.pemenang == "MERAH") {
              res.winner = merah_id,
                res.result = [1, 0]
            } else if (pertandingan.pemenang == "BIRU") {
              res.winner = biru_id,
                res.result = [0, 1]
            }
          }
          firstRoundResult.push(res)
        }
      }
    }
    return firstRoundResult
  }

  async getRoundResult(matchups) {
    const new_matchups = []
    for (var m of matchups) {
      var res = {
        winner: null,
        result: [null, null],
        pertandingan_id: null
      }
      if (m[0].pertandingan_id == null) {
        res.winner = m[1].winner
        const eliminasi = await Eliminasi.query().where({ pemenang_b_id: m[1].pertandingan_id }).first()
        res.pertandingan_id = eliminasi.pertandingan_id
      } else if (m[1].pertandingan_id == null) {
        res.winner = m[0].winner
        const eliminasi = await Eliminasi.query().where({ pemenang_a_id: m[0].pertandingan_id }).first()
        res.pertandingan_id = eliminasi.pertandingan_id
      } else if (m[0].pertandingan_id != null && m[1].pertandingan_id != null) {
        const eliminasi = await Eliminasi.query().where({ pemenang_a_id: m[0].pertandingan_id, pemenang_b_id: m[1].pertandingan_id }).first()
        res.pertandingan_id = eliminasi.pertandingan_id
        if (eliminasi) {
          const pertandingan = await Pertandingan.find(eliminasi.pertandingan_id)
          var res = {
            winner: null,
            result: [null, null],
            pertandingan_id: pertandingan.id
          }
          if (pertandingan.skor_merah != null && pertandingan.skor_biru != null) {
            if (pertandingan.skor_merah >= pertandingan.skor_biru) {
              res.winner = m[0].winner
            } else if (pertandingan.skor_merah < pertandingan.skor_biru) {
              res.winner = m[1].winner
            }
            res.result = [pertandingan.skor_merah, pertandingan.skor_biru]
          } else {
            if (pertandingan.pemenang == "MERAH") {
              res.winner = m[0].winner,
                res.result = [1, 0]
            } else if (pertandingan.pemenang == "BIRU") {
              res.winner = m[1].winner,
                res.result = [0, 1]
            }
          }
        }
      }
      new_matchups.push(res)
    }

    return new_matchups
  }

  async getBracketInfo(kelas_id) {
    const kelas = await Kelas.find(kelas_id).then(k => k.toJSON())
    const tournament = await Tournament.find(kelas.tournament_id).then(t => t.toJSON())
    const undian = await Undian.query().where({ tournament_id: tournament.id, kelas_id: kelas.id }).first()
    const pesertaUndian = await this.undianService.collectPesertaUndian(undian.id)
    const jumlahPeserta = pesertaUndian.length
    const bagan = await this.getTemplateBagan(jumlahPeserta)

    const teams = await this.mapUndianToBagan(pesertaUndian, bagan.matchups)

    const initial_teams = []
    for (const t of teams) {
      let red = null, blue = null
      if (t[0] != null) {
        red = t[0].nama + " | " + t[0].kontingen
      }
      if (t[1] != null) {
        blue = t[1].nama + " | " + t[1].kontingen
      }
      initial_teams.push([red, blue])
    }



    const firstRoundResult = await this.getFirstRoundMatchups(teams)

    const bracketData = {}
    bracketData.teams = initial_teams
    bracketData.results = []
    bracketData.results.push(_.map(firstRoundResult, 'result'))

    let sisaPeserta = firstRoundResult.length
    let ronde = 2
    let matchups = _.map(firstRoundResult, (m) => { return { winner: m.winner, pertandingan_id: m.pertandingan_id } })
    while (sisaPeserta > 1) {

      matchups = _.chunk(matchups, 2)
      matchups = await this.getRoundResult(matchups)
      sisaPeserta = matchups.length
      ronde++
      bracketData.results.push(_.map(matchups, 'result'))
    }




    return {
      kelas,
      tournament,
      undian,
      pesertaUndian,
      bagan,
      teams,
      bracketData
    }
  }
}

module.exports = PertandinganService
