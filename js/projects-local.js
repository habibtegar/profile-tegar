// projectsData is loaded globally from js/projects-data.js

const projectsGrid = document.getElementById('firebase-projects-grid');

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '#';
  const trimmed = url.trim();
  if (/^(https?:\/\/|\/|#)/i.test(trimmed)) {
    return escapeHtml(trimmed);
  }
  return '#';
}

function getTechIcon(name) {
  const lower = name.toLowerCase();
  if (lower.includes('react')) return "<i class='bx bxl-react'></i>";
  if (lower.includes('vite')) return "<i class='bx bxs-zap'></i>";
  if (lower.includes('tailwind')) return "<i class='bx bxl-tailwind-css'></i>";
  if (lower.includes('html')) return "<i class='bx bxl-html5'></i>";
  if (lower.includes('css')) return "<i class='bx bxl-css3'></i>";
  if (lower.includes('javascript') || lower === 'js') return "<i class='bx bxl-javascript'></i>";
  if (lower.includes('api') || lower.includes('tmdb') || lower.includes('rest')) return "<i class='bx bx-transfer-alt'></i>";
  if (lower.includes('php')) return "<i class='bx bxl-php'></i>";
  if (lower.includes('mysql') || lower.includes('database')) return "<i class='bx bx-data'></i>";
  if (lower.includes('bootstrap')) return "<i class='bx bxl-bootstrap'></i>";
  return "<i class='bx bx-code-alt'></i>";
}

function renderProjects(projects) {
  if (!projectsGrid) return;

  if (!projects || projects.length === 0) {
    projectsGrid.innerHTML = `
      <div style="text-align: center; grid-column: 1 / -1; padding: 3rem; color: var(--text-muted);">
        <p>No projects available yet.</p>
      </div>
    `;
    return;
  }

  projectsGrid.innerHTML = '';

  // Infinite Loop Architecture:
  // Render 3 sets of cards: Set 0 (clones before), Set 1 (main visible set), Set 2 (clones after)
  // This enables seamless infinite sliding in both directions without ever hitting a limit
  const setsCount = 3;
  let globalIdx = 0;

  for (let s = 0; s < setsCount; s++) {
    const isClone = (s !== 1);
    projects.forEach((project, originalIdx) => {
      const delay = (originalIdx % 3) * 100;
      const imageUrl = project.imageUrl || 'img/placeholder.png';
      const addressUrl = project.addressUrl || (project.title.toLowerCase().replace(/\s+/g, '') + '.app');

      // Escape dynamic properties to prevent DOM XSS
      const safeTitle = escapeHtml(project.title);
      const safeDesc = escapeHtml(project.desc);
      const safeCategory = escapeHtml(project.category || 'WEB APP');
      const safeDemoLink = sanitizeUrl(project.demoLink);
      const safeGithubLink = sanitizeUrl(project.githubLink);

      // Tech stack chips
      const techChipsHtml = (project.techStack || [])
        .map(tech => `
          <span class="tech-chip">
            ${getTechIcon(tech)}
            <span>${escapeHtml(tech)}</span>
          </span>
        `).join('');

      // Action buttons with rel="noopener noreferrer"
      let actionButtonsHtml = '';
      if (project.demoLink) {
        actionButtonsHtml += `
          <a href="${safeDemoLink}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-project-live">
            <i class='bx bx-link-external'></i>
            <span>Live Preview</span>
          </a>
        `;
      }
      if (project.githubLink) {
        actionButtonsHtml += `
          <a href="${safeGithubLink}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-project-code">
            <i class='bx bxl-github'></i>
            <span>Source Code</span>
          </a>
        `;
      }

      const webpUrl = imageUrl.replace(/\.(png|jpe?g)$/i, '.webp');
      const cardHtml = `
        <div class="project-card" data-card-index="${globalIdx}" data-project-index="${originalIdx}" data-clone="${isClone}" data-aos="fade-up" data-aos-delay="${delay}">
          <!-- Browser Frame Mockup -->
          <div class="project-browser-frame">
            <div class="browser-header-bar">
              <div class="browser-dots">
                <span class="browser-dot dot-red"></span>
                <span class="browser-dot dot-yellow"></span>
                <span class="browser-dot dot-green"></span>
              </div>
              <span class="browser-address-bar">${addressUrl}</span>
            </div>
            <div class="project-image-wrap">
              <picture>
                <source srcset="${webpUrl}" type="image/webp" />
                <img src="${imageUrl}" alt="${project.title} - ${project.desc.slice(0, 75)} web application preview" loading="lazy" decoding="async" width="600" height="380" onerror="this.src='img/placeholder.png'" />
              </picture>
            </div>
          </div>
          <div class="project-content">
            <div class="project-header-meta">
              <span class="project-category-badge">${safeCategory}</span>
            </div>
            <h3 class="project-title">${safeTitle}</h3>
            <p class="project-desc">${safeDesc}</p>
            <div class="project-tech-stack">
              ${techChipsHtml}
            </div>
            <div class="project-actions">
              ${actionButtonsHtml}
            </div>
          </div>
        </div>
      `;

      projectsGrid.insertAdjacentHTML('beforeend', cardHtml);
      globalIdx++;
    });
  }

  // Initialize horizontal slider controls & interactions
  initProjectsSlider(projects);
}

