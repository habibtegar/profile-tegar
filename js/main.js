/**
 * main.js — Habib Tegar Portfolio 2025
 * Single Page — Handles: Navbar, Hamburger, Scroll Spy, Particles, Typing, AOS, Counter, Skill Bars
 */

/* =============================
   1. NAVBAR — scroll, hamburger & scroll-spy
   ============================= */
(function initNavbar() {
    const navbar    = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks  = document.getElementById('navLinks');
    const overlay   = document.getElementById('navOverlay');

    if (!navbar) return;

    /* --- Sticky navbar on scroll --- */
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
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
                    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
                    const top  = target.getBoundingClientRect().top + window.scrollY - navH;
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

    /* --- Close menu on window resize (if wider than breakpoint) --- */
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
        const navH    = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
        const scrollY = window.scrollY + navH + 80;

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
    onScroll(); // run on load
})();

/* =============================
   3. PARTICLE CANVAS BACKGROUND
   ============================= */
(function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animFrame;

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createParticle() {
        return {
            x:     Math.random() * canvas.width,
            y:     Math.random() * canvas.height,
            r:     Math.random() * 1.5 + 0.3,
            dx:    (Math.random() - 0.5) * 0.4,
            dy:    (Math.random() - 0.5) * 0.4,
            alpha: Math.random() * 0.5 + 0.1,
            pulse: Math.random() * Math.PI * 2
        };
    }

    function init() {
        resize();
        const isMobile = window.innerWidth < 768;
        const count = isMobile
            ? Math.min(Math.floor(window.innerWidth / 20), 50)
            : Math.min(Math.floor(window.innerWidth / 9), 140);
        particles = Array.from({ length: count }, createParticle);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            p.x += p.dx;
            p.y += p.dy;
            p.pulse += 0.015;

            if (p.x < 0)             p.x = canvas.width;
            if (p.x > canvas.width)  p.x = 0;
            if (p.y < 0)             p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            const alpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 217, 255, ${alpha})`;
            ctx.fill();
        });

        if (window.innerWidth >= 480) {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx   = particles[i].x - particles[j].x;
                    const dy   = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(0, 217, 255, ${0.07 * (1 - dist / 100)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        animFrame = requestAnimationFrame(draw);
    }

    init();
    draw();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(init, 200);
    }, { passive: true });
})();

/* =============================
   4. TYPING ANIMATION
   ============================= */
(function initTyping() {
    const el = document.getElementById('typedText');
    if (!el) return;

    const words   = ['Frontend Developer', 'Web Developer', 'UI Enthusiast', 'PHP Developer'];
    let wi        = 0;
    let ci        = 0;
    let deleting  = false;

    function type() {
        const word    = words[wi];
        const display = deleting ? word.slice(0, ci - 1) : word.slice(0, ci + 1);
        el.textContent = display;

        if (!deleting) ci++;
        else           ci--;

        let delay = deleting ? 55 : 100;

        if (!deleting && ci === word.length + 1) {
            deleting = true;
            delay    = 1800;
        } else if (deleting && ci === 0) {
            deleting = false;
            wi = (wi + 1) % words.length;
            delay = 400;
        }

        setTimeout(type, delay);
    }

    setTimeout(type, 800);
})();

/* =============================
   5. SCROLL REVEAL (AOS-like)
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
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    elements.forEach(el => observer.observe(el));
})();

/* =============================
   6. SKILL BAR ANIMATION
   ============================= */
(function initSkillBars() {
    const fills = document.querySelectorAll('.tech-bar-fill, .skill-fill');
    if (!fills.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el    = entry.target;
                const width = el.dataset.width || '0';
                setTimeout(() => { el.style.width = width + '%'; }, 200);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.25 });

    fills.forEach(el => observer.observe(el));
})();

/* =============================
   7. COUNTER ANIMATION (About stats)
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

                const step   = Math.max(1, Math.ceil(1500 / (target * 10)));
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
