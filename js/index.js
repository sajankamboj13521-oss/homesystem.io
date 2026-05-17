(function () {
    const video = document.getElementById('bg-video');
    const hero = document.querySelector('.hero');
    const nav = document.getElementById('site-nav');
    const toggle = document.getElementById('nav-toggle');
    const header = document.querySelector('header');

    if (video && hero) {
        hero.style.backgroundImage = "url('image/hvac.jpg')";

        const disableVideo = () => {
            video.classList.add('is-hidden');
            video.pause();
        };

        video.addEventListener('error', disableVideo);

        const tryPlay = () => {
            const p = video.play();
            if (p && typeof p.catch === 'function') {
                p.catch(disableVideo);
            }
        };

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            disableVideo();
        } else {
            tryPlay();
        }
    }

    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            const open = nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            header.classList.toggle('is-nav-open', open);
        });

        nav.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                nav.classList.remove('is-open');
                toggle.setAttribute('aria-expanded', 'false');
                header.classList.remove('is-nav-open');
            });
        });
    }

    const revealTargets = document.querySelectorAll(
        '.service-item, .stat-card, .sector-box, .scope-card, .detail-media'
    );

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
        );

        revealTargets.forEach((el) => {
            el.classList.add('reveal');
            observer.observe(el);
        });
    } else {
        revealTargets.forEach((el) => el.classList.add('is-visible'));
    }
})();
