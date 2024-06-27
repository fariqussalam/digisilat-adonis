(function () {
    $(function () {

        var currentJurus = 0;
        var nilaiHukuman = 0;
        var stateDis = 0;
        var stateWaktu = 0;

        var tempScore = {
            WIRAGA: "",
            WIRASA: "",
            WIRAMA: "",
            NO_STATE: ""
        }

        var inputMode = {
            WIRAGA: "WIRAGA",
            WIRASA: "WIRASA",
            WIRAMA: "WIRAMA",
            NO_STATE: "NO_STATE"
        }

        var pertandinganId = $('input[name="pertandingan_id"]').val();
        var state = new DigiSilat.Seni.State.Juri();

        state.wiraga = 0
        state.wirasa = 0
        state.wirama = 0
        state.hukuman = 0
        state.inputMode = inputMode.NO_STATE


        var socket = DigiSilat.createSocket("tunggal", "Tunggal Juri", pertandinganId)
        var $modalJuri = $("#modalAwal");
        socket.emit('get-data-pertandingan-seni', { pertandinganId: pertandinganId })
        $(document).ready(function () {
            // currentJurus = 1;
            // highlightCurrentJurus(currentJurus);
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

            console.log("nilai", dataJuri)
            console.log("state", state)
            if (dataJuri.diskualifikasi) {
                stateDis = 1;
                $("#modalDis").modal();
            }
            renderPertandingan(dataJuri)
        })

        function renderPertandingan(juri) {
            $('.js-tunggal-juri__nilai-total').text(getTotalNilai(juri));

            if (juri.wiraga) {
                state.wiraga = juri.wiraga
            }
            if (juri.wirasa) {
                state.wirasa = juri.wirasa
            }
            if (juri.wirama) {
                state.wirama = juri.wirama
            }

            $(".js-tunggal-juri__nilai-wiraga").text(state.wiraga);
            $(".js-tunggal-juri__nilai-wirasa").text(state.wirasa);
            $(".js-tunggal-juri__nilai-wirama").text(state.wirama);


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

        function getTotalNilaiHukuman(juri) {
            var nilaiHukuman = 0
            _.each(juri.hukuman, function (n) {
                nilaiHukuman += n.nilai
            })
            return nilaiHukuman;
        }

        function getTotalNilai(juri) {
            var totalNilaiHukuman = getTotalNilaiHukuman(juri)
            var nilaiWiraga = 0, nilaiWirasa = 0, nilaiWirama = 0
            if (juri.wiraga) nilaiWiraga = juri.wiraga
            if (juri.wirasa) nilaiWirasa = juri.wirasa
            if (juri.wirama) nilaiWirama = juri.wirama
            return totalNilaiHukuman + nilaiWiraga + nilaiWirasa + nilaiWirama
        }

        function JuriTunggal(nomorJuri) {
            this.nomorJuri = nomorJuri;
            this.pengurangan = [];
            this.hukuman = [];
            this.kemantapan = 0;
            this.wiraga = 0;
            this.wirasa = 0;
            this.wirama = 0;
            this.getTotalNilaiHukuman = function () {
                var nilaiHukuman = 0
                _.each(this.hukuman, function (n) {
                    nilaiHukuman += n.nilai
                })
                return nilaiHukuman;
            }
            this.getTotalNilai = function () {
                var totalNilaiHukuman = this.getTotalNilaiHukuman();
                return totalNilaiHukuman + this.kemantapan + this.wiraga + this.wirasa + this.wirama;
            }
        }

        var juri = new JuriTunggal(1);

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

        function NilaiHukuman(kategori) {
            this.kategori = kategori;
            if (kategori === "w-10") this.nilai = -10;
            else this.nilai = -5;
        }

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

        function resetHighlight() {
            $('.js-tunggal-juri__display-nilai-wiraga, .js-tunggal-juri__nilai-wiraga, .js-tunggal-juri__display-nilai-wirasa, .js-tunggal-juri__nilai-wirasa, .js-tunggal-juri__display-nilai-wirama, .js-tunggal-juri__nilai-wirama').css({
                "background-color": "",
                "color": ""
            })
        }


        $('.js-tunggal-juri__input-wiraga').click(function () {
            resetHighlight()
            state.inputMode = inputMode.WIRAGA
            $('.js-tunggal-juri__display-nilai-wiraga, .js-tunggal-juri__nilai-wiraga').css({
                "background-color": "green",
                "color": "white"
            })
        });

        $('.js-tunggal-juri__input-wirasa').click(function () {
            resetHighlight()
            state.inputMode = inputMode.WIRASA
            $('.js-tunggal-juri__display-nilai-wirasa, .js-tunggal-juri__nilai-wirasa').css({
                "background-color": "green",
                "color": "white"
            })
        });

        $('.js-tunggal-juri__input-wirama').click(function () {
            resetHighlight()
            state.inputMode = inputMode.WIRAMA
            $('.js-tunggal-juri__display-nilai-wirama, .js-tunggal-juri__nilai-wirama').css({
                "background-color": "green",
                "color": "white"
            })
        });

        $('.js-tunggal-juri__input').click(function () {
            var value = $(this).data("value");
            tempScore[state.inputMode] += value.toString()

            console.log("tempscore", tempScore)

            if (state.inputMode == inputMode.WIRAGA) {
                $('.js-tunggal-juri__nilai-wiraga').text(parseInt(tempScore[state.inputMode]))
            }
            if (state.inputMode == inputMode.WIRASA) {
                $('.js-tunggal-juri__nilai-wirasa').text(parseInt(tempScore[state.inputMode]))
            }
            if (state.inputMode == inputMode.WIRAMA) {
                $('.js-tunggal-juri__nilai-wirama').text(parseInt(tempScore[state.inputMode]))
            }
        });

        $('.js-tunggal-juri__input-clear').click(function () {
            tempScore[state.inputMode] = ""
            if (state.inputMode == inputMode.WIRAGA) {
                $(".js-tunggal-juri__nilai-wiraga").text(0);
            }
            if (state.inputMode == inputMode.WIRASA) {
                $(".js-tunggal-juri__nilai-wirasa").text(0);
            }
            if (state.inputMode == inputMode.WIRAMA) {
                $(".js-tunggal-juri__nilai-wirama").text(0);
            }
        });

        $('.js-tunggal-juri__input-enter').click(function () {
            if (tempScore[state.inputMode] == "") {
                return
            }

            var nilai = parseInt(tempScore[state.inputMode])
            switch (state.inputMode) {
                case inputMode.WIRAGA:
                    state.juri.wiraga = nilai
                    state.wiraga = nilai
                    break;
                case inputMode.WIRASA:
                    state.juri.wirasa = nilai
                    state.wirasa = nilai
                    break;
                case inputMode.WIRAMA:
                    state.juri.wirama = nilai
                    state.wirama = nilai
                    break;
            }

            socket.emit('input-skor-kemantapan', {
                pertandinganId: pertandinganId,
                nomorJuri: state.nomorJuri,
                nilai: nilai,
                inputMode: state.inputMode
            });
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