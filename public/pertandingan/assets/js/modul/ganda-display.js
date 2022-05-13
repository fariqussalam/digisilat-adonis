(function () {
    $(function () {

        var $tabelMax = $('.js-ganda-display__tabel-max');
        var $tabelMin = $('.js-ganda-display__tabel-min');
        var $tabelTotal = $('.js-ganda-display__tabel-total');

        
        var pertandinganId = $('input[name="pertandingan_id"]').val();
        var state = new DigiSilat.Seni.State.Display();
        var socket = DigiSilat.createSocket("ganda", "Ganda Display", pertandinganId)

        socket.on("connect", function() {
            socket.emit('get-data-pertandingan-seni', { pertandinganId: pertandinganId })
        });
        socket.on('data-pertandingan-seni', function(data) {
            console.log("Data Pertandingan Seni", data)
            renderPertandingan(data)
        })

        function renderPertandingan(data) {
            $('.daftar-nama-pesilat').text(data.pesilat.nama)
            $('.kontingen').text(data.pesilat.kontingen.nama)
            state.dewanJuri = data.dewanJuri
            for (var nomorJuri in data.dewanJuri) {
                var juri = data.dewanJuri[nomorJuri] 
                if (juri.diskualifikasi) {
                    renderDiskualifikasi(juri)
                } else {
                    $('.js-ganda-display__nilai[data-nilai="teknik-serang-bela"][data-juri="' + nomorJuri + '"]').text(juri.nilaiSerangBela);
                    $('.js-ganda-display__nilai[data-nilai="kekompakan"][data-juri="' + nomorJuri + '"]').text(juri.nilaiKemantapan);
                    $('.js-ganda-display__nilai[data-nilai="penghayatan"][data-juri="' + nomorJuri + '"]').text(juri.nilaiPenghayatan);
                    $('.js-ganda-display__nilai-hukuman[data-juri="' + nomorJuri + '"]').text(getTotalNilaiHukuman(juri))
                    $('.js-ganda-display__nilai-total[data-juri="' + nomorJuri + '"]').text(getTotalNilai(juri));
                }
            }
            if (data.skor_akhir != null) {
                renderSkorAkhir(data.skor_akhir)
            }
            var excluded = ["4", "5"]
            _.each(excluded, function(nomorJuri) {
                $(".js-ganda-display__juri[data-juri='"+nomorJuri+"']").css("display", "none")
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

        function renderSkorAkhir(skor_akhir) {
            $tabelMax.css("background-color", "blue").css("color","white")
            $tabelMin.css("background-color", "red").css("color","white")
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

            $('.js-ganda-display__nomor-juri[data-juri="' + nomorJuriTertinggi + '"]').css("background-color", "blue").css("color","white")
            $('.js-ganda-display__nilai[data-nilai="teknik-serang-bela"][data-juri="' + nomorJuriTertinggi + '"]').css("background-color", "blue").css("color","white")
            $('.js-ganda-display__nilai[data-nilai="kekompakan"][data-juri="' + nomorJuriTertinggi + '"]').css("background-color", "blue").css("color","white")
            $('.js-ganda-display__nilai[data-nilai="penghayatan"][data-juri="' + nomorJuriTertinggi + '"]').css("background-color", "blue").css("color","white")
            $('.js-ganda-display__nilai-hukuman[data-juri="' + nomorJuriTertinggi + '"]').css("background-color", "blue").css("color","white")
            $('.js-ganda-display__nilai-total[data-juri="' + nomorJuriTertinggi + '"]').css("background-color", "blue").css("color","white")
            $('.js-ganda-display__pengumuman-juri[data-juri="' + nomorJuriTertinggi + '"]').css("background-color", "blue").css("color","white")
            $('.js-ganda-display__pengumuman-juri[data-juri="' + nomorJuriTertinggi + '"]').text("Tertinggi")
            
            $('.js-ganda-display__nomor-juri[data-juri="' + nomorJuriTerendah + '"]').css("background-color", "red").css("color","white")
            $('.js-ganda-display__nilai[data-nilai="teknik-serang-bela"][data-juri="' + nomorJuriTerendah + '"]').css("background-color", "red").css("color","white")
            $('.js-ganda-display__nilai[data-nilai="kekompakan"][data-juri="' + nomorJuriTerendah + '"]').css("background-color", "red").css("color","white")
            $('.js-ganda-display__nilai[data-nilai="penghayatan"][data-juri="' + nomorJuriTerendah + '"]').css("background-color", "red").css("color","white")
            $('.js-ganda-display__nilai-hukuman[data-juri="' + nomorJuriTerendah + '"]').css("background-color", "red").css("color","white")
            $('.js-ganda-display__nilai-total[data-juri="' + nomorJuriTerendah + '"]').css("background-color", "red").css("color","white")
            $('.js-ganda-display__pengumuman-juri[data-juri="' + nomorJuriTerendah + '"]').css("background-color", "red").css("color","white")
            $('.js-ganda-display__pengumuman-juri[data-juri="' + nomorJuriTerendah + '"]').text("Terendah")
           
            $('.js-ganda-display__pengumuman').removeAttr("hidden")
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

        $(document).ready(function() {
            $(".js-ganda-display__tabel-max").hide();
            $(".js-ganda-display__tabel-min").hide();
            $(".js-ganda-display__tabel-total").hide();
        });

        function resetCountdown() {
            state.countdown = 0
        }
        var $clock = $('.js-timer-clock');
        var timer = new easytimer.Timer({precision:"secondTenths", countdown: false})
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

        socket.on('timer-command', function(data) {
            if (data.command == 'start') {
                timer.start({startValues: {seconds: state.countdown}});
            } else if (data.command == 'stop') {
                var waktu = parseInt(data.countdown);
                state.countdown = waktu
                timer.stop();
                timer.start({startValues: {seconds: state.countdown}});
                timer.stop();
            } else if (data.command == 'reset') {
                resetCountdown();
                timer.stop();
                timer.start({startValues: {seconds: state.countdown}});
                timer.stop();
            } else if (data.command == 'set') {
                var waktu = parseInt(data.countdown);
                resetCountdown();
                state.countdown = waktu
                timer.start({startValues: {seconds: state.countdown}});
                timer.stop();
                state.countdown = waktu
            }
        });
        
    })
})(jQuery);