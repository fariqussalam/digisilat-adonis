(function () {
    $(function () {

        var pertandinganId = $('input[name="pertandingan_id"]').val();
        var state = new DigiSilat.Seni.State.Timer();
        var socket = DigiSilat.createSocket("tunggal", "Tunggal Timer", pertandinganId);

        function resetCountdown() {
            state.countdown = 0
        }
        var $clock = $('.js-timer-clock');
        var $timerSet = $('.js-timer-set');
        var $timerStart = $('.js-timer-start');
        var $timerStop = $('.js-timer-stop');
        var $timerReset = $('.js-timer-reset');
        var $timerAdd = $('.js-timer-add');
        var timer = new easytimer.Timer({precision:"secondTenths", countdown: false})
        timer.addEventListener('secondTenthsUpdated', function (e) {
            state.countdown = timer.getTotalTimeValues().seconds;
            $clock.html(timer.getTimeValues().toString().substring(3));
        });
        timer.addEventListener('started', function (e) {
            $clock.html(timer.getTimeValues().toString().substring(3));
        });
        timer.addEventListener('reset', function (e) {
            $clock.html(timer.getTimeValues().toString().substring(3));
        });

        $timerSet.click(function() {
            var waktuString = $('input[name="waktu-timer"]').val();
            var waktu = parseInt(waktuString);
            resetCountdown();
            state.countdown = waktu
            timer.start({startValues: {seconds: state.countdown}});
            timer.stop();
            state.countdown = waktu;

            socket.emit('timer-command', {countdown: waktu, command: 'set'});
        })
        $timerStart.click(function() {
            timer.start({startValues: {seconds: state.countdown}});
            socket.emit('timer-command', {command: 'start'});
        });
        $timerStop.click(function() {
            timer.stop();
            socket.emit('timer-command', {command: 'stop', countdown: state.countdown});
        });
        $timerReset.click(function() {
            $.confirm({
                title: 'Konfirmasi Reset',
                content: 'Yakin Ingin Mereset Waktu ?',
                buttons: {
                    confirm: function () {
                        resetCountdown();
                        timer.stop();
                        timer.start({startValues: {seconds: state.countdown}});
                        timer.stop();
                        socket.emit('timer-command', {command: 'reset'});
                    },
                    cancel: function () {}
                }
            });
        })
        $timerAdd.click(function() {
            state.countdown = $(this).data("time");
            timer.stop();
            timer.start({startValues: {seconds: state.countdown}});
            timer.stop();

            socket.emit('timer-command', {countdown: state.countdown, command: 'set'});
        })

    })
})(jQuery);

