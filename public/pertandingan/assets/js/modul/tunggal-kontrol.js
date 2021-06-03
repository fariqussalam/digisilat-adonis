(function () {
    $(function () {
        var socket = io('/tunggal');
        socket.on('connect', function() {
            socket.emit('koneksi', { name: "Kontrol Tunggal" });
        });
        socket.on('doRefreshTunggal', function() {
            window.location.reload();
        });

        $(".js-tunggal-kontrol__pengumuman-pemenang").click(function() {
            socket.emit('pengumuman', {});
        });
        $('.js-tunggal-kontrol__mulai-baru').click(function() {
            socket.emit('refreshTunggal', {});
        });

    })
})(jQuery);