function initProjectsSlider(projectsList) {
  const viewport = document.getElementById('projectsSliderViewport');
  const track = document.getElementById('firebase-projects-grid');
  const prevBtn = document.getElementById('projectsSliderPrev');
  const nextBtn = document.getElementById('projectsSliderNext');
  const dotsContainer = document.getElementById('projectsSliderDots');

  if (!viewport || !track) return;

  const N = (projectsList && projectsList.length) ? projectsList.length : 4;
  let currentIndex = N; // Starts on the first card of Set 1 (Main Set)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Accurately compute card width to ensure exactly 3 cards on desktop, 2 on tablet, 1 on mobile
  function updateSliderDimensions() {
    if (!viewport) return;
    const vw = viewport.clientWidth;
    if (vw <= 0) return;

    let cardsPerView = 3;
    let gap = 24; // 1.5rem = 24px
    if (window.innerWidth <= 640) {
      cardsPerView = 1;
      gap = 0;
    } else if (window.innerWidth <= 1024) {
      cardsPerView = 2;
      gap = 24;
    }

    const cardWidth = Math.floor((vw - (cardsPerView - 1) * gap) / cardsPerView);
    viewport.style.setProperty('--card-w', cardWidth + 'px');
  }

  updateSliderDimensions();

  function getStep() {
    const card = track.querySelector('.project-card');
    if (!card) return 0;
    const gap = window.innerWidth <= 640 ? 0 : 24;
    return card.offsetWidth + gap;
  }

  function setPosition(index, smooth = false) {
    const step = getStep();
    if (!step) return;

    if (!smooth || prefersReducedMotion) {
      viewport.style.scrollSnapType = 'none';
      viewport.scrollTo({ left: index * step, behavior: 'instant' });
      void viewport.offsetWidth;
      viewport.style.scrollSnapType = '';
    } else {
      viewport.scrollTo({ left: index * step, behavior: 'smooth' });
    }
  }

  // Initial positioning to Main Set (index N)
  setPosition(currentIndex, false);

  // Normalize position silently when passing beyond middle set
  function normalizePosition() {
    const step = getStep();
    if (!step) return;

    if (currentIndex >= 2 * N) {
      currentIndex -= N;
      setPosition(currentIndex, false);
    } else if (currentIndex < N) {
      currentIndex += N;
      setPosition(currentIndex, false);
    }
    updateDots();
  }

  // Next / Prev actions (Infinite loop, unlimited)
  function goNext() {
    const step = getStep();
    if (!step) return;

    if (currentIndex >= 2 * N) {
      currentIndex -= N;
      setPosition(currentIndex, false);
    }
    currentIndex++;
    setPosition(currentIndex, true);
    updateDots();
  }

  function goPrev() {
    const step = getStep();
    if (!step) return;

    if (currentIndex <= 0) {
      currentIndex += N;
      setPosition(currentIndex, false);
    }
    currentIndex--;
    setPosition(currentIndex, true);
    updateDots();
  }

  // Prev / Next button navigation — ALWAYS ENABLED for infinite looping
  if (prevBtn) {
    prevBtn.disabled = false;
    prevBtn.onclick = (e) => {
      e.preventDefault();
      goPrev();
    };
  }

  if (nextBtn) {
    nextBtn.disabled = false;
    nextBtn.onclick = (e) => {
      e.preventDefault();
      goNext();
    };
  }

  // Generate pagination dots (one for each unique project)
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < N; i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab');
      const titleText = (projectsList && projectsList[i]?.title) || ('Project ' + (i + 1));
      dot.setAttribute('aria-label', `Slide ${i + 1} - ${titleText}`);
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');

      dot.addEventListener('click', (e) => {
        e.preventDefault();
        const currentMod = ((currentIndex % N) + N) % N;
        const diff = i - currentMod;
        currentIndex += diff;
        setPosition(currentIndex, true);
        updateDots();
      });

      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    if (!dotsContainer) return;
    const activeIdx = ((currentIndex % N) + N) % N;
    const dots = dotsContainer.querySelectorAll('.slider-dot');
    dots.forEach((dot, idx) => {
      const isActive = (idx === activeIdx);
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  updateDots();

  // Handle scroll settling (scrollend + debounce)
  let scrollTimer = null;
  function handleScrollEnd() {
    const step = getStep();
    if (!step) return;

    const computedIdx = Math.round(viewport.scrollLeft / step);
    currentIndex = computedIdx;
    normalizePosition();
  }

  viewport.addEventListener('scrollend', handleScrollEnd);

  viewport.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(handleScrollEnd, 120);

    // Update active dot in realtime during scroll
    const step = getStep();
    if (step > 0 && dotsContainer) {
      const liveIdx = Math.round(viewport.scrollLeft / step);
      const activeIdx = ((liveIdx % N) + N) % N;
      const dots = dotsContainer.querySelectorAll('.slider-dot');
      dots.forEach((dot, idx) => {
        const isActive = (idx === activeIdx);
        dot.classList.toggle('active', isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    }
  }, { passive: true });

  // Mouse Drag to Scroll (Desktop natural drag feel)
  let isDown = false;
  let startX = 0;
  let scrollLeftStart = 0;
  let hasMoved = false;

  viewport.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return; // Only primary button
    isDown = true;
    hasMoved = false;
    viewport.classList.add('is-dragging');
    startX = e.pageX - viewport.offsetLeft;
    scrollLeftStart = viewport.scrollLeft;
  });

  window.addEventListener('mouseup', () => {
    if (!isDown) return;
    isDown = false;
    viewport.classList.remove('is-dragging');
    handleScrollEnd();
  });

  viewport.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - viewport.offsetLeft;
    const walk = (x - startX);
    if (Math.abs(walk) > 5) {
      hasMoved = true;
    }
    viewport.scrollLeft = scrollLeftStart - walk;
  });

  // Prevent link click when dragging
  viewport.addEventListener('click', (e) => {
    if (hasMoved) {
      e.preventDefault();
      e.stopPropagation();
      hasMoved = false;
    }
  }, true);

  // Keyboard navigation
  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goPrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goNext();
    }
  });

  // Re-check on window resize
  window.addEventListener('resize', () => {
    updateSliderDimensions();
    const step = getStep();
    if (step) {
      setPosition(currentIndex, false);
    }
  }, { passive: true });
}

// Only render if grid is present and empty (or initial page load)
if (projectsGrid) {
  const sorted = [...(typeof projectsData !== 'undefined' ? projectsData : [])].sort((a, b) => {
    return (a.order || 99) - (b.order || 99);
  });
  renderProjects(sorted);
}
