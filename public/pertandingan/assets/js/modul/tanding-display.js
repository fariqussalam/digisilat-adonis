(function () {
    $(function () {

        function renderInitialData(juri) {
            _.each(DigiSilat.getSudutList(), function(sudut) {
                _.each(DigiSilat.getRondeList(), function(ronde) {
                    var nilai = juri.getNilai(sudut, ronde);
                    renderNilai(sudut, juri.nomorJuri, ronde, nilai.totalRonde, nilai.total);
                })
            })
        }

        var pertandinganId = $('input[name="pertandingan_id"]').val();
        var state = new DigiSilat.State.Display();

        var pertandingan = new Pertandingan()
        var pemenang = "";

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

        $(document).ready(function() {
            setWarnaRonde(state.ronde)
            socket.emit('get-data-pertandingan', { pertandinganId: pertandinganId })
        });

        var socket = DigiSilat.createSocket("Tanding Display", pertandinganId);
        socket.on('data-pertandingan', function(data) {
            setDataPertandingan(data)
            state.dewanJuri = data.dewanJuri;
            state.ronde = data.ronde
            var juriList = _.keys(state.dewanJuri);
            _.each(juriList, function(nomorJuri) {
                var juri = new DigiSilat.Juri(nomorJuri);
                juri.penilaian = state.dewanJuri[nomorJuri].penilaian
                renderInitialData(juri);
            }) ;
            setWarnaRonde(state.ronde)
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
       
        var Constant = {}
        Constant.MERAH = "merah"
        Constant.BIRU = "biru"
        function setPemenangMerah() {
            $('.js-tanding-display-pemenang__sudut').text("MERAH").css({
                "background-color": "red",
                "color": "white"
            });
            $('.js-tanding-display-pemenang__nama').text(pertandingan.merah.nama)
            $('.js-tanding-display-pemenang__kontingen').text(pertandingan.merah.kontingen.nama)
            $('.js-tanding-display-pemenang__poin').text(poinMerah + " - " + poinBiru)
            var pemenang = {
                sudut: "MERAH",
                nama: pertandingan.merah.nama,
                kontingen: pertandingan.merah.kontingen.nama,
                poin: poinMerah + " - " + poinBiru,
            }
            socket.emit('pengumuman-pemenang', pemenang);
        }
        function setPemenangBiru() {
            $('.js-tanding-display-pemenang__sudut').text("BIRU").css({
                "background-color": "blue",
                "color": "white"
            });
            $('.js-tanding-display-pemenang__nama').text(pertandingan.biru.nama)
            $('.js-tanding-display-pemenang__kontingen').text(pertandingan.biru.kontingen.nama)
            $('.js-tanding-display-pemenang__poin').text(poinMerah + " - " + poinBiru)
            var pemenang = {
                sudut: "BIRU",
                nama: pertandingan.biru.nama,
                kontingen: pertandingan.biru.kontingen.nama,
                poin: poinMerah + " - " + poinBiru,
            }
            socket.emit('pengumuman-pemenang', pemenang);
        }
        socket.on('pengumuman-pemenang', function() {
            if (pemenang === Constant.MERAH) {
                setPemenangMerah()
            } else if (pemenang === Constant.BIRU) {
                setPemenangBiru()
            }
            $('.js-tanding-display-table-pengumuman').show();

        });

    })
})(jQuery);