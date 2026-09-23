/* =========================================================
   ALL PROJECTS PAGE — filter, search, paginated grid
   Requires PROJECTS array (assets/js/projects-data.js) and the
   shared renderProjectCard() helper (assets/js/main.js).
   Filter/search changes animate cards with a FLIP-style transition
   instead of instantly replacing the grid.
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

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PAGE_SIZE = 12;
  let activeCat = 'all';
  let query = '';
  let visibleCount = PAGE_SIZE;
  const cardNodes = new Map(); // project id -> DOM element
  let firstRender = true;

  // pre-select filter from ?filter= query param
  const params = new URLSearchParams(window.location.search);
  if (params.get('filter')) activeCat = params.get('filter');
  if (params.get('q')) query = params.get('q');

  const getFiltered = () => PROJECTS.filter(p => {
    const matchCat = activeCat === 'all' || p.cat === activeCat;
    const q = query.trim().toLowerCase();
    const matchQuery = !q || p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.tags.join(' ').toLowerCase().includes(q);
    return matchCat && matchQuery;
  });

  const render = () => {
    const filtered = getFiltered();
    const slice = filtered.slice(0, visibleCount);
    const newIds = new Set(slice.map(p => p.id));

    if (countEl) countEl.textContent = `${filtered.length} project${filtered.length === 1 ? '' : 's'}`;
    if (emptyState) emptyState.style.display = filtered.length ? 'none' : 'block';
    if (loadMoreBtn) loadMoreBtn.style.display = filtered.length > visibleCount ? 'inline-flex' : 'none';

    // FIRST: capture positions of nodes that will remain, before any DOM change.
    const firstRects = new Map();
    if (!prefersReducedMotion) {
      cardNodes.forEach((el, id) => {
        if (newIds.has(id)) firstRects.set(id, el.getBoundingClientRect());
      });
    }

    // Remove cards that no longer match — fade/scale out, then detach.
    cardNodes.forEach((el, id) => {
      if (!newIds.has(id)) {
        cardNodes.delete(id);
        if (prefersReducedMotion) {
          el.remove();
        } else {
          el.classList.add('is-leaving');
          el.style.transform = '';
          const done = () => el.remove();
          el.addEventListener('transitionend', done, { once: true });
          setTimeout(done, 420);
        }
      }
    });

    // Add/reorder remaining + new cards in the correct sequence.
    slice.forEach((p, index) => {
      let el = cardNodes.get(p.id);
      if (!el) {
        const wrap = document.createElement('div');
        wrap.innerHTML = renderProjectCard(p);
        el = wrap.firstElementChild;
        if (!prefersReducedMotion) {
          el.classList.add('is-entering');
          el.style.transitionDelay = firstRender ? Math.min(index, 8) * 45 + 'ms' : '';
        }
        cardNodes.set(p.id, el);
      }
      grid.appendChild(el); // appending in order also reorders existing nodes
    });

    if (!prefersReducedMotion) {
      // LAST + invert + play, on the next frame once layout has settled.
      requestAnimationFrame(() => {
        cardNodes.forEach((el, id) => {
          if (firstRects.has(id)) {
            const first = firstRects.get(id);
            const last = el.getBoundingClientRect();
            const dx = first.left - last.left;
            const dy = first.top - last.top;
            if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
              el.style.transition = 'none';
              el.style.transform = `translate(${dx}px, ${dy}px)`;
              requestAnimationFrame(() => {
                el.style.transition = 'transform .5s var(--ease-data)';
                el.style.transform = '';
                el.addEventListener('transitionend', () => { el.style.transition = ''; }, { once: true });
              });
            }
          }
        });
        cardNodes.forEach((el) => {
          if (el.classList.contains('is-entering')) {
            requestAnimationFrame(() => {
              el.classList.remove('is-entering');
              setTimeout(() => { el.style.transitionDelay = ''; }, 500);
            });
          }
        });
      });
    }

    firstRender = false;
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
    let searchTimer;
    searchInput.addEventListener('input', (e) => {
      query = e.target.value;
      visibleCount = PAGE_SIZE;
      clearTimeout(searchTimer);
      searchTimer = setTimeout(render, 120);
    });
  }

  loadMoreBtn?.addEventListener('click', () => {
    visibleCount += PAGE_SIZE;
    render();
  });

  render();
});
