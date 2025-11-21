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
                card.innerHTML = `
                    <div class="card-img-container">
                         <img src="img/${game.id}.jpg" alt="${game.title}" class="card-img" onerror="this.src='https://via.placeholder.com/400x250/000/00f3ff?text=GAME+PREVIEW'">
                    </div>
                    <div class="card-content">
                        <h2 class="card-title">${game.title}</h2>
                        <p class="card-desc">${game.description}</p>
                        <a href="games/${game.id}.html" class="card-btn">Initialize &rarr;</a>
                    </div>
                `;
                grid.appendChild(card);
            });
        })
        .catch(err => console.error("Errore JSON:", err));
}

function initThreeJS() {
    const container = document.getElementById('canvas-container');
    
    // 1. Setup Base
    const scene = new THREE.Scene();
    // Aggiungiamo una nebbia nera per far sparire la griglia in lontananza (effetto infinito)
    scene.fog = new THREE.FogExp2(0x000000, 0.04); 

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // Posizioniamo la camera in basso e un po' indietro
    camera.position.z = 5; 
    camera.position.y = 1; 
    // La camera guarda verso l'orizzonte
    camera.rotation.x = -0.2; 

    const renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Creazione del Terreno (Grid)
    // PlaneGeometry(Larghezza, Altezza, SegmentiW, SegmentiH)
    // Molti segmenti per creare le "montagne"
    const planeGeometry = new THREE.PlaneGeometry(60, 60, 50, 50);

    // Materiale Wireframe Ciano
    const planeMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00f3ff, 
        wireframe: true,
        transparent: true,
        opacity: 0.3 // Tenue, non deve accecare
    });

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    
    // Ruotiamo il piano per farlo diventare un pavimento
    plane.rotation.x = -Math.PI / 2; 
    scene.add(plane);

    // 3. Generazione Montagne (Rumore)
    // Modifichiamo l'altezza dei vertici una volta sola all'inizio
    const count = planeGeometry.attributes.position.count;
    const positions = planeGeometry.attributes.position;
    
    // Salviamo valori random per l'animazione
    const randoms = new Float32Array(count);
    for(let i = 0; i < count; i++){
        randoms[i] = Math.random();
    }

    // 4. Loop Animazione
    const clock = new THREE.Clock();

    const animate = () => {
        const time = clock.getElapsedTime();

        // Movimento "volo in avanti"
        // Invece di muovere la camera all'infinito, muoviamo la texture/grid
        // Ma per semplicità qui, animiamo le onde dei vertici per sembrare acqua/terreno digitale
        
        for (let i = 0; i < count; i++) {
            // Animiamo la coordinata Z (che ora punta in alto perché abbiamo ruotato il piano)
            // Usiamo una combinazione di seni per creare "colline" che scorrono
            const x = positions.getX(i);
            const y = positions.getY(i); // Nota: questo è Y nella geometria piana originale
            
            // Effetto onda che scorre verso la camera
            const wave = Math.sin(x * 0.5 + time * 0.5) * Math.cos(y * 0.3 + time * 0.5) * 1.5;
            
            // Applichiamo l'altezza (Z axis locale del piano)
            positions.setZ(i, wave);
        }
        
        positions.needsUpdate = true;

        // Rotazione lenta per dinamicità
        plane.rotation.z += 0.001;

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    };

    // Gestione Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
}    const scene = new THREE.Scene();
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
    const geometry = new THREE.SphereGeometry(1, 128, 128);
    
    // MATERIALE (Petrolio Nero)
    const material = new THREE.MeshStandardMaterial({
        color: 0x000010,     // Nero assoluto
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
