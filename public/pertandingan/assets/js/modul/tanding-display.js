(function () {
    $(function () {

        var pertandinganId = $('input[name="pertandingan_id"]').val();
        var state = new DigiSilat.State.Display();

        function renderInitialData(juri) {
            _.each(DigiSilat.getSudutList(), function(sudut) {
                _.each(DigiSilat.getRondeList(), function(ronde) {
                    var nilai = juri.getNilai(sudut, ronde);
                    renderNilai(sudut, juri.nomorJuri, ronde, nilai.totalRonde, nilai.total);
                })
            })
        }

        function setWarnaRonde(ronde) {
            $('.js-tanding-display-ronde').css({
                "background-color": "white",
                "color": "black"
            })
            $('.js-tanding-display-ronde[data-ronde="'+ronde+'"]').css({
                "background-color": "Green",
                "color": "white"
            })
        }

        function setDataPertandingan(pertandingan) {
            $(".js-tanding-display-table-pengumuman").hide();
            $(".js-tanding-display-kelas").text(pertandingan.kelas.nama);
            $(".js-tanding-display-merah-nama").text(pertandingan.merah.nama);
            $(".js-tanding-display-merah-kontingen").text(pertandingan.merah.kontingen.nama);
            $(".js-tanding-display-biru-nama").text(pertandingan.biru.nama);
            $(".js-tanding-display-biru-kontingen").text(pertandingan.biru.kontingen.nama);
        }

        function renderNilai(sudut, nomorJuri, ronde, totalRonde, total) {
            var $totalRonde = $('.js-tanding-display__nilai[data-ronde="'+ ronde +'"][data-juri="'+ nomorJuri +'"][data-sudut="'+ sudut +'"]')
            var $total = $('.js-tanding-display__nilai[data-ronde="total"][data-juri="'+ nomorJuri +'"][data-sudut="'+ sudut +'"]')
            $totalRonde.text(totalRonde);
            $total.text(total);
        }

        function renderPoin(poinMerah, poinBiru) {
            $('.js-tanding-display-poin-merah').text(poinMerah)
            $('.js-tanding-display-poin-biru').text(poinBiru)
        }

        function renderPemenang(data) {
            var $indikatorMerah = $('[data-indikator-merah="true"], .js-tanding-display__nilai[data-sudut="merah"]')
            var $indikatorBiru = $('[data-indikator-biru="true"], .js-tanding-display__nilai[data-sudut="biru"]')
            $('.js-tanding-display-merah-nama').text(data.merah.nama)
            $('.js-tanding-display-biru-nama').text(data.biru.nama)
            $indikatorMerah.removeClass("glow-img-danger").css("background-color", "red")
            $indikatorBiru.removeClass("glow-img-primary").css("background-color", "")
            if (data.pemenang === 'MERAH') {
                $('.js-tanding-display-merah-nama').text(data.merah.nama + " (Pemenang)")
                $('[data-indikator-merah="true"]').addClass("glow-img-danger")
                $('.js-tanding-display__nilai[data-sudut="merah"]').addClass("glow-img-danger")

                $('[data-indikator-biru="true"]').css("background-color", "dimgrey")
                $('.js-tanding-display__nilai[data-sudut="biru"]').css("background-color", "dimgrey")
            } else if (data.pemenang === 'BIRU') {
                $('.js-tanding-display-biru-nama').text(data.biru.nama + " (Pemenang)")
                $('[data-indikator-biru="true"]').addClass("glow-img-primary")
                $('.js-tanding-display__nilai[data-sudut="biru"]').addClass("glow-img-primary")

                $('[data-indikator-merah="true"]').css("background-color", "dimgrey")
                $('.js-tanding-display__nilai[data-sudut="merah"]').css("background-color", "dimgrey")
            }
        }

        $(document).ready(function() {
            setWarnaRonde(state.ronde)
            socket.emit('get-data-pertandingan', { pertandinganId: pertandinganId })
        });

        var socket = DigiSilat.createSocket("tanding", "Tanding Display", pertandinganId);
        socket.on('data-pertandingan', function(data) {
            setDataPertandingan(data)
            state.dewanJuri = data.dewanJuri;
            state.ronde = data.ronde

            var juriList = _.keys(state.dewanJuri);
            var poinMerah = 0, poinBiru = 0;
            _.each(juriList, function(nomorJuri) {
                var juri = new DigiSilat.Juri(nomorJuri);
                juri.penilaian = state.dewanJuri[nomorJuri].penilaian
                renderInitialData(juri);

                var poin = juri.getRingkasanNilai()
                poinMerah = poinMerah + poin.merah
                poinBiru = poinBiru + poin.biru
                renderPoin(poinMerah, poinBiru)
            }) ;
            setWarnaRonde(state.ronde)
            if (data.pemenang) {
                renderPemenang(data)
            }
        })
        socket.on('kontrol-ronde', function(currentRonde) {
            state.ronde = currentRonde
            setWarnaRonde(currentRonde)
        })

        function resetCountdown() {
            state.countdown = 0
        }
        var $clock = $('.js-timer-clock');
        var timer = new easytimer.Timer({precision:"secondTenths", countdown: true})
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
                timer.stop();
            } else if (data.command == 'reset') {
                resetCountdown();
                timer.stop();
                timer.start({startValues: {seconds: state.countdown}});
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