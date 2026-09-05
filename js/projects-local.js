// projectsData is loaded globally from js/projects-data.js

const projectsGrid = document.getElementById('firebase-projects-grid');

function showLoading() {
  if (!projectsGrid) return;
  projectsGrid.innerHTML = `
    <div style="text-align: center; grid-column: 1 / -1; padding: 3rem; color: var(--accent);">
      <i class='bx bx-loader-alt bx-spin' style="font-size: 2.5rem;"></i>
      <p style="margin-top: 0.8rem; font-size: 0.9rem; color: var(--text-secondary);">Memuat data project...</p>
    </div>
  `;
}

function renderProjects(projects) {
  if (!projectsGrid) return;

  if (!projects || projects.length === 0) {
    projectsGrid.innerHTML = `
      <div style="text-align: center; grid-column: 1 / -1; padding: 3rem; color: var(--text-muted);">
        <p>Belum ada project yang ditambahkan.</p>
      </div>
    `;
    return;
  }

  projectsGrid.innerHTML = '';

  projects.forEach((project, index) => {
    const delay = (index % 3) * 100;

    const tagsHtml = (project.tags || [])
      .map((tag) => `<span class="project-tag">${tag}</span>`)
      .join('');

    let footerHtml = '';
    if (project.demoLink) {
      footerHtml += `
        <a href="${project.demoLink}" target="_blank" rel="noopener" class="btn btn-sm btn-primary">
          <i class='bx bx-link-external'></i> Live Demo
        </a>
      `;
    }
    if (project.githubLink) {
      footerHtml += `
        <a href="${project.githubLink}" target="_blank" rel="noopener" class="btn btn-sm btn-outline">
          <i class='bx bxl-github'></i> GitHub
        </a>
      `;
    }

    const statusClass = project.status === 'live' ? 'live' : '';
    const statusText = project.status === 'live' ? 'Live Demo' : 'Project';
    const imageUrl = project.imageUrl || 'img/placeholder.png';

    const cardHtml = `
      <div class="project-card" data-aos="fade-up" data-aos-delay="${delay}">
        <div class="project-image-wrap">
          <img src="${imageUrl}" alt="${project.title}" loading="lazy" onerror="this.src='img/placeholder.png'" />
          <span class="project-badge ${statusClass}">${statusText}</span>
        </div>
        <div class="project-content">
          <div class="project-tags">${tagsHtml}</div>
          <h3 class="project-title">${project.title}</h3>
          <p class="project-desc">${project.desc}</p>
          <div class="project-actions">${footerHtml}</div>
        </div>
      </div>
    `;

    projectsGrid.insertAdjacentHTML('beforeend', cardHtml);
  });
}

if (projectsGrid) {
  showLoading();

  // Sort by createdAt desc if available
  const sorted = [...(typeof projectsData !== 'undefined' ? projectsData : [])].sort((a, b) => {
    const ad = a.createdAt || '';
    const bd = b.createdAt || '';
    return bd.localeCompare(ad);
  });

  renderProjects(sorted);
}
