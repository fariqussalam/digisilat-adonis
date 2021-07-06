(function () {
  $(function () {

    var _csrf = $('.wrapper').data('csrf');
    if (!_csrf) {
      _csrf = $('input[name="csrf"]').val();
    }
    window['_csrf'] = _csrf

    $(".js-select2").select2();

    $('.js-auto-submit').on('change', function () {
      $(this).closest("form").submit();
    })

    var datatablesTurnamen = $("#datatables-turnamen").DataTable({
      responsive: true,
      lengthChange: !1
    });

    $('.datatables-kategori').each(function () {
      var table = $(this);
      table.DataTable({
        responsive: true,
        lengthChange: !1
      });
    });

    $('.datatables-pertandingan').each(function () {
      var table = $(this);
      table.DataTable({
        responsive: true,
        lengthChange: !1,
       ordering: false
      });
    });

    var ajaxAndReload = function(url, id) {
      if (!url || !id) return false;
      $.ajax({
        method: "POST",
        url: url,
        data: {
          _csrf: _csrf,
          id: id
        }
      }).done(function () {
        window.location.reload();
      });
    }

    function confirmActivate() {
      var url = $(this).data('url');
      var id = $(this).data('id');
      vex.dialog.confirm({
        yesText: 'Yes',
        message: 'Yakin ingin mengaktifkan turnamen ?',
        callback: function (result) {
          if (!result) return false;
          ajaxAndReload(url, id);
        }
      })
    };

    function confirmDelete() {
      var url = $(this).data('url');
      var id = $(this).data('id');
      vex.dialog.confirm({
        yesText: 'Yes',
        message: 'Yakin ingin menghapus turnamen ?',
        callback: function (result) {
          if (!result) return false;
          ajaxAndReload(url, id);
        }
      })
    }

    function toTypeName(type) {
      var name = "Kategori"
      switch (type) {
        case 'KONTINGEN':
          name = "Kontingen"
          break;
        case 'SENI':
          name = "Kategori Seni"
          break;
        case 'KELAS':
          name = "Kelas";
          break;
        case 'JABATAN':
          name = "Jabatan"
          break;
        default:
          name = "Kategori"
          break;
      }
      return name
    }

    var addKategori = function () {
      var url = $(this).data('url');
      var type = $(this).data("type");
      var typeName = toTypeName(type);
      vex.dialog.open({
        message: 'Tambah ' + typeName,
        input: [
          '<input name="type" type="hidden" value="' + type + '" />',
          '<input name="nama" type="text" required />'
        ].join(''),
        buttons: [
          $.extend({}, vex.dialog.buttons.YES, {text: 'Simpan'}),
          $.extend({}, vex.dialog.buttons.NO, {text: 'Kembali'})
        ],
        callback: function (data) {
          if (!data) return false;
          saveKategori(url, null, data.nama, data.type);
        }
      })
    }

    var saveKategori = function (url, id, nama, type) {
      var data = {
        id: id,
        nama: nama,
        type: type,
        _csrf: _csrf
      }
      $.ajax({
        method: "POST",
        url: url,
        data: data
      }).done(function (response) {
        window.location.reload();
      });
    }

    var editKategori = function () {
      var type = $(this).closest('.card').find('.js-kategori-create').data('type');
      console.log(type);
      var kategori = $(this).data();
      var typeName = toTypeName(type);
      vex.dialog.open({
        message: 'Edit ' + typeName,
        input: [
          '<input name="type" type="hidden" value="' + type + '" />',
          '<input name="nama" type="text" value="' + kategori.nama + '" required />'
        ].join(''),
        buttons: [
          $.extend({}, vex.dialog.buttons.YES, {text: 'Simpan'}),
          $.extend({}, vex.dialog.buttons.NO, {text: 'Kembali'})
        ],
        callback: function (data) {
          if (!data) return false;
          saveKategori(kategori.url, kategori.id, data.nama, type);
        }
      })
    }

    var confirmDeleteKategori = function () {
      var url = $(this).data('url');
      var id = $(this).data('id');
      var type = $(this).closest('.card').find('.js-kategori-create').data('type');
      vex.dialog.confirm({
        yesText: 'Yes',
        message: 'Yakin ingin menghapus data ?',
        callback: function (result) {
          if (!result) return false;
          deleteKategori(url, {id: id, type: type});
        }
      })
    };

    var deleteKategori = function (url, data) {
      if (!url || !data) return false;
      $.ajax({
        method: "POST",
        url: url,
        data: {id: data.id, type: data.type, _csrf: _csrf}
      }).done(function (response) {
        window.location.reload();
      });
    }

    var confirmDeletePeserta = function () {
      var url = $(this).data('url');
      var id = $(this).data('id');
      var tipe = $(this).data("tipe");
      vex.dialog.confirm({
        yesText: 'Yes',
        message: 'Yakin ingin menghapus data ?',
        callback: function (result) {
          if (!result) return false;
          deletePeserta(url, tipe, id);
        }
      })
    };

    var deletePeserta = function (url, tipe, id) {
      if (!url || !id) return false;
      $.ajax({
        method: "POST",
        url: url,
        data: {type: tipe, id: id , _csrf: _csrf}
      }).done(function (response) {
        window.location.reload();
      });
    }

    $(document).on('click', '.js-turnamen-activate', confirmActivate);
    $(document).on('click', '.js-turnamen-delete', confirmDelete);
    $(document).on('click', '.js-kategori-create', addKategori);
    $(document).on('click', '.js-kategori-edit', editKategori);
    $(document).on('click', '.js-kategori-delete', confirmDeleteKategori);
    $(document).on('click', '.js-peserta-delete', confirmDeletePeserta);

    $('.js-tournament-change-image').click(function() {
      var $closestDiv = $(this).closest("div");
      var inputName = $(this).data('name');
      var inputLabel = $(this).data('label')
      var uploadTemplate = '<label class="form-label">' + inputLabel + '</label><input type="file" class="form-control" name="' + inputName + '" >';
      $closestDiv.empty();
      $closestDiv.html(uploadTemplate)
    })


  })
})(jQuery);

