(function () {
    $(function () {

        var socket = io('/regu');
        socket.on('connect', function() {
            socket.emit('koneksi', {name: "Kontrol Regu"});
        });
        socket.on("doRefreshRegu", function() { window.location.reload(); });

        $(".js-regu-kontrol__pengumuman").click(function() { socket.emit('pengumuman', {}); });
        $(".js-regu-kontrol__mulai-baru").click(function() { socket.emit('refreshRegu', {}); });
    })
})(jQuery);