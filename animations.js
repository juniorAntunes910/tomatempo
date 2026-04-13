// Animations 3D - Three.js setup para efeitos visuais
class PomodoroAnimations {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.cube = null;
        this.particles = null;
        this.particleSystem = null;
        this.clock = new THREE.Clock();
        this.isAnimating = true;
        
        this.init();
        this.setupEventListeners();
    }
    
    init() {
        // Configuração da cena
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x667eea);
        this.scene.fog = new THREE.FogExp2(0x667eea, 0.008);
        
        // Configuração da câmera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 30;
        this.camera.position.y = 5;
        
        // Configuração do renderizador
        this.renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bgCanvas'), alpha: false });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        // Luzes
        this.addLights();
        
        // Objetos 3D
        this.createMainCube();
        this.createParticleSystem();
        this.createFloatingSpheres();
        
        // Animação
        this.animate();
        
        // Resize handler
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    addLights() {
        // Luz ambiente
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);
        
        // Luz direcional principal
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 7);
        this.scene.add(directionalLight);
        
        // Luz de preenchimento
        const fillLight = new THREE.PointLight(0x764ba2, 0.5);
        fillLight.position.set(-3, 2, 4);
        this.scene.add(fillLight);
        
        // Luz de fundo
        const backLight = new THREE.PointLight(0x667eea, 0.3);
        backLight.position.set(0, 5, -5);
        this.scene.add(backLight);
    }
    
    createMainCube() {
        const geometry = new THREE.BoxGeometry(3, 3, 3);
        const material = new THREE.MeshStandardMaterial({
            color: 0xff6b6b,
            emissive: 0x442222,
            roughness: 0.3,
            metalness: 0.7,
            transparent: true,
            opacity: 0.9
        });
        
        this.cube = new THREE.Mesh(geometry, material);
        this.scene.add(this.cube);
        
        // Adiciona wireframe ao redor
        const edgesGeo = new THREE.EdgesGeometry(geometry);
        const edgesMat = new THREE.LineBasicMaterial({ color: 0xffffff });
        const wireframe = new THREE.LineSegments(edgesGeo, edgesMat);
        this.cube.add(wireframe);
    }
    
    createParticleSystem() {
        const particleCount = 1500;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 50 - 20;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.1,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }
    
    createFloatingSpheres() {
        this.spheres = [];
        const sphereCount = 30;
        
        for (let i = 0; i < sphereCount; i++) {
            const geometry = new THREE.SphereGeometry(0.2, 16, 16);
            const material = new THREE.MeshStandardMaterial({
                color: new THREE.Color().setHSL(0.6 + Math.random() * 0.2, 0.8, 0.5),
                emissive: 0x222222,
                roughness: 0.2,
                metalness: 0.8
            });
            
            const sphere = new THREE.Mesh(geometry, material);
            sphere.userData = {
                speedX: (Math.random() - 0.5) * 0.02,
                speedY: (Math.random() - 0.5) * 0.02,
                speedZ: (Math.random() - 0.5) * 0.02,
                radius: 10 + Math.random() * 15,
                angle: Math.random() * Math.PI * 2
            };
            
            sphere.position.x = (Math.random() - 0.5) * 40;
            sphere.position.y = (Math.random() - 0.5) * 30;
            sphere.position.z = (Math.random() - 0.5) * 30 - 10;
            
            this.scene.add(sphere);
            this.spheres.push(sphere);
        }
    }
    
    setupEventListeners() {
        // Eventos do timer
        document.addEventListener('pomodoro:tick', (e) => this.onTimerTick(e.detail));
        document.addEventListener('pomodoro:complete', (e) => this.onTimerComplete(e.detail));
        document.addEventListener('pomodoro:modeChange', (e) => this.onModeChange(e.detail));
        document.addEventListener('pomodoro:pause', (e) => this.onTimerPause(e.detail));
        document.addEventListener('pomodoro:reset', (e) => this.onTimerReset(e.detail));
        
        // Efeitos visuais no logo
        const logo = document.getElementById('logo');
        if (logo) {
            logo.addEventListener('mouseenter', () => this.pulseLogo());
        }
        
        // Efeitos nos botões
        document.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('mouseenter', (e) => this.buttonGlow(e.target));
            btn.addEventListener('mouseleave', (e) => this.buttonNormal(e.target));
        });
    }
    
    onTimerTick(timeLeft) {
        // Anima o cube baseado no tempo restante
        const progress = timeLeft / (25 * 60); // Baseado no tempo máximo
        const scale = 1 + Math.sin(Date.now() * 0.005) * 0.05;
        
        if (this.cube) {
            this.cube.scale.setScalar(scale);
            // Muda a cor baseada no progresso
            const color = new THREE.Color().setHSL(0.05 * (1 - progress), 1, 0.5);
            this.cube.material.color = color;
        }
        
        // Efeito de partículas
        if (this.particles) {
            this.particles.rotation.y += 0.005;
            this.particles.rotation.x += 0.003;
        }
        
        // Pulsa o timer display
        const timerDisplay = document.getElementById('timerDisplay');
        if (timerDisplay) {
            timerDisplay.style.transform = 'scale(1.02)';
            setTimeout(() => {
                timerDisplay.style.transform = 'scale(1)';
            }, 100);
        }
    }
    
    onTimerComplete(mode) {
        // Efeito de explosão de partículas
        this.createExplosionEffect();
        
        // Pisca o fundo
        document.body.style.animation = 'flash 0.5s';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 500);
        
        // Anima o cube
        if (this.cube) {
            this.cube.material.emissiveIntensity = 1;
            setTimeout(() => {
                this.cube.material.emissiveIntensity = 0.2;
            }, 1000);
        }
    }
    
    onModeChange(data) {
        // Muda a cor do cube baseado no modo
        const colors = {
            pomodoro: 0xff6b6b,
            shortBreak: 0x4ecdc4,
            longBreak: 0x45b7d1
        };
        
        if (this.cube && colors[data.mode]) {
            this.cube.material.color.setHex(colors[data.mode]);
            
            // Animação de rotação rápida
            let rotation = 0;
            const rotateInterval = setInterval(() => {
                if (this.cube) {
                    this.cube.rotation.y += 0.1;
                    rotation += 0.1;
                    if (rotation >= Math.PI * 2) {
                        clearInterval(rotateInterval);
                    }
                }
            }, 16);
        }
    }
    
    onTimerPause(timeLeft) {
        // Diminui a rotação das partículas
        if (this.particles) {
            this.particles.rotation.y += 0.001;
        }
        
        // Efeito de fade no cube
        if (this.cube) {
            this.cube.material.opacity = 0.7;
            setTimeout(() => {
                if (this.cube) this.cube.material.opacity = 0.9;
            }, 500);
        }
    }
    
    onTimerReset(timeLeft) {
        // Reset visual
        if (this.cube) {
            this.cube.scale.setScalar(1);
            this.cube.rotation.x = 0;
            this.cube.rotation.y = 0;
        }
    }
    
    createExplosionEffect() {
        const particleCount = 100;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 5;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0xffaa00,
            size: 0.1,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        
        const explosion = new THREE.Points(geometry, material);
        explosion.position.copy(this.cube.position);
        this.scene.add(explosion);
        
        // Remove após animação
        setTimeout(() => {
            this.scene.remove(explosion);
        }, 1000);
    }
    
    pulseLogo() {
        const logo = document.getElementById('logo');
        if (logo) {
            logo.style.animation = 'none';
            logo.offsetHeight; // Trigger reflow
            logo.style.animation = 'float 3s ease-in-out infinite, pulse 0.5s';
            setTimeout(() => {
                if (logo) logo.style.animation = 'float 3s ease-in-out infinite';
            }, 500);
        }
    }
    
    buttonGlow(button) {
        button.style.transform = 'translateY(-2px)';
        button.style.boxShadow = '0 0 15px rgba(102, 126, 234, 0.8)';
    }
    
    buttonNormal(button) {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    }
    
    animate() {
        if (!this.isAnimating) return;
        
        const delta = this.clock.getDelta();
        const time = Date.now() * 0.002;
        
        // Anima o cube
        if (this.cube) {
            this.cube.rotation.x += 0.005;
            this.cube.rotation.y += 0.008;
            this.cube.rotation.z += 0.003;
            
            // Movimento de flutuação
            this.cube.position.y = Math.sin(time) * 0.5;
        }
        
        // Anima as esferas flutuantes
        if (this.spheres) {
            this.spheres.forEach((sphere, index) => {
                sphere.position.x += Math.sin(time + index) * 0.01;
                sphere.position.y += Math.cos(time * 0.8 + index) * 0.01;
                sphere.rotation.x += 0.02;
                sphere.rotation.y += 0.03;
            });
        }
        
        // Anima a câmera suavemente
        this.camera.position.x += (0 - this.camera.position.x) * 0.05;
        this.camera.position.y += (Math.sin(time * 0.3) * 2 - this.camera.position.y) * 0.05;
        this.camera.lookAt(0, 0, 0);
        
        // Renderiza
        this.renderer.render(this.scene, this.camera);
        
        // Continua animação
        requestAnimationFrame(() => this.animate());
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Inicializa animações quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Adiciona keyframes para animações CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes flash {
            0%, 100% { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            50% { background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%); }
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        .timer-display {
            transition: transform 0.1s ease;
        }
    `;
    document.head.appendChild(style);
    
    window.pomodoroAnimations = new PomodoroAnimations();
});