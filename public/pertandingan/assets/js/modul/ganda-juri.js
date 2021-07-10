
(function () {
    $(function () {

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

        var stateDis = 0;
        var remot = new RemotGanda();
        var juri = new JuriGanda(1);
        var stateWaktu = new StateWaktu();

        function NilaiHukuman(kategori) {
            this.kategori = kategori;
            if (kategori === "w-10") this.nilai = -10;
            else this.nilai = -5;
        }

        var pertandinganId = $('input[name="pertandingan_id"]').val();
        var state = new DigiSilat.Seni.State.Juri();
        var socket = DigiSilat.createSocket("ganda", "Ganda Juri", pertandinganId)
        socket.emit('get-data-pertandingan-seni', { pertandinganId: pertandinganId })

        socket.on('data-pertandingan-seni', function(data) {
            var nomorJuri = state.nomorJuri
            var dataJuri = data.dewanJuri[nomorJuri];
            if (!dataJuri) return false;

            if (dataJuri.diskualifikasi) {
                stateDis = 1;
                $("#modalDis").modal();
            }
            renderPertandingan(dataJuri)
        })

        function renderPertandingan(juri) {
            $('.js-ganda-juri__display-skor[data-tipe="teknik-serang-bela"]').text(juri.nilaiSerangBela);
            $('.js-ganda-juri__display-skor[data-tipe="kekompakan"]').text(juri.nilaiKemantapan);
            $('.js-ganda-juri__display-skor[data-tipe="penghayatan"]').text(juri.nilaiPenghayatan);
            $('.js-ganda-juri__display-skor[data-tipe="total"]').text(getTotalNilai(juri));
            renderHukuman(juri)
        }
        
        function renderHukuman(juri) {

            for (var jenisHukuman in juri.nilaiHukuman) {
                var isHukumanWaktu = (jenisHukuman == 'w-10' || jenisHukuman == 'w-5') && (juri.nilaiHukuman[jenisHukuman] > 0);
                if (isHukumanWaktu && !stateWaktu.isStateWaktu()) {
                    stateWaktu.setStateWaktu();
                    $('.js-ganda-juri__nilai-hukuman[data-hukuman="faktor-waktu"]').text(jenisHukuman);
                } else {
                    $('.js-ganda-juri__nilai-hukuman[data-hukuman="' + jenisHukuman + '"]').text(juri.nilaiHukuman[jenisHukuman]);
                }
            }
           
            $('.js-ganda-juri__display-skor[data-tipe="hukuman"]').text(-1 * getTotalNilaiHukuman(juri));
        }

        function getTotalNilai(juri) {
            var totalNilaiHukuman = getTotalNilaiHukuman(juri)
            var totalNilai = juri.nilaiSerangBela + juri.nilaiKemantapan + juri.nilaiPenghayatan - totalNilaiHukuman
            return totalNilai
        }

        function getTotalNilaiHukuman(juri) {
            var nilaiHukuman = hitungNilaiHukuman(juri.nilaiHukuman)
            return nilaiHukuman;
        }

        function hitungNilaiHukuman(nilaiHukuman) {
            var total = 0;
            $.each(nilaiHukuman, function(nama, jumlah) {
                var nilai = nama === "w-10" ? 10 : 5;
                var jumlahNilai = jumlah * nilai;
                total += jumlahNilai;
            })
            return total;
        }

       
        function highlightCurrentState(state) {
            $('.js-ganda-juri__display, .js-ganda-juri__display-skor').css({"background-color": "", "color": ""});
            var $displayColumn = $('.js-ganda-juri__display[data-tipe="' + state + '"] , .js-ganda-juri__display-skor[data-tipe="' + state + '"]')
            $displayColumn.css({
                "background-color": "red",
                "color": "white"
            })
        }

        $(document).ready(function() {
            $("#modalAwal").modal();
        });

        $('.js-ganda-juri__connect').click(function() {
            var nomorJuri = parseInt($(".js-ganda-juri__select-nomor-juri").val());
            $(".js-ganda-juri__nomor-juri").text(nomorJuri);
            state.nomorJuri = nomorJuri
            socket.emit('get-data-pertandingan-seni', { pertandinganId: pertandinganId })
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
            inputSkorHukuman(juri.nomor, kategori);
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
            socket.emit('hapus-skor-hukuman-ganda', { 
                pertandinganId: pertandinganId,
                nomorJuri: state.nomorJuri
            });
        });

        function inputSkor(state, nomorJuri, nilai) {
            socket.emit('input-skor-ganda', { 
                pertandinganId: pertandinganId,
                nomorJuri: nomorJuri,
                nilai: nilai,
                kategoriNilai: state
            });
        }
        function inputSkorHukuman(nomorJuri, kategori) {
            socket.emit('input-skor-hukuman-ganda', {
                pertandinganId: pertandinganId,
                nomorJuri: state.nomorJuri,
                kategori: kategori
            });
        }
        function inputDis(nomorJuri) {
            socket.emit('set-diskualifikasi', { 
                pertandinganId: pertandinganId,
                nomorJuri: nomorJuri
            });
        }

    })
})(jQuery);