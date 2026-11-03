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

  projects.forEach((project, index) => {
    const delay = (index % 3) * 100;
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
      <div class="project-card" data-aos="fade-up" data-aos-delay="${delay}">
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
  });

  // Initialize horizontal slider controls & interactions
  initProjectsSlider();
}

function initProjectsSlider() {
  const viewport = document.getElementById('projectsSliderViewport');
  const track = document.getElementById('firebase-projects-grid');
  const prevBtn = document.getElementById('projectsSliderPrev');
  const nextBtn = document.getElementById('projectsSliderNext');
  const dotsContainer = document.getElementById('projectsSliderDots');

  if (!viewport || !track) return;

  const cards = Array.from(track.querySelectorAll('.project-card'));
  if (cards.length === 0) return;

  // Helper to compute card position relative to viewport left edge
  function getCardRelativeLeft(card) {
    const cardRect = card.getBoundingClientRect();
    const viewportRect = viewport.getBoundingClientRect();
    return cardRect.left - viewportRect.left;
  }

  function scrollToCard(card) {
    const relLeft = getCardRelativeLeft(card);
    viewport.scrollBy({ left: relLeft, behavior: 'smooth' });
  }

  // Generate pagination dots
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    cards.forEach((card, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab');
      const titleText = card.querySelector('.project-title')?.textContent?.trim() || ('Project ' + (i + 1));
      dot.setAttribute('aria-label', 'Slide ' + (i + 1) + ' - ' + titleText);
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      dot.addEventListener('click', () => {
        scrollToCard(card);
      });
      dotsContainer.appendChild(dot);
    });
  }

  // Update arrows and dots based on scroll position
  let ticking = false;
  function updateSliderState() {
    const scrollLeft = viewport.scrollLeft;
    const maxScroll = viewport.scrollWidth - viewport.clientWidth;

    // Toggle arrow disabled state (tolerance of 6px for subpixel calculations)
    if (prevBtn) {
      prevBtn.disabled = scrollLeft <= 6;
    }
    if (nextBtn) {
      nextBtn.disabled = scrollLeft >= maxScroll - 6;
    }

    // Find closest card to viewport start
    if (dotsContainer) {
      let closestIdx = 0;
      let minDiff = Infinity;
      cards.forEach((card, idx) => {
        const diff = Math.abs(getCardRelativeLeft(card));
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });

      const dots = dotsContainer.querySelectorAll('.slider-dot');
      dots.forEach((dot, idx) => {
        const isActive = idx === closestIdx;
        dot.classList.toggle('active', isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    }

    ticking = false;
  }

  viewport.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateSliderState);
      ticking = true;
    }
  }, { passive: true });

  // Initial state check
  updateSliderState();

  // Prev / Next button navigation
  if (prevBtn) {
    prevBtn.onclick = () => {
      const prevCard = [...cards].reverse().find(c => getCardRelativeLeft(c) < -12);
      if (prevCard) {
        scrollToCard(prevCard);
      } else {
        const step = cards[0].offsetWidth + 24;
        viewport.scrollBy({ left: -step, behavior: 'smooth' });
      }
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      const nextCard = cards.find(c => getCardRelativeLeft(c) > 12);
      if (nextCard) {
        scrollToCard(nextCard);
      } else {
        const step = cards[0].offsetWidth + 24;
        viewport.scrollBy({ left: step, behavior: 'smooth' });
      }
    };
  }

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
      prevBtn?.click();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextBtn?.click();
    }
  });

  // Re-check on window resize
  window.addEventListener('resize', () => {
    updateSliderState();
  }, { passive: true });
}

// Only render if grid is present and empty (or initial page load)
if (projectsGrid) {
  const sorted = [...(typeof projectsData !== 'undefined' ? projectsData : [])].sort((a, b) => {
    return (a.order || 99) - (b.order || 99);
  });
  renderProjects(sorted);
}
