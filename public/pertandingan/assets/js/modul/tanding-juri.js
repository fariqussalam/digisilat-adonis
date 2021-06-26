(function () {
    $(function () {

        function renderNilai(ronde, sudut, poin, minus, totalRonde, total) {
            var $poin = $(".js-tanding-juri__nilai[data-ronde='"+ ronde +"'][data-sudut='"+sudut+"'][data-indikator='poin']")
            var $minus = $(".js-tanding-juri__nilai[data-ronde='"+ ronde +"'][data-sudut='"+sudut+"'][data-indikator='minus']")
            var $totalRonde = $(".js-tanding-juri__nilai[data-ronde='"+ ronde +"'][data-sudut='"+sudut+"'][data-indikator='total']")
            var $total = $(".js-tanding-juri__nilai-total[data-sudut='"+sudut+"']")
            $poin.text(poin.join(","));
            $minus.text(minus.join(","));
            $totalRonde.text(totalRonde);
            $total.text(total);
        }

        function renderInitialData(juri) {
            _.each(DigiSilat.getSudutList(), function(sudut) {
                _.each(DigiSilat.getRondeList(), function(ronde) {
                    var nilai = juri.getNilai(sudut, ronde);
                    renderNilai(ronde, sudut, nilai.poin, nilai.minus, nilai.totalRonde, nilai.total);
                })
            })
        }

        function renderRonde(ronde) {
            $('#remot_ronde').text(ronde)
        }

        var pertandinganId = $('input[name="pertandingan_id"]').val();
        var nomorJuriInput = $('input[name="nomorJuri"]').val();
        var state = new DigiSilat.State.Juri();
        var $modal = $('#modalJuri');
        $(document).ready(function() {
            if (nomorJuriInput == null) $modal.modal("show");
            else {
                state.nomorJuri = nomorJuriInput
                $("#remot_nomor_juri").text(state.nomorJuri);
                socket.emit('koneksi-juri', { nomorJuri: state.nomorJuri });
                socket.emit('get-data-pertandingan', { pertandinganId: pertandinganId })
            }
        });

        var socket = DigiSilat.createSocket("tanding", 
        "Tanding Juri", pertandinganId);
        socket.on('data-pertandingan', function(data) {
            var nomorJuri = state.nomorJuri
            var dataJuri = data.dewanJuri[nomorJuri];
            if (!dataJuri) return false;
            var juri = new DigiSilat.Juri(nomorJuri);
            juri.penilaian = dataJuri.penilaian;
            juri.nama = dataJuri.nama;
            state.juri = juri;
            renderInitialData(juri);
            state.ronde = data.ronde
            renderRonde(state.ronde)
        })
        socket.on('kontrol-ronde', function(ronde) {
            state.ronde = ronde
            renderRonde(ronde)
        });
        $(".js-tanding-juri__finish").click(function() { history.go(0); });

        $('.js-tanding-juri-modal-submit').click(function() {
            var form = $modal.find("form").serializeObject();
            var nomorJuri = parseInt(form["nomor-juri"]);
            state.nomorJuri = nomorJuri;
            socket.emit('koneksi-juri', { nomorJuri: nomorJuri });
            socket.emit('get-data-pertandingan', { pertandinganId: pertandinganId })
            $("#remot_nomor_juri").text(state.nomorJuri);
            $modal.modal('hide');
        })

        $('.js-tanding-juri-tombol').click(function(){
            var data = $(this).data();
            var indikator = data.indikator === "plus" ? "+" : "-"
            var poinString = data.poinString == null ? data.poin : data.poinString
            var nilai = new DigiSilat.Nilai(data.sudut, state.ronde, indikator, data.poin, poinString)
            socket.emit('input-skor', {
                pertandinganId: pertandinganId,
                nomorJuri: state.nomorJuri,
                nilai:nilai
            });
        });

        $('.js-tanding-juri-tombol-hapus').click(function() {
            var ronde = state.ronde;
            var sudut = $(this).data("sudut");
            socket.emit('hapus-skor', {
                pertandinganId: pertandinganId,
                nomorJuri: state.nomorJuri,
                ronde: ronde,
                sudut: sudut
            });
        })

    })
})(jQuery);