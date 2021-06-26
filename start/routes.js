'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.on('/').render('index')
Route.get('file/download', 'FileController.download')

/**
 * Tournament
 */
Route.get('tournament', 'TournamentController.index')
Route.get('tournament/create', 'TournamentController.create')
Route.post('tournament/save', 'TournamentController.save')
Route.get('tournament/edit/:id', 'TournamentController.edit')
Route.post('tournament/update', 'TournamentController.update')
Route.post('tournament/delete', 'TournamentController.delete')
Route.post('tournament/activate', 'TournamentController.activate')

/**
 * Kategori
 */
Route.get('kategori', 'KategoriController.index')
Route.post('kategori/save', 'KategoriController.save')
Route.post('kategori/update', 'KategoriController.update')
Route.post('kategori/delete', 'KategoriController.delete')
Route.get('kategori-seni/create', 'KategoriController.createSeni')
Route.post('kategori-seni/save', 'KategoriController.saveSeni')
Route.get('kategori-seni/edit/:id', 'KategoriController.editSeni')
Route.post('kategori-seni/update', 'KategoriController.updateSeni')
Route.get('kategori-seni/delete/:id', 'KategoriController.deleteSeni')
Route.get('kategori-seni/manual-update', 'KategoriController.manualUpdateKategori')

/**
* Peserta
*/
Route.get('peserta/tanding', 'PesertaController.tanding')
Route.get('peserta/seni', 'PesertaController.seni')
Route.get('peserta/official', 'PesertaController.official')
Route.get('peserta/create/:type', 'PesertaController.create')
Route.get('peserta/edit/:type/:id', 'PesertaController.edit')
Route.post('peserta/save/:type', 'PesertaController.save')
Route.post('peserta/update/:type', 'PesertaController.update')
Route.post('peserta/delete/:type', 'PesertaController.delete')

/**
* Undian
*/
Route.get('undian/tanding', 'UndianController.tanding')
Route.get('undian/seni', 'UndianController.seni')
Route.get('undian/bagan', 'UndianController.bagan')
Route.post('undian/undi', 'UndianController.undi')
Route.post('undian/export', 'UndianController.exportExcel')

/**
* Pertandingan
*/
Route.get('pertandingan/generate-jadwal', 'JadwalController.generateJadwal')
Route.get('pertandingan/generate-jadwal-seni', 'JadwalController.generateJadwalSeni')
Route.get('pertandingan/jadwal/tanding', 'JadwalController.jadwalTanding')
Route.get('pertandingan/jadwal/seni', 'JadwalController.jadwalSeni')
Route.post('pertandingan/jadwal/update-gelanggang', 'JadwalController.updateGelanggang')
Route.post('pertandingan/jadwal/update-partai', 'JadwalController.updatePartai')
Route.post('pertandingan/jadwal/update-pool', 'JadwalController.updatePool')
Route.post('pertandingan/jadwal/update-partai-seni', 'JadwalController.updatePartaiSeni')
Route.get('pertandingan/jadwal/reset-gelanggang', 'JadwalController.resetGelanggang')
Route.get('pertandingan/jadwal/reset-pool', 'JadwalController.resetPool')

Route.post('pertandingan/jadwal/mulai-pertandingan', 'TandingController.mulaiPertandingan')
Route.get('tanding/gelanggang/:nomor_gelanggang', 'TandingController.gelanggang')
Route.get('tanding/gelanggang/:nomor_gelanggang/:halaman', 'TandingController.halaman')
Route.post('tanding/pengumuman-pemenang', 'TandingController.pengumumanPemenang' )

/**
 * Pool
 */
 Route.post('seni/jadwal/mulai-pertandingan', 'SeniController.mulaiPertandingan')
 Route.get('seni/pool/:nomor_pool', 'SeniController.pool')
 Route.get('seni/pool/:nomor_pool/:halaman', 'SeniController.halaman')

/**
 * Print PDF
 */
Route.post('pertandingan/export-pdf', 'TandingController.exportToPdf' )
