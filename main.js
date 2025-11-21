document.addEventListener('DOMContentLoaded', () => {
    loadGames();
    initThreeJS();
});

/* --- 1. CARICAMENTO GIOCHI DA JSON --- */
/* --- 1. CARICAMENTO GIOCHI DA JSON --- */
function loadGames() {
    const grid = document.getElementById('games-grid');
    const noCacheUrl = 'games.json?t=' + new Date().getTime();

    fetch(noCacheUrl)
        .then(response => {
            if (!response.ok) throw new Error("Errore lettura games.json");
            return response.json();
        })
        .then(games => {
            grid.innerHTML = ''; 
            
            games.forEach(game => {
                const card = document.createElement('article');
                card.className = 'card';
                
                // Gestione estensione jpg/png
                const ext = game.format || 'jpg';
                const imgPath = `img/${game.id}.${ext}`;

                // Abbiamo aggiunto target="_blank" nel link qui sotto
                card.innerHTML = `
                    <div class="card-img-container">
                         <img src="${imgPath}" 
                              alt="${game.title}" 
                              class="card-img" 
                              onerror="this.onerror=null; this.src='https://placehold.co/600x400/050505/00f3ff?text=NO+IMG'"> 
                    </div>
                    <div class="card-content">
                        <h2 class="card-title">${game.title}</h2>
                        <p class="card-desc">${game.description}</p>
                        <a href="games/${game.id}.html" class="card-btn" target="_blank" rel="noopener noreferrer">INITIALIZE &rarr;</a>
                    </div>
                `;
                grid.appendChild(card);
            });
        })
        .catch(err => {
            console.error(err);
            grid.innerHTML = `<p style="color:red; text-align:center;">Errore caricamento database giochi.</p>`;
        });
}

/* --- 2. SFONDO 3D (THREE.JS) - FLUSSO INFINITO --- */
function initThreeJS() {
    const container = document.getElementById('canvas-container');
    if (!container) return; // Sicurezza
    
    container.innerHTML = ''; // Reset

    // A. SCENA
    const scene = new THREE.Scene();
    // Nebbia nera che sfuma l'orizzonte (colore hex #020202 come il CSS)
    scene.fog = new THREE.FogExp2(0x020202, 0.04); 

    // B. CAMERA
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Posizionamento Camera
    const isMobile = window.innerWidth < 768;
    camera.position.z = isMobile ? 5 : 4; // Un po' più indietro su mobile
    camera.position.y = 1.2; // Altezza occhi
    camera.rotation.x = -0.2; // Guarda leggermente in basso verso l'orizzonte

    // C. RENDERER
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // D. GRIGLIA (GEOMETRIA)
    // PlaneGeometry(Larghezza, Altezza, SegmentiW, SegmentiH)
    // 60 segmenti bastano per avere onde fluide senza fondere il telefono
    const geometry = new THREE.PlaneGeometry(80, 80, 60, 60);
    
    const material = new THREE.MeshBasicMaterial({ 
        color: 0x00f3ff, // Ciano Neon
        wireframe: true,
        transparent: true,
        opacity: 0.2 // Molto tenue per non disturbare la lettura
    });

    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2; // Stendiamo il piano orizzontale
    scene.add(terrain);

    // E. PREPARAZIONE ANIMAZIONE
    const count = geometry.attributes.position.count;
    const positionAttribute = geometry.attributes.position;
    const clock = new THREE.Clock();

    // F. LOOP DI ANIMAZIONE (Senza scatti)
    const animate = () => {
        const time = clock.getElapsedTime();

        // Invece di muovere l'intero oggetto (che causa il reset scattoso),
        // calcoliamo l'onda matematicamente per ogni punto.
        for (let i = 0; i < count; i++) {
            // Prendiamo le coordinate originali X e Y del piano
            const x = positionAttribute.getX(i);
            const y = positionAttribute.getY(i); 
            
            // Calcoliamo l'altezza (Z) basata sul tempo.
            // (y * 0.3 + time) crea l'effetto scorrimento verso la camera.
            // Essendo una funzione seno/coseno, è infinita e fluida.
            
            const waveX = Math.sin(x * 0.2 + time * 0.5);
            const waveY = Math.cos(y * 0.3 + time * 1.0); 
            
            // Altezza finale
            const height = (waveX + waveY) * 1.2;
            
            // Applichiamo l'altezza al vertice
            positionAttribute.setZ(i, height);
        }

        positionAttribute.needsUpdate = true; // Diciamo a Three.js di ridisegnare la forma

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    };

    // G. GESTIONE RESIZE
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Avvia
    animate();
}
