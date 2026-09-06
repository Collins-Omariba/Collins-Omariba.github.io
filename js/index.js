(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelectorAll('.nav__link');

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      document.body.classList.toggle('nav-open');
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      document.body.classList.remove('nav-open');
    });
  });

  const header = document.querySelector('header');
  const onHeaderScroll = () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 12);
  };
  window.addEventListener('scroll', onHeaderScroll, { passive: true });
  onHeaderScroll();

  const yearsBuildingEl = document.getElementById('yearsBuilding');
  if (yearsBuildingEl) {
    const start = new Date(2020, 0, 1);
    const now = new Date();
    const years = Math.max(0, Math.floor((now.getTime() - start.getTime()) / (365.25 * 24 * 3600 * 1000)));
    yearsBuildingEl.textContent = `${years}+`;
  }

  const progressBar = document.getElementById('scrollProgress');
  const updateProgress = () => {
    if (!progressBar) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = max > 0 ? `scaleX(${Math.min(1, window.scrollY / max)})` : 'scaleX(0)';
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  const contentImages = document.querySelectorAll('.portfolio-item-individual img');
  contentImages.forEach((img) => {
    img.setAttribute('loading', 'lazy');
    img.setAttribute('decoding', 'async');
  });

  const fadeImages = document.querySelectorAll('.intro .intro__img, .portfolio-item-individual img');
  fadeImages.forEach((img) => {
    img.classList.add('img-fade');
    const done = () => img.classList.add('is-loaded');
    if (img.complete && img.naturalWidth > 0) {
      done();
    } else {
      img.addEventListener('load', done);
      img.addEventListener('error', done);
    }
  });

  const glideTo = (targetY) => {
    if (reduced) {
      window.scrollTo(0, targetY);
      return;
    }
    const startY = window.scrollY;
    const delta = targetY - startY;
    const duration = 850;
    let t0 = null;
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const step = (ts) => {
      if (t0 === null) t0 = ts;
      const p = Math.min(1, (ts - t0) / duration);
      window.scrollTo(0, startY + delta * ease(p));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    link.addEventListener('click', (e) => {
      const target = document.getElementById(href.slice(1));
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 64;
      glideTo(Math.max(0, y));
    });
  });

  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('revealed'));
  }

  const sectionIds = ['home', 'work', 'services', 'about', 'experience'];
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((l) => {
            l.classList.toggle('active', l.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );
  sectionIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) spy.observe(el);
  });

  const tiltCards = document.querySelectorAll('[data-tilt]');
  if (tiltCards.length && !reduced) {
    let raf = null;
    tiltCards.forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.style.transform = `perspective(950px) rotateX(${(-py * 3.2).toFixed(2)}deg) rotateY(${(px * 4.5).toFixed(2)}deg) translateY(-4px)`;
        });
      });
      card.addEventListener('pointerleave', () => {
        if (raf) cancelAnimationFrame(raf);
        card.style.transform = '';
      });
    });
  }
})();