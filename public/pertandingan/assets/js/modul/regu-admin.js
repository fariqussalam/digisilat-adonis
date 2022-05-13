(function () {
    $(function () {

        var pertandinganId = $('input[name="pertandingan_id"]').val();
        var state = new DigiSilat.Seni.State.Dewan();
        var socket = DigiSilat.createSocket("regu", "Regu Dewan", pertandinganId)

        socket.on("connect", function() {
            socket.emit('get-data-pertandingan-seni', { pertandinganId: pertandinganId })
        });
        socket.on('data-pertandingan-seni', function(data) {
            console.log("Data Pertandingan Seni", data)
            renderPertandingan(data)
        })

        function renderPertandingan(data) {
            state.dewanJuri = data.dewanJuri
            var isDisqualified = _.find(_.values(data.dewanJuri), function(j) {
                return j.diskualifikasi == true
            })
            if (isDisqualified) {
                for (var nomorJuri in data.dewanJuri) {
                    diskualifikasiPeserta(nomorJuri)
                }
                return;
            }
            var excluded = ["4", "5"]
            for (var nomorJuri in data.dewanJuri) {
                if (_.contains(excluded, nomorJuri)) {
                    continue
                }
                var juri = data.dewanJuri[nomorJuri]
                
                for (var jurus of juri.daftarNilai) {
                    renderNilaiJurus(juri, jurus.nomorJurus)
                }
                $.each(juri.hukuman, function(idx, hukuman) {
                    var nama = hukuman.kategori
                    var namaKelas = "." + nama;
                    if (nama === 'w-5' || nama === 'w-10') {
                        var nilai = nama === 'w-10' ? '-10' : '-5';
                        $(namaKelas + '[data-juri="' + nomorJuri + '"]').find('span').text(nilai);
                    } else {
                        var currentCount = parseInt($(namaKelas + '[data-juri="' + nomorJuri + '"]').find('span').text());
                        $(namaKelas + '[data-juri="' + nomorJuri + '"]').find('span').text(currentCount+1);
                    }
                });
                renderNilaiHukuman(juri)
                renderTotalNilai(juri)
                renderNilaiKemantapan(juri)
            }
            if (data.skor_akhir != null) {
                renderSkorAkhir(data.skor_akhir)
                renderTanggalPertandingan(data.tanggal_pertandingan)
            }
            
            _.each(excluded, function(nomorJuri) {
                $(".js-dewan-regu__juri[data-juri='"+nomorJuri+"']").css("display", "none")
            })
        }

        function renderSkorAkhir(skor_akhir) {
            $('.display-total[data-juri="' + skor_akhir.juriTeratas.nomorJuri + '"]').text("JURI " + skor_akhir.juriTeratas.nomorJuri + " (TERTINGGI)")
            $('.display-total[data-juri="' + skor_akhir.juriTerendah.nomorJuri + '"]').text("JURI " + skor_akhir.juriTerendah.nomorJuri + " (TERENDAH)")
            $('.nilai-total[data-juri="' + skor_akhir.juriTeratas.nomorJuri + '"]').css("background-color", "red").css("color","white")
            $('.nilai-total[data-juri="' + skor_akhir.juriTerendah.nomorJuri + '"]').css("background-color", "blue").css("color","white")
            $(".total-nilai").text(skor_akhir.totalNilai);
        }

        function renderTanggalPertandingan(tanggal_pertandingan) {
            $('.js-current-date').text(tanggal_pertandingan);
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
            $('.nilai-kebenaran[data-juri="' + juri.nomorJuri + '"][data-jurus="' + nomorJurus + '"]').text(nilaiJurus);
            $('.nilai-kebenaran-total[data-juri="' + juri.nomorJuri + '"]').text(totalNilaiJurus);
        }
        function renderNilaiHukuman(juri) {
            var nilaiHukuman = getTotalNilaiHukuman(juri);
            $('.nilai-hukuman[data-juri="' + juri.nomorJuri + '"]').text(nilaiHukuman);
        }
        function renderTotalNilai(juri) {
            var totalNilai = getTotalNilai(juri);
            $('.nilai-total[data-juri="' + juri.nomorJuri + '"]').text(totalNilai);
        }
        function renderNilaiKemantapan(juri) {
            $('.nilai-kekompakan[data-juri="' + juri.nomorJuri + '"]').text(juri.kemantapan);
        }
    
        $('.js-dewan-tanding__save-pdf').click(function() {
            var url = window.location.href + "?for_printed=1"
            console.log(url)
            $('input[name="printed_url"]').val(url)
            $('form[name="export-pdf-form"]').submit()
        })

        function diskualifikasiPeserta(nomorJuri) {
            var tandaDiskualifikasi = 'DIS';
            $('.nilai-kebenaran-total[data-juri="' + nomorJuri + '"]').text(tandaDiskualifikasi);
            $('.nilai-hukuman[data-juri="' + nomorJuri + '"]').text(tandaDiskualifikasi);
            $('.nilai-total[data-juri="' + nomorJuri + '"]').text(tandaDiskualifikasi);
            $('.nilai-kekompakan[data-juri="' + nomorJuri + '"]').text(tandaDiskualifikasi);
        }

      
    })
})(jQuery);