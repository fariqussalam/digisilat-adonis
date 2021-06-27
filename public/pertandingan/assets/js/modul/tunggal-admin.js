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
            if (data.skor_akhir != null) {
                renderSkorAkhir(data.skor_akhir)
                renderTanggalPertandingan(data.tanggal_pertandingan)
            }
        }

        function renderSkorAkhir(skor_akhir) {
            $('.js-tunggal-admin__display-nilai-total[data-juri="' + skor_akhir.juriTeratas.nomorJuri + '"]').append(" (TERTINGGI)")
            $('.js-tunggal-admin__display-nilai-total[data-juri="' + skor_akhir.juriTerendah.nomorJuri + '"]').append(" (TERENDAH)")
            $('.js-tunggal-admin__nilai-total[data-juri="' + skor_akhir.juriTeratas.nomorJuri + '"]').css("background-color", "red").css("color","white")
            $('.js-tunggal-admin__nilai-total[data-juri="' + skor_akhir.juriTerendah.nomorJuri + '"]').css("background-color", "blue").css("color","white")
            $(".js-tunggal-admin__total-nilai").text(skor_akhir.totalNilai);
        }

        function renderTanggalPertandingan(tanggal_pertandingan) {
            $('.js-current-date').text(" " + tanggal_pertandingan);
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
    
        $('.js-dewan-tanding__save-pdf').click(function() {
            var url = window.location.href + "?for_printed=1"
            console.log(url)
            $('input[name="printed_url"]').val(url)
            $('form[name="export-pdf-form"]').submit()
        })
    })
})(jQuery);