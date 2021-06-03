(function () {
    $(function () {

        var detil = {};
        var $modal = $('#modalPertandingan');
        $(document).ready(function() {
            $modal.modal("show");
        });

        function NilaiJurus(nomorJurus, jumlahNilai) {
            this.nomorJurus = nomorJurus;
            this.jumlahNilai = jumlahNilai;
        }

        function nilaiTunggalTemplate() {
            var daftarNilai = [
                7, 6, 5, 7, 6, 8, 11, 7, 6, 12, 6, 5, 5, 9
            ]
            var jurusTunggal = []
            $.each(daftarNilai, function(idx, el) {
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
            if (kategori === "W10") this.nilai = -10;
            else this.nilai = -5;
        }

        function JuriTunggal(nomorJuri) {
            this.nomorJuri = nomorJuri;
            this.daftarNilai = nilaiTunggalTemplate();
            this.pengurangan = [];
            this.hukuman = [];
            this.kemantapan = 0;
            this.getNilaiJurus = function(nomorJurus) {
                var jurus = _.filter(this.daftarNilai, function(n) {
                    return n.nomorJurus.toString() === nomorJurus.toString()
                })
                var jumlahNilai = jurus[0].jumlahNilai;
                var penguranganJurus = _.filter(this.pengurangan, function(n) {
                    return n.nomorJurus.toString() === nomorJurus.toString()
                })
                _.each(penguranganJurus, function(n) {
                    jumlahNilai += n.nilai;
                })
                return jumlahNilai
            }
            this.getTotalNilaiJurus = function() {
                var instance = this;
                var totalNilai = 0;
                _.each(this.daftarNilai, function(jurus) {
                    totalNilai += instance.getNilaiJurus(jurus.nomorJurus);
                })
                return totalNilai
            }
            this.getTotalNilaiHukuman = function() {
                var nilaiHukuman = 0
                _.each(this.hukuman, function(n) {
                    nilaiHukuman += n.nilai
                })
                return nilaiHukuman;
            }
            this.getTotalNilai = function() {
                var totalNilaiJurus = this.getTotalNilaiJurus();
                var totalNilaiHukuman = this.getTotalNilaiHukuman();
                return totalNilaiJurus + totalNilaiHukuman + this.kemantapan;
            }
        }

        function DewanJuri(jumlah) {
            var instance = this
            for (var i = 1; i <= jumlah; i++) {
                instance[i] = new JuriTunggal(i)
            }
        }

        var dewanJuri = new DewanJuri(5);

        function renderNilaiJurus(nomorJuri, nomorJurus) {
            var nilaiJurus = dewanJuri[nomorJuri].getNilaiJurus(nomorJurus);
            var totalNilaiJurus = dewanJuri[nomorJuri].getTotalNilaiJurus();
            $('.js-tunggal-admin__nilai[data-juri="' + nomorJuri + '"][data-jurus="' + nomorJurus + '"]').text(nilaiJurus);
            $('.js-tunggal-admin__nilai[data-juri="' + nomorJuri + '"][data-jurus="total"]').text(totalNilaiJurus);
        }
        function renderNilaiHukuman(nomorJuri) {
            var nilaiHukuman = dewanJuri[nomorJuri].getTotalNilaiHukuman();
            $('.js-tunggal-admin__hukuman[data-juri="' + nomorJuri + '"]').text(nilaiHukuman);
        }
        function renderTotalNilai(nomorJuri) {
            var totalNilai = dewanJuri[nomorJuri].getTotalNilai();
            $('.js-tunggal-admin__nilai-total[data-juri="' + nomorJuri + '"]').text(totalNilai);
        }

        function getMaxOfArray(numArray) {
            return Math.max.apply(null, numArray);
        }
        function getMinOfArray(numArray) {
            return Math.min.apply(null, numArray);
        }

        function getJuriMax() {
            var totalNilaiArray = []
            for (var i = 1; i <= 5; i++) {
                totalNilaiArray.push(dewanJuri[i].getTotalNilai());
            }
            var totalNilai = getMaxOfArray(totalNilaiArray);
            var juriMax;
            for (var x = 1; x <= 5; x++) {
                var nilai = dewanJuri[x].getTotalNilai();
                if (totalNilai === nilai) {
                    juriMax = dewanJuri[x];
                    return juriMax;
                }
            }
        }
        function getJuriMin(excluded) {
            var totalNilaiArray = []
            for (var i = 1; i <= 5; i++) {
                totalNilaiArray.push(dewanJuri[i].getTotalNilai());
            }
            var totalNilai = getMinOfArray(totalNilaiArray);
            var juriMin;
            for (var x = 1; x <= 5; x++) {
                var isExcluded = excluded != null && excluded.nomorJuri === dewanJuri[x].nomorJuri
                if (!isExcluded) {
                    var nilai = dewanJuri[x].getTotalNilai();
                    if (totalNilai === nilai) {
                        juriMin = dewanJuri[x];
                        return juriMin;
                    }
                }
            }
        }
        var socket = io('/tunggal');
        socket.on('connect', function() {
            socket.emit('koneksi', { name: "Admin Tunggal" });
            socket.emit('get_data_turnamen');
        });
        socket.on('display_pengumuman', function(data) {
            var juriMax = getJuriMax();
            var juriMin = getJuriMin(juriMax);
            var totalNilai = 0
            for (var i = 1; i <= 5; i++) {
                totalNilai += dewanJuri[i].getTotalNilai();
            }
            totalNilai = totalNilai - juriMax.getTotalNilai();
            totalNilai = totalNilai - juriMin.getTotalNilai();
            $('.js-tunggal-admin__display-nilai-total[data-juri="' + juriMax.nomorJuri + '"]').append(" (TERTINGGI)")
            $('.js-tunggal-admin__display-nilai-total[data-juri="' + juriMin.nomorJuri + '"]').append(" (TERENDAH)")
            $('.js-tunggal-admin__nilai-total[data-juri="' + juriMax.nomorJuri + '"]').css("background-color", "red").css("color","white")
            $('.js-tunggal-admin__nilai-total[data-juri="' + juriMin.nomorJuri + '"]').css("background-color", "blue").css("color","white")
            $(".js-tunggal-admin__total-nilai").text(totalNilai);
            var currentDate = utils.getCurrentDateTime();
            $('.js-current-date').text(" " + currentDate.date);
            $('.js-current-time').text(" " + currentDate.time);

        });
        socket.on('display_inputSkorMinus', function(data) {
            dewanJuri[data.nJuri].pengurangan.push(new PenguranganJurus(data.nJurus, -1));
            renderNilaiJurus(data.nJuri, data.nJurus);
            renderTotalNilai(data.nJuri);
        });
        socket.on('display_inputSkorKemantapan', function(data) {
            dewanJuri[data.nJuri].kemantapan = data.nilai;
            $('.js-tunggal-admin__kemantapan[data-juri="' + data.nJuri + '"]').text(data.nilai);
            renderTotalNilai(data.nJuri)
        });

        socket.on('display_inputSkorHukuman', function(data) {
            dewanJuri[data.nJuri].hukuman.push(new NilaiHukuman(data.nKategori));
            renderNilaiHukuman(data.nJuri);
            renderTotalNilai(data.nJuri);
        });
        socket.on('display_hapusHukuman', function(data) {
            dewanJuri[data].hukuman = []
            renderNilaiHukuman(data);
            renderTotalNilai(data);
        });
        socket.on('doRefreshTunggal', function() {
            window.location.reload();
        });
        socket.on('terimaDataTurnamen', function(dataTurnamen) {
            $('.js-tunggal-admin__nama-turnamen').text(dataTurnamen.nama);
            $('.js-tunggal-admin__tempat-turnamen').text(dataTurnamen.tempat);
            $('.js-tunggal-admin__waktu-turnamen').text(dataTurnamen.waktu);
        });

        $(".js-admin-tunggal__submit-form").click(function() {
            var dataPertandingan = $("form[name='form-pertandingan']").serializeObject()
            detil.pool = dataPertandingan['pool']
            detil.nomorPenampil = dataPertandingan['nomor-penampil']
            detil.kontingen = dataPertandingan['kontingen']
            detil.namaPesilat = dataPertandingan['nama-penampil']
            $('.js-admin-tunggal__pool').text(detil.pool);
            $('.js-admin-tunggal__nomor-penampil').text(detil.nomorPenampil);
            $('.js-admin-tunggal__nama-penampil').text(detil.namaPesilat);
            $('.js-admin-tunggal__kontingen').text(detil.kontingen);
            $modal.modal("hide");
            socket.emit('detilTunggal', detil);
        });

        $(".js-admin-tunggal__pengumuman-pemenang").click(function() {
            socket.emit('pengumuman');
        });

        $(".js-admin-tunggal__pertandingan-baru").click(function() {
            socket.emit('refreshTunggal');
        });

        $(".js-admin-tunggal__simpan-data").click(function() {
            var filename = "TUNGGAL";
            if (detil.pool != null) filename += "-" + detil.pool + "-";
            if (detil.nomorPenampil != null) filename += "-" + detil.nomorPenampil + "-";
            if (detil.namaPesilat != null) filename += "-" + detil.nomorPenampil + "-";
            filename += "-" + utils.getFormattedDateTime();
            utils.simpanGambar(filename);
        });

    })
})(jQuery);