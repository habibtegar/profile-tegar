(function initMusicPlayer() {

    const playlist = [
        {
            title: "About You",
            artist: "The 1975",
            src: "music/About You.mp3"
        },
        {
            title: "Berdansalah, karir ini tak ada artinya",
            artist: "Hindia",
            src: "music/Berdansalah.mp3"
        },
        {
            title: "That Should Be Me",
            artist: "Justin Bieber",
            src: "music/That Should Be Me.mp3"
        },
        {
            title: "Everything You Are",
            artist: "Hindia",
            src: "music/everything u are.mp3"
        },
        {
            title: "Teh Hijau",
            artist: "Tulus",
            src: "music/Teh Hijau.mp3"
        },
        {
            title: "Celengan Rindu",
            artist: "Fiersa Besari",
            src: "music/Celengan Rindu.mp3"
        }
    ];

    /* ── BUILD HTML WITH EXPANDED & MINIMIZED WIDGET ─────── */
    const playerHTML = `
    <div id="music-player" role="region" aria-label="Music Player">

        <!-- 1. Minimized Floating Widget -->
        <div class="player-mini-widget" id="playerMiniWidget" title="Buka Music Player" aria-label="Expand Music Player">
            <div class="mini-disc-ring paused" id="miniDisc">
                <i class='bx bxs-music mini-music-icon'></i>   
            </div>
        </div>

        <!-- 2. Expanded Card Body -->
        <div class="player-expanded-box" id="playerExpandedBox">
            <!-- Header bar -->
            <div class="player-header">
                <span class="player-header-dot"></span>
                <i class='bx bxs-music player-header-icon'></i>
                <span class="player-header-label">MUSIC PLAYER</span>
                <button class="player-minimize-btn" id="playerMinimizeBtn" aria-label="Minimize player" title="Minimize">
                    <i class='bx bx-minus'></i>
                </button>
            </div>

            <!-- Main body -->
            <div class="player-body">
                <!-- Disc -->
                <div class="player-disc">
                    <div class="player-disc-ring paused" id="playerDisc"></div>
                </div>

                <!-- Track info -->
                <div class="player-info">
                    <div class="player-title" id="playerTitle">About You</div>
                    <div class="player-artist" id="playerArtist">The 1975</div>
                    <div class="player-waves" aria-hidden="true">
                        <span class="player-wave-bar"></span>
                        <span class="player-wave-bar"></span>
                        <span class="player-wave-bar"></span>
                        <span class="player-wave-bar"></span>
                        <span class="player-wave-bar"></span>
                    </div>
                    <div class="player-progress" id="playerProgressBar" title="Seek">
                        <div class="player-progress-fill" id="playerProgressFill"></div>
                    </div>
                </div>
            </div>

            <!-- Controls -->
            <div class="player-controls">
                <button class="player-btn player-btn-sm" id="playerPrev" aria-label="Previous track" title="Previous">
                    <i class='bx bx-skip-previous'></i>
                </button>
                <button class="player-btn" id="playerPlayPause" aria-label="Play / Pause" title="Play / Pause">
                    <i class='bx bx-play' id="playIcon"></i>
                </button>
                <button class="player-btn player-btn-sm" id="playerNext" aria-label="Next track" title="Next">
                    <i class='bx bx-skip-next'></i>
                </button>
            </div>
        </div>
    </div>`;

    function setupPlayer() {
        if (document.getElementById('music-player')) return;

        document.body.insertAdjacentHTML('beforeend', playerHTML);

        /* ── ELEMENTS ─────────────────────────────────────────── */
        const player       = document.getElementById('music-player');
        const miniWidget   = document.getElementById('playerMiniWidget');
        const minimizeBtn  = document.getElementById('playerMinimizeBtn');
        const disc         = document.getElementById('playerDisc');
        const miniDisc     = document.getElementById('miniDisc');
        const titleEl      = document.getElementById('playerTitle');
        const artistEl     = document.getElementById('playerArtist');
        const playPauseBtn = document.getElementById('playerPlayPause');
        const playIcon     = document.getElementById('playIcon');
        const prevBtn      = document.getElementById('playerPrev');
        const nextBtn      = document.getElementById('playerNext');
        const progressFill = document.getElementById('playerProgressFill');
        const progressBar  = document.getElementById('playerProgressBar');

        /* ── MINIMIZE / EXPAND TOGGLE ─────────────────────────── */
        minimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            player.classList.add('minimized');
        });

        miniWidget.addEventListener('click', () => {
            player.classList.remove('minimized');
        });

        /* ── AUDIO STATE ──────────────────────────────────────── */
        let currentIndex = 0;
        let isPlaying    = false;
        const audio      = new Audio();
        audio.volume     = 0.55;
        audio.preload    = 'metadata';

        /* ── PLAYING / PAUSED STATES ──────────────────────────── */
        function setPlaying() {
            isPlaying = true;
            player.classList.add('playing');
            if (disc) {
                disc.classList.remove('paused');
                disc.classList.add('spinning');
            }
            if (miniDisc) {
                miniDisc.classList.remove('paused');
                miniDisc.classList.add('spinning');
            }
            if (playIcon) playIcon.className = 'bx bx-pause';
        }

        function setPaused() {
            isPlaying = false;
            player.classList.remove('playing');
            if (disc) {
                disc.classList.remove('spinning');
                disc.classList.add('paused');
            }
            if (miniDisc) {
                miniDisc.classList.remove('spinning');
                miniDisc.classList.add('paused');
            }
            if (playIcon) playIcon.className = 'bx bx-play';
        }

        /* ── LOAD TRACK ───────────────────────────────────────── */
        function loadTrack(index, autoPlay) {
            currentIndex = (index + playlist.length) % playlist.length;
            const track  = playlist[currentIndex];
            audio.src    = track.src;
            audio.load();

            if (titleEl)  titleEl.textContent  = track.title;
            if (artistEl) artistEl.textContent = track.artist;
            if (progressFill) progressFill.style.width = '0%';

            if (autoPlay) {
                audio.play().then(setPlaying).catch((err) => {
                    console.warn("Audio playback prevented:", err);
                    setPaused();
                });
            } else {
                setPaused();
            }
        }

        /* ── AUDIO EVENT LISTENERS ────────────────────────────── */
        audio.addEventListener('play', setPlaying);
        audio.addEventListener('pause', setPaused);

        /* Auto next when song ends */
        audio.addEventListener('ended', () => {
            loadTrack(currentIndex + 1, true);
        });

        /* Progress update */
        audio.addEventListener('timeupdate', () => {
            if (!audio.duration || isNaN(audio.duration) || !progressFill) return;
            progressFill.style.width = ((audio.currentTime / audio.duration) * 100) + '%';
        });

        /* ── CONTROLS ─────────────────────────────────────────── */
        playPauseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isPlaying) {
                audio.pause();
            } else {
                audio.play().then(setPlaying).catch((err) => {
                    console.warn("Playback failed:", err);
                    setPaused();
                });
            }
        });

        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            loadTrack(currentIndex - 1, isPlaying);
        });

        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            loadTrack(currentIndex + 1, isPlaying);
        });

        /* Seek on progress bar click */
        progressBar.addEventListener('click', (e) => {
            if (!audio.duration || isNaN(audio.duration)) return;
            const rect = progressBar.getBoundingClientRect();
            const clickPosition = (e.clientX - rect.left) / rect.width;
            audio.currentTime = Math.max(0, Math.min(1, clickPosition)) * audio.duration;
        });

        /* ── INIT (Load first track without autoplay) ─────────── */
        loadTrack(0, false);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupPlayer);
    } else {
        setupPlayer();
    }

})();
