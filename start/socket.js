const TandingService = use('App/Services/TandingService')
const SeniService = use('App/Services/SeniService')
const _ = require('underscore');
const s = require('underscore.string');
const Server = use('Server')
const io = use('socket.io')(Server.getInstance())
const tandingService = new TandingService()
const seniService = new SeniService()

io.on('connection', async function(socket){
    var query = socket.handshake.query
    var room = `${query.type}-${query.pertandinganId}`
    
    socket.join(room)
    socket.on('disconnect', function() {});

    socket.on('get-data-pertandingan', async function(data) {
        if (!data.pertandinganId) return;
        var pertandinganData = await tandingService.getPertandinganData(data.pertandinganId);
        io.to(room).emit('data-pertandingan', pertandinganData);
    });

    socket.on('input-skor', async function(data) {
        var pertandinganData = await tandingService.getPertandinganData(data.pertandinganId);
        if (!pertandinganData) return false;
        var latestData = await tandingService.inputSkor(data.pertandinganId, pertandinganData, data.nomorJuri, data.nilai);
        if (!latestData) return false;
        io.to(room).emit('data-pertandingan', latestData);
    })

    socket.on('hapus-skor', async function(data) {
        var pertandinganData = await tandingService.getPertandinganData(data.pertandinganId);
        if (!pertandinganData) return false;
        var latestData = await tandingService.hapusSkor(data.pertandinganId, pertandinganData, data.nomorJuri, data.sudut, data.ronde);
        if (!latestData) return false;
        io.to(room).emit('data-pertandingan', latestData);
    });

    socket.on('kontrol-ronde', async function(data) {
        if (!data.ronde) return false
        var currentRonde = await tandingService.kontrolRonde(data);
        io.to(room).emit('kontrol-ronde', currentRonde);
    })

    socket.on('timer-command', async function(data) {
        io.to(room).emit('timer-command', data)
    })
    
    /**
     * Seni
     */
    async function sendPertandinganSeniData(id, io) {
        var data = await seniService.getPertandinganData(id)
        io.to(room).emit('data-pertandingan-seni', data);
    }
     socket.on('get-data-pertandingan-seni', async function(data) {
        if (!data.pertandinganId) return;
        sendPertandinganSeniData(data.pertandinganId, io)
    });

    socket.on('input-skor-pengurangan', async function(data) {
        var pertandingan_data = await seniService.getPertandinganData(data.pertandinganId)
        if (!pertandingan_data) return false;
        var latestData = await seniService.inputSkorPengurangan(data.pertandinganId, pertandingan_data, data.nomorJuri, data.nilai);
        if (!latestData) return false;
        io.to(room).emit('data-pertandingan-seni', latestData);
    })

    socket.on('input-skor-kemantapan', async function(data) {
        var pertandingan_data = await seniService.getPertandinganData(data.pertandinganId)
        if (!pertandingan_data) return false;
        var latestData = await seniService.inputSkorKemantapan(data.pertandinganId, pertandingan_data, data.nomorJuri, data.nilai);
        if (!latestData) return false;
        io.to(room).emit('data-pertandingan-seni', latestData);
    })

    socket.on('input-skor-hukuman', async function(data) {
        var pertandingan_data = await seniService.getPertandinganData(data.pertandinganId)
        if (!pertandingan_data) return false;
        var latestData = await seniService.inputSkorHukuman(data.pertandinganId, pertandingan_data, data.nomorJuri, data.hukuman);
        if (!latestData) return false;
        io.to(room).emit('data-pertandingan-seni', latestData);
    })

    socket.on('hapus-skor-hukuman', async function(data) {
        var pertandingan_data = await seniService.getPertandinganData(data.pertandinganId)
        if (!pertandingan_data) return false;
        var latestData = await seniService.hapusSkorHukuman(data.pertandinganId, pertandingan_data, data.nomorJuri);
        if (!latestData) return false;
        io.to(room).emit('data-pertandingan-seni', latestData);
    })

    socket.on('set-diskualifikasi', async function(data) {
        var pertandingan_data = await seniService.getPertandinganData(data.pertandinganId)
        if (!pertandingan_data) return false;
        var latestData = await seniService.setDiskualifikasi(data.pertandinganId, pertandingan_data, data.nomorJuri);
        if (!latestData) return false;
        io.to(room).emit('data-pertandingan-seni', latestData);
    })

    socket.on("seni-pengumuman-skor", async function(data) {
        var latestData = await seniService.setPengumumanSkor(data.pertandinganId);
        if (!latestData) return false;
        io.to(room).emit('data-pertandingan-seni', latestData);
    })

});