// projectsData is now loaded globally from projects-data.js

const projectsGrid = document.getElementById('firebase-projects-grid');

function showLoading() {
  if (!projectsGrid) return;
  projectsGrid.innerHTML = `
    <div style="text-align: center; grid-column: 1 / -1; padding: 3rem; color: var(--cyan);">
      <i class='bx bx-loader-alt bx-spin' style="font-size: 3rem;"></i>
      <p style="margin-top: 1rem;">Loading projects...</p>
    </div>
  `;
}

function renderProjects(projects) {
  if (!projectsGrid) return;

  if (!projects || projects.length === 0) {
    projectsGrid.innerHTML = `
      <div style="text-align: center; grid-column: 1 / -1; padding: 3rem; color: var(--white-mute);">
        <p>Belum ada project yang ditambahkan.</p>
      </div>
    `;
    return;
  }

  projectsGrid.innerHTML = '';

  projects.forEach((project, index) => {
    const delay = (index % 4) * 100;

    const tagsHtml = (project.tags || [])
      .map((tag) => `<span class="project-tag">${tag}</span>`)
      .join('');



    let footerHtml = '';
    if (project.demoLink) {
      footerHtml += `
        <a href="${project.demoLink}" target="_blank" rel="noopener" class="btn btn-sm btn-primary">
          <i class='bx bx-globe'></i> Website
        </a>
      `;
    }
    if (project.githubLink) {
      footerHtml += `
        <a href="${project.githubLink}" target="_blank" rel="noopener" class="btn btn-sm btn-outline">
          <i class='bx bxl-github'></i> Github
        </a>
      `;
    }

    const statusClass = project.status === 'live' ? 'live' : 'wip';
    const statusText = project.status === 'live' ? 'Live' : 'Preview';
    const imageUrl = project.imageUrl || 'img/placeholder.png';

    const cardHtml = `
      <div class="project-card glass-card" data-aos="fade-up" data-aos-delay="${delay}">
        <div class="project-image">
          <img src="${imageUrl}" alt="${project.title}" loading="lazy" onerror="this.src='img/placeholder.png'" />

          <div class="project-status ${statusClass}">${statusText}</div>
        </div>
        <div class="project-body">
          <div class="project-tags">${tagsHtml}</div>
          <h3 class="project-title">${project.title}</h3>
          <p class="project-desc">${project.desc}</p>
          <div class="project-footer">${footerHtml}</div>
        </div>
      </div>
    `;

    projectsGrid.insertAdjacentHTML('beforeend', cardHtml);
  });
}

if (projectsGrid) {
  showLoading();

  // Sort by createdAt desc (if present)
  const sorted = [...(projectsData || [])].sort((a, b) => {
    const ad = a.createdAt || '';
    const bd = b.createdAt || '';
    return bd.localeCompare(ad);
  });

  // Render immediately (local data)
  renderProjects(sorted);
}

