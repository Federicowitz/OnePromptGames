document.addEventListener('DOMContentLoaded', () => {
    loadGames();
    initThreeJS();
});

function loadGames() {
    const grid = document.getElementById('games-grid');
    // (Questa parte resta uguale a prima, gestisce solo le card)
    fetch('games.json')
        .then(response => response.json())
        .then(games => {
            games.forEach(game => {
                const card = document.createElement('article');
                card.className = 'card';
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

function initThreeJS() {
    const container = document.getElementById('canvas-container');

    // 1. SCENA
    const scene = new THREE.Scene();
    // Nebbia nera per dare profondità
    scene.fog = new THREE.FogExp2(0x000000, 0.05);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    // La camera è a distanza 10.
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Ottimizzazione per mobile
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. GEOMETRIA (Sfera perfetta ad alta definizione)
    // SphereGeometry(raggio, segmentiX, segmentiY)
    // Raggio ridotto a 1.3 (molto più piccola). Segmenti 64 (liscia).
    const geometry = new THREE.SphereGeometry(1.3, 64, 64);
    
    // MATERIALE (Petrolio Nero)
    const material = new THREE.MeshStandardMaterial({
        color: 0x000000,     // Nero assoluto
        roughness: 0.15,     // Molto lucido
        metalness: 0.9,      // Molto metallico
        flatShading: false,  // Tassativo: FALSE per non vedere i triangoli
    });

    const blob = new THREE.Mesh(geometry, material);
    scene.add(blob);

    // Copia delle posizioni originali per il calcolo delle onde
    const originalPositions = geometry.attributes.position.array.slice();

    // 3. LUCI NEON (Più vicine perché la sfera è piccola)
    const ambientLight = new THREE.AmbientLight(0x111111); // Luce base minima
    scene.add(ambientLight);

    // Luce Ciano
    const light1 = new THREE.PointLight(0x00f3ff, 2, 20);
    scene.add(light1);

    // Luce Viola
    const light2 = new THREE.PointLight(0xbc13fe, 2, 20);
    scene.add(light2);

    const clock = new THREE.Clock();

    // 4. ANIMAZIONE
    const animate = () => {
        const time = clock.getElapsedTime();
        const positions = geometry.attributes.position;

        // -- DEFORMAZIONE FLUIDA --
        // Iteriamo sui vertici
        for (let i = 0; i < positions.count; i++) {
            const ox = originalPositions[i * 3];
            const oy = originalPositions[i * 3 + 1];
            const oz = originalPositions[i * 3 + 2];

            // Generiamo un'onda più "morbida" e meno frequente
            // Moltiplicatori (0.8, 0.6) più bassi = onde più larghe
            const wave = 
                Math.sin(ox * 0.8 + time * 1.1) + 
                Math.cos(oy * 0.6 + time * 1.3) + 
                Math.sin(oz * 0.8 + time * 0.9);

            // Intensità ridotta (0.08) = il movimento è sottile, non esplosivo
            const displacement = 1 + (wave * 0.08); 

            positions.setXYZ(
                i, 
                ox * displacement, 
                oy * displacement, 
                oz * displacement
            );
        }

        positions.needsUpdate = true;
        // Ricalcolo delle normali fondamentale per i riflessi corretti sulla superficie deformata
        geometry.computeVertexNormals(); 

        // -- MOVIMENTO LUCI --
        // Le luci girano strette attorno alla sfera piccola
        light1.position.x = Math.sin(time * 0.7) * 3.5;
        light1.position.y = Math.cos(time * 0.5) * 3.5;
        light1.position.z = Math.sin(time * 0.3) * 3.5 + 2; // +2 per stare davanti

        light2.position.x = Math.sin(time * 0.8 + 2) * -3.5;
        light2.position.y = Math.cos(time * 0.6 + 2) * -3.5;
        light2.position.z = Math.cos(time * 0.4 + 2) * 3.5 + 2;

        // Rotazione lenta sfera
        blob.rotation.y -= 0.002;

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    };

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
}
