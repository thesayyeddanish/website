/* =========================================================
   ALL PROJECTS PAGE — filter, search, paginated grid
   Requires PROJECTS array (assets/js/projects-data.js)
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof PROJECTS === 'undefined') return;

  const grid = document.querySelector('[data-project-grid]');
  const emptyState = document.querySelector('[data-empty-state]');
  const countEl = document.querySelector('[data-result-count]');
  const chips = document.querySelectorAll('.filter-chip');
  const searchInput = document.querySelector('[data-project-search]');
  const loadMoreBtn = document.querySelector('[data-load-more]');
  if (!grid) return;

  const PAGE_SIZE = 12;
  let activeCat = 'all';
  let query = '';
  let visibleCount = PAGE_SIZE;

  // pre-select filter from ?filter= query param
  const params = new URLSearchParams(window.location.search);
  if (params.get('filter')) activeCat = params.get('filter');
  if (params.get('q')) query = params.get('q');

  const cardHTML = (p) => `
    <div class="project-card" data-reveal="scale">
      <div class="thumb">
        <span class="card-tag">${p.label}</span>
        <img src="${p.img}" alt="${p.title}" loading="lazy">
        <div class="thumb-overlay">
          <button class="card-view" data-preview-btn="${p.id}" aria-label="View ${p.title}"><ion-icon name="eye-outline"></ion-icon></button>
        </div>
      </div>
      <div class="project-body">
        <h3>${p.title}</h3>
        <p>${p.desc}</p>
        <div class="project-foot">
          <div class="mini-tags">${p.tags.map(t => `<span class="mini-tag">${t}</span>`).join('')}</div>
          <a href="${p.href}" target="_blank" rel="noopener" aria-label="Open ${p.title}"><ion-icon name="arrow-forward-outline"></ion-icon></a>
        </div>
      </div>
    </div>`;

  const getFiltered = () => PROJECTS.filter(p => {
    const matchCat = activeCat === 'all' || p.cat === activeCat;
    const q = query.trim().toLowerCase();
    const matchQuery = !q || p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.tags.join(' ').toLowerCase().includes(q);
    return matchCat && matchQuery;
  });

  const render = () => {
    const filtered = getFiltered();
    const slice = filtered.slice(0, visibleCount);
    grid.innerHTML = slice.map(cardHTML).join('');
    if (countEl) countEl.textContent = `${filtered.length} project${filtered.length === 1 ? '' : 's'}`;
    if (emptyState) emptyState.style.display = filtered.length ? 'none' : 'block';
    if (loadMoreBtn) loadMoreBtn.style.display = filtered.length > visibleCount ? 'inline-flex' : 'none';
    grid.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('in-view'));
  };

  chips.forEach(chip => {
    if (chip.dataset.cat === activeCat) chip.classList.add('active');
    else chip.classList.remove('active');
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCat = chip.dataset.cat;
      visibleCount = PAGE_SIZE;
      render();
    });
  });

  if (searchInput) {
    searchInput.value = query;
    searchInput.addEventListener('input', (e) => {
      query = e.target.value;
      visibleCount = PAGE_SIZE;
      render();
    });
  }

  loadMoreBtn?.addEventListener('click', () => {
    visibleCount += PAGE_SIZE;
    render();
  });

  render();
});
