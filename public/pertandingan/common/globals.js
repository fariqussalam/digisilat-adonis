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
            this.getNilai = function(sudut, ronde) {
                var poin = this.getPoin(sudut, ronde),
                    minus = this.getMinus(sudut, ronde),
                    totalRonde = this.getTotalRonde(sudut, ronde),
                    total = this.getTotal(sudut)

                return {
                    poin: poin,
                    minus: minus,
                    totalRonde: totalRonde,
                    total: total
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
                console.log("Connected To Socket")
            });
            socket.on('refresh', function() {
                window.location.reload();
            });
        },
        createSocket: function(name, pertandinganId) {
            var socket = io({ query: { name : name, pertandinganId: pertandinganId } });
            this.setGlobalEvent(socket);
            return socket
        }
    }

    if ( typeof module === 'object' && module && typeof module.exports === 'object' ) {
        module.exports = DigiSilat;
    } else {
        window.DigiSilat = DigiSilat;
    }
})( this );
/* jshint ignore:end */