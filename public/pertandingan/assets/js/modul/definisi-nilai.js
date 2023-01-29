var JenisIndikator = {
    Plus: "+",
    Minus: "-"
}
var JenisNilai = {
    SeranganTangan: "SeranganTangan",
    SeranganKaki: "SeranganKaki",
    SeranganJatuhan: "SeranganJatuhan",
    TangkisanTangan: "TangkisanTangan",
    TangkisanKaki: "TangkisanKaki",
    TangkisanJatuhan: "TangkisanJatuhan"
}

function Nilai(nilai, code, nilaiString, name) {
    this.nilai = nilai
    this.code = code
    this.nilaiString = nilaiString
    this.name = name
    this.indikator = JenisIndikator.Plus
}

function NewNilai(jenis) {
    switch (jenis) {
        case JenisNilai.SeranganTangan:
            return new Nilai(20, JenisNilai.SeranganTangan, "20", "Serangan Tangan")
        case JenisNilai.SeranganKaki:
            return new Nilai(30, JenisNilai.SeranganKaki, "30", "Serangan Kaki")
        case JenisNilai.SeranganJatuhan:
            return new Nilai(40, JenisNilai.SeranganJatuhan, "40", "Serangan Jatuhan")
        case JenisNilai.TangkisanTangan:
            return new Nilai(30, JenisNilai.TangkisanTangan, "10+20", "Tangkisan + Serangan Tangan")
        case JenisNilai.TangkisanKaki:
            return new Nilai(40, JenisNilai.TangkisanKaki, "10+30", "Tangkisan + Serangan Kaki")
        case JenisNilai.TangkisanJatuhan:
            return new Nilai(50, JenisNilai.TangkisanJatuhan, "10+40", "Tangkisan + Serangan Jatuhan")
        default:
            return new Nilai(0, "-", "0", "-")
            break;
    }
}

var JenisHukuman = {
    Teguran1: "Teguran1",
    Teguran2: "Teguran2",
    Peringatan1: "Peringatan1",
    Peringatan2: "Peringatan2",
    Diskualifikasi: "Diskualifikasi",
}

function Hukuman(nilai, code, nilaiString, name) {
    this.nilai = nilai
    this.code = code
    this.nilaiString = nilaiString
    this.name = name
    this.indikator = JenisIndikator.Minus
}

function NewHukuman(jenis) {
    switch (jenis) {
        case JenisHukuman.Teguran1:
            return new Hukuman(-10, JenisHukuman.Teguran1, "-10", "Teguran 1")
        case JenisHukuman.Teguran2:
            return new Hukuman(-20, JenisHukuman.Teguran2, "-20", "Teguran 2")
        case JenisHukuman.Peringatan1:
            return new Hukuman(-30, JenisHukuman.Peringatan1, "-30", "Peringatan 1")
        case JenisHukuman.Peringatan2:
            return new Hukuman(-40, JenisHukuman.Peringatan2, "-40", "Peringatan 2")
        default:
            return new Hukuman(0, "-", "0", "-")
    }
}