(function () {
  $(function () {

    var _csrf = $('.wrapper').data('csrf');

    function doUndian(data) {
      if (!data.url || !data.kategori) return false;
      $.ajax({
        method: "POST",
        url: data.url,
        data: { kategori: data.kategori, _csrf: _csrf, type: data.type }
      }).done(function () {
        window.location.reload();
      });
    }

    $('.js-undian-undi').on('click', function () {
      var dataUndian = $(this).data();
      var pesertaList = dataUndian.pesertaUndian.split(",");
      vex.dialog.open({
        buttons: [
          $.extend({}, vex.dialog.buttons.YES, {text: 'Draw'}),
        ],
        callback: function (data) {
          doUndian(dataUndian);
        },
        contentClassName: 'vex-undian-wrapper',
        unsafeMessage: '<div class="undian-box-wrapper">' +
            '<div class="undian-box text-center btn btn-success">UNDI</div>' +
            '</div>',
        afterOpen: function () {
          var undianList = pesertaList,
              num = undianList.length - 1,
              btnClass = '.undian-box',
              open = false;
          $(document).on('click', btnClass, function () {
            if (!open) {
              timer = setInterval(function () {
                var random = Math.round(Math.random() * num),
                    eat = undianList[random];
                $(btnClass).text(eat);
              }, 40);
              open = true;
            } else {
              clearInterval(timer);
              open = false;
            }
          })
        }
      })
    })

  })
})(jQuery);

/**
 * Bracket/Bagan
 */
