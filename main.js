document.addEventListener('DOMContentLoaded', () => {
    loadGames();
    initThreeJS();
});

function loadGames() {
    const grid = document.getElementById('games-grid');

    fetch('games.json')
        .then(response => response.json())
        .then(games => {
            games.forEach(game => {
                const card = document.createElement('article');
                card.className = 'card';
                // Inseriamo un attributo data-tilt se volessimo usare vanilla-tilt.js in futuro
                
                card.innerHTML = `
                    <div class="card-img-container">
                         <img src="img/${game.id}.jpg" alt="${game.title}" class="card-img" onerror="this.src='https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop'">
                    </div>
                    <div class="card-content">
                        <h2 class="card-title">${game.title}</h2>
                        <p class="card-desc">${game.description}</p>
                        <a href="games/${game.id}.html" class="card-btn">
                            LAUNCH_PROTOCOL <span style="font-size:1.2em">→</span>
                        </a>
                    </div>
                `;
                grid.appendChild(card);
            });
        })
        .catch(err => console.error("Errore DB giochi:", err));
}

// --- PARTE 2: THREE.JS BACKGROUND (PARTICLE FIELD) ---
function initThreeJS() {
    const container = document.getElementById('canvas-container');
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Avviciniamo un po' la camera su mobile per vedere meglio le particelle
    camera.position.z = window.innerWidth < 768 ? 25 : 30;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio); // Importante per schermi nitidi
    container.appendChild(renderer.domElement);

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    const posArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 100; 
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // Aumentiamo size se siamo su mobile
    const isMobile = window.innerWidth < 768;
    
    const material = new THREE.PointsMaterial({
        size: isMobile ? 0.25 : 0.15, // Più grandi su mobile
        color: 0x00f3ff,
        transparent: true,
        opacity: 0.8,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, material);
    scene.add(particlesMesh);

    // Gestione Input (Mouse + Touch)
    let mouseX = 0;
    let mouseY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    // Desktop
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    // Mobile (Touch)
    document.addEventListener('touchmove', (event) => {
        if (event.touches.length > 0) {
            mouseX = (event.touches[0].clientX - windowHalfX);
            mouseY = (event.touches[0].clientY - windowHalfY);
        }
    }, { passive: true });

    // Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const animate = () => {
        // Rotazione costante di base (così si muovono anche senza toccare)
        particlesMesh.rotation.y += 0.002; 
        particlesMesh.rotation.x += 0.001;

        // Interazione aggiuntiva
        particlesMesh.rotation.y += 0.05 * (mouseX * 0.001 - particlesMesh.rotation.y);
        particlesMesh.rotation.x += 0.05 * (mouseY * 0.001 - particlesMesh.rotation.x);

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    };

    animate();
}
