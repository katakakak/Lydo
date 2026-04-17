# 🎵 Lydo Pro - The Anti-Streaming Jukebox

**Lydo Pro** is a high-performance music management system designed to liberate listeners from the oppression of corporate platforms like Spotify and Deezer. The goal is simple: reclaim total control of your library with zero subscriptions and absolute privacy.

> **Final Ambition:** To evolve into an ethical streaming platform where subscription fees serve exclusively to cover actual server costs, rather than enriching shareholders.

---

## 🚀 Key Features

### 📂 "Zero-Cloud" Library Management
* **Smart Import:** Scan local folders instantly.
* **"Importer" Playlist:** Every new track added is automatically cataloged into a default playlist so nothing gets lost.
* **Persistent Storage:** Powered by **IndexedDB**. Your music stays in your browser even after you close the tab.

### 🛠 Advanced Control Tools
* **Bulk Selection:** Hold `Ctrl` (or `Cmd`) and click to select multiple tracks at once.
* **Playlist Management:** Create, organize, and fill playlists in batches via the contextual action menu.
* **Smart Deletion:** Remove tracks individually or in bulk. The system automatically cleans up associated playlists.

### 🎧 Premium Audio Experience
* **Interactive Progress Bar:** Precise navigation through tracks with a reactive "Neon Cyan" seeker.
* **Metadata & Art:** Automatic ID3 tag parsing (Artist, Title) and album cover display using `jsmediatags`.
* **Instant Search:** Filter through thousands of tracks in milliseconds.

---

## 🛠 Installation & Usage

1.  **Setup:** No complex installation required. Download the `index.html`, `lydoUI.css`, and `script.js` files.
2.  **Launch:** Open `index.html` in any modern web browser.
3.  **Import:** Click the **"Importer"** button at the top left and select your music folder.
4.  **Organize:** * Select tracks using `Ctrl + Click`.
    * Click **"Add to Playlists"** in the left panel.
    * Create a new playlist if needed.

---

## 🏗 Technical Stack

* **Frontend:** HTML5, CSS3 (Stable Flexbox/Grid architecture).
* **Database:** IndexedDB (High-capacity local storage).
* **Libraries:** * [Font Awesome 6](https://fontawesome.com/) (Professional Icons).
    * [jsmediatags](https://github.com/aadsm/jsmediatags) (Audio metadata parsing).

---

## 🎯 Future Vision

Lydo Pro isn't just a player; it's the start of a revolution. 
- [ ] Transition to Client/Server architecture (Node.js).
- [ ] Secure User Account system.
- [ ] "At-Cost" economic model (Infrastructure fees only).

---
*Lydo Pro - Own your music. Break the system.*
