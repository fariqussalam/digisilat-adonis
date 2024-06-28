(function () {
    $(function () {

        var $tabelMax = $('.js-ganda-display__tabel-max');
        var $tabelMin = $('.js-ganda-display__tabel-min');
        var $tabelTotal = $('.js-ganda-display__tabel-total');

        var $pengumuman = $('.js-ganda-display-pengumuman-pemenang')

        var nilaiTypeList = [
            "kualitas-teknik",
            "kuantitas-teknik",
            "ketangkasan",
            "stamina",
            "kemantapan",
            "irama"
        ]

        var pertandinganId = $('input[name="pertandingan_id"]').val();
        var state = new DigiSilat.Seni.State.Display();
        var socket = DigiSilat.createSocket("ganda", "Ganda Display", pertandinganId)

        socket.on("connect", function () {
            socket.emit('get-data-pertandingan-seni', { pertandinganId: pertandinganId })
        });
        socket.on('data-pertandingan-seni', function (data) {
            console.log("Data Pertandingan Seni", data)
            renderPertandingan(data)
        })

        function renderPertandingan(data) {
            $('.js-ganda-display-kategori').text(data.pesilat.kategori_seni.nama)
            $('.js-ganda-display-nama').text(data.pesilat.nama + " / " + data.pesilat.kontingen.nama)
            $('.js-ganda-display-nomor').text("No. " + data.nomor_penampil)
            $('.js-ganda-display-nama-only').text(data.pesilat.nama)
            $('.js-ganda-display-kontingen').text(data.pesilat.kontingen.nama)
            $pengumuman.hide()
            state.dewanJuri = data.dewanJuri
            for (var nomorJuri in data.dewanJuri) {
                var juri = data.dewanJuri[nomorJuri]
                if (juri.diskualifikasi) {
                    renderDiskualifikasi(juri)
                } else {

                    for (var tipe of nilaiTypeList) {
                        $('.js-nilai[data-nilai="' + tipe + '"][data-juri="' + nomorJuri + '"]').text(displayNilai(juri[tipe]))
                    }
                    $('.js-nilai[data-nilai="total"][data-juri="' + nomorJuri + '"]').text(getTotalNilai(juri))
                    $('.js-nilai[data-nilai="hukuman"][data-juri="' + nomorJuri + '"]').text(getTotalNilaiHukuman(juri))

                }
            }
            if (data.skor_akhir != null) {
                renderSkorAkhir(data.dewanJuri, data.skor_akhir)
            }
        }

        function displayNilai(nilai) {
            if (!nilai || nilai == undefined || nilai == null) {
                return 0
            } else {
                return nilai
            }
        }

        function getTotalNilai(juri) {
            var totalNilai = 0
            var totalNilaiHukuman = hitungNilaiHukuman(juri.nilaiHukuman);
            for (var tipe of nilaiTypeList) {
                totalNilai += displayNilai(juri[tipe])
            }
            totalNilai += displayNilai(totalNilaiHukuman)
            return totalNilai
        }

        function getTotalNilaiHukuman(juri) {
            var total = hitungNilaiHukuman(juri.nilaiHukuman);
            if (total === 0) return 0
            else return "-" + total.toString()
        }

        var nilaiHukumanType = {
            "w-10": 10,
            "w-15": 15,
            "w-20": 20
        }

        function hitungNilaiHukuman(nilaiHukuman) {
            var total = 0;
            $.each(nilaiHukuman, function (nama, jumlah) {
                var nilai = nilaiHukumanType[nama] ? nilaiHukumanType[nama] : 5;
                var jumlahNilai = jumlah * nilai;
                total += jumlahNilai;
            })
            return total;
        }

        function renderSkorAkhir(dewanJuri, skor_akhir) {
            $tabelMax.css("background-color", "blue").css("color", "white")
            $tabelMin.css("background-color", "red").css("color", "white")
            $tabelMax.find('.nomor-juri').text(skor_akhir.juriTeratas.nomorJuri);
            $tabelMax.find('.skor').text(getTotalNilai(skor_akhir.juriTeratas));
            $tabelMin.find('.nomor-juri').text(skor_akhir.juriTerendah.nomorJuri);
            $tabelMin.find('.skor').text(getTotalNilai(skor_akhir.juriTerendah));
            $tabelTotal.find('.skor').text(skor_akhir.totalNilai)
            $tabelMax.show();
            $tabelMin.show();
            $tabelTotal.show();


            var nomorJuriTertinggi = skor_akhir.juriTeratas.nomorJuri
            var nomorJuriTerendah = skor_akhir.juriTerendah.nomorJuri

            $('.js-ganda-display__nomor-juri[data-juri="' + nomorJuriTertinggi + '"]').css("background-color", "blue").css("color", "white")
            $('.js-ganda-display__nilai[data-nilai="teknik-serang-bela"][data-juri="' + nomorJuriTertinggi + '"]').css("background-color", "blue").css("color", "white")
            $('.js-ganda-display__nilai[data-nilai="kekompakan"][data-juri="' + nomorJuriTertinggi + '"]').css("background-color", "blue").css("color", "white")
            $('.js-ganda-display__nilai[data-nilai="penghayatan"][data-juri="' + nomorJuriTertinggi + '"]').css("background-color", "blue").css("color", "white")
            $('.js-ganda-display__nilai-hukuman[data-juri="' + nomorJuriTertinggi + '"]').css("background-color", "blue").css("color", "white")
            $('.js-ganda-display__nilai-total[data-juri="' + nomorJuriTertinggi + '"]').css("background-color", "blue").css("color", "white")
            $('.js-ganda-display__pengumuman-juri[data-juri="' + nomorJuriTertinggi + '"]').css("background-color", "blue").css("color", "white")
            $('.js-ganda-display__pengumuman-juri[data-juri="' + nomorJuriTertinggi + '"]').text("Tertinggi")

            $('.js-ganda-display__nomor-juri[data-juri="' + nomorJuriTerendah + '"]').css("background-color", "red").css("color", "white")
            $('.js-ganda-display__nilai[data-nilai="teknik-serang-bela"][data-juri="' + nomorJuriTerendah + '"]').css("background-color", "red").css("color", "white")
            $('.js-ganda-display__nilai[data-nilai="kekompakan"][data-juri="' + nomorJuriTerendah + '"]').css("background-color", "red").css("color", "white")
            $('.js-ganda-display__nilai[data-nilai="penghayatan"][data-juri="' + nomorJuriTerendah + '"]').css("background-color", "red").css("color", "white")
            $('.js-ganda-display__nilai-hukuman[data-juri="' + nomorJuriTerendah + '"]').css("background-color", "red").css("color", "white")
            $('.js-ganda-display__nilai-total[data-juri="' + nomorJuriTerendah + '"]').css("background-color", "red").css("color", "white")
            $('.js-ganda-display__pengumuman-juri[data-juri="' + nomorJuriTerendah + '"]').css("background-color", "red").css("color", "white")
            $('.js-ganda-display__pengumuman-juri[data-juri="' + nomorJuriTerendah + '"]').text("Terendah")

            var totalNilai = 0
            for (var nomorJuri in dewanJuri) {
                totalNilai += getTotalNilai(dewanJuri[nomorJuri])
            }

            $('.js-ganda-display-total-nilai').text(totalNilai)
            $pengumuman.show()
        }

        function renderDiskualifikasi(juri) {
            var nomorJuri = juri.nomorJuri
            var labelDiskualifikasi = "DIS"
            $('.js-ganda-display__nilai[data-nilai="teknik-serang-bela"][data-juri="' + nomorJuri + '"]').text(labelDiskualifikasi);
            $('.js-ganda-display__nilai[data-nilai="kekompakan"][data-juri="' + nomorJuri + '"]').text(labelDiskualifikasi);
            $('.js-ganda-display__nilai[data-nilai="penghayatan"][data-juri="' + nomorJuri + '"]').text(labelDiskualifikasi);
            $('.js-ganda-display__nilai-hukuman[data-juri="' + nomorJuri + '"]').text(labelDiskualifikasi)
            $('.js-ganda-display__nilai-total[data-juri="' + nomorJuri + '"]').text(labelDiskualifikasi);
        }

        $(document).ready(function () {
            $(".js-ganda-display__tabel-max").hide();
            $(".js-ganda-display__tabel-min").hide();
            $(".js-ganda-display__tabel-total").hide();
        });

        function resetCountdown() {
            state.countdown = 0
        }
        var $clock = $('.js-timer-clock');
        var timer = new easytimer.Timer({ precision: "secondTenths", countdown: false })
        timer.addEventListener('secondTenthsUpdated', function (e) {
            state.countdown = timer.getTotalTimeValues().seconds;
            $clock.html(timer.getTimeValues().toString().substring(3));
        });
        timer.addEventListener('started', function (e) {
            $clock.html(timer.getTimeValues().toString().substring(3));
        });
        timer.addEventListener('reset', function (e) {
            $clock.html(timer.getTimeValues().toString().substring(3));
        });

        socket.on('timer-command', function (data) {
            if (data.command == 'start') {
                timer.start({ startValues: { seconds: state.countdown } });
            } else if (data.command == 'stop') {
                var waktu = parseInt(data.countdown);
                state.countdown = waktu
                timer.stop();
                timer.start({ startValues: { seconds: state.countdown } });
                timer.stop();
            } else if (data.command == 'reset') {
                resetCountdown();
                timer.stop();
                timer.start({ startValues: { seconds: state.countdown } });
                timer.stop();
            } else if (data.command == 'set') {
                var waktu = parseInt(data.countdown);
                resetCountdown();
                state.countdown = waktu
                timer.start({ startValues: { seconds: state.countdown } });
                timer.stop();
                state.countdown = waktu
            }
        });

    })
})(jQuery);