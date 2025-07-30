document.addEventListener("DOMContentLoaded", function () {
    const videoPlayer = document.getElementById("video-player");
    const touchOverlay = document.getElementById("touch-overlay");
    const mathChallenge = document.getElementById("math-challenge");
    const mathForm = document.getElementById("math-form");
    const dontTouchScreen = document.getElementById("dont-touch-screen");
    const dontTouchButton = document.getElementById("dont-touch-button");

    const q1Text = document.getElementById("q1-text");
    const q2Text = document.getElementById("q2-text");
    const q3Text = document.getElementById("q3-text");

    let alertShown = false;
    let clickCount = 0;
    let isInTrap = false;
    let trapAlreadyCompleted = false;
    let mathChallengeCompleted = false;
    let thirdTrapTriggered = false;

    let problems = []; // Guarda los resultados de las operaciones

    // Al terminar secuencia.mp4
    videoPlayer.addEventListener("ended", function () {
        if (!trapAlreadyCompleted) {
            playImagen5(); // Primera trampa
        } else if (trapAlreadyCompleted && !mathChallengeCompleted && videoPlayer.src.includes("secuencia.mp4")) {
            playImagen5(true); // Segunda trampa (reto)
        } else if (mathChallengeCompleted && thirdTrapTriggered) {
            resetToStart(); //  Reinicio final
        }
    });

    // A la mitad de imagen_5.mp4 → "¡Toca aquí!" (solo si no se completó)
    videoPlayer.addEventListener("timeupdate", function () {
        if (
            videoPlayer.src.includes("imagen_5.mp4") &&
            isInTrap &&
            !alertShown &&
            !trapAlreadyCompleted
        ) {
            const mitad = videoPlayer.duration / 2;
            if (videoPlayer.currentTime >= mitad) {
                videoPlayer.pause();
                alert("La imagen cinco requiere de acciones para ser desencriptada");
                showTouchOverlay();
                alertShown = true;
            }
        }
    });

    // Reproducir imagen_5.mp4 
    function playImagen5(isSecondTime = false) {
        videoPlayer.src = "imagen_5.mp4";
        videoPlayer.load();

        videoPlayer.addEventListener("loadedmetadata", function onMeta() {
            videoPlayer.removeEventListener("loadedmetadata", onMeta);
            videoPlayer.play();

            if (isSecondTime) {
                isInTrap = false;
                alertShown = false;
                clickCount = 0;

                setTimeout(() => {
                    alert("La imagen 5 requiere acciones del usuario.");
                    showMathChallenge();
                }, 500);
            } else {
                isInTrap = true;
                alertShown = false;
                clickCount = 0;
            }
        });
    }

    // Mostrar overlay toca aquí
    function showTouchOverlay() {
        moveOverlayRandomly();
        touchOverlay.style.display = "flex";

        function handleClick() {
            clickCount++;

            if (clickCount < 3) {
                moveOverlayRandomly();
            } else {
                touchOverlay.removeEventListener("click", handleClick);
                touchOverlay.style.display = "none";
                returnToMiddleOfSecuencia();
            }
        }

        touchOverlay.addEventListener("click", handleClick);
    }

    // Mover el overlay a posiciones aleatorias
    function moveOverlayRandomly() {
        const maxWidth = window.innerWidth - 220;
        const maxHeight = window.innerHeight - 100;

        const randomLeft = Math.floor(Math.random() * maxWidth);
        const randomTop = Math.floor(Math.random() * maxHeight);

        touchOverlay.style.left = `${randomLeft}px`;
        touchOverlay.style.top = `${randomTop}px`;
    }

    // Volver a mitad de secuencia
    function returnToMiddleOfSecuencia() {
        trapAlreadyCompleted = true;
        isInTrap = false;
        alertShown = false;
        clickCount = 0;

        videoPlayer.src = "secuencia.mp4";
        videoPlayer.load();

        videoPlayer.addEventListener("loadedmetadata", function skipToMiddle() {
            videoPlayer.removeEventListener("loadedmetadata", skipToMiddle);
            videoPlayer.currentTime = videoPlayer.duration / 2;
            videoPlayer.play();
        });
    }

    //Mostrar reto m
    function showMathChallenge() {
        mathChallenge.style.display = "flex";
        videoPlayer.pause();

        const ops = ["+", "-", "*"];
        problems = [];

        for (let i = 0; i < 3; i++) {
            const a = Math.floor(Math.random() * 10) + 1;
            const b = Math.floor(Math.random() * 10) + 1;
            const op = ops[Math.floor(Math.random() * ops.length)];
            const text = `${a} ${op} ${b}`;
            let result;

            switch (op) {
                case "+": result = a + b; break;
                case "-": result = a - b; break;
                case "*": result = a * b; break;
            }

            problems.push({ text, result });
        }

        q1Text.textContent = problems[0].text;
        q2Text.textContent = problems[1].text;
        q3Text.textContent = problems[2].text;

        mathForm.onsubmit = function (e) {
            e.preventDefault();

            const q1 = parseInt(mathForm.q1.value);
            const q2 = parseInt(mathForm.q2.value);
            const q3 = parseInt(mathForm.q3.value);

            if (q1 === problems[0].result && q2 === problems[1].result && q3 === problems[2].result) {
                mathChallenge.style.display = "none";
                mathChallengeCompleted = true;
                goToEndOfSecuencia();
            } else {
                alert("Respuestas incorrectas. Intenta de nuevo.");
            }
        };
    }

    //  Ir casi al final de secuencia.mp4 y activar tercera 
    function goToEndOfSecuencia() {
        videoPlayer.src = "secuencia.mp4";
        videoPlayer.load();

        videoPlayer.addEventListener("loadedmetadata", function skipToEnd() {
            videoPlayer.removeEventListener("loadedmetadata", skipToEnd);
            const casiFinal = videoPlayer.duration * 0.95;
            videoPlayer.currentTime = casiFinal;
            videoPlayer.play();

            setTimeout(() => {
                if (!thirdTrapTriggered) {
                    videoPlayer.pause();
                    showDontTouchTrap();
                    thirdTrapTriggered = true;
                }
            }, 2000);
        });
    }

    //  "NO PULSES ESTE BOTÓN"
    function showDontTouchTrap() {
        dontTouchScreen.style.display = "flex";

        dontTouchButton.onclick = () => {
            dontTouchScreen.style.display = "none";
            alert("Desobedeciste… desbloqueando contenido oculto.");

            videoPlayer.src = "imagen_5.mp4";
            videoPlayer.load();

            videoPlayer.addEventListener("loadedmetadata", function start() {
                videoPlayer.removeEventListener("loadedmetadata", start);
                videoPlayer.currentTime = 0;
                videoPlayer.play();
            });
        };
    }

    //  Reiniciar todo al llegar al final definitivo
    function resetToStart() {
        alert("Reiniciando secuencia...");

        // Reiniciar variables de control
        alertShown = false;
        clickCount = 0;
        isInTrap = false;
        trapAlreadyCompleted = false;
        mathChallengeCompleted = false;
        thirdTrapTriggered = false;
        problems = [];

        // Reproducir desde el inicio
        videoPlayer.src = "secuencia.mp4";
        videoPlayer.load();

        videoPlayer.addEventListener("loadedmetadata", function restart() {
            videoPlayer.removeEventListener("loadedmetadata", restart);
            videoPlayer.currentTime = 0;
            videoPlayer.play();
        });
    }
});
