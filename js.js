document.addEventListener("DOMContentLoaded", function () {
    const videoPlayer = document.getElementById("video-player");


    // Cuando termine secuencia.mp4, reproducir imagen5.mp4 automáticamente
    videoPlayer.addEventListener("ended", function () {
        videoPlayer.src = "imagen5.mp4";
        videoPlayer.load();
        videoPlayer.play();
    });
});
