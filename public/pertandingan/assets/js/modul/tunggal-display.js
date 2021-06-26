(function () {
    $(function () {

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
            for (var nomorJuri in data.dewanJuri) {
                var juri = data.dewanJuri[nomorJuri]
                renderNilaiJurus(juri)
                renderNilaiHukuman(juri)
                renderTotalNilai(juri)
                renderNilaiKemantapan(juri)
            }
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
  

        function getMaxOfArray(numArray) {
            return Math.max.apply(null, numArray);
        }
        function getMinOfArray(numArray) {
            return Math.min.apply(null, numArray);
        }

        function getJuriMax() {
            var totalNilaiArray = []
            for (var i = 1; i <= 5; i++) {
                totalNilaiArray.push(dewanJuri[i].getTotalNilai());
            }
            var totalNilai = getMaxOfArray(totalNilaiArray);
            var juriMax;
            for (var x = 1; x <= 5; x++) {
                var nilai = dewanJuri[x].getTotalNilai();
                if (totalNilai === nilai) {
                    juriMax = dewanJuri[x];
                    return juriMax;
                }
            }
        }
        function getJuriMin(excluded) {
            var totalNilaiArray = []
            for (var i = 1; i <= 5; i++) {
                totalNilaiArray.push(dewanJuri[i].getTotalNilai());
            }
            var totalNilai = getMinOfArray(totalNilaiArray);
            var juriMin;
            for (var x = 1; x <= 5; x++) {
                var isExcluded = excluded != null && excluded.nomorJuri === dewanJuri[x].nomorJuri
                if (!isExcluded) {
                    var nilai = dewanJuri[x].getTotalNilai();
                    if (totalNilai === nilai) {
                        juriMin = dewanJuri[x];
                        return juriMin;
                    }
                }
            }
        }

        var $tabelMax = $('.js-tunggal-display__tabel-max');
        var $tabelMin = $('.js-tunggal-display__tabel-min');
        var $tabelTotal = $('.js-tunggal-display__tabel-total');

        $(document).ready(function() {
            $tabelMax.hide();
            $tabelMin.hide();
            $tabelTotal.hide();
            for (var i = 1; i <= 5; i++) {
                renderNilaiJurus(i)
                renderNilaiHukuman(i)
                renderTotalNilai(i)
                renderNilaiKemantapan(i)
            }
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