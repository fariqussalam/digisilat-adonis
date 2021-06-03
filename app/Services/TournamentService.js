'use strict'
const _ = require('underscore')

class TournamentService {

    getKategoriTypes() {
        const typeList = [
            {
                type: "KONTINGEN",
                name: "Kontingen",
            },
            {
                type: "KELAS",
                name: "Kelas"
            },
            {
                type: "SENI",
                name: "Kategori Seni"
            },
            {
                type: "JABATAN",
                name: "Jabatan"
            }
        ]
        return typeList
    }

    mapKategori(types, typeList) { 

        for (let type of types) {
            type.list = typeList[type.type]
        }

        return types
    }

 
}

module.exports = TournamentService