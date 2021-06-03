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


        var penampil = {};
        var daftarJuri = {};

        for (var i = 1; i <= 5; i++) {
            daftarJuri[i.toString()] = new JuriGanda(i);
        }

        function populateAwal() {
            $.each(daftarJuri, function(key, juri) {
                updateTampilanNilai(parseInt(key));
            });
        }

        $(document).ready(function() {
            $('#modalAwal').modal('show');
            populateAwal();
        });
        $("#simpan-data-penampil").click(function() {
            penampil.pool = $('#input-pool').val();
            penampil.nomor = $('#input-nomor-penampil').val();
            penampil.kontingen = $('#input-kontingen').val();
            penampil.nama = $('#input-nomor-penampil').val();
            penampil.pesilat = [];
            $('.input-nama-pesilat').each(function() {
                var nomor = $(this).data('urutan');
                var nama = $(this).val();
                penampil.pesilat.push({
                    nomor: nomor,
                    nama: nama
                });
            });
            populateDataPenampil();
            kirimDataPenampil();
            $('#modalAwal').modal('hide');
        });

        function populateDataPenampil() {
            $('#pool').text(penampil.pool);
            $('#nomor-penampil').text(penampil.nomor);
            $('#kontingen').text(penampil.kontingen);
            if (penampil.pesilat && Array.isArray(penampil.pesilat)) {
                var namaPesilatHtml = "";
                for (let i = 0; i < penampil.pesilat.length; i++) {
                    var pesilat = penampil.pesilat[i]
                    namaPesilatHtml += '<li data-urutan="' + pesilat.nomor + '">' + pesilat.nama + '</li>';
                }
                var htmlTemplate = `<ol class="list-nama-pesilat">${namaPesilatHtml}</ol>`;
                $('.daftar-nama-pesilat').html(htmlTemplate);
            }
        }
        var socket = io('/ganda');
        socket.on('connect', function() {
            socket.emit('koneksi', {name: "Admin Ganda"});
            socket.emit('get_data_turnamen');
        });

        socket.on('display_pengumuman', function(data) {
            var hasil = getNomorJuriTertinggiDanTerendah();
            var nilaiFinal = 0;
            for (var nomorJuri in daftarJuri) {
                nilaiFinal += daftarJuri[nomorJuri].totalNilai();
            }
            nilaiFinal -= daftarJuri[hasil.tertinggi].totalNilai();
            nilaiFinal -= daftarJuri[hasil.terendah].totalNilai();
            $('#total-nilai').html('&nbsp;' + nilaiFinal);
            $('.display-total[data-juri="' + hasil.tertinggi + '"]').addClass('kolom-skor-tertinggi').append(" (TERTINGGI)");
            $('.display-total[data-juri="' + hasil.terendah + '"]').addClass('kolom-skor-terendah').append(" (TERENDAH)");
            $("#tanggal").text(getCurrentDate());
            $("#waktu").text(getCurrentTime());
        });

        socket.on('terimaDataTurnamen', function(dataTurnamen) {
            $('#nama-turnamen').text(dataTurnamen.nama);
            $('#tempat-turnamen').text(dataTurnamen.tempat);
            $('#waktu-turnamen').text(dataTurnamen.waktu);
        });

        function kirimDataPenampil() {
            socket.emit('dataPenampil', penampil);
        }

        function updateTampilanNilai(nomorJuri) {
            var juri = daftarJuri[nomorJuri.toString()];
            $('.nilai-serang-bela[data-juri="' + nomorJuri + '"]').text(juri.nilaiSerangBela);
            $('.nilai-kemantapan[data-juri="' + nomorJuri + '"]').text(juri.nilaiKemantapan);
            $('.nilai-penghayatan[data-juri="' + nomorJuri + '"]').text(juri.nilaiPenghayatan);
            $.each(juri.nilaiHukuman, function(nama, jumlahHukuman) {
                var namaKelas = "." + nama;
                if (nama == 'w-5' || nama == 'w-10') {
                    var nilai = nama == 'w-10' ? '-10' : '-5';
                    if (jumlahHukuman > 0) $(namaKelas + '[data-juri="' + nomorJuri + '"]').find('span').text(nilai);
                    else $(namaKelas + '[data-juri="' + nomorJuri + '"]').find('span').text(0);
                } else {
                    $(namaKelas + '[data-juri="' + nomorJuri + '"]').find('span').text(jumlahHukuman);
                }
            });
            $('.nilai-hukuman[data-juri="' + nomorJuri + '"]').text(juri.totalNilaiHukuman());
            $('.nilai-total[data-juri="' + nomorJuri + '"]').text(juri.totalNilai());
        }

        function diskualifikasiPeserta(nomorJuri) {
            var tandaDiskualifikasi = 'DIS';
            $('.nilai-serang-bela[data-juri="' + nomorJuri + '"]').text(tandaDiskualifikasi);
            $('.nilai-kemantapan[data-juri="' + nomorJuri + '"]').text(tandaDiskualifikasi);
            $('.nilai-penghayatan[data-juri="' + nomorJuri + '"]').text(tandaDiskualifikasi);
            $('.nilai-hukuman[data-juri="' + nomorJuri + '"]').text(tandaDiskualifikasi);
            $('.nilai-total[data-juri="' + nomorJuri + '"]').text(tandaDiskualifikasi);
        }

        socket.on('display_inputSkorTSB', function(data) {
            var nomorJuri = data.nJuri;
            daftarJuri[nomorJuri.toString()].nilaiSerangBela = data.nilai;
            updateTampilanNilai(nomorJuri);
        });

        socket.on('display_inputSkorNKM', function(data) {
            var nomorJuri = data.nJuri;
            daftarJuri[nomorJuri.toString()].nilaiKemantapan = data.nilai;
            updateTampilanNilai(nomorJuri);
        });

        socket.on('display_inputSkorPGN', function(data) {
            var nomorJuri = data.nJuri;
            daftarJuri[nomorJuri.toString()].nilaiPenghayatan = data.nilai;
            updateTampilanNilai(nomorJuri);
        });

        socket.on('display_hapusHukuman', function(data) {
            daftarJuri[data].hapusHukuman();
            updateTampilanNilai(parseInt(data));
        });

        socket.on('display_inputDis', function(data) {
            diskualifikasiPeserta(data)
        });

        socket.on('display_inputSkorHukuman', function(data) {
            var namaKategori = prosesNamaKategori(data.nKategori);
            daftarJuri[data.nJuri].tambahHukuman(namaKategori);
            updateTampilanNilai(parseInt(data.nJuri));
        });

        socket.on('doRefreshGanda', function() {
            window.location.reload();
        });

        socket.on('terimaDataTurnamen', function(dataTurnamen) {
            $('#nama-turnamen').text(dataTurnamen.nama);
            $('#tempat-turnamen').text(dataTurnamen.tempat);
            $('#waktu-turnamen').text(dataTurnamen.waktu);
        });

        function getNomorJuriTertinggiDanTerendah() {
            var listNilaiTotal = [];
            $.each(daftarJuri, function(nomorJuri, juri) {
                listNilaiTotal.push(juri.totalNilai());
            })
            var nilaiTertinggi = Math.max(...listNilaiTotal);
            var nilaiTerendah = Math.min(...listNilaiTotal);
            var nomorJuriTertinggi, nomorJuriTerendah;
            for (var nomorJuri in daftarJuri) {
                if (daftarJuri[nomorJuri].totalNilai() === nilaiTertinggi) {
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

        $("#simpan-data").click(function() {
            var filename = "GANDA";
            if (penampil.pool) filename += "-" + penampil.pool + "-";
            if (penampil.nomor) filename += "-" + penampil.nomor + "-";
            if (penampil.kontingen) filename += "-" + penampil.kontingen + "-";
            filename += "-" + getFormattedDateTime();
            utils.simpanGambar(filename);
        });
        $("#pengumuman-pemenang").click(function() {
            socket.emit('pengumuman', {});
        });
        $("#mulai-baru").click(function() {
            socket.emit('refreshGanda', {});
        });
    })
})(jQuery);