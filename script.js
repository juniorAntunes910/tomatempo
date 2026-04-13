// PomodoroTimer Core - Lógica completa para demonstração em aula
// Persiste o tempo restante de cada modo individualmente

class PomodoroCore {
    constructor() {
        // Duração padrão em segundos
        this.durations = {
            pomodoro: 25 * 60,
            shortBreak: 5 * 60,
            longBreak: 15 * 60
        };
        
        // Estado atual
        this.currentMode = 'pomodoro';      // 'pomodoro', 'shortBreak', 'longBreak'
        this.timeLeft = this.durations.pomodoro;
        this.isRunning = false;
        this.intervalId = null;
        
        // Armazena o tempo restante para cada modo (persistência)
        this.savedTimes = {
            pomodoro: this.durations.pomodoro,
            shortBreak: this.durations.shortBreak,
            longBreak: this.durations.longBreak
        };
        
        // Elementos DOM
        this.timerDisplay = document.getElementById('timerDisplay');
        this.modeNameSpan = document.getElementById('modeName');
        this.statusMsgDiv = document.getElementById('statusMsg');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.modeButtons = document.querySelectorAll('.mode-option');
        
        this.init();
    }
    
    init() {
        this.updateDisplay();
        this.updateModeUI();
        this.attachEvents();
        this.dispatchEvent('ready', { mode: this.currentMode, time: this.timeLeft });
    }
    
    attachEvents() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.resetCurrentMode());
        
        this.modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = btn.dataset.mode;
                if (mode) this.switchMode(mode);
            });
        });
    }
    
    start() {
        if (this.isRunning) return;
        if (this.timeLeft <= 0) {
            this.resetCurrentMode();
        }
        this.isRunning = true;
        this.updateStatus(`Em andamento — ${this.getModeLabel()}`, 'play');
        
        this.intervalId = setInterval(() => {
            if (this.timeLeft > 0) {
                this.timeLeft--;
                // Salva progresso a cada segundo
                this.savedTimes[this.currentMode] = this.timeLeft;
                this.updateDisplay();
                this.dispatchEvent('tick', { timeLeft: this.timeLeft, mode: this.currentMode });
            }
            
            if (this.timeLeft === 0) {
                this.completeSession();
            }
        }, 1000);
    }
    
    pause() {
        if (!this.isRunning) return;
        clearInterval(this.intervalId);
        this.intervalId = null;
        this.isRunning = false;
        this.updateStatus(`Pausado — restam ${this.formatTime(this.timeLeft)}`, 'pause');
        this.dispatchEvent('pause', { timeLeft: this.timeLeft, mode: this.currentMode });
    }
    
    resetCurrentMode() {
        const wasRunning = this.isRunning;
        if (wasRunning) this.pause();
        
        // Reseta o tempo do modo atual para o valor original da duração
        this.timeLeft = this.durations[this.currentMode];
        this.savedTimes[this.currentMode] = this.timeLeft;
        this.updateDisplay();
        this.updateStatus(`${this.getModeLabel()} resetado`, 'reset');
        this.dispatchEvent('reset', { mode: this.currentMode, timeLeft: this.timeLeft });
    }
    
    switchMode(newMode) {
        if (newMode === this.currentMode) return;
        
        // Salva o tempo atual do modo que está saindo
        this.savedTimes[this.currentMode] = this.timeLeft;
        
        // Para o timer se estiver rodando
        const wasRunning = this.isRunning;
        if (wasRunning) this.pause();
        
        // Muda o modo
        this.currentMode = newMode;
        
        // Recupera o tempo salvo para o novo modo (ou usa duração padrão)
        const saved = this.savedTimes[this.currentMode];
        this.timeLeft = (saved && saved > 0) ? saved : this.durations[this.currentMode];
        
        // Atualiza interface
        this.updateDisplay();
        this.updateModeUI();
        this.updateStatus(`Modo: ${this.getModeLabel()}`, 'modeChange');
        
        this.dispatchEvent('modeChange', { mode: this.currentMode, timeLeft: this.timeLeft });
        
        // Se estava rodando antes, mantém consistência (opção: não auto-iniciar)
        // Neste design, não reinicia automaticamente para dar controle ao usuário.
    }
    
    completeSession() {
        this.pause(); // para o timer
        this.updateStatus(`✅ Ciclo concluído! Hora de ${this.getNextSuggestion()}`, 'complete');
        this.dispatchEvent('complete', { mode: this.currentMode });
        
        // Opcional: tocar notificação (API de som pode ser adicionada depois)
        // O reset não é automático, o usuário decide.
    }
    
    updateDisplay() {
        const mins = Math.floor(this.timeLeft / 60);
        const secs = this.timeLeft % 60;
        this.timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    updateModeUI() {
        // Atualiza texto do badge
        const labels = {
            pomodoro: 'Foco intenso',
            shortBreak: 'Pausa curta',
            longBreak: 'Pausa longa'
        };
        this.modeNameSpan.textContent = labels[this.currentMode];
        
        // Marca botão ativo
        this.modeButtons.forEach(btn => {
            if (btn.dataset.mode === this.currentMode) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    
    updateStatus(message, type = 'info') {
        if (this.statusMsgDiv) {
            let icon = '<i class="fas fa-info-circle"></i>';
            if (type === 'play') icon = '<i class="fas fa-play-circle"></i>';
            if (type === 'pause') icon = '<i class="fas fa-pause-circle"></i>';
            if (type === 'reset') icon = '<i class="fas fa-sync-alt"></i>';
            if (type === 'complete') icon = '<i class="fas fa-check-circle"></i>';
            this.statusMsgDiv.innerHTML = `${icon} ${message}`;
        }
    }
    
    getModeLabel() {
        const map = { pomodoro: 'Pomodoro', shortBreak: 'Pausa curta', longBreak: 'Pausa longa' };
        return map[this.currentMode];
    }
    
    getNextSuggestion() {
        if (this.currentMode === 'pomodoro') return 'uma pausa curta';
        return 'foco novamente';
    }
    
    formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2,'0')}`;
    }
    
    dispatchEvent(eventName, detail) {
        const customEvent = new CustomEvent(`pomodoro:${eventName}`, { detail });
        document.dispatchEvent(customEvent);
    }
}

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.timerCore = new PomodoroCore();
});