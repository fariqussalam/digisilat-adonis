(function () {
    $(function () {
        // var clock = $('.clock').FlipClock({
        //     clockFace: 'MinuteCounter',
        //     autoStart: false,
        //     callbacks: {
        //         stop: function() {
        //
        //         }
        //     }
        // });
        // clock.setTime(0);
        // clock.setCountdown(false);

        function NilaiJurus(nomorJurus, jumlahNilai) {
            this.nomorJurus = nomorJurus;
            this.jumlahNilai = jumlahNilai;
        }

        function nilaiTunggalTemplate() {
            var daftarNilai = [
                7, 6, 5, 7, 6, 8, 11, 7, 6, 12, 6, 5, 5, 9
            ]
            var jurusTunggal = []
            $.each(daftarNilai, function(idx, el) {
                jurusTunggal.push(new NilaiJurus(idx + 1, el))
            })
            return jurusTunggal
        }

        function PenguranganJurus(nomorJurus, nilai) {
            this.nomorJurus = nomorJurus;
            this.nilai = nilai;
        }
        function NilaiHukuman(kategori) {
            this.kategori = kategori;
            if (kategori === "W10") this.nilai = -10;
            else this.nilai = -5;
        }

        function JuriTunggal(nomorJuri) {
            this.nomorJuri = nomorJuri;
            this.daftarNilai = nilaiTunggalTemplate();
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
        }

        function DewanJuri(jumlah) {
            var instance = this
            for (var i = 1; i <= jumlah; i++) {
                instance[i] = new JuriTunggal(i)
            }
        }

        var dewanJuri = new DewanJuri(5);

        function renderNilaiJurus(nomorJuri) {
            var totalNilaiJurus = dewanJuri[nomorJuri].getTotalNilaiJurus();
            $('.js-tunggal-display__nilai-kebenaran[data-juri="' + nomorJuri + '"]').text(totalNilaiJurus);
        }
        function renderNilaiHukuman(nomorJuri) {
            var nilaiHukuman = dewanJuri[nomorJuri].getTotalNilaiHukuman();
            $('.js-tunggal-display__nilai-hukuman[data-juri="' + nomorJuri + '"]').text(nilaiHukuman);
        }
        function renderNilaiKemantapan(nomorJuri) {
            var nilaiKemantapan = dewanJuri[nomorJuri].kemantapan
            $('.js-tunggal-display__nilai-kemantapan[data-juri="' + nomorJuri + '"]').text(nilaiKemantapan);
        }
        function renderTotalNilai(nomorJuri) {
            var totalNilai = dewanJuri[nomorJuri].getTotalNilai();
            $('.js-tunggal-display__nilai-total[data-juri="' + nomorJuri + '"]').text(totalNilai);
        }

        function getMaxOfArray(numArray) {
            return Math.max.apply(null, numArray);
        }
        function getMinOfArray(numArray) {
            return Math.min.apply(null, numArray);
        }

        function getJuriMax() {
            var totalNilaiArray = []
            for (var i = 1; i <= 5; i++) {
                totalNilaiArray.push(dewanJuri[i].getTotalNilai());
            }
            var totalNilai = getMaxOfArray(totalNilaiArray);
            var juriMax;
            for (var x = 1; x <= 5; x++) {
                var nilai = dewanJuri[x].getTotalNilai();
                if (totalNilai === nilai) {
                    juriMax = dewanJuri[x];
                    return juriMax;
                }
            }
        }
        function getJuriMin(excluded) {
            var totalNilaiArray = []
            for (var i = 1; i <= 5; i++) {
                totalNilaiArray.push(dewanJuri[i].getTotalNilai());
            }
            var totalNilai = getMinOfArray(totalNilaiArray);
            var juriMin;
            for (var x = 1; x <= 5; x++) {
                var isExcluded = excluded != null && excluded.nomorJuri === dewanJuri[x].nomorJuri
                if (!isExcluded) {
                    var nilai = dewanJuri[x].getTotalNilai();
                    if (totalNilai === nilai) {
                        juriMin = dewanJuri[x];
                        return juriMin;
                    }
                }
            }
        }

        var $tabelMax = $('.js-tunggal-display__tabel-max');
        var $tabelMin = $('.js-tunggal-display__tabel-min');
        var $tabelTotal = $('.js-tunggal-display__tabel-total');

        $(document).ready(function() {
            $tabelMax.hide();
            $tabelMin.hide();
            $tabelTotal.hide();
            for (var i = 1; i <= 5; i++) {
                renderNilaiJurus(i)
                renderNilaiHukuman(i)
                renderTotalNilai(i)
                renderNilaiKemantapan(i)
            }
        });

        var socket = io('/tunggal');
        socket.on('connect', function() {
            socket.emit('koneksi', { name: "Display Tunggal" });
        });
        socket.on('display_detilTunggal', function(data) {
            $(".js-tunggal-display__pool").text(data.pool + " / " + data.nomorPenampil);
            $(".js-tunggal-display__nama-pesilat").text(data.namaPesilat);
            $(".js-tunggal-display__kontingen").text(data.kontingen);
        });
        socket.on('display_pengumuman', function(data) {
            var juriMax = getJuriMax();
            var juriMin = getJuriMin(juriMax);
            var totalNilai = 0
            for (var i = 1; i <= 5; i++) {
                totalNilai += dewanJuri[i].getTotalNilai();
            }
            totalNilai = totalNilai - juriMax.getTotalNilai();
            totalNilai = totalNilai - juriMin.getTotalNilai();
            $tabelMax.css("background-color", "red").css("color","white")
            $tabelMin.css("background-color", "blue").css("color","white")
            $tabelMax.find('.max-nomor-juri').text(juriMax.nomorJuri);
            $tabelMax.find('.max-skor').text(juriMax.getTotalNilai());
            $tabelMin.find('.min-nomor-juri').text(juriMin.nomorJuri);
            $tabelMin.find('.min-skor').text(juriMin.getTotalNilai());
            $tabelTotal.find('.total-skor').text(totalNilai)
            $tabelMax.show();
            $tabelMin.show();
            $tabelTotal.show();
        });
        socket.on('display_setTimer', function(data) {
            clock.setTime(data);
            console.log("Waktu Di Set :" + data + ' detik');
        });
        socket.on('display_ControlTimer', function(data) {
            var commands = {
                START: "start",
                STOP: "stop",
                RESET: "reset"
            }
            switch (data) {
                case commands.START:
                    clock.start();
                    break;
                case commands.STOP:
                    clock.stop();
                    break;
                case commands.RESET:
                    clock.reset();
                    break;
            }
        });
        socket.on('display_inputSkorMinus', function(data) {
            dewanJuri[data.nJuri].pengurangan.push(new PenguranganJurus(data.nJurus, -1));
            renderNilaiJurus(data.nJuri);
            renderTotalNilai(data.nJuri);
        });
        socket.on('display_inputSkorKemantapan', function(data) {
            dewanJuri[data.nJuri].kemantapan = data.nilai;
            $('.js-tunggal-display__nilai-kemantapan[data-juri="' + data.nJuri + '"]').text(data.nilai);
            renderTotalNilai(data.nJuri)
        });
        socket.on('display_hapusHukuman', function(data) {
            dewanJuri[data].hukuman = []
            renderNilaiHukuman(data);
            renderTotalNilai(data);
        });
        socket.on('display_inputSkorHukuman', function(data) {
            dewanJuri[data.nJuri].hukuman.push(new NilaiHukuman(data.nKategori));
            renderNilaiHukuman(data.nJuri);
            renderTotalNilai(data.nJuri);
        });
        socket.on('display_inputDis', function(nomorJuri) {
            $('.js-tunggal-display__nilai-kebenaran[data-juri="' + nomorJuri + '"]').text("DIS")
            $('.js-tunggal-display__nilai-kemantapan[data-juri="' + nomorJuri + '"]').text("DIS")
            $('.js-tunggal-display__nilai-hukuman[data-juri="' + nomorJuri + '"]').text("DIS")
            $('.js-tunggal-display__nilai-total[data-juri="' + nomorJuri + '"]').text("DIS")
        });

        socket.on('doRefreshTunggal', function() {
            window.location.reload();
        });

    })
})(jQuery);