(function () {
  $(function () {

    if (!String.prototype.includes) {
      String.prototype.includes = function(search, start) {
        'use strict';

        if (search instanceof RegExp) {
          throw TypeError('first argument must not be a RegExp');
        }
        if (start === undefined) { start = 0; }
        return this.indexOf(search, start) !== -1;
      };
    }

    function getDataPeserta() {
      var pesertaList = []
      $('.js-data-peserta').each(function() {
        var data = $(this).data();
        if (data.nomorUndian !== "-") {
          pesertaList.push(data)
        }
      })
      return pesertaList
    }

    function replaceBracketData(peserta, teams) {
      if (!peserta || peserta.length < 1) return null;
      if (!teams) return null;
      var pesertaMap = {}
      _.each(peserta, function(p) {
        pesertaMap[p.nomorUndian] = p.nama + " | " + p.namaKontingen;
      })

      var replaced = _.map(teams, function(t) {
        var newList = []
        _.each(t, function (el) {
          if (el != null && el.includes("Undian")) {
            var index = el.substring(el.indexOf(":") + 1);
            newList.push(pesertaMap[index]);
          } else {
            newList.push(el);
          }
        })
        return newList;
      });
      return replaced;
    }

    /**
     * TODO: finish save bagan
     */
    function saveBagan() {}

    function initBrackets() {
      var jumlahPeserta = $("input[name='jumlah_peserta']").val();
      var baganString = $("input[name='template_bagan']").val();
      if (!jumlahPeserta || !baganString) return false

      var brackets = JSON.parse(baganString);
      var bracketData = brackets.brackets[jumlahPeserta];
      var peserta = getDataPeserta();
      var teams = bracketData.data.teams;

      var replaced = replaceBracketData(peserta, teams);
      if (replaced) bracketData.data.teams = replaced;

      var $bracketWrapper = $('.js-bracket-wrapper');
      var bracketTemplate = "<div><div class='js-bracket'></div></div>";
      var $template = $(bracketTemplate);
      $template.find('.js-bracket').data("jumlah", jumlahPeserta);
      $bracketWrapper.append($template);

      $('.js-bracket').bracket({
        init: bracketData.data, teamWidth: 300,
        save: saveBagan,
        disableToolbar: true
      });
    }

    initBrackets();

    function loadJSON(callback) {
      var xobj = new XMLHttpRequest();
      xobj.overrideMimeType("application/json");
      xobj.open('GET', '/template-bagan.json', true);
      xobj.onreadystatechange = function() {
        if (xobj.readyState === 4 && xobj.status === 200) {
          callback(xobj.responseText);
        }
      };
      xobj.send(null);
    }

    function initContohBagan() {
      loadJSON(function(response) {
        var brackets = JSON.parse(response);
        var $bracketWrapper = $('.js-contoh-bagan');
        for (var i = 2; i<=50;i++) {
          var bracketTemplate = "<div>" +
              "<div class='row mb-1 mt-1 js-bracket-name' style='width:100%'></div>" +
              "<div class='js-bracket'></div>" +
              "</div>";
          var $template = $(bracketTemplate);
          $template.find('.js-bracket-name').html("Bracket " + i + " : ");
          $template.find('.js-bracket').data("jumlah", i);
          $bracketWrapper.append($template);
        }

        $('.js-bracket').each(function() {
          var jumlah = $(this).data("jumlah");
          var bracketData = brackets.brackets[jumlah];
          if (bracketData) {
            $(this).bracket({
              init: bracketData.data,
              teamWidth: 200,
            })
          }
        })
      });
    }

    var $contohBagan = $(".js-contoh-bagan");
    if ($contohBagan.length && $contohBagan.length > 0) {
      initContohBagan();
    }

    /**
     * TODO: finish rendering merapihkan bagan
     */
    /**
     setTimeout(function() {
      $('div:contains(BYE)').closest(".team.na").css("visibility", "hidden");
    }, 500)
     */

  })
})(jQuery);

/**
 * Generate Jadwal
 */
