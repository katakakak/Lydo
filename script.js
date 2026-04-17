let db;
let allTracks = [];
let currentQueue = [];
let selectedIds = new Set();
let currentIndex = -1;
const audio = document.getElementById('audio-player');
const playIcon = document.getElementById('play-icon');

// 1. Initialisation DB
const request = indexedDB.open("LydoSystem", 8);

request.onupgradeneeded = (e) => {
    let d = e.target.result;
    if (!d.objectStoreNames.contains("songs")) d.createObjectStore("songs", { keyPath: "id", autoIncrement: true });
    if (!d.objectStoreNames.contains("playlists")) d.createObjectStore("playlists", { keyPath: "name" });
};

request.onsuccess = (e) => {
    db = e.target.result;
    const tx = db.transaction("playlists", "readwrite");
    tx.objectStore("playlists").get("Importer").onsuccess = (ev) => {
        if (!ev.target.result) tx.objectStore("playlists").add({ name: "Importer", songs: [] });
    };
    loadAllSongs();
    updatePlaylistsMenu();
};

// 2. Importation
document.getElementById('folder-input').onchange = (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('audio/'));
    const tx = db.transaction(["songs", "playlists"], "readwrite");
    const songStore = tx.objectStore("songs");
    const plStore = tx.objectStore("playlists");

    plStore.get("Importer").onsuccess = (ev) => {
        let pl = ev.target.result;
        files.forEach(file => {
            const req = songStore.add({ name: file.name.replace('.mp3',''), data: file });
            req.onsuccess = (res) => {
                pl.songs.push(res.target.result);
                plStore.put(pl);
            };
        });
    };
    tx.oncomplete = () => { loadAllSongs(); updatePlaylistsMenu(); };
};

// 3. Affichage et Rendu
function loadAllSongs() {
    if (!db) return;
    db.transaction("songs", "readonly").objectStore("songs").getAll().onsuccess = (e) => {
        allTracks = e.target.result;
        currentQueue = [...allTracks];
        document.getElementById('view-title').innerText = "Tous les titres";
        selectedIds.clear();
        updateSelectionUI();
        renderList();
    };
}

function renderList() {
    const list = document.getElementById('music-list');
    list.innerHTML = '';
    
    currentQueue.forEach((track, index) => {
        const row = document.createElement('div');
        row.className = `track-row ${selectedIds.has(track.id) ? 'selected' : ''} ${currentIndex === index ? 'active' : ''}`;
        row.innerHTML = `
            <i class="fa-solid ${currentIndex === index ? 'fa-volume-high' : 'fa-play'}"></i>
            <span>${track.name}</span>
            <div class="row-actions">
                <i class="fa-solid fa-trash" onclick="deleteSingle(${track.id}, event)"></i>
            </div>
        `;
        
        row.onclick = (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (selectedIds.has(track.id)) selectedIds.delete(track.id);
                else selectedIds.add(track.id);
                updateSelectionUI();
                renderList();
            } else {
                playTrack(index);
            }
        };
        list.appendChild(row);
    });
}

// 4. SUPPRESSION
function deleteSingle(id, event) {
    event.stopPropagation();
    if (!confirm("Supprimer cette musique de la bibliothèque ?")) return;
    performDelete([id]);
}

function deleteSelected() {
    if (!confirm(`Supprimer les ${selectedIds.size} titres sélectionnés ?`)) return;
    performDelete(Array.from(selectedIds));
}

function performDelete(idsToDelete) {
    const tx = db.transaction(["songs", "playlists"], "readwrite");
    const songStore = tx.objectStore("songs");
    const plStore = tx.objectStore("playlists");

    // 1. Supprimer de l'entrepôt principal
    idsToDelete.forEach(id => songStore.delete(id));

    // 2. Nettoyer les playlists
    plStore.getAll().onsuccess = (e) => {
        e.target.result.forEach(pl => {
            const originalLength = pl.songs.length;
            pl.songs = pl.songs.filter(songId => !idsToDelete.includes(songId));
            if (pl.songs.length !== originalLength) plStore.put(pl);
        });
    };

    tx.oncomplete = () => {
        selectedIds.clear();
        loadAllSongs();
        updatePlaylistsMenu();
    };
}

