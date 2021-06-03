(function () {
    $(function () {

        var socket = io('/ganda');
        var waktunum = 0;
        socket.on('connect', function() {
            socket.emit('koneksi', {name: "Timer Ganda"});
        });
        $("#set_timer").click(function() {
            var waktufix = $("#waktu_timer").val();
            waktunum = parseInt(waktufix);
            socket.emit('timer_set', waktunum);
            clock.setTime(waktunum);

        });
        $("#start_timer").click(function() {
            var action = "start";
            clock.start();
            socket.emit('control_timer', action);
        });
        $("#stop_timer").click(function() {
            var action = "stop";
            clock.stop();
            socket.emit('control_timer', action);
        });

    })
})(jQuery);