(function () {
    $(function () {

        var tempSkor = "";
        var stateKemantapan = 0;
        var nilaiKemantapan = 0;
        var currentJurus = 0;
        var nilaiHukuman = 0;
        var stateDis = 0;
        var stateWaktu = 0;

        var pertandinganId = $('input[name="pertandingan_id"]').val();
        var state = new DigiSilat.Seni.State.Juri();
        var socket = DigiSilat.createSocket("tunggal", "Tunggal Juri", pertandinganId)
        var $modalJuri = $("#modalAwal");
        socket.emit('get-data-pertandingan-seni', { pertandinganId: pertandinganId })
        $(document).ready(function () {
            currentJurus = 1;
            highlightCurrentJurus(currentJurus);
            $modalJuri.modal("show");
        });

        $('.js-tunggal-juri__connect').click(function () {
            var nomorJuri = parseInt($(".js-tunggal-juri__select-nomor-juri").val());
            $(".js-tunggal-juri__nomor-juri").text(nomorJuri);
            state.nomorJuri = nomorJuri
            socket.emit('get-data-pertandingan-seni', { pertandinganId: pertandinganId })
        });

        socket.on('data-pertandingan-seni', function (data) {
            var nomorJuri = state.nomorJuri
            var dataJuri = data.dewanJuri[nomorJuri];
            if (!dataJuri) return false;

            console.log(data)
            if (dataJuri.diskualifikasi) {
                stateDis = 1;
                $("#modalDis").modal();
            }
            renderPertandingan(dataJuri)
        })

        function renderPertandingan(juri) {
            for (var jurus of juri.daftarNilai) {
                $('.js-tunggal-juri__skor-jurus[data-jurus="' + jurus.nomorJurus + '"]').text(getNilaiJurus(juri, jurus.nomorJurus));
            }
            $('.js-tunggal-juri__nilai-kebenaran').text(getTotalNilaiJurus(juri));
            $('.js-tunggal-juri__nilai-total').text(getTotalNilai(juri));
            $(".js-tunggal-juri__nilai-kemantapan").text(juri.kemantapan);

            var wiraga = 0
            if (juri.wiraga) {
                wiraga = juri.wiraga
            }

            var wirasa = 0
            if (juri.wirasa) {
                wirasa = juri.wirasa
            }

            var wirama = 0
            if (juri.wirama) {
                wirama = juri.wirama
            }

            $(".js-tunggal-juri__nilai-wiraga").text(juri.wiraga);
            $(".js-tunggal-juri__nilai-wirasa").text(juri.wirasa);
            $(".js-tunggal-juri__nilai-wirama").text(juri.wirama);


            renderNilaiHukuman(juri)
            $('.js-tunggal-juri__nilai-hukuman').text(getTotalNilaiHukuman(juri));
        }

        function renderNilaiHukuman(juri) {

            if (juri.hukuman.length == 0) {
                stateWaktu = 0;
                $('.js-tunggal-juri__display-hukuman').text(0)
                $('.js-tunggal-juri__display-hukuman[data-hukuman="salah-pakaian"]').text("Tidak")
                $(".js-tunggal-juri__nilai-hukuman").text(0);
            }

            _.each(juri.hukuman, function (hukuman) {
                var isHukumanWaktu = hukuman.kategori == 'w-5' || hukuman.kategori == 'w-10'
                if (isHukumanWaktu) {
                    stateWaktu = 1
                    $('.js-tunggal-juri__display-hukuman[data-hukuman="faktor-waktu"]').text(hukuman.nilai)
                }
                var countHukuman = _.filter(juri.hukuman, function (params) {
                    return params.kategori === hukuman.kategori
                }).length

                if (hukuman.kategori === 'salah-pakaian') {
                    countHukuman = "Iya"
                }

                $('.js-tunggal-juri__display-hukuman[data-hukuman="' + hukuman.kategori + '"]').text(countHukuman)
            })
        }

        function getNilaiJurus(juri, nomorJurus) {
            var jurus = _.filter(juri.daftarNilai, function (n) {
                return n.nomorJurus.toString() === nomorJurus.toString()
            })
            var jumlahNilai = jurus[0].jumlahNilai;
            var penguranganJurus = _.filter(juri.pengurangan, function (n) {
                return n.nomorJurus.toString() === nomorJurus.toString()
            })
            _.each(penguranganJurus, function (n) {
                jumlahNilai += n.nilai;
            })
            return jumlahNilai
        }

        function getTotalNilaiJurus(juri) {
            var totalNilai = 0;
            _.each(juri.daftarNilai, function (jurus) {
                totalNilai += getNilaiJurus(juri, jurus.nomorJurus);
            })
            return totalNilai
        }

        function getTotalNilaiHukuman(juri) {
            var nilaiHukuman = 0
            _.each(juri.hukuman, function (n) {
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
            this.wiraga = 0;
            this.wirasa = 0;
            this.wirama = 0;
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
                return totalNilaiHukuman + this.kemantapan + this.wiraga + this.wirasa + this.wirama;
            }
        }

        var juri = new JuriTunggal(1);

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

        $('.js-tunggal-juri__up-jurus').click(function () {
            currentJurus += 1;
            if (currentJurus > 14) {
                currentJurus = 1;
            }
            highlightCurrentJurus(currentJurus);
        });
        $('.js-tunggal-juri__minus').click(function () {
            socket.emit('input-skor-pengurangan', {
                pertandinganId: pertandinganId,
                nomorJuri: state.nomorJuri,
                nilai: new PenguranganJurus(currentJurus, -1)
            });
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

            if (kategori === 'salah-pakaian') {
                countHukuman = "Iya"
            }
            if (isHukumanWaktu) {
                stateWaktu = 1
            }

            var stringKategori = toStringKategori(kategori)
            socket.emit('input-skor-hukuman', {
                pertandinganId: pertandinganId,
                nomorJuri: state.nomorJuri,
                hukuman: hukuman
            });
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

        $('.js-tunggal-juri__input-wiraga').click(function () {
            setStateKemantapan();
            $('.js-tunggal-juri__display-nilai-wiraga, .js-tunggal-juri__nilai-wiraga').css({
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
                state.juri.kemantapan = nilaiKemantapan;
                socket.emit('input-skor-kemantapan', {
                    pertandinganId: pertandinganId,
                    nomorJuri: state.nomorJuri,
                    nilai: nilaiKemantapan
                });
            }
        });

        $('.js-tunggal-juri__input-dis').click(function () {
            $('#konfirmDis').modal("show");
        });
        $('.btn-konfirm-dis').click(function () {
            $('#konfirmDis').modal('hide');
            stateDis = 1;
            socket.emit('set-diskualifikasi', {
                pertandinganId: pertandinganId,
                nomorJuri: state.nomorJuri
            });
            $("#modalDis").modal();
        });

        $('.js-tunggal-juri__hapus-hukuman').click(function () {
            stateWaktu = 0;
            juri.hukuman = [];
            socket.emit('hapus-skor-hukuman', {
                pertandinganId: pertandinganId,
                nomorJuri: state.nomorJuri
            });
        });

    })
})(jQuery);