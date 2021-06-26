(function () {
    $(function () {

        var pertandinganId = $('input[name="pertandingan_id"]').val();
        var state = new DigiSilat.Seni.State.Dewan();
        var socket = DigiSilat.createSocket("tunggal", "Tunggal Dewan", pertandinganId)

        socket.on("connect", function() {
            socket.emit('get-data-pertandingan-seni', { pertandinganId: pertandinganId })
        });
        socket.on('data-pertandingan-seni', function(data) {
            console.log("Data Pertandingan Seni", data)
            renderPertandingan(data)
        })

        function renderPertandingan(data) {
            state.dewanJuri = data.dewanJuri
            for (var nomorJuri in data.dewanJuri) {
                var juri = data.dewanJuri[nomorJuri]
                for (var jurus of juri.daftarNilai) {
                    renderNilaiJurus(juri, jurus.nomorJurus)
                }
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

        function NilaiJurus(nomorJurus, jumlahNilai) {
            this.nomorJurus = nomorJurus;
            this.jumlahNilai = jumlahNilai;
        }

        function nilaiTunggalTemplate() {
            var daftarNilai = [
                7, 6, 5, 7, 6, 8, 11, 7, 6, 12, 6, 5, 5, 9
            ]
            var jurusTunggal = []
            $.each(daftarNilai, function(idx, el) {
                jurusTunggal.push(new NilaiJurus(idx + 1, el))
            })
            return jurusTunggal
        }

        function renderNilaiJurus(juri, nomorJurus) {
            var nilaiJurus = getNilaiJurus(juri, nomorJurus);
            var totalNilaiJurus = getTotalNilaiJurus(juri);
            $('.js-tunggal-admin__nilai[data-juri="' + juri.nomorJuri + '"][data-jurus="' + nomorJurus + '"]').text(nilaiJurus);
            $('.js-tunggal-admin__nilai[data-juri="' + juri.nomorJuri + '"][data-jurus="total"]').text(totalNilaiJurus);
        }
        function renderNilaiHukuman(juri) {
            var nilaiHukuman = getTotalNilaiHukuman(juri);
            $('.js-tunggal-admin__hukuman[data-juri="' + juri.nomorJuri + '"]').text(nilaiHukuman);
        }
        function renderTotalNilai(juri) {
            var totalNilai = getTotalNilai(juri);
            $('.js-tunggal-admin__nilai-total[data-juri="' + juri.nomorJuri + '"]').text(totalNilai);
        }
        function renderNilaiKemantapan(juri) {
            $('.js-tunggal-admin__kemantapan[data-juri="' + juri.nomorJuri + '"]').text(juri.kemantapan);
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

        socket.on('display_pengumuman', function(data) {
            var juriMax = getJuriMax();
            var juriMin = getJuriMin(juriMax);
            var totalNilai = 0
            for (var i = 1; i <= 5; i++) {
                totalNilai += dewanJuri[i].getTotalNilai();
            }
            totalNilai = totalNilai - juriMax.getTotalNilai();
            totalNilai = totalNilai - juriMin.getTotalNilai();
            $('.js-tunggal-admin__display-nilai-total[data-juri="' + juriMax.nomorJuri + '"]').append(" (TERTINGGI)")
            $('.js-tunggal-admin__display-nilai-total[data-juri="' + juriMin.nomorJuri + '"]').append(" (TERENDAH)")
            $('.js-tunggal-admin__nilai-total[data-juri="' + juriMax.nomorJuri + '"]').css("background-color", "red").css("color","white")
            $('.js-tunggal-admin__nilai-total[data-juri="' + juriMin.nomorJuri + '"]').css("background-color", "blue").css("color","white")
            $(".js-tunggal-admin__total-nilai").text(totalNilai);
            var currentDate = utils.getCurrentDateTime();
            $('.js-current-date').text(" " + currentDate.date);
            $('.js-current-time').text(" " + currentDate.time);

        });
    
        $('.js-dewan-tanding__save-pdf').click(function() {
            var url = window.location.href + "?for_printed=1"
            console.log(url)
            $('input[name="printed_url"]').val(url)
            $('form[name="export-pdf-form"]').submit()
        })



    })
})(jQuery);