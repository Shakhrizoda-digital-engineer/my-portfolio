/* ===================================================
   animations.js — ENHANCED EDITION
   Cinematic, large-scale motion design
   =================================================== */

(function () {
    'use strict';

    const qs = (sel, ctx = document) => ctx.querySelector(sel);
    const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
    const rand = (min, max) => Math.random() * (max - min) + min;
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

    /* ================================================
       1. MASSIVE PARTICLE CANVAS
          — Connected network of glowing orbs
       ================================================ */
    const canvas = qs('#particleCanvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    let W, H, particles = [];
    let mouseX = 0, mouseY = 0;

    function resizeCanvas() {
        if (!canvas) return;
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() { this.reset(true); }
        reset(initial = false) {
            this.x = rand(0, W);
            this.y = initial ? rand(0, H) : rand(H * 0.8, H + 20);
            this.r = rand(1, 4);
            this.vx = rand(-0.35, 0.35);
            this.vy = rand(-0.8, -0.15);
            this.alpha = rand(0.2, 0.8);
            this.life = rand(0.0015, 0.004);
            this.pulse = rand(0, Math.PI * 2);
            this.pulseSpeed = rand(0.02, 0.05);
            this.hue = Math.random() > 0.5 ? '139,92,246' : Math.random() > 0.5 ? '236,72,153' : '99,102,241';
        }
        update() {
            // Repel from mouse
            const dx = this.x - mouseX;
            const dy = this.y - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                this.vx += (dx / dist) * 0.4;
                this.vy += (dy / dist) * 0.4;
            }
            this.x += this.vx;
            this.y += this.vy;
            this.alpha -= this.life;
            this.pulse += this.pulseSpeed;
            // dampen velocity
            this.vx *= 0.99;
            this.vy *= 0.99;
            if (this.alpha <= 0 || this.y < -20) this.reset();
        }
        draw(c) {
            const pulsed = this.r + Math.sin(this.pulse) * 0.6;
            // Glow
            const grd = c.createRadialGradient(this.x, this.y, 0, this.x, this.y, pulsed * 3.5);
            grd.addColorStop(0, `rgba(${this.hue},${this.alpha})`);
            grd.addColorStop(0.5, `rgba(${this.hue},${this.alpha * 0.4})`);
            grd.addColorStop(1, `rgba(${this.hue},0)`);
            c.beginPath();
            c.arc(this.x, this.y, pulsed * 3.5, 0, Math.PI * 2);
            c.fillStyle = grd;
            c.fill();
            // Solid core
            c.beginPath();
            c.arc(this.x, this.y, pulsed, 0, Math.PI * 2);
            c.fillStyle = `rgba(${this.hue},${this.alpha})`;
            c.fill();
        }
    }

    function drawConnections() {
        if (!ctx) return;
        const maxDist = 130;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < maxDist) {
                    const alpha = (1 - d / maxDist) * 0.25;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(139,92,246,${alpha})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
        }
    }

    function initParticles() {
        if (!canvas) return;
        resizeCanvas();
        particles = Array.from({ length: 120 }, () => new Particle());
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });
        animateParticles();
    }

    function animateParticles() {
        if (!ctx) return;
        ctx.clearRect(0, 0, W, H);
        drawConnections();
        particles.forEach(p => { p.update(); p.draw(ctx); });
        requestAnimationFrame(animateParticles);
    }

    /* ================================================
       2. AURORA BACKGROUND — animated gradient mesh
       ================================================ */
    function initAurora() {
        const aurora = document.createElement('div');
        aurora.className = 'aurora-bg';
        document.body.prepend(aurora);

        // 3 large orbs that drift slowly
        for (let i = 0; i < 3; i++) {
            const orb = document.createElement('div');
            orb.className = `aurora-orb aurora-orb-${i + 1}`;
            aurora.appendChild(orb);
        }
    }

    /* ================================================
       3. HERO PORTRAIT TILT — Sleek 3D interaction
       ================================================ */
    function initHeroPortrait() {
        const wrap = qs('.hero-portrait-wrap');
        const hero = qs('.hero-visual');
        if (!wrap || !hero) return;

        hero.addEventListener('mousemove', e => {
            const rect = hero.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const rx = clamp((e.clientY - cy) / rect.height * -15, -10, 10);
            const ry = clamp((e.clientX - cx) / rect.width * 15, -10, 10);
            wrap.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
        });

        hero.addEventListener('mouseleave', () => {
            wrap.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) rotate(2deg) scale(1)';
        });
    }

    /* ================================================
       4. PHILOSOPHY HERO — cinematic book open
       ================================================ */
    function initHeroBook() {
        const left = qs('#hobLeft');
        const right = qs('#hobRight');
        if (!left || !right) return;
        setTimeout(() => {
            left.classList.add('opened');
            right.classList.add('opened');
        }, 600);
    }

    /* ================================================
       5. TYPEWRITER — hero title letters animate in
       ================================================ */
    function initTypewriter() {
        const titleEl = qs('.hero-title');
        if (!titleEl) return;

        // Wrap each letter in a span
        const html = titleEl.innerHTML;
        let wrapped = '';
        let delay = 0;
        let insideTag = false;

        for (let i = 0; i < html.length; i++) {
            if (html[i] === '<') { insideTag = true; wrapped += html[i]; continue; }
            if (html[i] === '>') { insideTag = false; wrapped += html[i]; continue; }
            if (insideTag || html[i] === '\n') { wrapped += html[i]; continue; }
            if (html[i] === ' ') { wrapped += html[i]; continue; }
            wrapped += `<span class="letter" style="animation-delay:${(0.4 + delay * 0.04).toFixed(2)}s">${html[i]}</span>`;
            delay++;
        }
        titleEl.innerHTML = wrapped;
        titleEl.classList.add('letters-ready');
    }

    /* ================================================
       6. FLOATING BOOKS — random books drift upward
          (visible on Bio page)
       ================================================ */
    function initFloatingBooks() {
        const section = qs('.hero') || qs('.phil-hero');
        if (!section) return;

        const bookSymbols = ['📖', '📚', '📝', '🔖', '✏️', '📓'];
        const container = document.createElement('div');
        container.className = 'floating-books-layer';
        section.appendChild(container);

        function spawnBook() {
            const el = document.createElement('div');
            el.className = 'floating-book-icon';
            el.textContent = bookSymbols[Math.floor(Math.random() * bookSymbols.length)];
            const size = rand(20, 52);
            const startX = rand(5, 95);
            const duration = rand(7, 14);
            const drift = rand(-60, 60);
            el.style.cssText = `
        left: ${startX}%;
        bottom: -60px;
        font-size: ${size}px;
        animation: floatUp ${duration}s ease-in forwards;
        --drift: ${drift}px;
        opacity: 0;
      `;
            container.appendChild(el);
            setTimeout(() => el.remove(), duration * 1000);
        }

        // Spawn initial wave
        for (let i = 0; i < 6; i++) {
            setTimeout(spawnBook, i * 800);
        }
        // Then keep spawning
        setInterval(spawnBook, 1800);
    }

    /* ================================================
       7. MAGNETIC BUTTONS
       ================================================ */
    function initMagneticButtons() {
        qsa('.btn-primary, .btn-ghost').forEach(btn => {
            btn.addEventListener('mousemove', e => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }

    /* ================================================
       8. SCROLL-TRIGGERED REVEALS — staggered
       ================================================ */
    function initScrollReveals() {
        const items = qsa('.card-reveal, .tl-reveal, .pillar-card, .value-item');
        if (!items.length) return;

        // Add classes
        items.forEach(el => {
            if (!el.classList.contains('card-reveal') && !el.classList.contains('tl-reveal')) {
                el.classList.add('card-reveal');
            }
        });

        if ('IntersectionObserver' in window) {
            const io = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        io.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
            items.forEach(el => io.observe(el));
        } else {
            items.forEach(el => el.classList.add('visible'));
        }
    }

    /* ================================================
       9. SECTION TITLE REVEAL — slide-up with mask
       ================================================ */
    function initTitleReveals() {
        const titles = qsa('.section-title, .hero-title, .phil-hero-content .hero-title');
        if ('IntersectionObserver' in window) {
            const io = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('title-revealed');
                        io.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2 });
            titles.forEach(el => {
                el.classList.add('title-mask');
                io.observe(el);
            });
        }
    }

    /* ================================================
       10. PARALLAX LAYERS — multi-depth scroll
       ================================================ */
    function initParallax() {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;

            // Philosophy hero: text parallax + fade
            const philContent = qs('.phil-hero-content');
            if (philContent) {
                philContent.style.transform = `translateY(${scrolled * 0.18}px)`;
                philContent.style.opacity = Math.max(0, 1 - scrolled / 500);
            }

            // Section labels subtle parallax
            qsa('.section-label').forEach((el, i) => {
                el.style.transform = `translateY(${scrolled * 0.015 * (i % 2 === 0 ? 1 : -1)}px)`;
            });
        }, { passive: true });
    }

    /* ================================================
       11. NAVBAR SCROLL
       ================================================ */
    function initNavbar() {
        const nav = qs('#navbar');
        if (!nav) return;
        window.addEventListener('scroll', () => {
            nav.classList.toggle('scrolled', window.scrollY > 60);
        }, { passive: true });
    }



    /* ================================================
       12. SECTION COUNTER — animate numbers filling
       ================================================ */
    function initCounters() {
        const tl = qsa('.tl-dot');
        tl.forEach((dot, i) => {
            dot.style.animationDelay = `${i * 0.15}s`;
            dot.classList.add('dot-pulse');
        });
    }

    /* ================================================
       15. SMOOTH SCROLL
       ================================================ */
    function initSmoothScroll() {
        qsa('a[href^="#"]').forEach(a => {
            a.addEventListener('click', e => {
                const target = qs(a.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    /* ================================================
       16. GLITCH effect on logo hover
       ================================================ */
    function initGlitch() {
        const logo = qs('.nav-logo');
        if (!logo) return;
        logo.addEventListener('mouseenter', () => logo.classList.add('glitch'));
        logo.addEventListener('mouseleave', () => {
            setTimeout(() => logo.classList.remove('glitch'), 400);
        });
    }

    /* ================================================
       17. INIT
       ================================================ */
    function init() {
        initParticles();
        initAurora();
        initNavbar();
        initHeroPortrait();
        initHeroBook();
        initTypewriter();
        initFloatingBooks();
        initMagneticButtons();
        initScrollReveals();
        initTitleReveals();
        initParallax();
        initCounters();
        initSmoothScroll();
        initGlitch();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
