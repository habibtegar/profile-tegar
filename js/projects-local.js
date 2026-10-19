// projectsData is loaded globally from js/projects-data.js

const projectsGrid = document.getElementById('firebase-projects-grid');

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

    // Tech stack chips
    const techChipsHtml = (project.techStack || [])
      .map(tech => `
        <span class="tech-chip">
          ${getTechIcon(tech)}
          <span>${tech}</span>
        </span>
      `).join('');

    // Action buttons
    let actionButtonsHtml = '';
    if (project.demoLink) {
      actionButtonsHtml += `
        <a href="${project.demoLink}" target="_blank" rel="noopener" class="btn btn-sm btn-project-live">
          <i class='bx bx-link-external'></i>
          <span>Live Preview</span>
        </a>
      `;
    }
    if (project.githubLink) {
      actionButtonsHtml += `
        <a href="${project.githubLink}" target="_blank" rel="noopener" class="btn btn-sm btn-project-code">
          <i class='bx bxl-github'></i>
          <span>Source Code</span>
        </a>
      `;
    }

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
            <img src="${imageUrl}" alt="${project.title}" loading="lazy" onerror="this.src='img/placeholder.png'" />
          </div>
        </div>
        <div class="project-content">
          <div class="project-header-meta">
            <span class="project-category-badge">${project.category || 'WEB APP'}</span>
          </div>
          <h3 class="project-title">${project.title}</h3>
          <p class="project-desc">${project.desc}</p>
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
}

// Only render if grid is present and empty (or initial page load)
if (projectsGrid) {
  const sorted = [...(typeof projectsData !== 'undefined' ? projectsData : [])].sort((a, b) => {
    return (a.order || 99) - (b.order || 99);
  });
  renderProjects(sorted);
}
