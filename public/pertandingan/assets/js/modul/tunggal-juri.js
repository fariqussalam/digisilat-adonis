(function () {
    $(function () {

        var tempSkor = "";
        var stateKemantapan = 0;
        var nilaiKemantapan = 0;
        var currentJurus = 0;
        var nilaiHukuman = 0;
        var stateDis = 0;
        var stateWaktu = 0;

        function NilaiJurus(nomorJurus, jumlahNilai) {
            this.nomorJurus = nomorJurus;
            this.jumlahNilai = jumlahNilai;
            this.isAktif = false;
        }

        function nilaiTunggalTemplate() {
            var daftarNilai = [
                7, 6, 5, 7, 6, 8, 11, 7, 6, 12, 6, 5, 5, 9
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

        function JuriTunggal(nomorJuri) {
            this.nomorJuri = nomorJuri;
            this.daftarNilai = nilaiTunggalTemplate();
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

        var juri = new JuriTunggal(1);

        function displayNilaiKebenaran() {
            $('.js-tunggal-juri__nilai-kebenaran').text(juri.getTotalNilaiJurus());
        }

        function displayNilaiTotal() {
            $('.js-tunggal-juri__nilai-total').text(juri.getTotalNilai());
        }

        function highlightCurrentJurus(jurus) {
            $('.js-tunggal-juri__display-jurus[data-jurus="' + jurus + '"]').css({
                "background-color": "red",
                "color": "white"
            });
            $('.js-tunggal-juri__skor-jurus[data-jurus="' + jurus + '"]').css({
                "background-color": "red",
                "color": "white"
            });
            $('.js-tunggal-juri__display-jurus[data-jurus!="' + jurus + '"]').css({
                "background-color": "",
                "color": ""
            });
            $('.js-tunggal-juri__skor-jurus[data-jurus!="' + jurus + '"]').css({
                "background-color": "",
                "color": ""
            });
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

        var $modalJuri = $("#modalAwal");
        $(document).ready(function () {
            currentJurus = 1;
            highlightCurrentJurus(currentJurus);
            _.each(juri.daftarNilai, function (jurus) {
                $('.js-tunggal-juri__skor-jurus[data-jurus="' + jurus.nomorJurus + '"]').text(jurus.jumlahNilai);
            })
            displayNilaiKebenaran();
            displayNilaiTotal();
            $modalJuri.modal("show");
        });

        $('.js-tunggal-juri__up-jurus').click(function () {
            currentJurus += 1;
            if (currentJurus > 14) {
                currentJurus = 1;
            }
            highlightCurrentJurus(currentJurus);
        });
        $('.js-tunggal-juri__minus').click(function () {
            if (juri.getNilaiJurus(currentJurus) < 1) return false;
            juri.pengurangan.push(new PenguranganJurus(currentJurus, -1))
            $('.js-tunggal-juri__skor-jurus[data-jurus="' + currentJurus + '"]').text(juri.getNilaiJurus(currentJurus));
            displayNilaiKebenaran();
            displayNilaiTotal();
            inputSkorMinus(String(juri.nomorJuri), String(currentJurus));
        });

        $('.js-tunggal-juri__input-hukuman').click(function () {
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
                $('.js-tunggal-juri__display-hukuman[data-hukuman="faktor-waktu"]').text(hukuman.nilai)
            }

            $('.js-tunggal-juri__display-hukuman[data-hukuman="' + kategori + '"]').text(countHukuman)
            $('.js-tunggal-juri__nilai-hukuman').text(juri.getTotalNilaiHukuman());
            displayNilaiTotal();
            var stringKategori = toStringKategori(kategori)
            inputSkorHukuman(juri.nomorJuri, stringKategori);
        })

        function getTempSkor() {
            return tempSkor;
        }

        function appendTempSkor(skor) {
            tempSkor += skor.toString();
        }

        function setStateKemantapan() {
            stateKemantapan = 1;
        }

        function isStateKemantapan() {
            return stateKemantapan === 1;
        }

        $('.js-tunggal-juri__input-kemantapan').click(function () {
            setStateKemantapan();
            $('.js-tunggal-juri__display-nilai-kemantapan, .js-tunggal-juri__nilai-kemantapan').css({
                "background-color": "green",
                "color": "white"
            })
        });
        $('.js-tunggal-juri__input').click(function () {
            var value = $(this).data("value");
            if (isStateKemantapan() && getTempSkor().length < 2) {
                appendTempSkor(value);
                $('.js-tunggal-juri__nilai-kemantapan').text(parseInt(getTempSkor()))
            }
        });
        $('.js-tunggal-juri__input-clear').click(function () {
            tempSkor = "";
            $(".js-tunggal-juri__nilai-kemantapan").text(0);
        });
        $('.js-tunggal-juri__input-enter').click(function () {
            if (isStateKemantapan() && getTempSkor() !== "") {
                nilaiKemantapan = parseInt(tempSkor);
                juri.kemantapan = nilaiKemantapan;
                displayNilaiTotal();
                inputSkorKemantapan(juri.nomorJuri, nilaiKemantapan);
                $(".js-tunggal-juri__nilai-kemantapan").text(tempSkor);
            }
        });
        $('.js-tunggal-juri__input-dis').click(function () {
            $('#konfirmDis').modal("show");
        });
        $('.btn-konfirm-dis').click(function () {
            $('#konfirmDis').modal('hide');
            stateDis = 1;
            inputDis(juri.nomorJuri);
            $("#modalDis").modal();
        });
        $('.js-tunggal-juri__finish').click(function () {
            window.location.reload(true);
        });
        $('.js-tunggal-juri__hapus-hukuman').click(function () {
            stateWaktu = 0;
            $('.js-tunggal-juri__display-hukuman').text(0)
            $('.js-tunggal-juri__display-hukuman[data-hukuman="salah-pakaian"]').text("Tidak")
            $(".js-tunggal-juri__nilai-hukuman").text(nilaiHukuman);
            displayNilaiTotal();
            juri.hukuman = [];
            socket.emit('hapus_hukuman', juri.nomorJuri);
        });
        $('.js-tunggal-juri__connect').click(function () {
            var nomorJuri = parseInt($(".js-tunggal-juri__select-nomor-juri").val());
            socket.emit('detilkoneksijuri', nomorJuri);
            $(".js-tunggal-juri__nomor-juri").text(nomorJuri);
            juri = new JuriTunggal(nomorJuri);
        });

        var socket = io("/tunggal");
        socket.on('connect', function () {
            socket.emit('koneksi', {name: "Juri Tunggal"});
        });
        socket.on('doRefreshTunggal', function () {
            window.location.reload();
        });

        function inputSkorMinus(nJuri, nJurus) {
            socket.emit('inputSkorMinus', {nJurus: nJurus, nJuri: nJuri});
        }

        function inputSkorKemantapan(nJuri, nilai) {
            socket.emit('inputSkorKemantapan', {nJuri: nJuri, nilai: nilai});
        }

        function inputSkorHukuman(nJuri, nKategori) {
            socket.emit('inputSkorHukuman', {nJuri: nJuri, nKategori: nKategori});
        }

        function inputDis(nJuri) {
            socket.emit('inputDis', nJuri);
        }

    })
})(jQuery);