(function () {
  $(function () {

    $('.js-turnamen-generate-jadwal').on('click', function() {
      var url = $(this).data("url");
      swal({
        title: "Perhatian",
        text: "Apabila Jadwal Telah Dibuat Maka Undian Sudah Tidak Bisa Diubah",
        icon: "warning",
        buttons: ["Cancel", "Buat"],
      }).then(function(confirm) {
        if (confirm) {
         window.location.href= url;
        }
      });
    });

    $('.js-jadwal__atur-pertandingan').click(function() {
      var id = $(this).data("id");
      var url = $(this).data("url");
      var jumlah_gelanggang = $('input[name="jumlah_gelanggang"]').val()
      var template = "";
      for (var i = 1;i <= jumlah_gelanggang;i++) {
        template += '<option value="' + i + '">Gelanggang ' + i + '</option>'
      }
      vex.dialog.open({
          message: 'Atur Nomor Partai dan Nomor Gelanggang',
          input: [
              '<style>',
                  '.vex-custom-field-wrapper {',
                      'margin: 1em 0;',
                  '}',
                  '.vex-custom-field-wrapper > label {',
                      'display: inline-block;',
                      'margin-bottom: .2em;',
                  '}',
              '</style>',
              '<div class="vex-custom-field-wrapper">',
                  '<label for="nomor_partai">Nomor Partai</label>',
                  '<div class="vex-custom-input-wrapper">',
                      '<input type="text" name="nomor_partai" />',
                  '</div>',
              '</div>',
              '<div class="vex-custom-field-wrapper">',
                  '<label for="color">Nomor Gelanggang</label>',
                  '<div class="vex-custom-input-wrapper">',
                  '<select name="nomor_gelanggang" class="form-control js-select2 js-auto-submit" data-placeholder="Pilih Nomor Gelanggang">',
                      template,
                      '</select>',
                  '</div>',
              '</div>'
          ].join(''),
          callback: function (data) {
              if (!data) {
                  return console.log('Cancelled')
              }
              $.ajax({
                method: "POST",
                url: url,
                data: {
                  _csrf: window['_csrf'],
                  id: id,
                  nomor_gelanggang: data.nomor_gelanggang,
                  nomor_partai: data.nomor_partai
                }
              }).done(function () {
                window.location.reload();
              });
          }
      })
    })

    $('.js-jadwal__atur-pertandingan-seni').click(function() {
      var id = $(this).data("id");
      var url = $(this).data("url");
      var jumlah_pool = $('input[name="jumlah_pool"]').val()
      var template = "";
      for (var i = 1;i <= jumlah_pool;i++) {
        template += '<option value="' + i + '">Pool ' + i + '</option>'
      }
      vex.dialog.open({
          message: 'Atur Nomor Pool',
          input: [
              '<style>',
                  '.vex-custom-field-wrapper {',
                      'margin: 1em 0;',
                  '}',
                  '.vex-custom-field-wrapper > label {',
                      'display: inline-block;',
                      'margin-bottom: .2em;',
                  '}',
              '</style>',
              '<div class="vex-custom-field-wrapper">',
                  '<label for="color">Nomor Pool</label>',
                  '<div class="vex-custom-input-wrapper">',
                  '<select name="nomor_pool" class="form-control js-select2 js-auto-submit" data-placeholder="Pilih Nomor Pool">',
                      template,
                      '</select>',
                  '</div>',
              '</div>'
          ].join(''),
          callback: function (data) {
              if (!data) {
                  return console.log('Cancelled')
              }
              $.ajax({
                method: "POST",
                url: url,
                data: {
                  _csrf: window['_csrf'],
                  id: id,
                  nomor_pool: data.nomor_pool
                }
              }).done(function () {
                window.location.reload();
              });
          }
      })
    })

    $('.js-gelanggang__mulai-pertandingan').click(function() {
      var data = $(this).data()
      if (!data) {
        return console.log('Cancelled')
    }
    $.ajax({
      method: "POST",
      url: data.url,
      data: {
        _csrf: window['_csrf'],
        id: data.id,
        nomor_gelanggang: data.nomorGelanggang,
        status: data.status
      }
    }).done(function (data) {
      console.log("okk")
      window.location.reload();
    });
    })

    $('.js-gelanggang__mulai-pertandingan-seni').click(function() {
      var data = $(this).data()
      if (!data) {
        return console.log('Cancelled')
    }
    $.ajax({
      method: "POST",
      url: data.url,
      data: {
        _csrf: window['_csrf'],
        id: data.id,
        nomor_pool: data.nomorPool,
        status: data.status
      }
    }).done(function (data) {
      window.location.reload();
    });
    })

    $('.js-gelanggang__pengumuman-pemenang').click(function() {
      var alasanKemenangan = window.alasanKemenangan
      if (!alasanKemenangan) return false;
      
      var url = $(this).data('url')
      var pertandinganId = $(this).data("pertandingan");
      var alasanKemenanganTemplate = ""
      _.each(alasanKemenangan, function(alasan) {
        alasanKemenanganTemplate += '<option value="' + alasan + '">' + alasan + '</option>'
      })

      var sudut = window.sudut
      var sudutTemplate = ""
      _.each(sudut, function(s) {
        sudutTemplate += '<option value="' + s + '">' + s + '</option>'
      })

      vex.dialog.open({
        message: 'Pengumuman Pemenang',
        input: [
            '<style>',
                '.vex-custom-field-wrapper {',
                    'margin: 1em 0;',
                '}',
                '.vex-custom-field-wrapper > label {',
                    'display: inline-block;',
                    'margin-bottom: .2em;',
                '}',
            '</style>',
            '<input type="hidden" name="pertandingan_id" value="' + pertandinganId + '"',
            '<div class="vex-custom-field-wrapper">',
                '<label for="color">Sudut Pemenang</label>',
                '<div class="vex-custom-input-wrapper">',
                '<select name="sudut" class="form-control js-select2">',
                    sudutTemplate,
                    '</select>',
                '</div>',
            '</div>',
            '<div class="vex-custom-field-wrapper">',
                '<label for="color">Alasan Kemenangan</label>',
                '<div class="vex-custom-input-wrapper">',
                '<select name="alasan_kemenangan" class="form-control js-select2">',
                    alasanKemenanganTemplate,
                    '</select>',
                '</div>',
            '</div>',
          '<div class="vex-custom-field-wrapper">',
          '<label for="poin">Poin Merah</label>',
          '<div class="vex-custom-input-wrapper">',
          '<input type="number" name="poin_merah" max="10" value="0"/>',
          '</div>',
          '<div class="vex-custom-field-wrapper">',
          '<label for="poin">Poin Biru</label>',
          '<div class="vex-custom-input-wrapper">',
          '<input type="number" name="poin_biru" max="10" value="0" />',
          '</div>',
          '</div>'
        ].join(''),
        callback: function (data) {
            if (!data) {
                return console.log('Cancelled')
            }
            $.ajax({
              method: "POST",
              url: url,
              data: {
                _csrf: window['_csrf'],
                pertandingan_id: data.pertandingan_id,
                sudut: data.sudut,
                alasan: data.alasan_kemenangan,
                skor_merah: data.poin_merah,
                skor_biru: data.poin_biru
              }
            }).done(function () {
              window.location.reload();
            });
        }
    })


    })
  })
})(jQuery);

