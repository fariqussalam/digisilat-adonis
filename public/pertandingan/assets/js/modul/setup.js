(function () {
    $(function () {
        var socket = io();
        socket.on('connect', function() {
            socket.emit('koneksi', { name: "Setup Turnamen" });
            socket.emit("get-data-turnamen");
        });
        socket.on('data-turnamen', function(turnamen) {
            $('#nama-turnamen').text(turnamen.nama);
            $('#tempat-turnamen').text(turnamen.tempat);
            $('#waktu-turnamen').text(turnamen.waktu);
            var $form = $("form[name='setup-turnamen']");
            $form.find('input[name="nama"]').val(turnamen.nama);
            $form.find('input[name="tempat"]').val(turnamen.tempat);
            $form.find('input[name="waktu"]').val(turnamen.waktu);
        });

        $('.btn-submit-turnamen').click(function() {
            var turnamen = $('form[name="setup-turnamen"]').serializeObject();
            socket.emit('simpan-data-turnamen', turnamen);
        });

    })
})(jQuery);