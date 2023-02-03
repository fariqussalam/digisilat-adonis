(function () {
    $(function () {

        var pertandinganId = $('input[name="pertandingan_id"]').val();
        var state = new DigiSilat.State.Display();
        var $panelPemenang = $('.js-panel-pengumuman-pemenang')

        function renderInitialData(juri) {
            _.each(DigiSilat.getSudutList(), function(sudut) {
                var nilaiPerSudut = 0
                _.each(DigiSilat.getRondeList(), function(ronde) {
                    if (ronde == state.ronde) {
                        var nilai = juri.getNilai(sudut, ronde);
                        nilaiPerSudut = nilaiPerSudut + nilai.totalRonde
                    }
                //     var nilai = juri.getNilai(sudut, ronde);
                //     nilaiPerSudut = nilaiPerSudut + nilai.totalRonde
                //   //  renderNilai(sudut, juri.nomorJuri, ronde, nilai.totalRonde, nilai.total);
                })
                
                renderNilaiSudut(sudut, nilaiPerSudut)
            })
        }

        function renderRonde(ronde) {
            $('.indikator-ronde').text("Ronde " + ronde)
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
            $(".js-tanding-display-biru-nama").text(pertandingan.biru.nama);
            $(".js-tanding-display-biru-kontingen").text(pertandingan.biru.kontingen.nama);
            $(".js-tanding-display-kuning-nama").text(pertandingan.kuning.nama);
            $(".js-tanding-display-kuning-kontingen").text(pertandingan.kuning.kontingen.nama);
        }

        function renderNilai(sudut, nomorJuri, ronde, totalRonde, total) {
            var $totalRonde = $('.js-tanding-display__nilai[data-ronde="'+ ronde +'"][data-juri="'+ nomorJuri +'"][data-sudut="'+ sudut +'"]')
            var $total = $('.js-tanding-display__nilai[data-ronde="total"][data-juri="'+ nomorJuri +'"][data-sudut="'+ sudut +'"]')
            $totalRonde.text(totalRonde);
            $total.text(total);
        }

        function renderNilaiSudut(sudut, nilaiPerSudut) {
            $('.js-total-nilai[data-sudut="' + sudut + '"]').text(nilaiPerSudut)
        }

        function renderPoin(poinMerah, poinBiru) {
            $('.js-tanding-display-poin-merah').text(poinMerah ? poinMerah : 0)
            $('.js-tanding-display-poin-biru').text(poinBiru ? poinBiru : 0)
        }

        function renderPemenang(data, pemberiPoin, hasil_seri) {
            if (data.pemenang === 'KUNING') {
                $('.js-pemenang-nama').text(data.kuning.nama)
                $('.js-tanding-display-kuning-nama').text(data.kuning.nama + " (Pemenang)")
                $('.sisi-biru.display-name').css("background-color", "dimgrey")
                $('.sisi-kuning.display-name').addClass("glow-img-warning")
            } else if (data.pemenang === 'BIRU') {
                $('.js-pemenang-nama').text(data.biru.nama)
                $('.js-tanding-display-biru-nama').text(data.biru.nama + " (Pemenang)")
                $('.sisi-kuning.display-name').css("background-color", "dimgrey")
                $('.sisi-biru.display-name').addClass("glow-img-primary")
            }
            $('.js-pemenang-sudut').text(data.pemenang)
            $('.js-pemenang-hasil').text(data.alasan_kemenangan)

            if (hasil_seri && hasil_seri.length > 0) {
                _.each(hasil_seri, function(item) {
                    if (item.pemenang == "merah") {
                        $('.js-tanding-display__nilai[data-ronde="total"][data-sudut="merah"][data-juri="'+ item.nomor_juri +'"]').removeClass('sisi-total').addClass('sisi-merah').addClass("glow-img-danger")
                    } else if (item.pemenang == "biru") {
                        $('.js-tanding-display__nilai[data-ronde="total"][data-sudut="biru"][data-juri="'+ item.nomor_juri +'"]').removeClass('sisi-total').addClass('sisi-biru').addClass("glow-img-primary")
                    }
                })
            }

            hitungPemenangPerRonde(data)

        }

        function hitungPemenangPerRonde(data) {
            $('.js-indikator-pemenang-ronde').show()
            var juri = new DigiSilat.Juri(1);
            juri.penilaian = data.dewanJuri["1"].penilaian
            _.each(DigiSilat.getRondeList(), function(ronde) {
                var nilaiBiru =  juri.getTotalRonde("biru", ronde);
                var nilaiKuning = juri.getTotalRonde("kuning", ronde);
                if (nilaiBiru > nilaiKuning) {
                    $('.js-indikator-pemenang-ronde[data-ronde="' + ronde + '"][data-sudut="kuning"]').hide()
                } else if (nilaiKuning > nilaiBiru) {
                    $('.js-indikator-pemenang-ronde[data-ronde="' + ronde + '"][data-sudut="biru"]').hide()
                }
            })
           
        }

        $(document).ready(function() {
            renderRonde(state.ronde)
            socket.emit('get-data-pertandingan', { pertandinganId: pertandinganId })
            $panelPemenang.hide()
        });

        var socket = DigiSilat.createSocket("tanding", "Tanding Display", pertandinganId);
        socket.on('data-pertandingan', function(data) {
            setDataPertandingan(data)
            state.dewanJuri = data.dewanJuri;
            state.ronde = data.ronde

            var juriList = ["1"];
            var poinMerah = 0, poinBiru = 0;
            var pemberiPoin = {
                merah: [],
                biru: []
            }
            _.each(juriList, function(nomorJuri) {
                var juri = new DigiSilat.Juri(nomorJuri);
                juri.penilaian = state.dewanJuri[nomorJuri].penilaian
                renderInitialData(juri);

                // var poin = juri.getRingkasanNilai()
                // poinMerah = poinMerah + poin.merah
                // poinBiru = poinBiru + poin.biru
                // if (poin.merah == 1) {
                //     pemberiPoin.merah.push(juri.nomorJuri)
                // } else if (poin.biru == 1) {
                //     pemberiPoin.biru.push(juri.nomorJuri)
                // }
                // renderPoin(poinMerah, poinBiru)
            }) ;
            renderRonde(state.ronde)
            if (data.pemenang && data.pemenang != "-") {
                console.log(data)
                $panelPemenang.show()
                state.hasil_seri = data.hasil_seri
                renderPemenang(data, pemberiPoin, data.hasil_seri)
                renderPoin(data.skor_merah, data.skor_biru)
            }
        })
        socket.on('kontrol-ronde', function(currentRonde) {
            state.ronde = currentRonde
            renderRonde(currentRonde)
            socket.emit('get-data-pertandingan', { pertandinganId: pertandinganId })
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