// 5. Playlists et Modal
function updateSelectionUI() {
    const bar = document.getElementById('selection-bar');
    bar.style.display = selectedIds.size > 0 ? 'flex' : 'none';
    document.getElementById('select-count').innerText = `${selectedIds.size} sélectionné(s)`;
}

function updatePlaylistsMenu() {
    db.transaction("playlists", "readonly").objectStore("playlists").getAll().onsuccess = (e) => {
        const container = document.getElementById('playlist-container');
        container.innerHTML = '';
        e.target.result.forEach(pl => {
            const div = document.createElement('div');
            div.className = 'nav-item';
            div.innerHTML = `<i class="fa-solid fa-music"></i> ${pl.name}`;
            div.onclick = () => {
                document.getElementById('view-title').innerText = pl.name;
                currentQueue = allTracks.filter(t => pl.songs.includes(t.id));
                renderList();
            };
            container.appendChild(div);
        });
    };
}

function openModal() {
    document.getElementById('playlist-modal').style.display = 'flex';
    db.transaction("playlists", "readonly").objectStore("playlists").getAll().onsuccess = (e) => {
        const list = document.getElementById('modal-list');
        list.innerHTML = '';
        e.target.result.forEach(pl => {
            const d = document.createElement('div');
            d.className = 'pl-opt';
            d.innerText = pl.name;
            d.onclick = () => {
                const tx = db.transaction("playlists", "readwrite");
                const store = tx.objectStore("playlists");
                store.get(pl.name).onsuccess = (res) => {
                    const data = res.target.result;
                    selectedIds.forEach(id => { if(!data.songs.includes(id)) data.songs.push(id); });
                    store.put(data);
                    selectedIds.clear();
                    closeModal();
                    updateSelectionUI();
                    renderList();
                };
            };
            list.appendChild(d);
        });
    };
}

function createNewPlaylist() {
    const name = prompt("Nom de la playlist :");
    if (name) {
        const tx = db.transaction("playlists", "readwrite");
        tx.objectStore("playlists").add({ name, songs: [] });
        tx.oncomplete = updatePlaylistsMenu;
    }
}

function closeModal() { document.getElementById('playlist-modal').style.display = 'none'; }

// 6. Lecteur Audio
function playTrack(index) {
    currentIndex = index;
    const track = currentQueue[index];
    if (audio.src) URL.revokeObjectURL(audio.src);
    audio.src = URL.createObjectURL(track.data);
    audio.play();
    document.getElementById('track-title').innerText = track.name;
    playIcon.className = "fa-solid fa-circle-pause";
    renderList();

    window.jsmediatags.read(track.data, {
        onSuccess: (tag) => {
            const pic = tag.tags.picture;
            if (pic) {
                let base = "";
                for (let i = 0; i < pic.data.length; i++) base += String.fromCharCode(pic.data[i]);
                document.getElementById('main-cover').src = `data:${pic.format};base64,${window.btoa(base)}`;
            } else {
                document.getElementById('main-cover').src = "https://picsum.photos/400/400?grayscale";
            }
            document.getElementById('track-artist').innerText = tag.tags.artist || "Artiste inconnu";
        }
    });
}

audio.ontimeupdate = () => { if(audio.duration) document.getElementById('progress-bar').value = (audio.currentTime / audio.duration) * 100; };
document.getElementById('progress-bar').oninput = (e) => { if(audio.duration) audio.currentTime = (e.target.value / 100) * audio.duration; };
document.getElementById('btn-play-pause').onclick = () => {
    if (audio.paused) { audio.play(); playIcon.className="fa-solid fa-circle-pause"; }
    else { audio.pause(); playIcon.className="fa-solid fa-circle-play"; }
};
document.getElementById('btn-next').onclick = () => playTrack((currentIndex + 1) % currentQueue.length);
document.getElementById('btn-prev').onclick = () => playTrack((currentIndex - 1 + currentQueue.length) % currentQueue.length);
document.getElementById('volume-slider').oninput = (e) => audio.volume = e.target.value;

document.getElementById('search-input').oninput = (e) => {
    const val = e.target.value.toLowerCase();
    currentQueue = allTracks.filter(t => t.name.toLowerCase().includes(val));
    renderList();
};