/**
 * Undian Export To Excel
 */
 (function () {
  $(function () {

    $('.js-undian-export-to-excel').click(function() {
      swal({
        title: 'Exporting...',
        allowOutsideClick: false,
        onBeforeOpen: () => {
            swal.showLoading()
        },
        buttons: false
    });

      var id = $(this).data("undian")
      var url = $(this).data("url")
      $.ajax({
        method: "POST",
        url: url,
        data: {
          _csrf: window['_csrf'],
          id: id
        }
      }).done(function (data) {
        swal.close()
        if (data.filename) {
          $('.js-download-form').find('input[name="filename"]').val(data.filename)
          $('.js-download-form').submit()
        }
      }).fail(function() {
        swal.close()
      });
    });
  })
})(jQuery);

/**
 * Seni
 */
 (function () {
  $(function () {

  })
})(jQuery);

/**
 * Tambah Peseta Massal
 */
 (function () {
  $(function () {

    $('.js-peserta-add-group-item').click(function() {
      var template = $('#template-peserta-tanding-massal').html()
      var rendered = Mustache.render(template)
      $(this).closest('div').find('form').append(rendered);
    })

    $('.js-peserta-seni-add-group-item').click(function() {
      var template = $('#template-peserta-seni-massal').html()
      var rendered = Mustache.render(template)
      $(this).closest('div').find('form').append(rendered);
    })

    $('.js-peserta-add-group-submit').click(function() {
      $(this).closest('div').find('form').submit()
    })

  })
})(jQuery);