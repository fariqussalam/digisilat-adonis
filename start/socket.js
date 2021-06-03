const TandingService = use('App/Services/TandingService')
const _ = require('underscore');
const Server = use('Server')
const io = use('socket.io')(Server.getInstance())
const tandingService = new TandingService()

io.on('connection', async function(socket){
    var socketQuery = socket.handshake.query
    console.log(`${socketQuery.name} Connected`);

    socket.on('disconnect', function() {
       console.log(`${socketQuery.name} Disconnected`)
    });

    socket.on('get-data-pertandingan', async function(data) {
        if (!data.pertandinganId) return;
        var pertandinganData = await tandingService.getPertandinganData(data.pertandinganId);
        io.sockets.emit('data-pertandingan', pertandinganData);
    });

    socket.on('input-skor', async function(data) {
        var pertandinganData = await tandingService.getPertandinganData(data.pertandinganId);
        if (!pertandinganData) return false;
        var latestData = await tandingService.inputSkor(data.pertandinganId, pertandinganData, data.nomorJuri, data.nilai);
        if (!latestData) return false;
        io.sockets.emit('data-pertandingan', latestData);
    })

    socket.on('hapus-skor', async function(data) {
        var pertandinganData = await tandingService.getPertandinganData(data.pertandinganId);
        if (!pertandinganData) return false;
        var latestData = await tandingService.hapusSkor(data.pertandinganId, pertandinganData, data.nomorJuri, data.sudut, data.ronde);
        if (!latestData) return false;
        io.sockets.emit('data-pertandingan', latestData);
    });

    socket.on('kontrol-ronde', async function(data) {
        if (!data.ronde) return false
        var currentRonde = await tandingService.kontrolRonde(data);
        io.sockets.emit('kontrol-ronde', currentRonde);
    })

    socket.on('timer-command', async function(data) {
        io.sockets.emit('timer-command', data)
    })
});