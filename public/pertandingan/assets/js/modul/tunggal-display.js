(function () {
    $(function () {

        var $tabelMax = $('.js-tunggal-display__tabel-max');
        var $tabelMin = $('.js-tunggal-display__tabel-min');
        var $tabelTotal = $('.js-tunggal-display__tabel-total');

        $(document).ready(function() {
            $tabelMax.hide();
            $tabelMin.hide();
            $tabelTotal.hide();
        });     

        var pertandinganId = $('input[name="pertandingan_id"]').val();
        var state = new DigiSilat.Seni.State.Display();

        var socket = DigiSilat.createSocket("tunggal", "Tunggal Display", pertandinganId);

        socket.on("connect", function() {
            socket.emit('get-data-pertandingan-seni', { pertandinganId: pertandinganId })
        });
        socket.on('data-pertandingan-seni', function(data) {
            console.log("Data Pertandingan Seni", data)
            renderPertandingan(data)
        })

        function renderPertandingan(data) {
            var excludedJuri = ["4", "5"]
            var isDisqualified = _.find(_.values(data.dewanJuri), function(j) {
                return j.diskualifikasi == true
            })
            if (isDisqualified) {
                for (var nomorJuri in data.dewanJuri) {     
                    $('.js-tunggal-display__nilai-kebenaran[data-juri="' + nomorJuri + '"]').text("DIS")
                    $('.js-tunggal-display__nilai-kemantapan[data-juri="' + nomorJuri + '"]').text("DIS")
                    $('.js-tunggal-display__nilai-hukuman[data-juri="' + nomorJuri + '"]').text("DIS")
                    $('.js-tunggal-display__nilai-total[data-juri="' + nomorJuri + '"]').text("DIS")
                }
                return;
            }
            for (var nomorJuri in data.dewanJuri) {
                if (excludedJuri.includes(nomorJuri)) {
                    continue
                }
                var juri = data.dewanJuri[nomorJuri]
                    renderNilaiJurus(juri)
                    renderNilaiHukuman(juri)
                    renderTotalNilai(juri)
                    renderNilaiKemantapan(juri)
                    if (data.skor_akhir != null) {
                        renderSkorAkhir(data.skor_akhir)
                    }
            }
           
            _.each(excludedJuri, function(nomorJuri) {
                $('.js-tunggal-display__juri[data-juri="'+nomorJuri+'"]').css("display", "none")
            })
        }
        
        function getNilaiJurus(juri, nomorJurus) {
            var jurus = _.filter(juri.daftarNilai, function(n) {
                return n.nomorJurus.toString() === nomorJurus.toString()
            })
            var jumlahNilai = jurus[0].jumlahNilai;
            var penguranganJurus = _.filter(juri.pengurangan, function(n) {
                return n.nomorJurus.toString() === nomorJurus.toString()
            })
            _.each(penguranganJurus, function(n) {
                jumlahNilai += n.nilai;
            })
            return jumlahNilai
        }

        function getTotalNilaiJurus(juri) {
            var totalNilai = 0;
            _.each(juri.daftarNilai, function(jurus) {
                totalNilai += getNilaiJurus(juri, jurus.nomorJurus);
            })
            return totalNilai
        }

        function getTotalNilaiHukuman(juri) {
            var nilaiHukuman = 0
            _.each(juri.hukuman, function(n) {
                nilaiHukuman += n.nilai
            })
            return nilaiHukuman;
        }

        function getTotalNilai(juri) {
            var totalNilaiJurus = getTotalNilaiJurus(juri)
            var totalNilaiHukuman = getTotalNilaiHukuman(juri)
            return totalNilaiJurus + totalNilaiHukuman + juri.kemantapan
        }

        function renderNilaiJurus(juri) {
            var totalNilaiJurus = getTotalNilaiJurus(juri)
            $('.js-tunggal-display__nilai-kebenaran[data-juri="' + juri.nomorJuri + '"]').text(totalNilaiJurus);
        }
        function renderNilaiHukuman(juri) {
            var nilaiHukuman = getTotalNilaiHukuman(juri);
            $('.js-tunggal-display__nilai-hukuman[data-juri="' + juri.nomorJuri + '"]').text(nilaiHukuman);
        }
        function renderNilaiKemantapan(juri) {
            var nilaiKemantapan = juri.kemantapan
            $('.js-tunggal-display__nilai-kemantapan[data-juri="' + juri.nomorJuri + '"]').text(nilaiKemantapan);
        }
        function renderTotalNilai(juri) {
            var totalNilai = getTotalNilai(juri);
            $('.js-tunggal-display__nilai-total[data-juri="' + juri.nomorJuri + '"]').text(totalNilai);
        }

        function renderSkorAkhir(skor_akhir) {
            $tabelMax.css("background-color", "blue").css("color","white")
            $tabelMin.css("background-color", "red").css("color","white")
            $tabelMax.find('.max-nomor-juri').text(skor_akhir.juriTeratas.nomorJuri);
            $tabelMax.find('.max-skor').text(getTotalNilai(skor_akhir.juriTeratas));
            $tabelMin.find('.min-nomor-juri').text(skor_akhir.juriTerendah.nomorJuri);
            $tabelMin.find('.min-skor').text(getTotalNilai(skor_akhir.juriTerendah));
            $tabelTotal.find('.total-skor').text(skor_akhir.totalNilai)
            $tabelMax.show();
            $tabelMin.show();
            $tabelTotal.show();

            var nomorJuriTertinggi = skor_akhir.juriTeratas.nomorJuri
            var nomorJuriTerendah = skor_akhir.juriTerendah.nomorJuri

            $('.js-tunggal-display__nomor-juri[data-juri="' + nomorJuriTertinggi + '"]').css("background-color", "blue").css("color","white")
            $('.js-tunggal-display__nilai-kebenaran[data-juri="' + nomorJuriTertinggi + '"]').css("background-color", "blue").css("color","white")
            $('.js-tunggal-display__nilai-kemantapan[data-juri="' + nomorJuriTertinggi + '"]').css("background-color", "blue").css("color","white")
            $('.js-tunggal-display__nilai-hukuman[data-juri="' + nomorJuriTertinggi + '"]').css("background-color", "blue").css("color","white")
            $('.js-tunggal-display__nilai-hukuman[data-juri="' + nomorJuriTertinggi + '"]').css("background-color", "blue").css("color","white")
            $('.js-tunggal-display__nilai-total[data-juri="' + nomorJuriTertinggi + '"]').css("background-color", "blue").css("color","white")
            $('.js-tunggal-display__pengumuman-juri[data-juri="' + nomorJuriTertinggi + '"]').css("background-color", "blue").css("color","white")
            $('.js-tunggal-display__pengumuman-juri[data-juri="' + nomorJuriTertinggi + '"]').text("Tertinggi")
            
            $('.js-tunggal-display__nomor-juri[data-juri="' + nomorJuriTerendah + '"]').css("background-color", "red").css("color","white")
            $('.js-tunggal-display__nilai-kebenaran[data-juri="' + nomorJuriTerendah + '"]').css("background-color", "red").css("color","white")
            $('.js-tunggal-display__nilai-kemantapan[data-juri="' + nomorJuriTerendah + '"]').css("background-color", "red").css("color","white")
            $('.js-tunggal-display__nilai-hukuman[data-juri="' + nomorJuriTerendah + '"]').css("background-color", "red").css("color","white")
            $('.js-tunggal-display__nilai-hukuman[data-juri="' + nomorJuriTerendah + '"]').css("background-color", "red").css("color","white")
            $('.js-tunggal-display__nilai-total[data-juri="' + nomorJuriTerendah + '"]').css("background-color", "red").css("color","white")
            $('.js-tunggal-display__pengumuman-juri[data-juri="' + nomorJuriTerendah + '"]').css("background-color", "red").css("color","white")
            $('.js-tunggal-display__pengumuman-juri[data-juri="' + nomorJuriTerendah + '"]').text("Terendah")
            
            $('.js-tunggal-display__pengumuman').removeAttr("hidden")
        }
  
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
            console.log(data)
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
        })

    })
})(jQuery);