(function () {
    $(function () {
        var socket = io("/regu");
        var tempSkor = "";
        var stateKekompakan = 0;
        var currentJurus = 0;
        var stateDis = 0;
        var stateWaktu = 0;

        function NilaiJurus(nomorJurus, jumlahNilai) {
            this.nomorJurus = nomorJurus;
            this.jumlahNilai = jumlahNilai;
            this.isAktif = false;
        }

        function nilaiReguTemplate() {
            var daftarNilai = [
                9, 9, 10, 9, 7, 8, 9, 11, 9, 4, 8, 7
            ]
            var jurusTunggal = []
            $.each(daftarNilai, function (idx, el) {
                jurusTunggal.push(new NilaiJurus(idx + 1, el))
            })
            return jurusTunggal
        }

        function PenguranganJurus(nomorJurus, nilai) {
            this.nomorJurus = nomorJurus;
            this.nilai = nilai;
        }

        function NilaiHukuman(kategori) {
            this.kategori = kategori;
            if (kategori === "w-10") this.nilai = -10;
            else this.nilai = -5;
        }

        function JuriRegu(nomorJuri) {
            this.nomorJuri = nomorJuri;
            this.daftarNilai = nilaiReguTemplate();
            this.pengurangan = [];
            this.hukuman = [];
            this.kemantapan = 0;
            this.getNilaiJurus = function (nomorJurus) {
                var jurus = _.filter(this.daftarNilai, function (n) {
                    return n.nomorJurus.toString() === nomorJurus.toString()
                })
                var jumlahNilai = jurus[0].jumlahNilai;
                var penguranganJurus = _.filter(this.pengurangan, function (n) {
                    return n.nomorJurus.toString() === nomorJurus.toString()
                })
                _.each(penguranganJurus, function (n) {
                    jumlahNilai += n.nilai;
                })
                return jumlahNilai
            }
            this.getTotalNilaiJurus = function () {
                var instance = this;
                var totalNilai = 0;
                _.each(this.daftarNilai, function (jurus) {
                    totalNilai += instance.getNilaiJurus(jurus.nomorJurus);
                })
                return totalNilai
            }
            this.getTotalNilaiHukuman = function () {
                var nilaiHukuman = 0
                _.each(this.hukuman, function (n) {
                    nilaiHukuman += n.nilai
                })
                return nilaiHukuman;
            }
            this.getTotalNilai = function () {
                var totalNilaiJurus = this.getTotalNilaiJurus();
                var totalNilaiHukuman = this.getTotalNilaiHukuman();
                return totalNilaiJurus + totalNilaiHukuman + this.kemantapan;
            }
        }

        var juri = new JuriRegu(1);

        function displayNilaiKebenaran() {
            $('.js-regu-juri__nilai-kebenaran').text(juri.getTotalNilaiJurus());
        }

        function displayNilaiTotal() {
            $('.js-regu-juri__nilai-total').text(juri.getTotalNilai());
        }

        function highlightCurrentJurus(jurus) {
            $('.js-regu-juri__display-jurus, .js-regu-juri__skor-jurus').css({
                "background-color": "",
                "color": ""
            });
            $('.js-regu-juri__display-jurus[data-jurus="' + jurus + '"], .js-regu-juri__skor-jurus[data-jurus="' + jurus + '"]').css({
                "background-color": "green",
                "color": "white"
            });
        }

        function getTempSkor() {
            return tempSkor;
        }

        function appendTempSkor(skor) {
            tempSkor += skor.toString();
        }

        function setStateKekompakan() {
            stateKekompakan = 1;
        }

        function isStateKekompakan() {
            return stateKekompakan === 1;
        }

        function toStringKategori(kat) {
            switch (kat) {
                case "keluar-garis":
                    return "Keluar Garis"
                case "salah-pakaian":
                    return "Salah Pakaian"
                case "mengeluarkan-suara":
                    return "Mengeluarkan Suara"
                case "senjata-lepas":
                    return "Senjata Lepas"
                case "w-5":
                    return "W5"
                case "w-10":
                    return "W10"
            }
        }

        $(document).ready(function () {
            currentJurus = 1;
            highlightCurrentJurus(currentJurus);
            for (var i = 1; i <= juri.daftarNilai.length; i++) {
                $('.js-regu-juri__skor-jurus[data-jurus="' + i + '"]').text(juri.getNilaiJurus(i))
            }
            displayNilaiKebenaran();
            displayNilaiTotal();
            $(".js-regu-juri__modal-awal").modal();
        });
        $('.js-regu-juri__up-jurus').click(function () {
            currentJurus += 1;
            if (currentJurus > 12) currentJurus = 1;
            highlightCurrentJurus(currentJurus);
        });
        $('.js-regu-juri__input-minus').click(function () {
            juri.pengurangan.push(new PenguranganJurus(currentJurus, -1))
            $('.js-regu-juri__skor-jurus[data-jurus="' + currentJurus + '"]').text(juri.getNilaiJurus(currentJurus));
            displayNilaiKebenaran();
            displayNilaiTotal();
            inputSkorMinus(String(juri.nomorJuri), String(currentJurus));
        });
        $('.js-regu-juri__input-hukuman').click(function () {
            var kategori = $(this).data("hukuman");
            var isHukumanWaktu = $(this).data("waktu") === true;
            var hukuman = new NilaiHukuman(kategori);

            if (kategori === 'salah-pakaian') {
                var count = _.filter(juri.hukuman, function (params) {
                    return params.kategori === 'salah-pakaian'
                }).length
                if (count > 0) {
                    return false;
                }
            }

            if (isHukumanWaktu && stateWaktu > 0) {
                return false;
            }

            juri.hukuman.push(hukuman);
            var countHukuman = _.filter(juri.hukuman, function (params) {
                return params.kategori === kategori
            }).length

            if (kategori === 'salah-pakaian') {
                countHukuman = "Iya"
            }
            if (isHukumanWaktu) {
                stateWaktu = 1
                $('.js-regu-juri__hukuman[data-hukuman="faktor-waktu"]').text(hukuman.nilai)
            }

            $('.js-regu-juri__hukuman[data-hukuman="' + kategori + '"]').text(countHukuman)
            $('.js-regu-juri__nilai-hukuman').text(juri.getTotalNilaiHukuman());
            displayNilaiTotal();
            var stringKategori = toStringKategori(kategori)
            inputSkorHukuman(juri.nomorJuri, stringKategori);
        })
        $('.js-regu-juri__set-kekompakan').click(function () {
            setStateKekompakan();
            $('.js-regu-juri__display-kekompakan, .js-regu-juri__nilai-kekompakan').css({
                "background-color": "green",
                "color": "white"
            });
        });
        $('.js-regu-juri__input').click(function () {
            if (isStateKekompakan()) {
                var value = $(this).data("value");
                appendTempSkor(value.toString())
                $('.js-regu-juri__nilai-kekompakan').text(getTempSkor());
            }
        })
        $('.js-regu-juri__input-clear').click(function () {
            if (isStateKekompakan()) {
                tempSkor = "";
                $('.js-regu-juri__nilai-kekompakan').text(0);
            }
        });
        $('.js-regu-juri__input-enter').click(function () {
            if (isStateKekompakan() && getTempSkor() !== "") {
                var nilaiKekompakan = parseInt(getTempSkor());
                juri.kemantapan = nilaiKekompakan
                inputSkorKekompakan(juri.nomorJuri, nilaiKekompakan);
                $(".js-regu-juri__nilai-kekompakan").text(juri.kemantapan);
                displayNilaiTotal();
            }
        });
        $('#vButtonDis').click(function () {
            $('#konfirmDis').modal();
        });
        $('.btn-konfirm-dis').click(function () {
            $('#konfirmDis').modal('hide');
            stateDis = 1;
            inputDis(juri.nomorJuri);
            $("#modalDis").modal();
        });
        $('.js-regu-juri__hapus-hukuman').click(function () {
            juri.hukuman = [];
            $(".js-regu-juri__hukuman").text(0);
            $(".js-regu-juri__nilai-hukuman").text(0);
            displayNilaiTotal();
            socket.emit('hapus_hukuman', juri.nomorJuri);
        });
        $('#vButtonSelesaiDis').click(function () {
            window.location.reload(true);
        });
        $('.js-regu-juri__finish').click(function () {
            window.location.reload(true);
        });

        $('.js-regu-juri__connect').click(function () {
            var nomorJuri = parseInt($(".jd-regu-juri__select-nomor-juri").val());
            socket.emit('detilkoneksijuri', nomorJuri);
            $(".js-regu-juri__nomor-juri").text(nomorJuri);
            juri = new JuriRegu(nomorJuri);
        });

        socket.on('connect', function () {
            socket.emit('koneksi', {name: "Regu Juri"});
        });
        socket.on("doRefreshRegu", function () {
            window.location.reload();
        });

        function inputSkorMinus(nJuri, nJurus) {
            socket.emit('inputSkorMinus', {
                nJurus: nJurus, nJuri: nJuri
            });
        }

        function inputSkorKekompakan(nJuri, nilai) {
            socket.emit('inputSkorKekompakan', {
                nJuri: nJuri,
                nilai: nilai
            });
        }

        function inputSkorHukuman(nJuri, nKategori) {
            socket.emit('inputSkorHukuman', {
                nJuri: nJuri, nKategori: nKategori
            });
        }

        function inputDis(nomorJuri) {
            socket.emit('inputDis', nomorJuri);
        }
    })
})(jQuery);