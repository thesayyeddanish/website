/* =========================================================
   DANISH SAYYED — PORTFOLIO (redesign)
   Shared interactions: nav, reveal-on-scroll, project modal,
   testimonials carousel, contact form, to-top button
========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Active nav link on scroll (home page only) ---------- */
  const navLinks = document.querySelectorAll('.nav-link, .mobile-drawer a');
  const sections = [...document.querySelectorAll('main section[id]')];
  if (sections.length && navLinks.length) {
    const setActive = (id) => {
      navLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${id}` || a.getAttribute('href') === `index.html#${id}`);
      });
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) setActive(en.target.id); });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
    sections.forEach(s => io.observe(s));
  }

  /* ---------- Mobile nav ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  if (toggle && drawer) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('is-open');
      drawer.classList.toggle('is-open');
    });
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      toggle.classList.remove('is-open');
      drawer.classList.remove('is-open');
    }));
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    const rio = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('in-view');
          rio.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => rio.observe(el));
  }

  /* ---------- To-top button ---------- */
  const toTop = document.querySelector('.to-top');
  if (toTop) {
    window.addEventListener('scroll', () => {
      toTop.classList.toggle('is-visible', window.scrollY > 600);
    }, { passive: true });
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const target = parseFloat(el.getAttribute('data-count'));
        const suffix = el.getAttribute('data-suffix') || '';
        const dur = 1100;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(el => cio.observe(el));
  }

  /* =========================================================
     PROJECT PREVIEW MODAL
     Requires PROJECTS array (assets/js/projects-data.js)
  ========================================================= */
  const overlay = document.querySelector('.preview-overlay');
  if (overlay && typeof PROJECTS !== 'undefined') {
    const thumbImg = overlay.querySelector('.preview-thumb img');
    const tagsWrap = overlay.querySelector('.preview-tags');
    const titleEl = overlay.querySelector('.preview-info h4');
    const descEl = overlay.querySelector('.preview-info p');
    const viewBtn = overlay.querySelector('[data-preview-view]');
    const githubBtn = overlay.querySelector('[data-preview-github]');

    const openPreview = (project) => {
      if (!project) return;
      thumbImg.src = project.img;
      thumbImg.alt = project.title;
      tagsWrap.innerHTML = project.tags.map(t => `<span>${t}</span>`).join('');
      titleEl.textContent = project.title;
      descEl.textContent = project.desc;
      viewBtn.href = project.href;
      githubBtn.href = project.href; // placeholder: same destination until real repo links are added
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    };
    const closePreview = () => {
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
    };

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-preview-btn]');
      if (btn) {
        e.preventDefault();
        const id = parseInt(btn.getAttribute('data-preview-btn'), 10);
        const project = PROJECTS.find(p => p.id === id);
        openPreview(project);
      }
      if (e.target.closest('.preview-close') || e.target === overlay) closePreview();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePreview(); });
  }

  /* =========================================================
     TESTIMONIALS CAROUSEL (paginated, groups of 3)
     Requires TESTIMONIALS array (assets/js/testimonials-data.js)
  ========================================================= */
  const testiRoot = document.querySelector('[data-testimonials]');
  if (testiRoot && typeof TESTIMONIALS !== 'undefined') {
    const featuredWrap = testiRoot.querySelector('.testi-featured');
    const pairWrap = testiRoot.querySelector('.testi-pair');
    const dotsWrap = testiRoot.querySelector('.testi-dots');
    const prevBtn = testiRoot.querySelector('[data-testi-prev]');
    const nextBtn = testiRoot.querySelector('[data-testi-next]');

    const pages = [];
    for (let i = 0; i < TESTIMONIALS.length; i += 3) pages.push(TESTIMONIALS.slice(i, i + 3));
    let page = 0;

    const li = (name) => `https://www.linkedin.com/in/thesayyeddanish`; // profile page (individual reviewer links not published)

    const renderFeatured = (t) => `
      <div class="testi-quote-mark">&rdquo;</div>
      <div class="testi-featured-top">
        <img class="testi-avatar" src="${t.img}" alt="${t.name}">
        <div class="testi-body">
          <p>${t.full}</p>
          <div class="testi-name-row">
            <div>
              <h4>${t.name}</h4>
              <div class="role">${t.role}</div>
            </div>
            <a class="testi-linkedin" href="https://www.linkedin.com/in/thesayyeddanish" target="_blank" rel="noopener" aria-label="LinkedIn"><ion-icon name="logo-linkedin"></ion-icon></a>
          </div>
          <div class="testi-tags">${t.tags.map(tag => `<span>${tag}</span>`).join('')}</div>
        </div>
      </div>`;

    const renderSmall = (t) => `
      <div class="testi-small-card">
        <div class="testi-small-top">
          <img class="testi-small-avatar" src="${t.img}" alt="${t.name}">
          <div>
            <h5>${t.name}</h5>
            <div class="role">${t.role}</div>
          </div>
        </div>
        <p>&ldquo;${t.full}&rdquo;</p>
      </div>`;

    const render = () => {
      const set = pages[page];
      featuredWrap.innerHTML = renderFeatured(set[0]);
      pairWrap.innerHTML = set.slice(1).map(renderSmall).join('');
      pairWrap.style.display = set.length > 1 ? 'grid' : 'none';
      if (set.length === 2) pairWrap.style.gridTemplateColumns = '1fr';
      else pairWrap.style.gridTemplateColumns = '1fr 1fr';
      dotsWrap.innerHTML = pages.map((_, i) => `<span class="${i === page ? 'active' : ''}"></span>`).join('');
      [...featuredWrap.parentElement.querySelectorAll('[data-reveal]')].forEach(el => el.classList.add('in-view'));
    };
    render();

    prevBtn?.addEventListener('click', () => { page = (page - 1 + pages.length) % pages.length; render(); });
    nextBtn?.addEventListener('click', () => { page = (page + 1) % pages.length; render(); });
    dotsWrap?.addEventListener('click', (e) => {
      const dots = [...dotsWrap.children];
      const idx = dots.indexOf(e.target);
      if (idx > -1) { page = idx; render(); }
    });
  }

  /* =========================================================
     CONTACT FORM (Formspree)
  ========================================================= */
  const form = document.querySelector('#contact-form');
  if (form) {
    const submitBtn = form.querySelector('.form-submit');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      submitBtn.classList.remove('is-done', 'is-error');
      submitBtn.classList.add('is-loading');
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          submitBtn.classList.remove('is-loading');
          submitBtn.classList.add('is-done');
          form.reset();
          setTimeout(() => submitBtn.classList.remove('is-done'), 3500);
        } else {
          throw new Error('Form submission failed');
        }
      } catch (err) {
        submitBtn.classList.remove('is-loading');
        submitBtn.classList.add('is-error');
        setTimeout(() => submitBtn.classList.remove('is-error'), 3500);
      }
    });
  }

});
