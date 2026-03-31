let timer;
let isRunning = false;
let currentMode = "focus";

const times = {
    focus: 25 * 60,
    short: 5 * 60,
    long: 15 * 60
};

function updateDisplay() {
    const timeLeft = times[currentMode];

    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const seconds = String(timeLeft % 60).padStart(2, "0");

    document.getElementById("timer").textContent = `${minutes}:${seconds}`;

    document.getElementById("mode-title").textContent =
        currentMode === "focus"
            ? "Foco"
            : currentMode === "short"
                ? "Descanso curto"
                : "Descanso longo";
}

function startTimer() {
    if (isRunning) return;

    isRunning = true;

    timer = setInterval(() => {
        if (times[currentMode] > 0) {
            times[currentMode]--;
            updateDisplay();
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timer);
    isRunning = false;
}

function changeMode(mode) {
    currentMode = mode;
    updateDisplay();
}

updateDisplay();