// tombol fullscreen
const fullscreenBtn = document.getElementById('fullscreen-btn');
const content = document.getElementById('content');

fullscreenBtn.addEventListener('click', toggleFullScreen);

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        if (content.requestFullscreen) {
            content.requestFullscreen();
        } else if (content.webkitRequestFullscreen) { /* Safari */
            content.webkitRequestFullscreen();
        } else if (content.msRequestFullscreen) { /* IE11 */
            content.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
            document.msExitFullscreen();
        }
    }
}