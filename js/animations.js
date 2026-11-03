/**
 * animations.js — Habib Tegar Portfolio
 * Advanced Scroll-Reverse & Realtime Scrub Animations using GSAP 3, ScrollTrigger, and Lenis Smooth Scroll
 * 
 * Implements:
 * 1. Synchronized Lenis Smooth Scroll & GSAP ScrollTrigger
 * 2. Preloader-synchronized Hero entrance + bidirectional Hero scroll-reverse scrub
 * 3. Bidirectional Section Headers scrub (Tag -> Title -> Subtitle)
 * 4. About Section scroll-reverse scrub (Portrait, Stats counter, Lead words, Directory list, Skill pills, CTAs)
 * 5. Skills Section scroll-reverse scrub (Logo marquees preserved, Matrix columns staggered scrub)
 * 6. Projects Section scroll-reverse scrub (Browser frames, Metadata, Title, Desc, Chips, Actions, Image Parallax)
 * 7. Contact Section scroll-reverse scrub (Panel headers, Info items, Social directory, Form controls)
 * 8. Prefers-reduced-motion accessibility & mobile-responsive optimization
 * 9. Zero layout shift, no hidden reading elements, and 100% Lenis / preloader integration
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
        document.querySelectorAll('[data-aos], .matrix-col, .project-card, .projects-slider-container, .section-header, .about-word, .hero-name-line, .info-item, .social-dir-card').forEach((el) => {
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

    // 2. HERO SECTION ANIMATION & SCROLL-REVERSE SCRUB
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

        // Master Hero Entrance Timeline (Triggered once on preloader exit / portfolio:ready)
        const heroTl = gsap.timeline({
            defaults: { ease: 'power3.out' }
        });

        // 1. Meta status bar
        if (metaBar) {
            heroTl.from(metaBar, {
                y: -18,
                opacity: 0,
                duration: 0.65,
                clearProps: 'opacity,transform'
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
                duration: 0.55,
                clearProps: 'opacity,transform'
            }, '-=0.55');
        }

        // 4. Hero Narrative Description
        if (heroDesc) {
            heroTl.from(heroDesc, {
                y: 20,
                opacity: 0,
                duration: 0.65,
                clearProps: 'opacity,transform'
            }, '-=0.4');
        }

        // 5. CTA Action Buttons (Stagger)
        if (ctaButtons.length) {
            heroTl.from(ctaButtons, {
                y: 20,
                opacity: 0,
                stagger: 0.1,
                duration: 0.55,
                clearProps: 'all'
            }, '-=0.35');
        }

        // 6. Social Links (Stagger Pop)
        if (socialLinks.length) {
            heroTl.from(socialLinks, {
                scale: 0.75,
                opacity: 0,
                stagger: 0.06,
                duration: 0.45,
                ease: 'back.out(1.8)',
                clearProps: 'all'
            }, '-=0.3');
        }

        // 7. Right Editorial Portrait Frame & Image
        if (portraitFrame) {
            heroTl.from(portraitFrame, {
                y: 35,
                scale: 0.96,
                opacity: 0,
                duration: 0.95,
                ease: 'power3.out',
                clearProps: 'transform,opacity'
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

    // 3. UNIVERSAL SECTION HEADERS SCROLL-REVERSE SCRUB
    const sectionHeaders = document.querySelectorAll('.section-header');
    sectionHeaders.forEach((header) => {
        const tag = header.querySelector('.editorial-section-tag');
        const title = header.querySelector('.section-title');
        const subtitle = header.querySelector('.section-subtitle');

        const headerTl = gsap.timeline({
            scrollTrigger: {
                trigger: header,
                start: 'top 95%',
                end: 'top 70%',
                scrub: 0.8,
                invalidateOnRefresh: true
            }
        });

        if (tag) {
            headerTl.fromTo(tag,
                { opacity: 0, y: 18 },
                { opacity: 1, y: 0, ease: 'power1.out', duration: 0.25 },
                0
            );
        }
        if (title) {
            headerTl.fromTo(title,
                { opacity: 0, y: 26 },
                { opacity: 1, y: 0, ease: 'power1.out', duration: 0.35 },
                0.06
            );
        }
        if (subtitle) {
            headerTl.fromTo(subtitle,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, ease: 'power1.out', duration: 0.3 },
                0.12
            );
        }
    });

    // 4. ABOUT SECTION SCROLL-REVERSE SCRUB
    // 4A. Left Column (Portrait & Stats Strip)
    const aboutPhoto = document.querySelector('.about-photo-wrapper');
    if (aboutPhoto) {
        gsap.fromTo(aboutPhoto,
            { opacity: 0, y: 32, scale: 0.96 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                ease: 'power1.out',
                scrollTrigger: {
                    trigger: aboutPhoto,
                    start: 'top 93%',
                    end: 'top 68%',
                    scrub: 0.8,
                    invalidateOnRefresh: true
                }
            }
        );
    }

    const statsStrip = document.querySelector('.editorial-stats-strip');
    if (statsStrip) {
        const statItems = statsStrip.querySelectorAll('.stat-item');
        gsap.fromTo(statItems.length ? statItems : statsStrip,
            { opacity: 0, y: 24 },
            {
                opacity: 1,
                y: 0,
                stagger: 0.08,
                ease: 'power1.out',
                scrollTrigger: {
                    trigger: statsStrip,
                    start: 'top 94%',
                    end: 'top 70%',
                    scrub: 0.8,
                    invalidateOnRefresh: true
                }
            }
        );
    }

    // 4B. Subtle Counting Effect on Statistics (Bidirectional ScrollTrigger)
    const statNumbers = document.querySelectorAll('.editorial-stats-strip .stat-number[data-count]');
    if (statNumbers.length) {
        statNumbers.forEach((statEl) => {
            const targetVal = parseInt(statEl.getAttribute('data-count'), 10) || 0;
            const counterObj = { val: 0 };

            gsap.to(counterObj, {
                val: targetVal,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.editorial-stats-strip',
                    start: 'top 94%',
                    end: 'top 68%',
                    scrub: 0.8
                },
                onUpdate: () => {
                    statEl.textContent = Math.round(counterObj.val) + '+';
                }
            });
        });
    }

    // 4C. About Lead Card & Word-by-word Scrub
    const aboutLeadCard = document.querySelector('.about-lead-card');
    if (aboutLeadCard) {
        gsap.fromTo(aboutLeadCard,
            { opacity: 0, y: 28 },
            {
                opacity: 1,
                y: 0,
                ease: 'power1.out',
                scrollTrigger: {
                    trigger: aboutLeadCard,
                    start: 'top 93%',
                    end: 'top 70%',
                    scrub: 0.8,
                    invalidateOnRefresh: true
                }
            }
        );
    }

    const aboutLead = document.querySelector('.about-text-lead');
    if (aboutLead) {
        const wordSpans = splitToInlineWords(aboutLead, 'about-word');
        if (wordSpans.length) {
            gsap.fromTo(
                wordSpans,
                { opacity: 0.25, color: 'var(--text-muted)' },
                {
                    opacity: 1,
                    color: 'var(--text-primary)',
                    stagger: 0.04,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: aboutLead,
                        start: 'top 88%',
                        end: 'bottom 45%',
                        scrub: 0.75,
                        invalidateOnRefresh: true
                    }
                }
            );
        }
    }

    // 4D. Secondary Biography Text Entrance
    const aboutBioText = document.querySelector('.about-lead-card .about-text');
    if (aboutBioText) {
        gsap.fromTo(aboutBioText,
            { opacity: 0, y: 22 },
            {
                opacity: 1,
                y: 0,
                ease: 'power1.out',
                scrollTrigger: {
                    trigger: aboutBioText,
                    start: 'top 93%',
                    end: 'top 70%',
                    scrub: 0.8,
                    invalidateOnRefresh: true
                }
            }
        );
    }

    // 4E. Directory List Stagger Scrub
    const directoryList = document.querySelector('.about-directory-list');
    if (directoryList) {
        const directoryRows = directoryList.querySelectorAll('.directory-row');
        if (directoryRows.length) {
            gsap.fromTo(directoryRows,
                { opacity: 0, x: 26 },
                {
                    opacity: 1,
                    x: 0,
                    stagger: 0.08,
                    ease: 'power1.out',
                    scrollTrigger: {
                        trigger: directoryList,
                        start: 'top 92%',
                        end: 'top 66%',
                        scrub: 0.8,
                        invalidateOnRefresh: true
                    }
                }
            );
        }
    }

    // 4F. Skills Pills Stagger Pop Scrub
    const skillsPills = document.querySelector('.skills-pills');
    if (skillsPills) {
        const pills = skillsPills.querySelectorAll('.skill-pill');
        if (pills.length) {
            gsap.fromTo(pills,
                { opacity: 0, scale: 0.88, y: 15 },
                {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    stagger: 0.03,
                    ease: 'power1.out',
                    scrollTrigger: {
                        trigger: skillsPills,
                        start: 'top 94%',
                        end: 'top 72%',
                        scrub: 0.8,
                        invalidateOnRefresh: true
                    }
                }
            );
        }
    }

    // 4G. About Action Buttons Scrub
    const aboutActions = document.querySelector('.about-actions');
    if (aboutActions) {
        const actionBtns = aboutActions.querySelectorAll('.btn');
        if (actionBtns.length) {
            gsap.fromTo(actionBtns,
                { opacity: 0, y: 18 },
                {
                    opacity: 1,
                    y: 0,
                    stagger: 0.08,
                    ease: 'power1.out',
                    scrollTrigger: {
                        trigger: aboutActions,
                        start: 'top 95%',
                        end: 'top 74%',
                        scrub: 0.8,
                        invalidateOnRefresh: true
                    }
                }
            );
        }
    }

    // 5. SKILLS SECTION SCROLL-REVERSE SCRUB
    // 5A. Continuous logo marquee wrapper scrub (preserves infinite marquee loop)
    const marqueeWrapper = document.querySelector('.skills-marquee-wrapper');
    if (marqueeWrapper) {
        gsap.fromTo(marqueeWrapper,
            { opacity: 0, y: 28 },
            {
                opacity: 1,
                y: 0,
                ease: 'power1.out',
                scrollTrigger: {
                    trigger: marqueeWrapper,
                    start: 'top 94%',
                    end: 'top 72%',
                    scrub: 0.8,
                    invalidateOnRefresh: true
                }
            }
        );
    }

    // 5B. Editorial Tech Matrix (Flat Horizontal Alignment + Stagger Scrub)
    const matrixGrid = document.querySelector('.skills-matrix-grid');
    if (matrixGrid) {
        const matrixCols = matrixGrid.querySelectorAll('.matrix-col');
        // Ensure all columns start with clean resets
        matrixCols.forEach((col) => {
            col.style.transform = 'none';
            col.style.marginTop = '0';
        });

        const matrixTl = gsap.timeline({
            scrollTrigger: {
                trigger: matrixGrid,
                start: 'top 92%',
                end: 'top 65%',
                scrub: 0.8,
                invalidateOnRefresh: true
            }
        });

        matrixTl.fromTo(matrixCols,
            { opacity: 0, y: 32 },
            {
                opacity: 1,
                y: 0,
                stagger: 0.12,
                ease: 'power1.out'
            }
        );
    }

    // 6. PROJECTS SECTION SCROLL-REVERSE SCRUB (Horizontal Slider Container Integration)
    function initProjectsAnimation() {
        const sliderContainer = document.querySelector('.projects-slider-container') || document.querySelector('.projects-grid');
        if (!sliderContainer) return;

        const cards = sliderContainer.querySelectorAll('.project-card');
        const prevBtn = sliderContainer.querySelector('.slider-arrow-prev');
        const nextBtn = sliderContainer.querySelector('.slider-arrow-next');
        const dots = document.getElementById('projectsSliderDots');

        const projectsTl = gsap.timeline({
            scrollTrigger: {
                trigger: sliderContainer,
                start: 'top 92%',
                end: 'top 65%',
                scrub: 0.8,
                invalidateOnRefresh: true
            }
        });

        projectsTl.fromTo(sliderContainer,
            { opacity: 0, y: 32 },
            { opacity: 1, y: 0, ease: 'power1.out', duration: 0.5 },
            0
        );

        if (cards.length) {
            projectsTl.fromTo(cards,
                { opacity: 0, y: 22 },
                { opacity: 1, y: 0, stagger: 0.06, ease: 'power1.out', duration: 0.4 },
                0.08
            );
        }

        if (prevBtn && nextBtn) {
            projectsTl.fromTo([prevBtn, nextBtn],
                { opacity: 0, scale: 0.85 },
                { opacity: 1, scale: 1, stagger: 0.04, ease: 'power1.out', duration: 0.3 },
                0.15
            );
        }

        if (dots) {
            projectsTl.fromTo(dots,
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, ease: 'power1.out', duration: 0.3 },
                0.2
            );
        }
    }

    initProjectsAnimation();

    // 7. CONTACT SECTION SCROLL-REVERSE SCRUB
    // 7A. Left Column (Contact Info & Social Directory)
    const contactInfoCol = document.querySelector('.contact-info-col');
    if (contactInfoCol) {
        const cardTitle = contactInfoCol.querySelector('.contact-card-title');
        const cardDesc = contactInfoCol.querySelector('.contact-card-desc');
        const infoItems = contactInfoCol.querySelectorAll('.info-item');
        const socialHeading = contactInfoCol.querySelector('.social-heading');
        const socialCards = contactInfoCol.querySelectorAll('.social-dir-card');

        const contactLeftTl = gsap.timeline({
            scrollTrigger: {
                trigger: contactInfoCol,
                start: 'top 92%',
                end: 'top 65%',
                scrub: 0.8,
                invalidateOnRefresh: true
            }
        });

        if (cardTitle) {
            contactLeftTl.fromTo(cardTitle,
                { opacity: 0, y: 18 },
                { opacity: 1, y: 0, ease: 'power1.out', duration: 0.25 },
                0
            );
        }
        if (cardDesc) {
            contactLeftTl.fromTo(cardDesc,
                { opacity: 0, y: 18 },
                { opacity: 1, y: 0, ease: 'power1.out', duration: 0.3 },
                0.06
            );
        }
        if (infoItems.length) {
            contactLeftTl.fromTo(infoItems,
                { opacity: 0, x: -24 },
                { opacity: 1, x: 0, stagger: 0.08, ease: 'power1.out', duration: 0.35 },
                0.12
            );
        }
        if (socialHeading) {
            contactLeftTl.fromTo(socialHeading,
                { opacity: 0, y: 16 },
                { opacity: 1, y: 0, ease: 'power1.out', duration: 0.25 },
                0.22
            );
        }
        if (socialCards.length) {
            contactLeftTl.fromTo(socialCards,
                { opacity: 0, y: 20, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, stagger: 0.06, ease: 'power1.out', duration: 0.35 },
                0.26
            );
        }
    }

    // 7B. Right Column (Form Card & Controls)
    const formCol = document.querySelector('.contact-form-col');
    if (formCol) {
        const formCard = formCol.querySelector('.contact-form-card');
        const formTitle = formCol.querySelector('.form-title');
        const formGroups = formCol.querySelectorAll('.form-group');
        const submitBtn = formCol.querySelector('#submitBtn');
        const formNote = formCol.querySelector('.form-status');

        const formTl = gsap.timeline({
            scrollTrigger: {
                trigger: formCol,
                start: 'top 90%',
                end: 'top 65%',
                scrub: 0.8,
                invalidateOnRefresh: true
            }
        });

        if (formCard) {
            formTl.fromTo(formCard,
                { opacity: 0, y: 32 },
                { opacity: 1, y: 0, ease: 'power1.out', duration: 0.35 },
                0
            );
        }
        if (formTitle) {
            formTl.fromTo(formTitle,
                { opacity: 0, y: 18 },
                { opacity: 1, y: 0, ease: 'power1.out', duration: 0.25 },
                0.06
            );
        }
        if (formGroups.length) {
            formTl.fromTo(formGroups,
                { opacity: 0, y: 18 },
                { opacity: 1, y: 0, stagger: 0.08, ease: 'power1.out', duration: 0.35 },
                0.12
            );
        }
        if (submitBtn) {
            formTl.fromTo(submitBtn,
                { opacity: 0, y: 16 },
                { opacity: 1, y: 0, ease: 'power1.out', duration: 0.25 },
                0.26
            );
        }
        if (formNote) {
            formTl.fromTo(formNote,
                { opacity: 0, y: 14 },
                { opacity: 1, y: 0, ease: 'power1.out', duration: 0.2 },
                0.3
            );
        }
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
