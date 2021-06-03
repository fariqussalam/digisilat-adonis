(function () {
    $(function () {
        var $tabelMax = $('.js-regu-display__tabel-max');
        var $tabelMin = $('.js-regu-display__tabel-min');
        var $tabelTotal = $('.js-regu-display__tabel-total');

        function hitungNilaiKebenaran(nilaiKebenaran) {
            var total = 0;
            $.each(nilaiKebenaran, function(idx, nilai) {
                total += nilai;
            })
            return total;
        }

        function hitungNilaiHukuman(nilaiHukuman) {
            var total = 0;
            $.each(nilaiHukuman, function(nama, jumlah) {
                var nilai = nama === "w-10" ? 10 : 5;
                var jumlahNilai = jumlah * nilai;
                total += jumlahNilai;
            })
            return total;
        }

        function initNilaiKebenaran() {
            var nilaiKebenaran = {};
            var nilaiJurus = [9, 9, 10, 9, 7, 8, 9, 11, 9, 4, 8, 7];
            $.each(nilaiJurus, function(index, value) {
                var urutan = index + 1;
                nilaiKebenaran[urutan.toString()] = value;
            });
            return nilaiKebenaran;
        }


        function JuriRegu(nomor) {
            this.name = nomor.toString();
            this.nomor = nomor;
            this.nilaiHukuman = {
                "keluar-garis": 0,
                "salah-pakaian": 0,
                "mengeluarkan-suara": 0,
                "w-5": 0,
                "w-10": 0
            };
            this.nilaiKekompakan = 0;
            this.nilaiKebenaran = initNilaiKebenaran();
        }
        JuriRegu.prototype.tambahHukuman = function(namaKategori) {
            this.nilaiHukuman[namaKategori] += 1;
        };
        JuriRegu.prototype.hapusHukuman = function() {
            for (var jenisHukuman in this.nilaiHukuman) {
                this.nilaiHukuman[jenisHukuman] = 0;
            }
        };
        JuriRegu.prototype.kurangNilaiJurus = function(nomorJurus) {
            this.nilaiKebenaran[nomorJurus.toString()] -= 1;
        };
        JuriRegu.prototype.totalNilaiKebenaran = function() {
            return hitungNilaiKebenaran(this.nilaiKebenaran);
        };
        JuriRegu.prototype.totalNilaiHukuman = function() {
            var total = hitungNilaiHukuman(this.nilaiHukuman);
            return total === 0 ? total : "-" + total;
        };
        JuriRegu.prototype.totalNilai = function() {
            var totalNilaiKebenaran = hitungNilaiKebenaran(this.nilaiKebenaran);
            var totalNilaiHukuman = hitungNilaiHukuman(this.nilaiHukuman);
            return totalNilaiKebenaran + this.nilaiKekompakan - totalNilaiHukuman;
        };

        var dewanJuri = {};

        for (var i = 1; i <= 5; i++) {
            var nomorStr = i.toString();
            dewanJuri[nomorStr] = new JuriRegu(i);
        }

        function renderNilaiHukuman(nomorJuri) {
            $('.js-regu-display__nilai[data-juri="' + nomorJuri + '"][data-tipe="hukuman"]').text(dewanJuri[nomorJuri].totalNilaiHukuman());
        }

        function renderNilaiKekompakan(nomorJuri) {
            $('.js-regu-display__nilai[data-juri="' + nomorJuri + '"][data-tipe="kekompakan"]').text(dewanJuri[nomorJuri].nilaiKekompakan());
        }

        function renderNilaiKebenaran(nomorJuri) {
            $('.js-regu-display__nilai[data-juri="' + nomorJuri + '"][data-tipe="kebenaran"]').text(dewanJuri[nomorJuri].totalNilaiKebenaran());
        }
        function renderTotalNilai(nomorJuri) {
            $('.js-regu-display__nilai[data-juri="' + nomorJuri + '"][data-tipe="total"]').text(dewanJuri[nomorJuri].totalNilai());
        }
        function getNomorJuriTertinggiDanTerendah() {
            var listNilaiTotal = [];
            $.each(dewanJuri, function(nomorJuri, juri) {
                listNilaiTotal.push(juri.totalNilai());
            })
            var nilaiTertinggi = Math.max(...listNilaiTotal);
            var nilaiTerendah = Math.min(...listNilaiTotal);
            var nomorJuriTertinggi, nomorJuriTerendah;
            for (var i in dewanJuri) {
                if (dewanJuri[i].totalNilai() === nilaiTertinggi) {
                    nomorJuriTertinggi = i;
                    break;
                }
            }
            for (var nomorJuri in dewanJuri) {
                if (dewanJuri[nomorJuri].totalNilai() === nilaiTerendah && nomorJuri !== nomorJuriTertinggi) {
                    nomorJuriTerendah = nomorJuri;
                    break;
                }
            }
            return {
                tertinggi: nomorJuriTertinggi,
                terendah: nomorJuriTerendah
            };
        }

        var socket = io('/regu');
        socket.on('connect', function() {
            socket.emit('koneksi', {name: "Display Regu"});
        });

        $(document).ready(function() {
            $tabelMax.hide();
            $tabelMin.hide();
            $tabelTotal.hide();
            _.each(dewanJuri, function(value, key) {
                renderNilaiKebenaran(value.nomor)
                renderTotalNilai(value.nomor)
            });
        });

        socket.on('display_pengumuman', function(data) {
            var hasil = getNomorJuriTertinggiDanTerendah();
            var nilaiFinal = 0;
            for (var nomorJuri in dewanJuri) {
                nilaiFinal += dewanJuri[nomorJuri].totalNilai();
            }
            nilaiFinal -= dewanJuri[hasil.tertinggi].totalNilai();
            nilaiFinal -= dewanJuri[hasil.terendah].totalNilai();
            $tabelMax.find(".skor").text(dewanJuri[hasil.tertinggi].totalNilai());
            $tabelMin.find(".skor").text(dewanJuri[hasil.terendah].totalNilai());
            $('.js-regu-display__nilai[data-tipe="total"][data-juri="' + hasil.tertinggi + '"]').css({"background-color":"red", "color": "white"});
            $('.js-regu-display__nilai[data-tipe="total"][data-juri="' + hasil.terendah + '"]').css({"background-color":"blue", "color": "white"});
            $tabelTotal.find(".skor").text(nilaiFinal);
            $tabelMax.show();
            $tabelMin.show();
            $tabelTotal.show();

        });
        socket.on('display_inputSkorMinus', function(data) {
            dewanJuri[data.nJuri].kurangNilaiJurus(data.nJurus);
            renderNilaiKebenaran(data.nJuri);
            renderTotalNilai(data.nJuri);
        });
        socket.on('display_inputSkorKekompakan', function(data) {
            dewanJuri[data.nJuri].nilaiKekompakan = data.nilai
            renderNilaiKekompakan(data.nJuri);
            renderTotalNilai(data.nJuri);
        });

        socket.on('display_hapusHukuman', function(data) {
            dewanJuri[data.nJuri].hapusHukuman();
            renderNilaiHukuman(data.nJuri);
            renderTotalNilai(data.nJuri);
        });

        socket.on('display_inputSkorHukuman', function(data) {
            var kategori = data.nKategori === "W10" ? "w-10" : data.nKategori;
            dewanJuri[data.nJuri].tambahHukuman(kategori);
            renderNilaiHukuman(data.nJuri);
            renderTotalNilai(data.nJuri);
        });
        socket.on('display_inputDis', function(data) {
            $('.js-regu-display__nilai[data-juri="' + data + '"]').text("DIS")
        });
        socket.on("doRefreshRegu", function(data) {
            window.location.reload();
        });
        socket.on('dataPenampil', function(penampil) {
            $('.pool').text(penampil.pool + " / " + penampil.nomor);
            $('.kontingen').text(penampil.kontingen);
            $('.pesilat-1').text(penampil.pesilat[0].nama);
            $('.pesilat-2').text(penampil.pesilat[1].nama);
            $('.pesilat-3').text(penampil.pesilat[2].nama);
        });
    })
})(jQuery);