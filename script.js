/* AVAYA Cheesecake Jars | script.js */

(function () {
  'use strict';

  // STICKY NAV
  const navbar = document.getElementById('navbar');

  function handleScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    updateActiveNavLink();
  }

  window.addEventListener('scroll', handleScroll, { passive: true });

  // ACTIVE NAV LINK ON SCROLL
  const sections = document.querySelectorAll('section[id], div[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function updateActiveNavLink() {
    let currentSection = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 100;
      if (window.scrollY >= top) currentSection = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + currentSection) {
        link.classList.add('active');
      }
    });
  }

  // MOBILE MENU
  const hamburger = document.getElementById('hamburger');
  const navLinksEl = document.getElementById('navLinks');
  let menuOpen = false;

  function closeMenu() {
    menuOpen = false;
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    navLinksEl.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    menuOpen = !menuOpen;
    hamburger.classList.toggle('active', menuOpen);
    hamburger.setAttribute('aria-expanded', String(menuOpen));
    navLinksEl.classList.toggle('open', menuOpen);
    document.body.style.overflow = menuOpen ? 'hidden' : '';
  });

  // Close menu on nav link click
  navLinksEl.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (menuOpen && !navbar.contains(e.target)) closeMenu();
  });

  // SMOOTH SCROLL
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 70;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // SCROLL-REVEAL ANIMATIONS
  const revealEls = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach(el => observer.observe(el));

  // FLAVOR OF THE DAY BADGE
  const flavors = [
    { name: 'Espresso Crème', emoji: '☕' },
    { name: 'Caramel Biscoff', emoji: '🍮' },
    { name: 'Choco Bliss', emoji: '🍫' },
    { name: 'Midnight Oreo', emoji: '🌙' },
  ];

  function getTodayFlavor() {
    const day = new Date().getDay(); // 0=Sun … 6=Sat
    return flavors[day % flavors.length];
  }

  const flavorText = document.getElementById('flavorText');
  if (flavorText) {
    const f = getTodayFlavor();
    flavorText.textContent = `${f.emoji} Today's Pick: ${f.name}`;
  }

  // TESTIMONIAL SLIDER
  const cards = document.querySelectorAll('.testimonial-card');
  const dotsContainer = document.getElementById('sliderDots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  let current = 0;
  let autoSlideTimer;

  // Build dots
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to review ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  function goTo(index) {
    cards[current].classList.remove('active');
    dotsContainer.children[current].classList.remove('active');
    current = (index + cards.length) % cards.length;
    cards[current].classList.add('active');
    dotsContainer.children[current].classList.add('active');
    resetAutoSlide();
  }

  function resetAutoSlide() {
    clearInterval(autoSlideTimer);
    autoSlideTimer = setInterval(() => goTo(current + 1), 5000);
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  // Keyboard support
  document.addEventListener('keydown', e => {
    const slider = document.querySelector('.testimonial-slider');
    if (!slider) return;
    if (e.key === 'ArrowLeft') goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  // Touch / swipe support
  (function addSwipe() {
    const track = document.getElementById('testimonialTrack');
    if (!track) return;
    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
    }, { passive: true });
  })();

  resetAutoSlide();

  // THEME TOGGLE
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle ? themeToggle.querySelector('.theme-icon') : null;
  const html = document.documentElement;

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    if (themeIcon) themeIcon.textContent = theme === 'dark' ? '🌙' : '☕';
    try { localStorage.setItem('avaya-theme', theme); } catch (e) {}
  }

  // Load saved theme
  try {
    const saved = localStorage.getItem('avaya-theme');
    if (saved) applyTheme(saved);
  } catch (e) {}

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      // Small bounce animation
      themeToggle.style.transform = 'scale(1.2) rotate(20deg)';
      setTimeout(() => { themeToggle.style.transform = ''; }, 200);
    });
  }

  // CONTACT FORM
  const form = document.getElementById('contactForm');
  if (form) {
    const submitBtn = document.getElementById('submitBtn');
    const formSuccess = document.getElementById('formSuccess');

    function validateField(id, errorId, condition) {
      const el = document.getElementById(id);
      const errEl = document.getElementById(errorId);
      const group = el.closest('.form-group');
      if (!condition(el.value.trim())) {
        group.classList.add('error');
        errEl && errEl.setAttribute('role', 'alert');
        return false;
      }
      group.classList.remove('error');
      return true;
    }

    // Live validation feedback
    ['name', 'phone', 'message'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', () => {
        el.closest('.form-group').classList.remove('error');
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const validName = validateField('name', 'nameError', v => v.length >= 2);
      const validPhone = validateField('phone', 'phoneError', v => v.length >= 3);
      const validMsg = validateField('message', 'messageError', v => v.length >= 5);

      if (!validName || !validPhone || !validMsg) return;

      // Show loading
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      // Open Instagram DM after submit
      const igDM = 'https://ig.me/m/avaya.blr';
      // Simulate brief send delay
      setTimeout(() => {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        formSuccess.classList.add('show');
        form.reset();

        
        window.open(igDM, '_blank', 'noopener');

        // Hide success message after 5s
        setTimeout(() => formSuccess.classList.remove('show'), 5000);
      }, 900);
    });
  }

  // GALLERY LIGHTBOX (simple zoom)
  const galleryItems = document.querySelectorAll('.g-item');

  function createLightbox(src, alt) {
    const lb = document.createElement('div');
    lb.style.cssText = `
      position:fixed; inset:0; z-index:9999;
      background:rgba(10,5,2,0.92);
      display:flex; align-items:center; justify-content:center;
      cursor:zoom-out; animation: lbFadeIn 0.25s ease;
    `;
    const style = document.createElement('style');
    style.textContent = '@keyframes lbFadeIn { from { opacity:0 } to { opacity:1 } }';
    document.head.appendChild(style);

    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.style.cssText = `
      max-width: 90vw; max-height: 88vh;
      border-radius: 12px;
      box-shadow: 0 30px 80px rgba(0,0,0,0.5);
      object-fit: contain;
      transform: scale(0.95);
      animation: lbImgIn 0.3s ease forwards;
    `;
    const imgStyle = document.createElement('style');
    imgStyle.textContent = '@keyframes lbImgIn { to { transform: scale(1); } }';
    document.head.appendChild(imgStyle);

    const close = document.createElement('button');
    close.innerHTML = '✕';
    close.setAttribute('aria-label', 'Close image');
    close.style.cssText = `
      position:absolute; top:20px; right:24px;
      color: rgba(247,237,216,0.7); background:none; border:none;
      font-size:1.6rem; cursor:pointer; z-index:1;
      transition: color 0.2s;
    `;
    close.onmouseenter = () => { close.style.color = '#F7EDD8'; };
    close.onmouseleave = () => { close.style.color = 'rgba(247,237,216,0.7)'; };

    lb.appendChild(img);
    lb.appendChild(close);
    document.body.appendChild(lb);
    document.body.style.overflow = 'hidden';

    function destroy() {
      document.body.removeChild(lb);
      document.body.style.overflow = '';
    }

    lb.addEventListener('click', destroy);
    close.addEventListener('click', destroy);
    document.addEventListener('keydown', function handler(e) {
      if (e.key === 'Escape') { destroy(); document.removeEventListener('keydown', handler); }
    });
  }

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img) createLightbox(img.src, img.alt);
    });
    item.setAttribute('tabindex', '0');
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.click(); }
    });
  });

  // PRODUCT CARD TILT EFFECT
  const productCards = document.querySelectorAll('.product-card');

  function isTouchDevice() {
    return window.matchMedia('(hover: none)').matches;
  }

  if (!isTouchDevice()) {
    productCards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top)  / rect.height - 0.5;
        card.style.transform = `translateY(-8px) rotateX(${(-y * 5).toFixed(1)}deg) rotateY(${(x * 5).toFixed(1)}deg)`;
        card.style.boxShadow = `${(-x * 10).toFixed(0)}px ${(-y * 10 + 20).toFixed(0)}px 40px rgba(44,26,14,0.22)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.boxShadow = '';
      });
    });
  }

  // BUTTON RIPPLE EFFECT
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.4;
      ripple.style.cssText = `
        position:absolute; border-radius:50%;
        background:rgba(255,255,255,0.2);
        width:${size}px; height:${size}px;
        left:${e.clientX - rect.left - size/2}px;
        top:${e.clientY - rect.top - size/2}px;
        transform: scale(0); pointer-events:none;
        animation: rippleAnim 0.5s ease-out forwards;
      `;
      const style = document.createElement('style');
      if (!document.getElementById('ripple-style')) {
        style.id = 'ripple-style';
        style.textContent = '@keyframes rippleAnim { to { transform:scale(1); opacity:0; } }';
        document.head.appendChild(style);
      }
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // WHATSAPP FAB — HIDE ON CONTACT SECTION
  const fab = document.querySelector('.ig-fab');
  const contactSection = document.getElementById('contact');

  if (fab && contactSection) {
    const fabObserver = new IntersectionObserver(
      ([entry]) => {
        fab.style.opacity = entry.isIntersecting ? '0' : '1';
        fab.style.pointerEvents = entry.isIntersecting ? 'none' : 'auto';
      },
      { threshold: 0.3 }
    );
    fabObserver.observe(contactSection);
  }

  /* ── 14. NAV OVERLAY (close mobile menu on overlay click) */
  let overlay;

  function toggleOverlay(show) {
    if (show && !overlay) {
      overlay = document.createElement('div');
      overlay.style.cssText = `
        position:fixed; inset:0; z-index:849;
        background:rgba(0,0,0,0.4);
        backdrop-filter:blur(2px);
      `;
      overlay.addEventListener('click', closeMenu);
      document.body.appendChild(overlay);
    } else if (!show && overlay) {
      overlay.remove();
      overlay = null;
    }
  }

  hamburger.addEventListener('click', () => toggleOverlay(menuOpen));
  document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => toggleOverlay(false)));

  // INITIAL CALL
  handleScroll();

})();
