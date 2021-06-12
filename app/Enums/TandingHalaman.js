const _ = require('underscore')
const TandingHalaman = {
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
const TandingHalamanList = _.values(TandingHalaman)
const Halaman = {
    map: TandingHalaman,
    list: TandingHalamanList
}

module.exports = Halaman