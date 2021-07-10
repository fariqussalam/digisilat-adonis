'use strict';

/* jshint ignore:start */
(function(window){
    var DigiSilat = {
        getSudutList: function() {
            return ["merah", "biru"]
        },
        getRondeList: function() {
            return [1, 2, 3]
        },
        Juri: function(nomorJuri) {
            this.nama = ""
            this.nomorJuri = nomorJuri
            this.penilaian = []
            this.getPoin = function(sudut, ronde) {
                var nilaiList = _.filter(this.penilaian, function(n) { return n.ronde === ronde && n.sudut === sudut && n.nilai > 0})
                var nilaiString = []
                _.each(nilaiList, function(n) { nilaiString.push(n.nilaiString) })
                return nilaiString
            }
            this.getMinus = function(sudut, ronde) {
                var nilaiList = _.filter(this.penilaian, function(n) { return n.ronde === ronde && n.sudut === sudut && n.nilai < 0})
                var nilaiString = []
                _.each(nilaiList, function(n) { nilaiString.push(n.nilaiString) })
                return nilaiString
            }
            var isJatuhan = function(nilai, nilaiString) {
                return nilai > 0 && (nilaiString == '1+3' || nilaiString == '3')
            }
            this.getJatuhan = function(sudut, ronde) {
                var nilaiList = _.filter(this.penilaian, function(n) {
                    return n.ronde === ronde && n.sudut === sudut && isJatuhan(n.nilai, n.nilaiString)
                })
                var nilaiString = []
                _.each(nilaiList, function(n) { nilaiString.push(n.nilaiString) })
                return nilaiString
            }
            this.getNilaiPoin = function(sudut, ronde) {
                var nilaiList = _.filter(this.penilaian, function(n) {
                    return n.ronde === ronde && n.sudut === sudut && !isJatuhan(n.nilai, n.nilaiString)
                })
                var nilaiString = []
                _.each(nilaiList, function(n) { nilaiString.push(n.nilaiString) })
                return nilaiString
            }
            this.getTotalRonde = function(sudut, ronde) {
                var nilaiList = _.filter(this.penilaian, function(n) { return n.ronde === ronde && n.sudut === sudut })
                var nilai = 0
                _.each(nilaiList, function(n) { nilai+=n.nilai })
                return nilai
            }
            this.getTotal = function(sudut) {
                var nilaiList = _.filter(this.penilaian, function(n) { return n.sudut === sudut })
                var nilai = 0
                _.each(nilaiList, function(n) { nilai+=n.nilai })
                return nilai
            }
            this.getRingkasanNilai = function() {
                var nilaiMerah = 0
                var nilaiBiru = 0
                var totalMerah = this.getTotal("merah")
                var totalBiru = this.getTotal("biru")
                if (totalMerah > totalBiru) nilaiMerah = 1
                else if (totalBiru > totalMerah) nilaiBiru = 1
                return {
                    merah: nilaiMerah,
                    biru: nilaiBiru
                }
            }
            this.getNilai = function(sudut, ronde) {
                var poin = this.getPoin(sudut, ronde),
                    minus = this.getMinus(sudut, ronde),
                    totalRonde = this.getTotalRonde(sudut, ronde),
                    total = this.getTotal(sudut),
                    jatuhan = this.getJatuhan(sudut, ronde),
                    nilai = this.getNilaiPoin(sudut, ronde)

                return {
                    poin: poin,
                    minus: minus,
                    totalRonde: totalRonde,
                    total: total,
                    jatuhan: jatuhan,
                    nilaiPoin: nilai
                }
            }
        },
        Nilai: function(sudut, ronde, indikator, nilai, nilaiString) {
            this.sudut = sudut;
            this.ronde = ronde;
            this.indikator = indikator;
            this.nilai = nilai;
            this.nilaiString = nilaiString;
        },
        State: {
            Juri: function() {
                this.nomorJuri = null
                this.ronde = 1
                this.juri = {}
            },
            Display: function() {
                this.ronde = 1
                this.dewanJuri = {}
                this.countdown = 0
            },
            Dewan: function() {
                this.ronde = 1
                this.dewanJuri = {}
            },
            Timer: function() {
                this.ronde = 1
                this.countdown = 0
            }
        },
        setGlobalEvent: function(socket) {
            socket.on('connect', function() {
                console.log("Connected to Server")
            });
            socket.on('refresh', function() {
                window.location.reload();
            });
        },
        createSocket: function(type, name, pertandinganId) {
            var socket = io({ query: { type: type, name : name, pertandinganId: pertandinganId } });
            this.setGlobalEvent(socket);
            setSeniEvent(socket, pertandinganId)
            return socket
        }
    }

    DigiSilat.Seni = {
        getNilaiTunggalTemplate: function() {
            var daftarNilai = [
                7, 6, 5, 7, 6, 8, 11, 7, 6, 12, 6, 5, 5, 9
            ]
            var jurusTunggal = []
            $.each(daftarNilai, function(idx, el) {
                jurusTunggal.push(new this.NilaiJurus(idx + 1, el))
            })
            return jurusTunggal
        },
        NilaiJurus: function(nomorJurus, jumlahNilai) {
            this.nomorJurus = nomorJurus;
            this.jumlahNilai = jumlahNilai;
        },
        JuriTunggal: function(nomorJuri) {
            this.nomorJuri = nomorJuri;
            this.daftarNilai = this.getNilaiTunggalTemplate();
            this.pengurangan = [];
            this.hukuman = [];
            this.kemantapan = 0;
            this.getNilaiJurus = function(nomorJurus) {
                var jurus = _.filter(this.daftarNilai, function(n) {
                    return n.nomorJurus.toString() === nomorJurus.toString()
                })
                var jumlahNilai = jurus[0].jumlahNilai;
                var penguranganJurus = _.filter(this.pengurangan, function(n) {
                    return n.nomorJurus.toString() === nomorJurus.toString()
                })
                _.each(penguranganJurus, function(n) {
                    jumlahNilai += n.nilai;
                })
                return jumlahNilai
            }
            this.getTotalNilaiJurus = function() {
                var instance = this;
                var totalNilai = 0;
                _.each(this.daftarNilai, function(jurus) {
                    totalNilai += instance.getNilaiJurus(jurus.nomorJurus);
                })
                return totalNilai
            }
            this.getTotalNilaiHukuman = function() {
                var nilaiHukuman = 0
                _.each(this.hukuman, function(n) {
                    nilaiHukuman += n.nilai
                })
                return nilaiHukuman;
            }
            this.getTotalNilai = function() {
                var totalNilaiJurus = this.getTotalNilaiJurus();
                var totalNilaiHukuman = this.getTotalNilaiHukuman();
                return totalNilaiJurus + totalNilaiHukuman + this.kemantapan;
            }
        },
        State: {
            Juri: function () {
                this.nomorJuri = null
                this.juri = {}
            },
            Display: function () {
                this.dewanJuri = {}
                this.countdown = 0
            },
            Dewan: function () {
                this.dewanJuri = {}
            },
            Timer: function () {
                this.countdown = 0
            }
        },
    }

    function setSeniEvent(socket, pertandinganId) {
        $('.js-seni-pengumuman-skor').click(function() {
            console.log("pegumuman skor")
            socket.emit("seni-pengumuman-skor", {pertandinganId: pertandinganId})
        })
    }

    if ( typeof module === 'object' && module && typeof module.exports === 'object' ) {
        module.exports = DigiSilat;
    } else {
        window.DigiSilat = DigiSilat;
    }
})( this );
/* jshint ignore:end */