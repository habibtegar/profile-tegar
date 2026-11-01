/**
 * main.js — Habib Tegar Portfolio
 * Handles: Theme Toggle, Navbar, Hamburger, Scroll Spy, Typing Effect, Scroll Reveal, Stats Counter
 */

/* =============================
   0. THEME TOGGLE (Dark / Light Mode)
   ============================= */
(function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const root = document.documentElement;

    function getSavedTheme() {
        return localStorage.getItem('portfolio-theme') || 'dark';
    }

    function applyTheme(theme, animate = false) {
        if (animate) {
            root.classList.add('theme-transition');
        }
        root.setAttribute('data-theme', theme);
        localStorage.setItem('portfolio-theme', theme);

        if (themeToggle) {
            const isLight = theme === 'light';
            themeToggle.setAttribute('aria-label', isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode');
            themeToggle.setAttribute('title', isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode');
        }

        if (animate) {
            window.setTimeout(() => {
                root.classList.remove('theme-transition');
            }, 450);
        }
    }

    // Initialize theme state & sync UI
    const currentTheme = getSavedTheme();
    applyTheme(currentTheme, false);

    // Event listener for toggle button
    if (themeToggle) {
        themeToggle.addEventListener('click', (e) => {
            e.preventDefault();
            const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
            const nextTheme = current === 'light' ? 'dark' : 'light';
            applyTheme(nextTheme, true);
        });
    }
})();

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
                    if (window.lenis) {
                        window.lenis.scrollTo(target, { offset: -(navH - 10) });
                    } else {
                        const top  = target.getBoundingClientRect().top + window.scrollY - navH + 10;
                        window.scrollTo({ top, behavior: 'smooth' });
                    }
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

    const words   = ['Laravel Developer', 'Web Developer', 'Frontend Enthusiast', 'PPLG Student'];
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
    if (typeof gsap !== 'undefined') {
        // High fidelity scroll reveal managed by GSAP + ScrollTrigger in js/animations.js
        return;
    }
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

    if (typeof gsap !== 'undefined') {
        // High-fidelity counter animation is driven by GSAP ScrollTrigger in js/animations.js
        return;
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

/* =============================
   6. SKILLS MARQUEE (Ultra-wide screen seamless loop helper)
   ============================= */
(function initSkillsMarquee() {
    const rows = document.querySelectorAll('.skills-marquee-row');
    if (!rows.length) return;

    // Duplikasi otomatis jika layar sangat lebar (>2200px) agar marquee tidak memiliki celah kosong
    function ensureWideScreenCoverage() {
        if (window.innerWidth > 2200) {
            rows.forEach(row => {
                const groups = row.querySelectorAll('.skills-marquee-group');
                if (groups.length < 3) {
                    const clone = groups[0].cloneNode(true);
                    clone.setAttribute('aria-hidden', 'true');
                    row.appendChild(clone);
                }
            });
        }
    }

    ensureWideScreenCoverage();
    window.addEventListener('resize', ensureWideScreenCoverage, { passive: true });
})();

/* =============================
   7. PRELOADER / MODERN EDITORIAL TYPOGRAPHY PRELOADER
   ============================= */
(function initPreloader() {
    const preloader   = document.getElementById('preloader');
    if (!preloader) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const progressBar = document.getElementById('preloaderBar');
    const percentEl   = document.getElementById('preloaderPercent');
    const statusEl    = document.getElementById('preloaderStatus');

    // Accessibility check: instant reveal if reduced motion requested
    if (prefersReducedMotion) {
        preloader.classList.add('loaded');
        window.__portfolioReady = true;
        window.dispatchEvent(new CustomEvent('portfolio:ready'));
        setTimeout(() => {
            if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
        }, 100);
        return;
    }

    // GSAP Stagger Entrance for Editorial Headline & Metadata
    const chars = preloader.querySelectorAll('.preloader-char');
    const metaTop = preloader.querySelector('.preloader-meta-top');
    const category = preloader.querySelector('.preloader-category');
    const bottomWrap = preloader.querySelector('.preloader-bottom-wrap');

    if (typeof gsap !== 'undefined') {
        if (metaTop) {
            gsap.from(metaTop, {
                y: -14,
                opacity: 0,
                duration: 0.6,
                ease: 'power3.out'
            });
        }

        if (chars.length) {
            gsap.from(chars, {
                yPercent: 125,
                opacity: 0,
                rotateZ: 2,
                stagger: 0.032,
                duration: 0.75,
                ease: 'power4.out',
                delay: 0.05
            });
        }

        if (category) {
            gsap.from(category, {
                opacity: 0,
                y: 10,
                duration: 0.55,
                delay: 0.28,
                ease: 'power2.out'
            });
        }

        if (bottomWrap) {
            gsap.from(bottomWrap, {
                y: 14,
                opacity: 0,
                duration: 0.6,
                ease: 'power3.out'
            });
        }
    }

    let currentPercent = 0;
    let targetPercent  = 88;
    let isWindowLoaded = false;
    let isFinished     = false;
    let isExitStarted  = false;

    const stages = [
        { threshold: 0,   text: "INITIALIZING EDITORIAL SYSTEM" },
        { threshold: 30,  text: "CALIBRATING TECH STACK & ASSETS" },
        { threshold: 65,  text: "PREPARING INTERACTIVE SHOWCASE" },
        { threshold: 90,  text: "PORTFOLIO READY" },
        { threshold: 100, text: "WELCOME" }
    ];

    function updateStatus(val) {
        if (!statusEl) return;
        for (let i = stages.length - 1; i >= 0; i--) {
            if (val >= stages[i].threshold) {
                if (statusEl.textContent !== stages[i].text) {
                    statusEl.textContent = stages[i].text;
                }
                break;
            }
        }
    }

    function setPercent(val) {
        currentPercent = Math.min(100, Math.max(0, val));
        if (progressBar) progressBar.style.width = currentPercent + '%';
        if (percentEl) {
            const formatted = String(Math.round(currentPercent)).padStart(2, '0') + '%';
            percentEl.textContent = formatted;
        }
        updateStatus(currentPercent);
    }

    function triggerCurtainExit() {
        if (isExitStarted) return;
        isExitStarted = true;

        // Dispatch portfolio:ready right as curtain begins to reveal hero
        window.__portfolioReady = true;
        window.dispatchEvent(new CustomEvent('portfolio:ready'));

        if (typeof gsap !== 'undefined') {
            const exitTl = gsap.timeline({
                onComplete: () => {
                    preloader.classList.add('loaded');
                    setTimeout(() => {
                        if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
                    }, 400);
                }
            });

            // Headline characters lift slightly
            if (chars.length) {
                exitTl.to(chars, {
                    yPercent: -22,
                    opacity: 0.6,
                    duration: 0.35,
                    ease: 'power2.in'
                }, 0);
            }

            // Smooth upward clip-path curtain wipe
            exitTl.to(preloader, {
                clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
                duration: 0.82,
                ease: 'power4.inOut'
            }, 0.08);
        } else {
            preloader.classList.add('loaded');
            setTimeout(() => {
                if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
            }, 850);
        }
    }

    const timer = setInterval(() => {
        if (isFinished) {
            clearInterval(timer);
            return;
        }

        if (!isWindowLoaded) {
            // Progressive smooth increase towards ~88% while awaiting page load
            if (currentPercent < targetPercent) {
                const step = (targetPercent - currentPercent) * 0.12 + 0.8;
                setPercent(currentPercent + step);
            }
        } else {
            // Assets ready: swiftly accelerate to 100% without artificial drag
            if (currentPercent < 100) {
                currentPercent += 5.5;
                setPercent(currentPercent);
            } else {
                setPercent(100);
                isFinished = true;
                clearInterval(timer);

                // Brief pause at 100% (160ms) for high-end perception, then trigger curtain wipe
                setTimeout(triggerCurtainExit, 160);
            }
        }
    }, 22);

    function onAssetsLoaded() {
        isWindowLoaded = true;
    }

    if (document.readyState === 'complete') {
        onAssetsLoaded();
    } else {
        window.addEventListener('load', onAssetsLoaded);
    }

    // Safety timeout: prevents the page from remaining hidden if any external CDN hangs
    setTimeout(() => {
        onAssetsLoaded();
        setTimeout(() => {
            if (!isFinished) {
                setPercent(100);
                isFinished = true;
                clearInterval(timer);
                triggerCurtainExit();
            }
        }, 150);
    }, 2200);
})();

