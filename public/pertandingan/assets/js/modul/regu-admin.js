(function () {
    $(function () {

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

        var penampil = {};
        var daftarJuri = {};

        for (var i = 1; i <= 5; i++) {
            var nomorStr = i.toString();
            daftarJuri[nomorStr] = new JuriRegu(i);
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
        var socket = io('/regu');
        socket.on('connect', function() {
            socket.emit('koneksi', {name: "Admin Regu"});
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
            $.each(juri.nilaiKebenaran, function(key, nilaiJurus) {
                var nomorJurus = parseInt(key);
                $('.nilai-kebenaran[data-juri="' + nomorJuri + '"][data-jurus="' + nomorJurus + '"]').text(nilaiJurus);
            });
            $.each(juri.nilaiHukuman, function(nama, jumlahHukuman) {
                var namaKelas = "." + nama;
                if (nama === 'w-5' || nama === 'w-10') {
                    var nilai = nama === 'w-10' ? '-10' : '-5';
                    if (jumlahHukuman > 0) $(namaKelas + '[data-juri="' + nomorJuri + '"]').find('span').text(nilai);
                } else {
                    $(namaKelas + '[data-juri="' + nomorJuri + '"]').find('span').text(jumlahHukuman);
                }
            });
            $('.nilai-kebenaran-total[data-juri="' + nomorJuri + '"]').text(juri.totalNilaiKebenaran());
            $('.nilai-hukuman[data-juri="' + nomorJuri + '"]').text(juri.totalNilaiHukuman());
            $('.nilai-total[data-juri="' + nomorJuri + '"]').text(juri.totalNilai());
            $('.nilai-kekompakan[data-juri="' + nomorJuri + '"]').text(juri.nilaiKekompakan);
        }

        function diskualifikasiPeserta(nomorJuri) {
            var tandaDiskualifikasi = 'DIS';
            $('.nilai-kebenaran-total[data-juri="' + nomorJuri + '"]').text(tandaDiskualifikasi);
            $('.nilai-hukuman[data-juri="' + nomorJuri + '"]').text(tandaDiskualifikasi);
            $('.nilai-total[data-juri="' + nomorJuri + '"]').text(tandaDiskualifikasi);
            $('.nilai-kekompakan[data-juri="' + nomorJuri + '"]').text(tandaDiskualifikasi);
        }

        socket.on('display_inputSkorMinus', function(data) {
            daftarJuri[data.nJuri].kurangNilaiJurus(data.nJurus);
            updateTampilanNilai(parseInt(data.nJuri));
        });
        socket.on('display_inputSkorKekompakan', function(data) {
            daftarJuri[data.nJuri].nilaiKekompakan = data.nilai;
            updateTampilanNilai(parseInt(data.nJuri));
        });
        socket.on('display_hapusHukuman', function(data) {
            daftarJuri[data].hapusHukuman();
            updateTampilanNilai(parseInt(data));
        });

        socket.on('display_inputSkorHukuman', function(data) {
            var namaKategori = prosesNamaKategori(data.nKategori);
            daftarJuri[data.nJuri].tambahHukuman(namaKategori);
            updateTampilanNilai(parseInt(data.nJuri));
        });

        socket.on('display_inputDis', function(data) {
            diskualifikasiPeserta(data)
        });

        function getNomorJuriTertinggiDanTerendah() {
            var listNilaiTotal = [];
            $.each(daftarJuri, function(nomorJuri, juri) {
                listNilaiTotal.push(juri.totalNilai());
            })
            var nilaiTertinggi = Math.max(...listNilaiTotal);
            var nilaiTerendah = Math.min(...listNilaiTotal);
            var nomorJuriTertinggi, nomorJuriTerendah;
            for (var i in daftarJuri) {
                if (daftarJuri[i].totalNilai() === nilaiTertinggi) {
                    nomorJuriTertinggi = i;
                    break;
                }
            }
            for (var nomorJuri in daftarJuri) {
                if (daftarJuri[nomorJuri].totalNilai() === nilaiTerendah && nomorJuri !== nomorJuriTertinggi) {
                    nomorJuriTerendah = nomorJuri;
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
            var filename = "REGU";
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
            socket.emit('refreshRegu', {});
        });

        socket.on('doRefreshRegu', function() {
            window.location.reload();
        });

    })
})(jQuery);