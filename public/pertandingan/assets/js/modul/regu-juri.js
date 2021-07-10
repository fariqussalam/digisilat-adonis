(function () {
    $(function () {
    
        var tempSkor = "";
        var stateKekompakan = 0;
        var currentJurus = 0;
        var stateDis = 0;
        var stateWaktu = 0;

        var pertandinganId = $('input[name="pertandingan_id"]').val();
        var state = new DigiSilat.Seni.State.Juri();
        var socket = DigiSilat.createSocket("regu", "Regu Juri", pertandinganId)
        
        socket.emit('get-data-pertandingan-seni', { pertandinganId: pertandinganId })
        $(document).ready(function () {
            currentJurus = 1;
            highlightCurrentJurus(currentJurus);
            $(".js-regu-juri__modal-awal").modal();
        });

        $('.js-regu-juri__connect').click(function () {
            var nomorJuri = parseInt($(".jd-regu-juri__select-nomor-juri").val());
            socket.emit('detilkoneksijuri', nomorJuri);
            $(".js-regu-juri__nomor-juri").text(nomorJuri);
            juri = new JuriRegu(nomorJuri);
            state.nomorJuri = nomorJuri
            socket.emit('get-data-pertandingan-seni', { pertandinganId: pertandinganId })
        });

        socket.on('data-pertandingan-seni', function(data) {
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
                $('.js-regu-juri__skor-jurus[data-jurus="' + jurus.nomorJurus + '"]').text(getNilaiJurus(juri, jurus.nomorJurus));
            }
            $('.js-regu-juri__nilai-kebenaran').text(getTotalNilaiJurus(juri));
            $('.js-regu-juri__nilai-total').text(getTotalNilai(juri));
            $(".js-regu-juri__nilai-kekompakan").text(juri.kemantapan);
            renderNilaiHukuman(juri)
            $('.js-regu-juri__nilai-hukuman').text(getTotalNilaiHukuman(juri));
        }

        function renderNilaiHukuman(juri) {

            if (juri.hukuman.length == 0) {
                stateWaktu = 0;
                $('.js-regu-juri__hukuman').text(0)
                $('.js-regu-juri__hukuman[data-hukuman="salah-pakaian"]').text("Tidak")
                $(".js-regu-juri__nilai-hukuman").text(0);
            }

            _.each(juri.hukuman, function(hukuman) {
                var isHukumanWaktu = hukuman.kategori == 'w-5' || hukuman.kategori == 'w-10'
                if (isHukumanWaktu) {
                    stateWaktu = 1
                    $('.js-regu-juri__hukuman[data-hukuman="faktor-waktu"]').text(hukuman.nilai)
                }
                var countHukuman = _.filter(juri.hukuman, function (params) {
                    return params.kategori === hukuman.kategori
                }).length
    
                if (hukuman.kategori === 'salah-pakaian') {
                    countHukuman = "Iya"
                }
    
                $('.js-regu-juri__hukuman[data-hukuman="' + hukuman.kategori + '"]').text(countHukuman)
            })
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
            this.isAktif = false;
        }

        function nilaiReguTemplate() {
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

        $('.js-regu-juri__up-jurus').click(function () {
            currentJurus += 1;
            if (currentJurus > 12) currentJurus = 1;
            highlightCurrentJurus(currentJurus);
        });
        $('.js-regu-juri__input-minus').click(function () {
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
              
            }
            socket.emit('input-skor-hukuman', {
                pertandinganId: pertandinganId,
                nomorJuri: state.nomorJuri,
                hukuman: hukuman
            });
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
            }
        });
        $('.js-regu-juri__input-dis').click(function () {
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
            socket.emit('hapus-skor-hukuman', { 
                pertandinganId: pertandinganId,
                nomorJuri: state.nomorJuri
            });
        });
        $('#vButtonSelesaiDis').click(function () {
            window.location.reload(true);
        });
        $('.js-regu-juri__finish').click(function () {
            window.location.reload(true);
        });

        function inputSkorMinus(nJuri, nJurus) {
            socket.emit('input-skor-pengurangan', {
                pertandinganId: pertandinganId,
                nomorJuri: state.nomorJuri,
                nilai: new PenguranganJurus(nJurus, -1)
            });
        }

        function inputSkorKekompakan(nJuri, nilai) {
            socket.emit('input-skor-kemantapan', {
                pertandinganId: pertandinganId,
                nomorJuri: state.nomorJuri,
                nilai: nilai
            });
        }
        
        function inputDis(nomorJuri) {
            socket.emit('set-diskualifikasi', { 
                pertandinganId: pertandinganId,
                nomorJuri: state.nomorJuri
            });
        }
    })
})(jQuery);