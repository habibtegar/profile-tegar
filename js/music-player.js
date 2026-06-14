/* ============================================================
   FLOATING MUSIC PLAYER
   Habib Tegar Portfolio
   ============================================================ */

(function initMusicPlayer() {

    /* ── PLAYLIST ─────────────────────────────────────────── */
    const playlist = [
        {
            title  : "About You",
            artist : "The 1975",
            src    : "/music/About You.mp3"
        },
        {
            title  : "That Should Be Me",
            artist : "Justin Biber",
            src    : "/music/That Should Be Me.mp3"
        },
        {
            title  : "The One That you Got Away",
            artist : "Katy Perry",
            src    : "/music/The One That Got Away.mp3"
        }
    ];

    /* ── BUILD HTML ───────────────────────────────────────── */
    const playerHTML = `
    <div id="music-player" role="region" aria-label="Music Player">

        <!-- Header bar -->
        <div class="player-header">
            <span class="player-header-dot"></span>
            <i class='bx bxs-music player-header-icon'></i>
            <span class="player-header-label">SONGS &ndash; PLAY</span>
            <i class='bx bx-chevron-left player-header-icon'></i>
            <i class='bx bx-chevron-right player-header-icon'></i>
        </div>

        <!-- Main body -->
        <div class="player-body">
            <!-- Disc -->
            <div class="player-disc">
                <div class="player-disc-ring paused" id="playerDisc"></div>
            </div>

            <!-- Track info -->
            <div class="player-info">
                <div class="player-title" id="playerTitle">Selamat Tinggal</div>
                <div class="player-artist" id="playerArtist">STEVAN</div>
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
            <button class="player-btn player-btn-sm" id="playerPrev" aria-label="Previous" title="Previous">
                <i class='bx bx-skip-previous'></i>
            </button>
            <button class="player-btn" id="playerPlayPause" aria-label="Play / Pause" title="Play / Pause">
                <i class='bx bx-play' id="playIcon"></i>
            </button>
            <button class="player-btn player-btn-sm" id="playerNext" aria-label="Next" title="Next">
                <i class='bx bx-skip-next'></i>
            </button>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', playerHTML);

    /* ── ELEMENTS ─────────────────────────────────────────── */
    const player       = document.getElementById('music-player');
    const disc         = document.getElementById('playerDisc');
    const titleEl      = document.getElementById('playerTitle');
    const artistEl     = document.getElementById('playerArtist');
    const playPauseBtn = document.getElementById('playerPlayPause');
    const playIcon     = document.getElementById('playIcon');
    const prevBtn      = document.getElementById('playerPrev');
    const nextBtn      = document.getElementById('playerNext');
    const progressFill = document.getElementById('playerProgressFill');
    const progressBar  = document.getElementById('playerProgressBar');

    /* ── AUDIO ─────────────────────────────────────────────  */
    let currentIndex = 0;
    let isPlaying    = false;
    const audio      = new Audio();
    audio.volume     = 0.55;
    audio.preload    = 'metadata';

    /* ── LOAD TRACK ───────────────────────────────────────── */
    function loadTrack(index, autoPlay) {
        const track = playlist[index];
        audio.src   = track.src;

        titleEl.textContent  = track.title;
        artistEl.textContent = track.artist;
        titleEl.classList.toggle('marquee', track.title.length > 17);

        progressFill.style.width = '0%';

        if (autoPlay) {
            audio.play().then(setPlaying).catch(console.warn);
        }
    }

    /* ── PLAYING / PAUSED STATES ──────────────────────────── */
    function setPlaying() {
        isPlaying = true;
        player.classList.add('playing');
        disc.classList.replace('paused', 'spinning');
        playIcon.className = 'bx bx-pause';
    }

    function setPaused() {
        isPlaying = false;
        player.classList.remove('playing');
        disc.classList.replace('spinning', 'paused');
        playIcon.className = 'bx bx-play';
    }

    /* ── CONTROLS ─────────────────────────────────────────── */
    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            setPaused();
        } else {
            audio.play().then(setPlaying).catch(console.warn);
        }
    });

    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
        loadTrack(currentIndex, isPlaying);
    });

    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % playlist.length;
        loadTrack(currentIndex, isPlaying);
    });

    /* Auto next when song ends */
    audio.addEventListener('ended', () => {
        currentIndex = (currentIndex + 1) % playlist.length;
        loadTrack(currentIndex, true);
    });

    /* ── PROGRESS ─────────────────────────────────────────── */
    audio.addEventListener('timeupdate', () => {
        if (!audio.duration) return;
        progressFill.style.width = ((audio.currentTime / audio.duration) * 100) + '%';
    });

    progressBar.addEventListener('click', (e) => {
        if (!audio.duration) return;
        const rect = progressBar.getBoundingClientRect();
        audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
    });

    /* ── INIT ─────────────────────────────────────────────── */
    loadTrack(0, false);

})();
