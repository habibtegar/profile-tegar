/**
 * animations.js — Habib Tegar Portfolio
 * Advanced Scroll Animation using GSAP 3, ScrollTrigger, and Lenis Smooth Scroll
 * 
 * Implements:
 * 1. Synchronized Lenis Smooth Scroll & GSAP ScrollTrigger
 * 2. Preloader-synchronized Hero entrance with staggered character reveal
 * 3. About section entrance: photo reveal, GSAP stats count-up & directory stagger
 * 4. Skills section reveal (preserving continuous CSS infinite logo marquee)
 * 5. Projects section browser frame reveal, metadata stagger & image parallax scrub
 * 6. Contact section heading reveal, info stagger & form controls entrance
 * 7. Prefers-reduced-motion accessibility & responsive mobile optimization
 */

(function () {
    'use strict';

    // 0. Prefers-reduced-motion check
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Verify GSAP and ScrollTrigger availability
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('[Animations] GSAP or ScrollTrigger not loaded. Skipping advanced animations.');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Helper: Navigation bar height
    function getNavHeight() {
        return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 72;
    }

    // Helper: Split text into characters wrapped in mask spans
    function splitToChars(element) {
        if (!element || element.dataset.splitCharsApplied) return [];
        element.dataset.splitCharsApplied = 'true';

        const text = element.textContent.trim();
        element.textContent = '';
        const charInners = [];

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const wrap = document.createElement('span');
            wrap.className = 'char-wrap';

            const inner = document.createElement('span');
            inner.className = 'char-inner';
            inner.textContent = char;

            wrap.appendChild(inner);
            element.appendChild(wrap);
            charInners.push(inner);
        }

        return charInners;
    }

    // Helper: Split paragraph or title into words wrapped in spans
    function splitToWords(element, wordClass = 'word-inner') {
        if (!element || element.dataset.splitWordsApplied) return [];
        element.dataset.splitWordsApplied = 'true';

        const text = element.textContent.trim();
        const words = text.split(/\s+/);
        element.textContent = '';
        const wordInners = [];

        words.forEach((word, index) => {
            const wrap = document.createElement('span');
            wrap.className = 'word-wrap';

            const inner = document.createElement('span');
            inner.className = wordClass;
            inner.textContent = word;

            wrap.appendChild(inner);
            element.appendChild(wrap);
            wordInners.push(inner);

            if (index < words.length - 1) {
                element.appendChild(document.createTextNode(' '));
            }
        });

        return wordInners;
    }

    // Helper: Split text in-place into spans (inline for scrub reveal)
    function splitToInlineWords(element, wordClass = 'about-word') {
        if (!element || element.dataset.splitInlineApplied) return [];
        element.dataset.splitInlineApplied = 'true';

        const text = element.textContent.trim();
        const words = text.split(/\s+/);
        element.textContent = '';
        const wordSpans = [];

        words.forEach((word, index) => {
            const span = document.createElement('span');
            span.className = wordClass;
            span.textContent = word;
            element.appendChild(span);
            wordSpans.push(span);

            if (index < words.length - 1) {
                element.appendChild(document.createTextNode(' '));
            }
        });

        return wordSpans;
    }

    // 1. LENIS SMOOTH SCROLL INTEGRATION
    let lenis = null;
    if (typeof Lenis !== 'undefined' && !prefersReducedMotion) {
        lenis = new Lenis({
            duration: 1.15,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 0.9,
            touchMultiplier: 1.4,
            infinite: false
        });

        window.lenis = lenis;

        // Synchronize Lenis scroll with GSAP ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);

        // Add Lenis to GSAP ticker for frame-locked updates
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);

        // Global anchor scroll handler via Lenis
        document.addEventListener('click', (e) => {
            const anchor = e.target.closest('a[href^="#"]');
            if (!anchor) return;

            const href = anchor.getAttribute('href');
            if (href === '#' || !href) return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const navH = getNavHeight();
                lenis.scrollTo(target, { offset: -(navH - 10) });
            }
        });
    }

    // If reduced motion is requested, reveal all elements immediately and exit
    if (prefersReducedMotion) {
        document.querySelectorAll('[data-aos]').forEach((el) => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
        const statNumbers = document.querySelectorAll('.editorial-stats-strip .stat-number[data-count]');
        statNumbers.forEach((el) => {
            const count = el.getAttribute('data-count') || '0';
            el.textContent = count + '+';
        });
        return;
    }

    // 2. HERO SECTION ANIMATION
    let heroAnimated = false;
    function initHeroAnimation() {
        if (heroAnimated) return;
        heroAnimated = true;

        const nameLines = document.querySelectorAll('.hero-name-line');
        const charElements = [];

        nameLines.forEach((line) => {
            const chars = splitToChars(line);
            charElements.push(...chars);
        });

        const metaBar = document.querySelector('.hero-meta-bar');
        const roleEditorial = document.querySelector('.hero-role-editorial');
        const heroDesc = document.querySelector('.hero-desc');
        const ctaButtons = document.querySelectorAll('.hero-actions .btn');
        const socialLinks = document.querySelectorAll('.hero-social .social-link');
        const portraitFrame = document.querySelector('.editorial-portrait-frame');
        const portraitImg = document.querySelector('.editorial-portrait');

        // Master Hero Entrance Timeline
        const heroTl = gsap.timeline({
            defaults: { ease: 'power3.out' }
        });

        // 1. Meta status bar
        if (metaBar) {
            heroTl.from(metaBar, {
                y: -18,
                opacity: 0,
                duration: 0.65
            });
        }

        // 2. Headline Character Reveal
        if (charElements.length) {
            heroTl.from(charElements, {
                yPercent: 115,
                rotateZ: 4,
                opacity: 0,
                duration: 0.85,
                stagger: 0.025,
                ease: 'power4.out'
            }, metaBar ? '-=0.4' : 0);
        }

        // 3. Editorial Role Badge
        if (roleEditorial) {
            heroTl.from(roleEditorial, {
                y: 18,
                opacity: 0,
                duration: 0.55
            }, '-=0.55');
        }

        // 4. Hero Narrative Description
        if (heroDesc) {
            heroTl.from(heroDesc, {
                y: 20,
                opacity: 0,
                duration: 0.65
            }, '-=0.4');
        }

        // 5. CTA Action Buttons (Stagger)
        if (ctaButtons.length) {
            heroTl.from(ctaButtons, {
                y: 20,
                opacity: 0,
                stagger: 0.1,
                duration: 0.55
            }, '-=0.35');
        }

        // 6. Social Links (Stagger Pop)
        if (socialLinks.length) {
            heroTl.from(socialLinks, {
                scale: 0.75,
                opacity: 0,
                stagger: 0.06,
                duration: 0.45,
                ease: 'back.out(1.8)'
            }, '-=0.3');
        }

        // 7. Right Editorial Portrait Frame & Image
        if (portraitFrame) {
            heroTl.from(portraitFrame, {
                y: 35,
                scale: 0.96,
                opacity: 0,
                duration: 0.95,
                ease: 'power3.out'
            }, '-=0.8');
        }

        if (portraitImg) {
            heroTl.from(portraitImg, {
                scale: 1.08,
                duration: 1.2,
                ease: 'power2.out'
            }, '-=0.95');
        }
    }

    // Synchronize Hero Entrance with Preloader completion
    if (window.__portfolioReady || !document.getElementById('preloader')) {
        setTimeout(initHeroAnimation, 120);
    } else {
        window.addEventListener('portfolio:ready', () => {
            setTimeout(initHeroAnimation, 100);
        });
        // Safety timeout fallback
        setTimeout(initHeroAnimation, 4200);
    }

    // 3. SECTION HEADERS REVEAL
    const sectionHeaders = document.querySelectorAll('.section-header');
    sectionHeaders.forEach((header) => {
        const tag = header.querySelector('.editorial-section-tag');
        const title = header.querySelector('.section-title');
        const subtitle = header.querySelector('.section-subtitle');

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: header,
                start: 'top 86%',
                toggleActions: 'play none none none'
            }
        });

        if (tag) tl.from(tag, { y: 15, opacity: 0, duration: 0.5, ease: 'power2.out' });
        if (title) tl.from(title, { y: 22, opacity: 0, duration: 0.65, ease: 'power3.out' }, '-=0.35');
        if (subtitle) tl.from(subtitle, { y: 18, opacity: 0, duration: 0.55, ease: 'power2.out' }, '-=0.4');
    });

    // 4. ABOUT SECTION ANIMATION
    // 4A. Clean Entrance Reveal for About Left Column (Photo & Stats Strip)
    const aboutLeft = document.querySelector('.about-left-col');
    if (aboutLeft) {
        const photo = aboutLeft.querySelector('.about-photo-wrapper');
        const statsStrip = aboutLeft.querySelector('.editorial-stats-strip');

        const leftTl = gsap.timeline({
            scrollTrigger: {
                trigger: aboutLeft,
                start: 'top 82%',
                toggleActions: 'play none none none'
            }
        });

        if (photo) {
            leftTl.from(photo, {
                y: 32,
                scale: 0.96,
                opacity: 0,
                duration: 0.85,
                ease: 'power3.out'
            });
        }

        if (statsStrip) {
            leftTl.from(statsStrip, {
                y: 20,
                opacity: 0,
                duration: 0.65,
                ease: 'power2.out'
            }, '-=0.45');
        }
    }

    // 4B. Subtle Counting Effect on Statistics (Synced with ScrollTrigger)
    const statNumbers = document.querySelectorAll('.editorial-stats-strip .stat-number[data-count]');
    if (statNumbers.length) {
        statNumbers.forEach((statEl) => {
            const targetVal = parseInt(statEl.getAttribute('data-count'), 10) || 0;
            const counterObj = { val: 0 };

            gsap.to(counterObj, {
                val: targetVal,
                duration: 1.5,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.editorial-stats-strip',
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                onUpdate: () => {
                    statEl.textContent = Math.round(counterObj.val) + '+';
                }
            });
        });
    }

    // 4C. Word-by-word Scrub Reveal on Lead Paragraph
    const aboutLead = document.querySelector('.about-text-lead');
    if (aboutLead) {
        const wordSpans = splitToInlineWords(aboutLead, 'about-word');
        if (wordSpans.length) {
            gsap.fromTo(
                wordSpans,
                { opacity: 0.2, color: 'var(--text-muted)' },
                {
                    opacity: 1,
                    color: 'var(--text-primary)',
                    stagger: 0.05,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: aboutLead,
                        start: 'top 82%',
                        end: 'bottom 45%',
                        scrub: 0.75
                    }
                }
            );
        }
    }

    // 4D. Secondary Biography Text Entrance
    const aboutText = document.querySelector('.about-lead-card .about-text');
    if (aboutText) {
        gsap.from(aboutText, {
            scrollTrigger: {
                trigger: aboutText,
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            y: 20,
            opacity: 0,
            duration: 0.65,
            ease: 'power2.out'
        });
    }

    // 4E. About Directory List Stagger Reveal
    const directoryRows = document.querySelectorAll('.about-directory-list .directory-row');
    if (directoryRows.length) {
        gsap.from(directoryRows, {
            scrollTrigger: {
                trigger: '.about-directory-list',
                start: 'top 84%',
                toggleActions: 'play none none none'
            },
            x: 24,
            opacity: 0,
            stagger: 0.09,
            duration: 0.65,
            ease: 'power2.out'
        });
    }

    // 4F. About Skill Pills Stagger Pop Reveal
    const skillPills = document.querySelectorAll('.skills-pills .skill-pill');
    if (skillPills.length) {
        gsap.from(skillPills, {
            scrollTrigger: {
                trigger: '.skills-pills',
                start: 'top 86%',
                toggleActions: 'play none none none'
            },
            scale: 0.88,
            opacity: 0,
            stagger: 0.035,
            duration: 0.45,
            ease: 'back.out(1.5)'
        });
    }

    // 4G. About CTA Buttons Entrance
    const aboutActions = document.querySelectorAll('.about-actions .btn');
    if (aboutActions.length) {
        gsap.from(aboutActions, {
            scrollTrigger: {
                trigger: '.about-actions',
                start: 'top 88%',
                toggleActions: 'play none none none'
            },
            y: 18,
            opacity: 0,
            stagger: 0.1,
            duration: 0.55,
            ease: 'power2.out'
        });
    }

    // 5. SKILLS SECTION ANIMATION
    // 5A. Entrance reveal for the animated logo marquee wrapper (Continuous CSS marquee is fully preserved)
    const marqueeWrapper = document.querySelector('.skills-marquee-wrapper');
    if (marqueeWrapper) {
        gsap.from(marqueeWrapper, {
            scrollTrigger: {
                trigger: marqueeWrapper,
                start: 'top 88%',
                toggleActions: 'play none none none'
            },
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out'
        });
    }

    // 5B. Reveal for Tech Competency Matrix Columns (Smooth Stagger without child opacity conflicts)
    const matrixCols = document.querySelectorAll('.skills-matrix-grid .matrix-col');
    if (matrixCols.length) {
        gsap.from(matrixCols, {
            scrollTrigger: {
                trigger: '.skills-matrix-grid',
                start: 'top 82%',
                toggleActions: 'play none none none'
            },
            y: 40,
            opacity: 0,
            stagger: 0.16,
            duration: 0.8,
            ease: 'power3.out'
        });
    }

    // 6. PROJECTS SECTION ANIMATION
    function initProjectsAnimation() {
        const projectCards = document.querySelectorAll('.projects-grid .project-card');
        if (!projectCards.length) return;

        projectCards.forEach((card) => {
            const frame = card.querySelector('.project-browser-frame');
            const img = card.querySelector('.project-image-wrap img');
            const contentItems = card.querySelectorAll(
                '.project-header-meta, .project-title, .project-desc, .project-tech-stack, .project-actions'
            );

            // Card Entrance Timeline
            const cardTl = gsap.timeline({
                scrollTrigger: {
                    trigger: card,
                    start: 'top 84%',
                    toggleActions: 'play none none none'
                }
            });

            if (frame) {
                cardTl.from(frame, {
                    y: 36,
                    scale: 0.95,
                    opacity: 0,
                    duration: 0.85,
                    ease: 'power3.out'
                });
            }

            if (contentItems.length) {
                cardTl.from(
                    contentItems,
                    {
                        y: 22,
                        opacity: 0,
                        stagger: 0.08,
                        duration: 0.6,
                        ease: 'power2.out'
                    },
                    frame ? '-=0.5' : 0
                );
            }

            // Subtle Parallax Scrub on Preview Image
            if (img) {
                gsap.fromTo(
                    img,
                    { yPercent: -6 },
                    {
                        yPercent: 6,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: card,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: 0.6
                        }
                    }
                );
            }
        });
    }

    initProjectsAnimation();

    // 7. CONTACT SECTION ANIMATION
    // 7A. Word Reveal on Contact Heading
    const contactTitle = document.querySelector('.contact-section .section-title');
    if (contactTitle) {
        const contactWords = splitToWords(contactTitle, 'word-inner');
        if (contactWords.length) {
            gsap.from(contactWords, {
                scrollTrigger: {
                    trigger: contactTitle,
                    start: 'top 86%',
                    toggleActions: 'play none none none'
                },
                yPercent: 110,
                opacity: 0,
                stagger: 0.08,
                duration: 0.75,
                ease: 'power4.out'
            });
        }
    }

    // 7B. Contact Directory Items Stagger Reveal
    const contactInfoItems = document.querySelectorAll('.contact-info-col .info-item');
    if (contactInfoItems.length) {
        gsap.from(contactInfoItems, {
            scrollTrigger: {
                trigger: '.contact-info-col',
                start: 'top 82%',
                toggleActions: 'play none none none'
            },
            x: -24,
            opacity: 0,
            stagger: 0.12,
            duration: 0.65,
            ease: 'power2.out'
        });
    }

    // 7C. Social Directory Cards Stagger Reveal
    const socialDirCards = document.querySelectorAll('.social-directory-grid .social-dir-card');
    if (socialDirCards.length) {
        gsap.from(socialDirCards, {
            scrollTrigger: {
                trigger: '.social-directory-grid',
                start: 'top 86%',
                toggleActions: 'play none none none'
            },
            y: 20,
            opacity: 0,
            stagger: 0.08,
            duration: 0.55,
            ease: 'power2.out'
        });
    }

    // 7D. Contact Form Card Entrance Reveal (Parent tween ensures submit button is never hidden)
    const formCard = document.querySelector('.contact-form-card');
    if (formCard) {
        gsap.from(formCard, {
            scrollTrigger: {
                trigger: '.contact-form-col',
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            y: 35,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out'
        });
    }

    // 8. RESIZE & REFRESH HANDLER
    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            ScrollTrigger.refresh();
        }, 200);
    });

    // Refresh ScrollTrigger when images are fully loaded
    window.addEventListener('load', () => {
        ScrollTrigger.refresh();
    });

})();
