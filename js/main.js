/**
 * main.js — Habib Tegar Portfolio
 * Handles: Navbar, Hamburger, Scroll Spy, Typing Effect, Scroll Reveal, Stats Counter
 */

/* =============================
   1. NAVBAR — scroll, hamburger & smooth scroll
   ============================= */
(function initNavbar() {
    const navbar    = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks  = document.getElementById('navLinks');
    const overlay   = document.getElementById('navOverlay');

    if (!navbar) return;

    /* --- Sticky navbar on scroll --- */
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });

    if (!hamburger || !navLinks) return;

    /* --- Open / Close helpers --- */
    function openMenu() {
        hamburger.classList.add('open');
        navLinks.classList.add('open');
        if (overlay) overlay.classList.add('show');
        hamburger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
        if (overlay) overlay.classList.remove('show');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    /* --- Hamburger toggle --- */
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = hamburger.classList.contains('open');
        isOpen ? closeMenu() : openMenu();
    });

    /* --- Close on overlay click --- */
    if (overlay) overlay.addEventListener('click', closeMenu);

    /* --- Close on nav link click (smooth scroll to section) --- */
    navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    closeMenu();
                    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
                    const top  = target.getBoundingClientRect().top + window.scrollY - navH + 10;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            } else {
                closeMenu();
            }
        });
    });

    /* --- Close on Escape key --- */
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });

    /* --- Close menu on window resize --- */
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) closeMenu();
    }, { passive: true });

    /* --- Prevent nav-links panel click from closing --- */
    navLinks.addEventListener('click', (e) => e.stopPropagation());
})();

/* =============================
   2. SCROLL SPY — highlight active nav link
   ============================= */
(function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const links    = document.querySelectorAll('.nav-link[data-section]');
    if (!sections.length || !links.length) return;

    function onScroll() {
        const navH    = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
        const scrollY = window.scrollY + navH + 60;

        let current = '';
        sections.forEach(section => {
            if (scrollY >= section.offsetTop) {
                current = section.id;
            }
        });

        links.forEach(link => {
            link.classList.toggle('active', link.dataset.section === current);
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();

/* =============================
   3. TYPING ANIMATION (Hero Role)
   ============================= */
(function initTyping() {
    const el = document.getElementById('typedText');
    if (!el) return;

    const words   = ['Web Developer', 'PPLG Student', 'Frontend Enthusiast', 'Laravel Learner'];
    let wi        = 0;
    let ci        = 0;
    let deleting  = false;

    function type() {
        const word    = words[wi];
        const display = deleting ? word.slice(0, ci - 1) : word.slice(0, ci + 1);
        el.textContent = display;

        if (!deleting) ci++;
        else           ci--;

        let delay = deleting ? 45 : 90;

        if (!deleting && ci === word.length + 1) {
            deleting = true;
            delay    = 2000;
        } else if (deleting && ci === 0) {
            deleting = false;
            wi = (wi + 1) % words.length;
            delay = 350;
        }

        setTimeout(type, delay);
    }

    setTimeout(type, 600);
})();

/* =============================
   4. SCROLL REVEAL (IntersectionObserver)
   ============================= */
(function initScrollReveal() {
    const elements = document.querySelectorAll('[data-aos]');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.aosDelay;
                if (delay) {
                    setTimeout(() => entry.target.classList.add('aos-animate'), parseInt(delay));
                } else {
                    entry.target.classList.add('aos-animate');
                }
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => observer.observe(el));
})();

/* =============================
   5. COUNTER ANIMATION (About stats)
   ============================= */
(async function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    try {
        const projectCounter = document.getElementById('projects-done-count');
        if (projectCounter && typeof projectsData !== 'undefined') {
            projectCounter.setAttribute('data-count', projectsData.length);
        }
    } catch (e) {
        console.error("Failed to update projects count:", e);
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el     = entry.target;
                const target = parseInt(el.getAttribute('data-count')) || 0;

                if (target === 0) {
                    el.textContent = '0+';
                    observer.unobserve(el);
                    return;
                }

                const step   = Math.max(1, Math.ceil(1200 / (target * 10)));
                let current  = 0;

                const timer = setInterval(() => {
                    current++;
                    el.textContent = current + '+';
                    if (current >= target) {
                        clearInterval(timer);
                        el.textContent = target + '+';
                    }
                }, step);

                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
})();
