(function () {
    $(function () {

        var pertandinganId = $('input[name="pertandingan_id"]').val();
        var state = new DigiSilat.Seni.State.Dewan();
        var socket = DigiSilat.createSocket("ganda", "Ganda Dewan", pertandinganId)

        socket.on("connect", function() {
            socket.emit('get-data-pertandingan-seni', { pertandinganId: pertandinganId })
        });
        socket.on('data-pertandingan-seni', function(data) {
            console.log("Data Pertandingan Seni", data)
            renderPertandingan(data)
        })

        function renderPertandingan(data) {
            $('.daftar-nama-pesilat').text(data.pesilat.nama)
            $('.js-data-pertandingan__kontingen').text(data.pesilat.kontingen.nama)
            state.dewanJuri = data.dewanJuri
            for (var nomorJuri in data.dewanJuri) {
                var juri = data.dewanJuri[nomorJuri] 
                if (juri.diskualifikasi) {
                    renderDiskualifikasi(juri)
                } else {
                    $('.js-nilai__nilai-serang-bela[data-juri="' + nomorJuri + '"]').text(juri.nilaiSerangBela);
                    $('.js-nilai__nilai-kemantapan[data-juri="' + nomorJuri + '"]').text(juri.nilaiKemantapan);
                    $('.js-nilai__nilai-penghayatan[data-juri="' + nomorJuri + '"]').text(juri.nilaiPenghayatan);
                     $.each(juri.nilaiHukuman, function(nama, jumlahHukuman) {
                        var namaKelas = ".js-hukuman__" + nama;
                        if (nama == 'w-5' || nama == 'w-10') {
                            var nilai = nama == 'w-10' ? '-10' : '-5';
                            if (jumlahHukuman > 0) $(namaKelas + '[data-juri="' + nomorJuri + '"]').find('span').text(nilai);
                            else $(namaKelas + '[data-juri="' + nomorJuri + '"]').find('span').text(0);
                        } else {
                            $(namaKelas + '[data-juri="' + nomorJuri + '"]').find('span').text(jumlahHukuman);
                        }
                     });
                     $('.js-hukuman__nilai-hukuman[data-juri="' + nomorJuri + '"]').text(getTotalNilaiHukuman(juri));
                     $('.js-nilai__nilai-total[data-juri="' + nomorJuri + '"]').text(getTotalNilai(juri));
                }
            }
            if (data.skor_akhir != null) {
                renderSkorAkhir(data.skor_akhir)
                renderTanggalPertandingan(data.tanggal_pertandingan)
            }
            var excluded = ["4", "5"]
            _.each(excluded, function(nomorJuri) {
                $(".js-ganda-dewan__juri[data-juri='"+nomorJuri+"']").css("display", "none")
            })
        }

        function getTotalNilai(juri) {
            var totalNilaiHukuman = hitungNilaiHukuman(juri.nilaiHukuman);
            return juri.nilaiSerangBela + juri.nilaiKemantapan + juri.nilaiPenghayatan - totalNilaiHukuman;
        }

        function getTotalNilaiHukuman(juri) {
            var total = hitungNilaiHukuman(juri.nilaiHukuman);
            if (total === 0) return 0
            else return "-" + total.toString()
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

        function renderDiskualifikasi(juri) {
            var nomorJuri = juri.nomorJuri
            var tandaDiskualifikasi = 'DIS';
            $('.js-nilai__nilai-serang-bela[data-juri="' + nomorJuri + '"]').text(tandaDiskualifikasi);
            $('.js-nilai__nilai-kemantapan[data-juri="' + nomorJuri + '"]').text(tandaDiskualifikasi);
            $('.js-nilai__nilai-penghayatan[data-juri="' + nomorJuri + '"]').text(tandaDiskualifikasi);
            $('.js-hukuman__nilai-hukuman[data-juri="' + nomorJuri + '"]').text(tandaDiskualifikasi);
            $('.js-nilai__nilai-total[data-juri="' + nomorJuri + '"]').text(tandaDiskualifikasi);
        }

        function renderSkorAkhir(skor_akhir) {
            $('.js-nilai__display-total[data-juri="' + skor_akhir.juriTeratas.nomorJuri + '"]').text("JURI " + skor_akhir.juriTeratas.nomorJuri + " (TERTINGGI)")
            $('.js-nilai__display-total[data-juri="' + skor_akhir.juriTerendah.nomorJuri + '"]').text("JURI " + skor_akhir.juriTerendah.nomorJuri + " (TERENDAH)")
            $('.js-nilai__nilai-total[data-juri="' + skor_akhir.juriTeratas.nomorJuri + '"]').css("background-color", "red").css("color","white")
            $('.js-nilai__nilai-total[data-juri="' + skor_akhir.juriTerendah.nomorJuri + '"]').css("background-color", "blue").css("color","white")
            $("#total-nilai").text(skor_akhir.totalNilai);
        }

        function renderTanggalPertandingan(tanggal_pertandingan) {
            $('.js-current-date').text(" " + tanggal_pertandingan);
        }

        $('.js-dewan-tanding__save-pdf').click(function() {
            var url = window.location.href + "?for_printed=1"
            console.log(url)
            $('input[name="printed_url"]').val(url)
            $('form[name="export-pdf-form"]').submit()
        })

    })
})(jQuery);