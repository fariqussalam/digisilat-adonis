(function () {
    $(function () {
        function hitungNilaiHukuman(nilaiHukuman) {
            var total = 0;
            $.each(nilaiHukuman, function(nama, jumlah) {
                var nilai = nama === "w-10" ? 10 : 5;
                var jumlahNilai = jumlah * nilai;
                total += jumlahNilai;
            })
            return total;
        }


        var socket = io("/ganda");
        socket.on('connect', function() {
            socket.emit('koneksi', {name: "Ganda Juri"});
        });
        socket.on("doRefreshGanda", function(data) {
            window.location.reload();
        })

        var GandaState = {
            TEKNIK_SERANG_BELA: "teknik-serang-bela",
            PENGHAYATAN: "penghayatan",
            KEKOMPAKAN: "kekompakan",
            NO_STATE: "no-state"
        }
        var tempScore = {}
        var stateValues = _.values(GandaState);
        _.each(stateValues, function(val) {
            tempScore[val] = ""
        })

        function RemotGanda() {
            this.currentState = GandaState.NO_STATE
        }

        function JuriGanda(nomor) {
            this.name = nomor.toString();
            this.nomor = nomor;
            this.nilaiHukuman = {
                "keluar-garis": 0,
                "senjata-jatuh": 0,
                "senjata-tidak-jatuh": 0,
                "senjata-diluar-arena": 0,
                "senjata-tidak-sesuai": 0,
                "w-5": 0,
                "w-10": 0
            };
            this.nilaiSerangBela = 0;
            this.niaiKemantapan = 0;
            this.nilaiPenghayatan = 0;
            this.tambahHukuman = function(namaKategori) {
                this.nilaiHukuman[namaKategori] += 1;
            };
            this.hapusHukuman = function() {
                for (var jenisHukuman in this.nilaiHukuman) {
                    this.nilaiHukuman[jenisHukuman] = 0;
                }
            };
            this.totalNilaiHukuman = function() {
                var total = hitungNilaiHukuman(this.nilaiHukuman);
                if (total === 0) return 0
                else return "-" + total.toString()
            };
            this.totalNilai = function() {
                var totalNilaiHukuman = hitungNilaiHukuman(this.nilaiHukuman);
                return this.nilaiSerangBela + this.niaiKemantapan + this.nilaiPenghayatan - totalNilaiHukuman;
            };
        }

        function StateWaktu() {
            this.state = 0
            this.isStateWaktu = function() {
                return this.state > 0
            }
            this.setStateWaktu = function() {
                this.state = 1
            }
        }
        function highlightCurrentState(state) {
            $('.js-ganda-juri__display, .js-ganda-juri__display-skor').css({"background-color": "", "color": ""});
            var $displayColumn = $('.js-ganda-juri__display[data-tipe="' + state + '"] , .js-ganda-juri__display-skor[data-tipe="' + state + '"]')
            $displayColumn.css({
                "background-color": "red",
                "color": "white"
            })
        }

        var stateDis = 0;
        var remot = new RemotGanda();
        var juri = new JuriGanda(1);
        var stateWaktu = new StateWaktu();

        $(document).ready(function() {
            $("#modalAwal").modal();
        });

        $('.js-ganda-juri__connect').click(function() {
            var nomorJuri = parseInt($(".js-ganda-juri__select-nomor-juri").val());
            socket.emit('detilkoneksijuri', nomorJuri);
            $(".js-ganda-juri__nomor-juri").text(nomorJuri);
            juri = new JuriGanda(nomorJuri);
        });
        $('.js-ganda-juri__set-state').click(function() {
            remot.currentState = $(this).data("state");
            highlightCurrentState(remot.currentState);
        })

        $('.js-ganda-juri__input-hukuman').click(function() {
            var kategori = $(this).data("hukuman");
            juri.tambahHukuman(kategori);
            var isHukumanWaktu = $(this).data("waktu") === true;
            if (isHukumanWaktu && !stateWaktu.isStateWaktu()) {
                stateWaktu.setStateWaktu();
                $('.js-ganda-juri__nilai-hukuman[data-hukuman="faktor-waktu"]').text(kategori);
            } else {
                $('.js-ganda-juri__nilai-hukuman[data-hukuman="' + kategori + '"]').text(juri.nilaiHukuman[kategori]);
            }
            $('.js-ganda-juri__display-skor[data-tipe="hukuman"]').text(juri.totalNilaiHukuman());
            $('.js-ganda-juri__display-skor[data-tipe="total"]').text(juri.totalNilai());
            inputSkorHukuman(juri.nomorJuri, kategori);
        })

        $('.js-ganda-juri__input').click(function() {
           var value = $(this).data("value");
           tempScore[remot.currentState] += value.toString()
            $('.js-ganda-juri__display-skor[data-tipe="' + remot.currentState + '"]').text(tempScore[remot.currentState]);
        });
        $('.js-ganda-juri__input-clear').click(function() {
            tempScore[remot.currentState] = "";
            $('.js-ganda-juri__display-skor[data-tipe="' + remot.currentState + '"]').text(0);
        })
        $('.js-ganda-juri__input-enter').click(function() {
            var skor = parseInt(tempScore[remot.currentState]);
            if (remot.currentState === GandaState.TEKNIK_SERANG_BELA) {
                juri.nilaiSerangBela = skor;
            } else if (remot.currentState === GandaState.PENGHAYATAN) {
                juri.nilaiPenghayatan = skor;
            } else if (remot.currentState === GandaState.KEKOMPAKAN) {
                juri.niaiKemantapan = skor;
            }
            console.log(juri);
            $('.js-ganda-juri__display-skor[data-tipe="' + remot.currentState  + '"]').text(skor);
            $('.js-ganda-juri__display-skor[data-tipe="total"]').text(juri.totalNilai());
            inputSkor(remot.currentState, juri.nomor, skor)
        })

        $('#vButtonDis').click(function() {
            $('#konfirmDis').modal();
        });
        $('.btn-konfirm-dis').click(function() {
            $('#konfirmDis').modal('hide');
            stateDis = 1;
            inputDis(juri.nomor);
            $("#modalDis").modal();
        });
        $('.js-ganda-juri__hapus-hukuman').click(function() {
            stateWaktu.state = 0;
            $('.js-ganda-juri__display-skor[data-tipe="hukuman"]').text(0);
            $('.js-ganda-juri__nilai-hukuman').text(0)
            socket.emit('hapus_hukuman', juri.nomor);
        });

        function getInputName(currentState) {
            switch (currentState) {
                case GandaState.TEKNIK_SERANG_BELA:
                    return "inputSkorTSB"
                case GandaState.KEKOMPAKAN:
                    return 'inputSkorNKM'
                case GandaState.PENGHAYATAN:
                    return "inputSkorPGN"
            }
        }
        function inputSkor(state, nJuri, nilai) {
            var inputName = getInputName(state);
            socket.emit(inputName, { nJuri: nJuri, nilai: nilai })
        }
        function inputSkorHukuman(nJuri, nKategori) {
            socket.emit('inputSkorHukuman', { nJuri: nJuri, nKategori: nKategori });
        }
        function inputDis(nJuri) {
            socket.emit('inputDis', nJuri);
        }

    })
})(jQuery);