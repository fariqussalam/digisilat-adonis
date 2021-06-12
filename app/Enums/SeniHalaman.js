const _ = require('underscore')
const SeniHalaman = {
    "DEWAN": {
        name: "DEWAN",
        label: "Dewan Pertandingan"
    },
    "DISPLAY": {
        name: "DISPLAY",
        label: "Display Pertandingan"
    },
    "JURI": {
        name: "JURI",
        label: "Juri Pertandingan"
    },
    "TIMER": {
        name: "TIMER",
        label: "Timer Pertandingan"
    },
}
const SeniHalamanList = _.values(SeniHalaman)
const Halaman = {
    map: SeniHalaman,
    list: SeniHalamanList
}
module.exports = Halaman