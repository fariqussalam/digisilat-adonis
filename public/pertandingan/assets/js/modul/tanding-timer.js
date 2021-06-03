(function () {
    $(function () {

        var pertandinganId = $('input[name="pertandingan_id"]').val();
        var state = new DigiSilat.State.Timer();
        var socket = DigiSilat.createSocket("Tanding Timer", pertandinganId);
        socket.on('data-pertandingan', function(data) {
            state.ronde = data.ronde
            $('#counterRonde').text(data.ronde);
        })
    
        $(document).ready(function() {
            socket.emit('get-data-pertandingan', { pertandinganId: pertandinganId })
            $('#counterRonde').text(state.ronde);
        });

        function modifyRonde(angka) {
            state.ronde += angka
            if (state.ronde > 3) {
                state.ronde = 3
            }
            if (state.ronde < 1) {
                state.ronde = 1
            }
            return state.ronde
        }
        $('.js-tanding-kontrol__modify-ronde').click(function() {
           var angka = parseInt($(this).data("angka"));
           modifyRonde(angka);
            $('#counterRonde').text(state.ronde);
            socket.emit("kontrol-ronde", { pertandinganId: pertandinganId, ronde: state.ronde })
        });
        $('.js-tanding-kontrol__pengumuman-pemenang').click(function() {
            var sudut = $(this).data("sudut");
            socket.emit('pengumuman-pemenang', sudut)
        })

        socket.on('kontrol-ronde', function(data) {
            state.ronde = data
            $('#counterRonde').text(state.ronde);
        })

        function resetCountdown() {
            state.countdown = 0
        }
        var $clock = $('.js-timer-clock');
        var $timerSet = $('.js-timer-set');
        var $timerStart = $('.js-timer-start');
        var $timerStop = $('.js-timer-stop');
        var $timerReset = $('.js-timer-reset');
        var $timerAdd = $('.js-timer-add');
        var timer = new easytimer.Timer({precision:"secondTenths", countdown: true})
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
            socket.emit('timer-command', {command: 'stop'});
        });
        $timerReset.click(function() {
            resetCountdown();
            timer.stop();
            timer.start({startValues: {seconds: state.countdown}});
            socket.emit('timer-command', {command: 'reset'});
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