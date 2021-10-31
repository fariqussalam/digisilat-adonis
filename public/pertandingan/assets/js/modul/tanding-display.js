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
            $('.js-tanding-display-poin-merah').text(poinMerah ? poinMerah : 0)
            $('.js-tanding-display-poin-biru').text(poinBiru ? poinBiru : 0)
        }

        function renderPemenang(data, pemberiPoin, hasil_seri) {
            // var $indikatorMerah = $('[data-indikator-merah="true"], .js-tanding-display__nilai[data-sudut="merah"]')
            // var $indikatorBiru = $('[data-indikator-biru="true"], .js-tanding-display__nilai[data-sudut="biru"]')
            $('.js-tanding-display-merah-nama').text(data.merah.nama)
            $('.js-tanding-display-biru-nama').text(data.biru.nama)
            // $indikatorMerah.removeClass("sisi-merah")
            // $indikatorBiru.removeClass("sisi-biru")
            // $indikatorMerah.removeClass("glow-img-danger").css("background-color", "dimgrey")
            // $indikatorBiru.removeClass("glow-img-primary").css("background-color", "dimgrey")
            $('.js-tanding-display__nilai[data-ronde="total"][data-sudut="merah"]')
            .removeClass('glow-img-danger').removeClass('sisi-merah')
            .addClass('sisi-total')
            $('.js-tanding-display__nilai[data-ronde="total"][data-sudut="biru"]')
            .removeClass('sisi-biru')
            .removeClass('glow-img-primary')
            .addClass('sisi-total')
            if (data.pemenang === 'MERAH') {
                $('.js-tanding-display-merah-nama').text(data.merah.nama + " (Pemenang)")
                $('.sisi-biru.display-name').css("background-color", "dimgrey")
                $('.sisi-merah.display-name').addClass("glow-img-danger")
            } else if (data.pemenang === 'BIRU') {
                $('.js-tanding-display-biru-nama').text(data.biru.nama + " (Pemenang)")
                $('.sisi-merah.display-name').css("background-color", "dimgrey")
                $('.sisi-biru.display-name').addClass("glow-img-primary")
            }

            _.each(pemberiPoin.merah, function(m) {
                // $('[data-indikator-merah="true"][data-juri="' + m + '"]').addClass("glow-img-danger")
                $('.js-tanding-display__nilai[data-ronde="total"][data-sudut="merah"][data-juri="'+ m +'"]').removeClass('sisi-total').addClass('sisi-merah').addClass("glow-img-danger")
                // $('.js-tanding-display__nilai[data-ronde="total"][data-sudut="biru"][data-juri="'+ m +'"]').addClass('sisi-total')
                // $('[data-indikator-biru="true"][data-juri="' + m + '"]').css("background-color", "dimgrey")
            })
            _.each(pemberiPoin.biru, function(m) {
                // $('.js-tanding-display__nilai[data-ronde="total"][data-sudut="biru"][data-juri="'+ m +'"]').addClass('sisi-biru')
                // // $('[data-indikator-biru="true"][data-juri="' + m + '"]').addClass("glow-img-primary")
                // $('.js-tanding-display__nilai[data-ronde="total"][data-sudut="biru"][data-juri="'+ m +'"]').addClass("glow-img-primary").css("background-color", "")
                // $('.js-tanding-display__nilai[data-ronde="total"][data-sudut="merah"][data-juri="'+ m +'"]').css("background-color", "dimgrey")
                // // $('[data-indikator-merah="true"][data-juri="' + m + '"]').css("background-color", "dimgrey")
                $('.js-tanding-display__nilai[data-ronde="total"][data-sudut="biru"][data-juri="'+ m +'"]').removeClass('sisi-total').addClass('sisi-biru').addClass("glow-img-primary")
                // $('.js-tanding-display__nilai[data-ronde="total"][data-sudut="merah"][data-juri="'+ m +'"]').addClass('sisi-total')
            })

            if (hasil_seri && hasil_seri.length > 0) {
                _.each(hasil_seri, function(item) {
                    if (item.pemenang == "merah") {
                        $('.js-tanding-display__nilai[data-ronde="total"][data-sudut="merah"][data-juri="'+ item.nomor_juri +'"]').removeClass('sisi-total').addClass('sisi-merah').addClass("glow-img-danger")
                    } else if (item.pemenang == "biru") {
                        $('.js-tanding-display__nilai[data-ronde="total"][data-sudut="biru"][data-juri="'+ item.nomor_juri +'"]').removeClass('sisi-total').addClass('sisi-biru').addClass("glow-img-primary")
                    }
                })
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
            var pemberiPoin = {
                merah: [],
                biru: []
            }
            _.each(juriList, function(nomorJuri) {
                var juri = new DigiSilat.Juri(nomorJuri);
                juri.penilaian = state.dewanJuri[nomorJuri].penilaian
                renderInitialData(juri);

                var poin = juri.getRingkasanNilai()
                poinMerah = poinMerah + poin.merah
                poinBiru = poinBiru + poin.biru
                if (poin.merah == 1) {
                    pemberiPoin.merah.push(juri.nomorJuri)
                } else if (poin.biru == 1) {
                    pemberiPoin.biru.push(juri.nomorJuri)
                }
                renderPoin(poinMerah, poinBiru)
            }) ;
            setWarnaRonde(state.ronde)
            if (data.pemenang) {
                state.hasil_seri = data.hasil_seri
                renderPemenang(data, pemberiPoin, data.hasil_seri)
                renderPoin(data.skor_merah, data.skor_biru)
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