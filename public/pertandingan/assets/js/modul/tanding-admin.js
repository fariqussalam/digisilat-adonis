(function () {
    $(function () {

        function renderInitialData(juri) {
            _.each(DigiSilat.getSudutList(), function(sudut) {
                _.each(DigiSilat.getRondeList(), function(ronde) {
                    var nilai = juri.getNilai(sudut, ronde);
                    renderNilai(sudut, juri.nomorJuri, ronde, nilai.poin, nilai.minus, nilai.totalRonde, nilai.total, nilai.nilaiPoin, nilai.jatuhan);
                })
            })
        }

        function renderNilai(sudut, nomorJuri, ronde, poin, minus, totalRonde, total, nilaiPoin, jatuhan) {
            var $poin = $(".js-nilai-pertandingan[data-ronde='"+ ronde +"'][data-juri='"+nomorJuri +"'][data-sudut='"+sudut+"'][data-tipe='poin']")
            var $minus = $(".js-nilai-pertandingan[data-ronde='"+ ronde +"'][data-juri='"+ nomorJuri +"'][data-sudut='"+sudut+"'][data-tipe='minus']")
            var $totalRonde = $(".js-nilai-pertandingan[data-ronde='"+ ronde +"'][data-juri='"+ nomorJuri +"'][data-sudut='"+sudut+"'][data-tipe='total']")
            var $jatuhan = $(".js-nilai-pertandingan[data-ronde='"+ ronde +"'][data-juri='"+ nomorJuri +"'][data-sudut='"+sudut+"'][data-tipe='jatuhan']")
            var $nilaiPoin = $(".js-nilai-pertandingan[data-ronde='"+ ronde +"'][data-juri='"+ nomorJuri +"'][data-sudut='"+sudut+"'][data-tipe='nilai']")
            var $total = $(".js-nilai-pertandingan[data-ronde='total'][data-juri='"+ nomorJuri +"'][data-sudut='"+sudut+"'][data-tipe='total']")
            $poin.text(poin.join(","));
            $minus.text(minus.join(","));
            $jatuhan.text(jatuhan.join(","));
            $nilaiPoin.text(nilaiPoin.join(","));
            $totalRonde.text(totalRonde);
            $total.text(total);

        }

        var pertandinganId = $('input[name="pertandingan_id"]').val();
        var state = new DigiSilat.State.Dewan();
        var socket = DigiSilat.createSocket("Tanding Dewan", pertandinganId)

        socket.on("connect", function() {
            console.log(socket.connected)
            socket.emit('get-data-pertandingan', { pertandinganId: pertandinganId })
        });
        socket.on('data-pertandingan', function(data) {
            setDataPertandingan(data)
            state.dewanJuri = data.dewanJuri;
            var juriList = _.keys(state.dewanJuri);
            _.each(juriList, function(nomorJuri) {
                var juri = new DigiSilat.Juri(nomorJuri);
                juri.penilaian = state.dewanJuri[nomorJuri].penilaian
                renderInitialData(juri);
            }) ;

            if (data.pemenang == "MERAH" || data.pemenang == "BIRU") {
                if (data.updated_at) setDateAndTime(data.updated_at)
                setDataPemenang(data)
            }
        })
        socket.on('pengumuman-pemenang', function(data) {
            if (!data) return false;
            $(".js-pemenang__sudut").text("  " + data.sudut);
            $(".js-pemenang__nama").text("  " + data.nama);
            $(".js-pemenang__kontingen").text("  " + data.kontingen);
            $(".js-pemenang__point").text("  " + data.poin);
        });

        function setDataPertandingan(pertandingan) {

            var $kelas = $(".js-data-pertandingan__kelas-gender"),
                $partai = $(".js-data-pertandingan__nomor-partai"),
                $merah = {
                    nama: $(".js-data-pertandingan__merah-nama"),
                    kontingen: $(".js-data-pertandingan__merah-kontingen")
                },
                $biru = {
                    nama: $(".js-data-pertandingan__biru-nama"),
                    kontingen: $(".js-data-pertandingan__biru-kontingen")
                };

            $kelas.text(pertandingan.kelas.nama);
            $partai.text(pertandingan.nomor_partai);
            $merah.nama.text(pertandingan.merah.nama);
            $merah.kontingen.text(pertandingan.merah.kontingen.nama);
            $biru.nama.text(pertandingan.biru.nama);
            $biru.kontingen.text(pertandingan.biru.kontingen.nama);
        }

        function setDateAndTime(date) {
            $(".js-current-date").text("  " + date);
        }

        function setDataPemenang(data) {
            var pemenang, sudut, alasan_kemenangan = "-";
            if (data.pemenang === 'MERAH') {
                pemenang = data.merah
                sudut = 'Merah'
            } else if(data.pemenang === 'BIRU') {
                pemenang = data.biru
                sudut = 'Biru'
            }

            if (data.alasan_kemenangan) alasan_kemenangan = data.alasan_kemenangan
            if (pemenang && sudut) {
                $(".js-pemenang__sudut").text("  " + sudut);
                $(".js-pemenang__nama").text("  " + pemenang.nama);
                $(".js-pemenang__kontingen").text("  " + pemenang.kontingen.nama);
                $(".js-pemenang__alasan").text(alasan_kemenangan);
            }
        }

        $('.js-dewan-tanding__save-pdf').click(function() {
            var url = window.location.href + "?for_printed=1"
            console.log(url)
            $('input[name="printed_url"]').val(url)
            $('form[name="export-pdf-form"]').submit()
        })
    })
})(jQuery);