'use strict';
(function(window){
    dayjs.locale("id");
    var utils = {}
    utils.getCurrentDateTime = function() {
        var now = dayjs();
        var date = now.format("DD/MM/YYYY")
        var time = now.format("HH:mm")
        return {
            date: date,
            time: time
        }
    }
    utils.getFormattedDateTime = function () {
        return dayjs().format("YYYY-MM-DD-HHmmss")
    }
    utils.simpanGambar = function(namaFile) {
        var printed = document.getElementById("printed");
        var container = document.getElementById("container");
        window.scrollTo(0, 0);
        html2canvas(printed, {
            dpi: 300
        }).then(function(canvas) {
            container.appendChild(canvas);
            var a = document.createElement('a');
            a.href = canvas.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream");
            a.download = namaFile + '.jpg';
            a.click();
        }).then(function() {
            var canvas = document.getElementsByTagName('canvas');
            canvas[0].parentNode.removeChild(canvas[0]);
        });
    }



    if ( typeof module === 'object' && module && typeof module.exports === 'object' ) {
        module.exports = utils;
    } else {
        window.utils = utils;
    }
})( this );