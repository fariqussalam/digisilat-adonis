(function () {
    $(function () {

        var socket = io('/ganda');
        socket.on('connect', function() {
            socket.emit('koneksi', {name: "Kontrol Ganda"});
        });
        socket.on("doRefreshGanda", function(data) {
            window.location.reload();
        });
        $(".js-ganda-kontrol__pengumuman").click(function() {
            socket.emit('pengumuman', {});
        });
        $(".js-ganda-kontrol__mulai-baru").click(function() {
            socket.emit('refreshGanda', {});
        });

    })
})(jQuery);