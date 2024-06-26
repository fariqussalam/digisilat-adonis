// document.addEventListener('DOMContentLoaded', (event) => {  // js murni
$(document).ready(function () {
    // pakai jquery

    // ////////////////////////////////////////////////////////////////////
    // PERHITUNGAN NILAI
    // ////////////////////////////////////////////////////////////////////

    // mengambil setiap element input nilai
    let un1 = $("#un1");
    let un2 = $("#un2");
    let un3 = $("#un3");
    let un4 = $("#un4");
    let un5 = $("#un5");
    let un6 = $("#un6");

    // element nilai hukuman
    let uh1 = $("#uh1");
    let uh2 = $("#uh2");
    let uh3 = $("#uh3");
    let uh4 = $("#uh4");
    let uh5 = $("#uh5");
    let uh6 = $("#uh6");

    // jumlah nilai dan hukuman
    let jn = $("#jn");
    let jnh = $("#jnh");

    // tombol pengurang
    let min10 = $("#min10");
    let min15 = $("#min15");
    let min20 = $("#min20");
    let min10b = $("#min10-b");
    let min5 = $("#min5");

    // tombol batal pengurang
    let undo10 = $("#undo10");
    let undo15 = $("#undo15");
    let undo20 = $("#undo20");
    let undo10b = $("#undo10-b");
    let undo5 = $("#undo5");

    // displa jumlah pelangaran penguran
    let dhn4 = $("#dhn4");
    let dhn6 = $("#dhn6");

    // nilai akhir
    let nilai_Akhir = $("#nilai-akhir");

    // funtion total nilai
    function totalNilai() {
        let val1 = parseFloat(un1.val()) || 0; // gunakan nol jika input kosong atau failed
        let val2 = parseFloat(un2.val()) || 0;
        let val3 = parseFloat(un3.val()) || 0;
        let val4 = parseFloat(un4.val()) || 0;
        let val5 = parseFloat(un5.val()) || 0;
        let val6 = parseFloat(un6.val()) || 0;

        let sum = val1 + val2 + val3 + val4 + val5 + val6;

        jn.val(sum);

        // otomatis nilai akhir
        nilaiAkhir();
    }

    // menjalankan fungsi total nilai setiap ada inputan
    un1.on("input", totalNilai);
    un2.on("input", totalNilai);
    un3.on("input", totalNilai);
    un4.on("input", totalNilai);
    un5.on("input", totalNilai);
    un6.on("input", totalNilai);

    // ////////////////////////////////////////////////////////////////////
    // PERHITUNGAN HUKUMAN
    // ////////////////////////////////////////////////////////////////////

    // min 10
    min10.click(function () {
        uh1.val(10);
        min10.toggleClass("d-none");
        undo10.toggleClass("d-none");
        totalHukuman();
    });
    undo10.click(function () {
        uh1.val(0);
        min10.toggleClass("d-none");
        undo10.toggleClass("d-none");
        totalHukuman();
    });

    // min 15
    min15.click(function () {
        uh2.val(15);
        min15.toggleClass("d-none");
        undo15.toggleClass("d-none");
        totalHukuman();
    });
    undo15.click(function () {
        uh2.val(0);
        min15.toggleClass("d-none");
        undo15.toggleClass("d-none");
        totalHukuman();
    });

    // min 20
    min20.click(function () {
        uh3.val(20);
        min20.toggleClass("d-none");
        undo20.toggleClass("d-none");
        totalHukuman();
    });
    undo20.click(function () {
        uh3.val(0);
        min20.toggleClass("d-none");
        undo20.toggleClass("d-none");
        totalHukuman();
    });

    // hukuman 4 dan 6
    // hukuman 4
    min10b.click(function () {
        let dval4 = parseFloat(uh4.val()) || 0;
        let count = dval4 + 10;
        uh4.val(count);

        let x = parseFloat(dhn4.text()) || 0;
        let h4 = x + 1;
        dhn4.text(h4);

        // otomatis total hukuman
        totalHukuman();

        // otomatis nilai akhir
        nilaiAkhir();
    });
    undo10b.click(function () {
        let dval4 = parseFloat(uh4.val()) || 0;
        if (dval4 > 0) {
            let count = dval4 - 10;
            uh4.val(count);

            let x = parseFloat(dhn4.text()) || 0;
            let h4 = x - 1;
            dhn4.text(h4);
        } else {
            uh4.val(dval4);
            dhn4.text("");
        }

        // otomatis total hukuman
        totalHukuman();

        // otomatis nilai akhir
        nilaiAkhir();
    });

    // hukuman 6
    min5.click(function () {
        let dval6 = parseFloat(uh6.val()) || 0;
        let count = dval6 + 5;
        uh6.val(count);

        let x = parseFloat(dhn6.text()) || 0;
        let h6 = x + 1;
        dhn6.text(h6);

        // otomatis total hukuman
        totalHukuman();

        // otomatis nilai akhir
        nilaiAkhir();
    });
    undo5.click(function () {
        let dval6 = parseFloat(uh6.val()) || 0;
        if (dval6 > 0) {
            let count = dval6 - 5;
            uh6.val(count);

            let x = parseFloat(dhn6.text()) || 0;
            let h6 = x - 1;
            dhn6.text(h6);
        } else {
            uh6.val(dval6);
            dhn6.text('');
        }

        // otomatis total hukuman
        totalHukuman();

        // otomatis nilai akhir
        nilaiAkhir();
    });

    // fungsi menghitung total hukuman
    function totalHukuman() {
        let val1 = parseFloat(uh1.val()) || 0; // gunakan nol jika input kosong atau failed
        let val2 = parseFloat(uh2.val()) || 0;
        let val3 = parseFloat(uh3.val()) || 0;
        let val4 = parseFloat(uh4.val()) || 0;
        let val5 = parseFloat(uh5.val()) || 0;
        let val6 = parseFloat(uh6.val()) || 0;

        let sum = val1 + val2 + val3 + val4 + val5 + val6;

        jnh.val(sum);

        // otomatis nilai akhir
        nilaiAkhir();
    }

    // menjalankan fungsi total nilai hukuman setiap ada inputan
    uh1.on("input", totalHukuman);
    uh2.on("input", totalHukuman);
    uh3.on("input", totalHukuman);
    uh4.on("input", totalHukuman);
    uh5.on("input", totalHukuman);
    uh6.on("input", totalHukuman);

    // fungsi hitung nilai akhir
    function nilaiAkhir() {
        let na1 = parseFloat(jn.val()) || 0;
        let na2 = parseFloat(jnh.val()) || 0;
        let sumNa = na1 - na2;
        nilai_Akhir.val(sumNa);
    }
});
