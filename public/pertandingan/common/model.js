function Juri(nomorJuri) {
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
}
function Nilai(sudut, ronde, indikator, nilai, nilaiString) {
    this.sudut = sudut;
    this.ronde = ronde;
    this.indikator = indikator;
    this.nilai = nilai;
    this.nilaiString = nilaiString;
}
function DewanJuri(jumlah) {
    var instance = this
    for (var i = 1; i <= jumlah; i++) {
        instance[i] = new Juri(i)
    }
    this.addNilai = function(nomorJuri, nilai) {
        instance[nomorJuri].penilaian.push(nilai)
    }
    this.removeNilai = function(nomorJuri, ronde) {
        var lastIndex = _(instance[nomorJuri].penilaian).findLastIndex(function(n) {
            return n.ronde === ronde
        })
        instance[nomorJuri].penilaian.splice(lastIndex, 1);
    }

}

function Pertandingan() {
    this.ronde = 1
    this.merah = {
        nama: "-",
        kontingen: "-"
    }
    this.biru = {
        nama: "-",
        kontingen: "-"
    }
    this.kelas = "-"
    this.pemenang = "-"
}