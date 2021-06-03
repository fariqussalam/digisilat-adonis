(function () {
    $(function () {

        function hitungNilaiHukuman(nilaiHukuman) {
            var total = 0;
            $.each(nilaiHukuman, function(nama, jumlah) {
                var nilai = nama === "w-10" ? 10 : 5;
                var jumlahNilai = jumlah * nilai;
                total += jumlahNilai;
            })
            return total;
        }
        function prosesNamaKategori(dataKategori) {
            var namaKategori = "";
            switch (dataKategori) {
                case "W10":
                    namaKategori = "w-10";
                    break;
                default:
                    namaKategori = dataKategori;
                    break;
            }
            return namaKategori;
        }

        function JuriGanda(nomor) {
            this.name = nomor.toString();
            this.nomor = nomor;
            this.nilaiHukuman = {
                "keluar-garis": 0,
                "senjata-jatuh": 0,
                "senjata-tidak-jatuh": 0,
                "senjata-diluar-arena": 0,
                "senjata-tidak-sesuai": 0,
                "w-5": 0,
                "w-10": 0
            };
            this.nilaiSerangBela = 0;
            this.niaiKemantapan = 0;
            this.nilaiPenghayatan = 0;
            this.tambahHukuman = function(namaKategori) {
                this.nilaiHukuman[namaKategori] += 1;
            };
            this.hapusHukuman = function() {
                for (var jenisHukuman in this.nilaiHukuman) {
                    this.nilaiHukuman[jenisHukuman] = 0;
                }
            };
            this.totalNilaiHukuman = function() {
                var total = hitungNilaiHukuman(this.nilaiHukuman);
                if (total === 0) return 0
                else return "-" + total.toString()
            };
            this.totalNilai = function() {
                var totalNilaiHukuman = hitungNilaiHukuman(this.nilaiHukuman);
                return this.nilaiSerangBela + this.niaiKemantapan + this.nilaiPenghayatan - totalNilaiHukuman;
            };
        }

        function DewanJuri(jumlah) {
            var instance = this
            for (var i = 1; i <= jumlah; i++) {
                instance[i] = new JuriGanda(i)
            }
        }

        var dewanJuri = new DewanJuri(5);

        function getNomorJuriTertinggiDanTerendah() {
            var listNilaiTotal = [];
            $.each(dewanJuri, function(nomorJuri, juri) {
                listNilaiTotal.push(juri.totalNilai());
            })
            var nilaiTertinggi = Math.max(...listNilaiTotal);
            var nilaiTerendah = Math.min(...listNilaiTotal);
            var nomorJuriTertinggi, nomorJuriTerendah;
            for (var nomorJuri in daftarJuri) {
                if (dewanJuri[nomorJuri].totalNilai() === nilaiTertinggi) {
                    nomorJuriTertinggi = nomorJuri;
                    break;
                }
            }
            for (var i in daftarJuri) {
                if (daftarJuri[i].totalNilai() === nilaiTerendah && i !== nomorJuriTertinggi) {
                    nomorJuriTerendah = i;
                    break;
                }
            }
            return {
                tertinggi: nomorJuriTertinggi,
                terendah: nomorJuriTerendah
            };
        }
        $(document).ready(function() {
            $(".js-ganda-display__tabel-max").hide();
            $(".js-ganda-display__tabel-min").hide();
            $(".js-ganda-display__tabel-total").hide();
        });

        var socket = io('/ganda');
        socket.on('connect', function() {
            socket.emit('koneksi', { name: "Display Ganda" });
        });
        socket.on('display_pengumuman', function() {
            var hasil = getNomorJuriTertinggiDanTerendah();
            var nilaiFinal = 0;
            for (var nomorJuri in dewanJuri) {
                nilaiFinal += daftarJuri[nomorJuri].totalNilai();
            }
            nilaiFinal -= daftarJuri[hasil.tertinggi].totalNilai();
            nilaiFinal -= daftarJuri[hasil.terendah].totalNilai();
            $('.js-ganda-display__tabel-max.nomor-juri').text(hasil.tertinggi);
            $('.js-ganda-display__tabel-max.skor').text(dewanJuri[hasil.tertinggi].totalNilai());
            $('.js-ganda-display__tabel-min.nomor-juri').text(hasil.terendah);
            $('.js-ganda-display__tabel-min.skor').text(dewanJuri[hasil.terendah].totalNilai());
            $('.js-ganda-display__tabel-total.skor').text(nilaiFinal);
            $(".js-ganda-display__tabel-max").show();
            $(".js-ganda-display__tabel-min").show();
            $(".js-ganda-display__tabel-total").show();
        });
        socket.on('display_inputSkorTSB', function(data) {
            dewanJuri[data.nJuri].nilaiSerangBela = data.nilai;
            $('.js-ganda-display__nilai[data-nilai="teknik-serang-bela"][data-juri="' + data.nJuri + '"]').text(data.nilai);
            $('.js-ganda-display__nilai-total[data-juri="' + data.nJuri + '"]').text(dewanJuri[data.nJuri].totalNilai());
        });
        socket.on('display_inputSkorNKM', function(data) {
            dewanJuri[data.nJuri].niaiKemantapan = data.nilai;
            $('.js-ganda-display__nilai[data-nilai="kekompakan"][data-juri="' + data.nJuri + '"]').text(data.nilai);
            $('.js-ganda-display__nilai-total[data-juri="' + data.nJuri + '"]').text(dewanJuri[data.nJuri].totalNilai());
        });
        socket.on('display_inputSkorPGN', function(data) {
            dewanJuri[data.nJuri].nilaiPenghayatan = data.nilai;
            $('.js-ganda-display__nilai[data-nilai="penghayatan"][data-juri="' + data.nJuri + '"]').text(data.nilai);
            $('.js-ganda-display__nilai-total[data-juri="' + data.nJuri + '"]').text(dewanJuri[data.nJuri].totalNilai());
        });
        socket.on('display_hapusHukuman', function(data) {
            dewanJuri[data.nJuri].hapusHukuman();
            $('.js-ganda-display__nilai-hukuman[data-juri="' + data.nJuri + '"]').text(0);
            $('.js-ganda-display__nilai-total[data-juri="' + data.nJuri + '"]').text(dewanJuri[data.nJuri].totalNilai());
        });
        socket.on('display_inputSkorHukuman', function(data) {
            var namaKategori = prosesNamaKategori(data.nKategori);
            dewanJuri[data.nJuri].tambahHukuman(namaKategori);
            $('.js-ganda-display__nilai-hukuman[data-juri="' + data.nJuri + '"]').text(dewanJuri[data.nJuri].totalNilaiHukuman());
            $('.js-ganda-display__nilai-total[data-juri="' + data.nJuri + '"]').text(dewanJuri[data.nJuri].totalNilai());
        });
        socket.on('display_inputDis', function(data) {
            $('.js-ganda-display__nilai[data-juri="' + data + '"]').text("DIS");
            $('.js-ganda-display__nilai-hukuman[data-juri="' + data + '"]').text("DIS");
            $('.js-ganda-display__nilai-total[data-juri="' + data + '"]').text("DIS");
        });
        socket.on('display_ControlTimer', function(data) {
            switch (data) {
                case "start":
                    clock.start();
                    break;
                case "stop":
                    clock.stop();
                    break;
                case "reset":
                    clock.reset();
                    break;
            }
        });
        socket.on("doRefreshGanda", function(data) {
            window.location.reload();
        })
        socket.on('dataPenampil', function(penampil) {
            $('.pool').text(penampil.pool + " / " + penampil.nomor);
            $('.kontingen').text(penampil.kontingen);
            $('.pesilat-1').text(penampil.pesilat[0].nama);
            $('.pesilat-2').text(penampil.pesilat[1].nama);
        });
    })
})(jQuery);