(function () {
    $(function () {

        var clock;

        clock = $('.clock').FlipClock({
            clockFace: 'MinuteCounter',
            autoStart: false,
            callbacks: {
                stop: function() {

                }
            }
        });

        clock.setTime(120);
        clock.setCountdown(true);

        var socket = io('/tunggal');
        socket.on('connect', function() {
            socket.emit('koneksi', {
                name: "Timer Tunggal"
            });
        });

        $("#set_timer").click(function() {
            var waktufix = $("#waktu_timer").val();
            var waktunum = parseInt(waktufix);
            socket.emit('timer_set', waktunum);
            clock.setTime(waktunum);

        });
        $("#start_timer").click(function() {
            var action = "start";
            clock.start();
            socket.emit('timer-command', action);
        });
        $("#stop_timer").click(function() {
            var action = "stop";
            clock.stop();
            socket.emit('control_timer', action);
        });

    })
})(jQuery);

