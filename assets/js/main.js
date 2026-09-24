/* =========================================================
   DANISH SAYYED — PORTFOLIO (redesign)
   Shared interactions: nav, reveal-on-scroll, project modal,
   testimonials carousel, contact form, to-top button
========================================================= */

/* Shared project-card markup so the featured grid (index.html) and the
   all-projects grid (projects-page.js) stay in sync — same thumbnail
   scan-line + contextual label treatment everywhere. */
const CONTEXT_LABELS_BY_CAT = {
  'tableau-dashboards': ['KPI', 'TREND'],
  'tableau-vizzes': ['INSIGHT', 'TREND'],
  'power-bi': ['KPI', 'MAP'],
  'python': ['INSIGHT', 'TREND'],
  'excel': ['KPI', 'INSIGHT'],
  'others': ['INSIGHT']
};

function renderProjectCard(p) {
  const labels = CONTEXT_LABELS_BY_CAT[p.cat] || ['INSIGHT'];
  return `
      <div class="project-card" data-project-id="${p.id}">
        <div class="thumb">
          <span class="card-tag">${p.label}</span>
          <img src="${p.img}" alt="${p.title}" loading="lazy">
          <span class="thumb-scan" aria-hidden="true"></span>
          <div class="thumb-context-labels" aria-hidden="true">${labels.map(l => `<span>${l}</span>`).join('')}</div>
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
}

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Reduced motion ---------- */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(hover: none), (pointer: coarse)').matches;
  const isNarrow = () => window.innerWidth < 768;

  /* ---------- Active nav link on scroll + sliding indicator ---------- */
  const navLinks = document.querySelectorAll('.nav-link, .mobile-drawer a');
  const sections = [...document.querySelectorAll('main section[id]')];
  const navIndicator = document.querySelector('.nav-indicator');
  const navLinksWrap = document.querySelector('.nav-links');

  const moveIndicator = (pulse) => {
    if (!navIndicator || !navLinksWrap) return;
    const activeLink = navLinksWrap.querySelector('.nav-link.active');
    if (!activeLink) { navIndicator.classList.remove('is-ready'); return; }
    const wrapRect = navLinksWrap.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    const left = linkRect.left - wrapRect.left;
    navIndicator.style.width = linkRect.width + 'px';
    navIndicator.style.transform = `translateX(${left}px)`;
    navIndicator.classList.add('is-ready');
    if (pulse && !prefersReducedMotion) {
      navIndicator.classList.remove('is-pulsing');
      // eslint-disable-next-line no-unused-expressions
      void navIndicator.offsetWidth; // restart animation
      navIndicator.classList.add('is-pulsing');
    }
  };

  if (sections.length && navLinks.length) {
    let currentId = null;
    const setActive = (id) => {
      if (id === currentId) return;
      currentId = id;
      navLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${id}` || a.getAttribute('href') === `index.html#${id}`);
      });
      moveIndicator(true);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) setActive(en.target.id); });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
    sections.forEach(s => io.observe(s));
  }

  // Position on load (instant, no slide-in from zero) and on resize.
  if (navIndicator) {
    requestAnimationFrame(() => {
      navIndicator.style.transition = 'none';
      moveIndicator(false);
      requestAnimationFrame(() => { navIndicator.style.transition = ''; });
    });
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => moveIndicator(false), 120);
    });
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

  /* ---------- Reveal on scroll ----------
     Generous threshold/rootMargin so short trailing sections (e.g. the
     last strip before the footer) reliably reveal even with little
     scroll room left below them. Also force-reveal anything already
     in (or very close to) the viewport on load, and as a safety net,
     reveal everything after a short delay no matter what. */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    const rio = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('in-view');
          rio.unobserve(en.target);
        }
      });
    }, { threshold: 0.01, rootMargin: '0px 0px 60px 0px' });
    revealEls.forEach(el => rio.observe(el));

    // Safety net: guarantee nothing is left permanently invisible.
    setTimeout(() => {
      revealEls.forEach(el => el.classList.add('in-view'));
    }, 1500);
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
        const dur = 1800;
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
     HERO: "raw data → decision" fragment convergence (once)
  ========================================================= */
  const heroFragments = document.getElementById('hero-fragments');
  if (heroFragments) {
    if (prefersReducedMotion) {
      heroFragments.classList.add('is-done');
    } else {
      const hfio = new IntersectionObserver((entries) => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            setTimeout(() => heroFragments.classList.add('is-converging'), 1400);
            setTimeout(() => heroFragments.classList.add('is-done'), 1400 + 1250);
            hfio.disconnect();
          }
        });
      }, { threshold: 0.4 });
      hfio.observe(heroFragments);
    }
  }

  /* ---------- Hero panel: rotating "LIVE ANALYTICS" label ---------- */
  const liveLabelText = document.querySelector('.live-label-text');
  if (liveLabelText) {
    const labels = ['LIVE ANALYTICS', 'BALL TRACKING', 'DECISION SYSTEMS', 'DATA VISUALIZATION'];
    let li = 0;
    let liveTimer = null;
    const cycle = () => {
      if (prefersReducedMotion) return;
      liveLabelText.classList.add('is-swapping');
      setTimeout(() => {
        li = (li + 1) % labels.length;
        liveLabelText.textContent = labels[li];
        liveLabelText.classList.remove('is-swapping');
      }, 300);
    };
    const heroPanelEl = document.querySelector('.hero-panel');
    if (heroPanelEl && !prefersReducedMotion) {
      const lpio = new IntersectionObserver((entries) => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            if (!liveTimer) liveTimer = setInterval(cycle, 4500);
          } else if (liveTimer) {
            clearInterval(liveTimer);
            liveTimer = null;
          }
        });
      }, { threshold: 0.2 });
      lpio.observe(heroPanelEl);
    }
  }

  /* =========================================================
     SIGNAL-PATH SEQUENCES (About journey, How I Work, Career scan)
     A small glowing dot travels once through a set of items when
     their container enters the viewport; each item briefly lights
     up as the signal reaches it, then returns to normal.
  ========================================================= */
  const runSignal = (container, dot, items, offsetFn, opts = {}) => {
    if (!container || !dot || !items.length) return;
    const stepMs = opts.stepMs || 480;
    const activeClass = opts.activeClass || 'is-active';

    if (prefersReducedMotion) {
      if (opts.onSettle) opts.onSettle(items);
      return;
    }

    let i = 0;
    const step = () => {
      if (i > 0) items[i - 1].classList.remove(activeClass);
      if (i >= items.length) {
        dot.classList.add('is-done');
        if (opts.onSettle) opts.onSettle(items);
        return;
      }
      const el = items[i];
      dot.style.top = offsetFn(el) + 'px';
      dot.classList.add('is-live');
      el.classList.add(activeClass);
      i++;
      setTimeout(step, stepMs);
    };
    setTimeout(step, opts.startDelay || 150);
  };

  const watchOnce = (el, cb, threshold = 0.3) => {
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) { cb(); obs.disconnect(); }
      });
    }, { threshold });
    obs.observe(el);
  };

  // Journey (About)
  const journeyList = document.getElementById('journey-signal-list');
  if (journeyList) {
    const dot = journeyList.querySelector('.signal-dot');
    const items = [...journeyList.querySelectorAll('.journey-item')];
    watchOnce(journeyList, () => {
      runSignal(journeyList, dot, items, (el) => el.offsetTop + 14, { stepMs: 1000 });
    });
  }

  // How I Work (About)
  const howList = document.getElementById('howwork-signal-list');
  if (howList) {
    const dot = howList.querySelector('.signal-dot-h');
    const items = [...howList.querySelectorAll('.how-item')];
    watchOnce(howList, () => {
      runSignal(howList, dot, items, (el) => el.offsetTop + 14, { stepMs: 1000 });
    });
  }

  // Career timeline scanner — current role keeps lasting emphasis
  const careerTimeline = document.getElementById('career-timeline');
  if (careerTimeline) {
    const dot = careerTimeline.querySelector('.career-scanner');
    const items = [...careerTimeline.querySelectorAll('.exp-item')];
    watchOnce(careerTimeline, () => {
      runSignal(careerTimeline, dot, items, (el) => el.offsetTop + 10.5, {
        stepMs: 1520,
        onSettle: (its) => its.forEach(el => { if (el.dataset.current === 'true') el.classList.add('is-current'); })
      });
    }, 0.15);
  }

  /* =========================================================
     SKILLS RELATIONSHIP HOVER
     Highlights matching tools across the same widget (relationships
     come only from real repeated skill names already in the markup —
     e.g. "Tableau" appearing in both the Analytics and Visualization
     rows), dims the rest. No invented data or percentages.
  ========================================================= */
  document.querySelectorAll('.skills-tool-list, .career-skills-grid').forEach((widget) => {
    const pills = [...widget.querySelectorAll('.skill-pill')];
    if (!pills.length) return;
    const activate = (text) => {
      pills.forEach(p => {
        const match = p.textContent.trim().toLowerCase() === text;
        p.classList.toggle('is-match', match);
        p.classList.toggle('is-dim', !match);
      });
    };
    const clear = () => pills.forEach(p => p.classList.remove('is-match', 'is-dim'));
    pills.forEach(p => {
      p.tabIndex = 0;
      const text = p.textContent.trim().toLowerCase();
      p.addEventListener('mouseenter', () => activate(text));
      p.addEventListener('focus', () => activate(text));
      p.addEventListener('mouseleave', clear);
      p.addEventListener('blur', clear);
    });
  });

  /* =========================================================
     FEATURED PROJECTS — horizontal "data gallery"
  ========================================================= */
  const galleryViewport = document.getElementById('gallery-viewport');
  if (galleryViewport) {
    const track = document.getElementById('featured-project-grid');
    const prevBtn = document.querySelector('.gallery-prev');
    const nextBtn = document.querySelector('.gallery-next');
    let rafPending = false;

    const updateCenter = () => {
      rafPending = false;
      const cards = [...track.children];
      if (!cards.length) return;
      const viewportCenter = galleryViewport.getBoundingClientRect().left + galleryViewport.clientWidth / 2;
      let closest = null, closestDist = Infinity;
      cards.forEach(card => {
        const r = card.getBoundingClientRect();
        const dist = Math.abs((r.left + r.width / 2) - viewportCenter);
        if (dist < closestDist) { closestDist = dist; closest = card; }
      });
      cards.forEach(c => c.classList.toggle('is-center', c === closest));
    };
    const queueUpdate = () => { if (!rafPending) { rafPending = true; requestAnimationFrame(updateCenter); } };

    galleryViewport.addEventListener('scroll', queueUpdate, { passive: true });
    window.addEventListener('resize', queueUpdate);
    // Initial pass once cards exist (they're injected by an inline script below).
    setTimeout(updateCenter, 60);
    setTimeout(updateCenter, 400);

    // Wheel: map vertical wheel/trackpad movement to horizontal scroll.
    galleryViewport.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // already horizontal, let it be
      e.preventDefault();
      galleryViewport.scrollLeft += e.deltaY;
    }, { passive: false });

    // Drag-to-scroll for mouse users (touch already scrolls natively).
    // Only engage once real movement is detected, so a plain click on a
    // card/button still fires normally instead of being hijacked by capture.
    if (!isTouch) {
      let isDown = false, dragging = false, startX = 0, startScroll = 0;
      track.addEventListener('pointerdown', (e) => {
        isDown = true;
        dragging = false;
        startX = e.clientX;
        startScroll = galleryViewport.scrollLeft;
      });
      track.addEventListener('pointermove', (e) => {
        if (!isDown) return;
        const delta = e.clientX - startX;
        if (!dragging && Math.abs(delta) > 6) {
          dragging = true;
          track.classList.add('is-dragging');
          track.setPointerCapture(e.pointerId);
        }
        if (dragging) galleryViewport.scrollLeft = startScroll - delta;
      });
      const endDrag = (e) => {
        isDown = false;
        if (dragging) {
          dragging = false;
          track.classList.remove('is-dragging');
          try { track.releasePointerCapture(e.pointerId); } catch (err) { /* noop */ }
        }
      };
      track.addEventListener('pointerup', endDrag);
      track.addEventListener('pointerleave', endDrag);
    }

    const scrollByCard = (dir) => {
      const card = track.querySelector('.project-card');
      const step = card ? card.getBoundingClientRect().width + 22 : 300;
      galleryViewport.scrollBy({ left: step * dir, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    };
    prevBtn?.addEventListener('click', () => scrollByCard(-1));
    nextBtn?.addEventListener('click', () => scrollByCard(1));
  }

  /* =========================================================
  /* =========================================================
     PROJECT PREVIEW MODAL
     Requires PROJECTS array (assets/js/projects-data.js)
     Opens with a FLIP-style shared-element transition: the clicked
     thumbnail expands from its card position into the modal image
     slot, then the info panel reveals in a short stagger. Closing
     reverses the image back to its source card where possible.
  ========================================================= */
  const overlay = document.querySelector('.preview-overlay');
  if (overlay && typeof PROJECTS !== 'undefined') {
    const previewBox = overlay.querySelector('.preview-box');
    const thumbImg = overlay.querySelector('.preview-thumb img');
    const infoPanel = overlay.querySelector('.preview-info');
    const tagsWrap = overlay.querySelector('.preview-tags');
    const titleEl = overlay.querySelector('.preview-info h4');
    const descEl = overlay.querySelector('.preview-info p');
    const viewBtn = overlay.querySelector('[data-preview-view]');
    const githubBtn = overlay.querySelector('[data-preview-github]');
    let lastSourceImg = null;
    let isAnimating = false;

    const flipImageFrom = (sourceRect, onDone) => {
      const targetRect = thumbImg.getBoundingClientRect();
      const dx = sourceRect.left - targetRect.left;
      const dy = sourceRect.top - targetRect.top;
      const sx = sourceRect.width / targetRect.width;
      const sy = sourceRect.height / targetRect.height;
      thumbImg.style.transition = 'none';
      thumbImg.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
      // eslint-disable-next-line no-unused-expressions
      void thumbImg.offsetWidth;
      requestAnimationFrame(() => {
        thumbImg.style.transition = 'transform .6s var(--ease-data)';
        thumbImg.style.transform = 'translate(0,0) scale(1,1)';
        if (onDone) thumbImg.addEventListener('transitionend', onDone, { once: true });
      });
    };

    const openPreview = (project, sourceImg) => {
      if (!project || isAnimating) return;
      thumbImg.src = project.img;
      thumbImg.alt = project.title;
      tagsWrap.innerHTML = project.tags.map(t => `<span>${t}</span>`).join('');
      titleEl.textContent = project.title;
      descEl.textContent = project.desc;
      viewBtn.href = project.href;
      githubBtn.href = project.href; // placeholder: same destination until real repo links are added
      infoPanel.classList.remove('is-revealed');

      const sourceRect = sourceImg ? sourceImg.getBoundingClientRect() : null;
      lastSourceImg = sourceImg || null;

      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';

      if (sourceRect && !prefersReducedMotion) {
        // Wait one frame so the modal has its real layout before we flip.
        requestAnimationFrame(() => {
          flipImageFrom(sourceRect, () => {
            infoPanel.classList.add('is-revealed');
          });
        });
      } else {
        thumbImg.style.transform = 'none';
        requestAnimationFrame(() => infoPanel.classList.add('is-revealed'));
      }
    };

    const closePreview = () => {
      if (isAnimating) return;
      infoPanel.classList.remove('is-revealed');
      const finish = () => {
        overlay.classList.remove('is-open');
        document.body.style.overflow = '';
        thumbImg.style.transition = '';
        thumbImg.style.transform = '';
        isAnimating = false;
      };

      const canReverse = lastSourceImg && lastSourceImg.isConnected && !prefersReducedMotion;
      if (canReverse) {
        isAnimating = true;
        setTimeout(() => {
          const sourceRect = lastSourceImg.getBoundingClientRect();
          const currentRect = thumbImg.getBoundingClientRect();
          const dx = sourceRect.left - currentRect.left;
          const dy = sourceRect.top - currentRect.top;
          const sx = sourceRect.width / currentRect.width;
          const sy = sourceRect.height / currentRect.height;
          thumbImg.style.transition = 'transform .45s var(--ease-data)';
          thumbImg.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
          overlay.style.transition = 'opacity .45s var(--ease-data) .1s';
          thumbImg.addEventListener('transitionend', () => {
            overlay.style.transition = '';
            finish();
          }, { once: true });
          overlay.classList.remove('is-open');
        }, 120);
      } else {
        isAnimating = true;
        overlay.classList.remove('is-open');
        setTimeout(finish, prefersReducedMotion ? 0 : 250);
      }
    };

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-preview-btn]');
      if (btn) {
        e.preventDefault();
        const id = parseInt(btn.getAttribute('data-preview-btn'), 10);
        const project = PROJECTS.find(p => p.id === id);
        const sourceImg = btn.closest('.thumb')?.querySelector('img') || null;
        openPreview(project, sourceImg);
      }
      if (e.target.closest('.preview-close') || e.target === overlay) closePreview();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('is-open')) closePreview(); });
  }

  /* =========================================================
     TESTIMONIALS — continuous "train"
     Requires TESTIMONIALS array (assets/js/testimonials-data.js)
     Cards drift slowly right-to-left; the one nearest the center is
     emphasized. Pauses on hover/focus/touch, resumes after. Loops
     seamlessly with one minimal clone of the set. Reduced motion:
     static row, no auto-scroll, manual browsing only.
  ========================================================= */
  const testiRoot = document.querySelector('[data-testimonials]');
  if (testiRoot && typeof TESTIMONIALS !== 'undefined' && TESTIMONIALS.length) {
    const viewport = document.getElementById('testi-viewport');
    const track = document.getElementById('testi-track');
    const dotsWrap = testiRoot.querySelector('.testi-dots');
    const prevBtn = testiRoot.querySelector('[data-testi-prev]');
    const nextBtn = testiRoot.querySelector('[data-testi-next]');

    const cardHTML = (t, idx) => `
      <div class="testi-card" data-t-idx="${idx}" tabindex="0">
        <span class="testi-quote-mark">&rdquo;</span>
        <p class="testi-quote-text">${t.full}</p>
        <div class="testi-card-top">
          <img class="testi-avatar" src="${t.img}" alt="${t.name}" loading="lazy">
          <div>
            <h4>${t.name}</h4>
            <div class="role">${t.role}</div>
          </div>
          <a class="testi-linkedin" href="https://www.linkedin.com/in/thesayyeddanish" target="_blank" rel="noopener" aria-label="LinkedIn"><ion-icon name="logo-linkedin"></ion-icon></a>
        </div>
        <div class="testi-tags">${t.tags.map(tag => `<span>${tag}</span>`).join('')}</div>
      </div>`;

    // One clone of the set appended after the original for seamless looping —
    // minimal duplication (2x) rather than many repeats.
    const setCount = TESTIMONIALS.length;
    const loopCopies = prefersReducedMotion ? 1 : 2;
    let html = '';
    for (let c = 0; c < loopCopies; c++) {
      html += TESTIMONIALS.map((t, i) => cardHTML(t, i)).join('');
    }
    track.innerHTML = html;

    dotsWrap.innerHTML = TESTIMONIALS.map((_, i) => `<span data-dot="${i}" class="${i === 0 ? 'active' : ''}"></span>`).join('');

    let oneSetWidth = 0;
    const measure = () => {
      const firstCards = [...track.children].slice(0, setCount);
      if (!firstCards.length) return;
      const last = firstCards[firstCards.length - 1];
      const gap = 22;
      oneSetWidth = (last.offsetLeft + last.offsetWidth) - firstCards[0].offsetLeft + gap;
    };

    let paused = false;
    let pauseTimer = null;
    const pause = () => { paused = true; };
    const resumeSoon = (delay = 900) => {
      clearTimeout(pauseTimer);
      pauseTimer = setTimeout(() => { syncScrollPos(); paused = false; }, delay);
    };

    viewport.addEventListener('mouseenter', pause);
    viewport.addEventListener('mouseleave', () => resumeSoon(200));
    viewport.addEventListener('touchstart', pause, { passive: true });
    viewport.addEventListener('touchend', () => resumeSoon(1200), { passive: true });
    track.addEventListener('focusin', pause);
    track.addEventListener('focusout', () => resumeSoon(200));

    // Manual drag-to-scroll (mouse) — native touch scroll already works.
    if (!isTouch) {
      let isDown = false, dragging = false, startX = 0, startScroll = 0;
      viewport.addEventListener('pointerdown', (e) => {
        isDown = true; dragging = false;
        startX = e.clientX; startScroll = viewport.scrollLeft;
        pause();
      });
      viewport.addEventListener('pointermove', (e) => {
        if (!isDown) return;
        const delta = e.clientX - startX;
        if (!dragging && Math.abs(delta) > 6) { dragging = true; viewport.classList.add('is-dragging'); }
        if (dragging) viewport.scrollLeft = startScroll - delta;
      });
      const endDrag = () => { isDown = false; dragging = false; viewport.classList.remove('is-dragging'); resumeSoon(700); };
      viewport.addEventListener('pointerup', endDrag);
      viewport.addEventListener('pointerleave', endDrag);
    }

    let rafId = null;
    const speed = 0.35; // px per frame — slow, calm drift
    let scrollPos = 1; // float accumulator — viewport.scrollLeft itself rounds to an
                        // integer each frame, which would silently swallow a sub-pixel speed

    const updateCenter = () => {
      const cards = [...track.children];
      if (!cards.length) return;
      const vpCenter = viewport.getBoundingClientRect().left + viewport.clientWidth / 2;
      let closest = null, closestDist = Infinity;
      cards.forEach(card => {
        const r = card.getBoundingClientRect();
        const dist = Math.abs((r.left + r.width / 2) - vpCenter);
        if (dist < closestDist) { closestDist = dist; closest = card; }
      });
      cards.forEach(c => c.classList.toggle('is-center', c === closest));
      if (closest) {
        const idx = parseInt(closest.dataset.tIdx, 10);
        [...dotsWrap.children].forEach((d, i) => d.classList.toggle('active', i === idx));
      }
    };

    const tick = () => {
      if (!paused && oneSetWidth > 0) {
        scrollPos += speed;
        if (scrollPos >= oneSetWidth) scrollPos -= oneSetWidth;
        viewport.scrollLeft = scrollPos;
      }
      updateCenter();
      rafId = requestAnimationFrame(tick);
    };

    // Keep the float accumulator in sync whenever the position changes by
    // some other means (drag, dot/arrow click), so auto-drift resumes
    // smoothly from wherever the person left it instead of jumping.
    const syncScrollPos = () => { scrollPos = viewport.scrollLeft; };

    const start = () => {
      measure();
      // Start partway through the first set so the very first center card
      // is a real (non-edge) testimonial rather than the seam.
      viewport.scrollLeft = 1;
      scrollPos = 1;
      if (!prefersReducedMotion) {
        rafId = requestAnimationFrame(tick);
      } else {
        updateCenter();
      }
    };
    setTimeout(start, 80);
    window.addEventListener('resize', () => { measure(); updateCenter(); });

    // Pause the loop while off-screen (performance).
    const testiIO = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (prefersReducedMotion) return;
        if (en.isIntersecting) {
          if (!rafId) rafId = requestAnimationFrame(tick);
        } else if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      });
    }, { threshold: 0.05 });
    testiIO.observe(testiRoot);

    const scrollToIndex = (idx) => {
      const target = [...track.children].find(c => parseInt(c.dataset.tIdx, 10) === idx);
      if (!target) return;
      pause();
      const vpCenter = viewport.clientWidth / 2;
      const targetLeft = target.offsetLeft + target.offsetWidth / 2 - vpCenter;
      viewport.scrollTo({ left: targetLeft, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      resumeSoon(1800);
    };

    prevBtn?.addEventListener('click', () => {
      pause();
      const card = track.querySelector('.testi-card');
      const step = card ? card.getBoundingClientRect().width + 22 : 420;
      viewport.scrollBy({ left: -step, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      resumeSoon(1800);
    });
    nextBtn?.addEventListener('click', () => {
      pause();
      const card = track.querySelector('.testi-card');
      const step = card ? card.getBoundingClientRect().width + 22 : 420;
      viewport.scrollBy({ left: step, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      resumeSoon(1800);
    });
    dotsWrap.addEventListener('click', (e) => {
      const dot = e.target.closest('[data-dot]');
      if (dot) scrollToIndex(parseInt(dot.dataset.dot, 10));
    });
  }

  /* =========================================================
     CONTACT FORM (Formspree)
  ========================================================= */
  const form = document.querySelector('#contact-form');
  if (form) {
    const submitBtn = form.querySelector('.form-submit');
    const formCard = document.querySelector('.form-card');

    // Focus states: brighten the active field, gently dim the rest.
    if (formCard) {
      form.addEventListener('focusin', () => formCard.classList.add('has-focus'));
      form.addEventListener('focusout', () => {
        setTimeout(() => {
          if (!formCard.contains(document.activeElement)) formCard.classList.remove('has-focus');
        }, 0);
      });
    }

    // Success flourish: the paper-plane leaves the button on a short curved
    // path toward the email icon, which pulses once on arrival.
    const flyToMailIcon = () => {
      const mailIcon = document.querySelector('.connect-row .ic.mail');
      if (!mailIcon || prefersReducedMotion) return;
      const startRect = submitBtn.getBoundingClientRect();
      const endRect = mailIcon.getBoundingClientRect();
      const startX = startRect.right - 28;
      const startY = startRect.top + startRect.height / 2;
      const endX = endRect.left + endRect.width / 2;
      const endY = endRect.top + endRect.height / 2;
      const dist = Math.hypot(endX - startX, endY - startY);
      if (dist > 2200 || dist < 4) return; // off-screen or degenerate — skip gracefully

      const fly = document.createElement('span');
      fly.className = 'fly-icon';
      fly.innerHTML = '<ion-icon name="paper-plane-outline"></ion-icon>';
      fly.style.transform = `translate(${startX}px, ${startY}px)`;
      document.body.appendChild(fly);

      const midX = (startX + endX) / 2;
      const midY = Math.min(startY, endY) - 70;
      const anim = fly.animate([
        { transform: `translate(${startX}px, ${startY}px) scale(1)`, opacity: 1, offset: 0 },
        { transform: `translate(${midX}px, ${midY}px) scale(.85)`, opacity: 1, offset: .55 },
        { transform: `translate(${endX}px, ${endY}px) scale(.35)`, opacity: 0, offset: 1 }
      ], { duration: 700, easing: 'cubic-bezier(.4,0,.2,1)' });

      anim.onfinish = () => {
        fly.remove();
        mailIcon.classList.add('is-pulsing');
        setTimeout(() => mailIcon.classList.remove('is-pulsing'), 700);
      };
    };

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

           // Let the success state register visually before the plane launches.
           setTimeout(() => {
             flyToMailIcon();
           }, 150);

           form.reset();
           if (formCard) formCard.classList.remove('has-focus');
           setTimeout(() => submitBtn.classList.remove('is-done'), 6000);
         }
      } catch (err) {
        submitBtn.classList.remove('is-loading');
        submitBtn.classList.add('is-error');
        setTimeout(() => submitBtn.classList.remove('is-error'), 3500);
      }
    });
  }

});
