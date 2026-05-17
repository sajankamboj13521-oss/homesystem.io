(function () {
    const mainVideo = document.getElementById('mainVideo');
    const clipGrid = document.getElementById('clip-grid');
    const videoTitle = document.getElementById('video-title');
    const videoNote = document.getElementById('video-note');
    const videoError = document.getElementById('video-error');

    if (!mainVideo || !clipGrid || typeof PROJECT_VIDEOS === 'undefined') return;

    const clips = PROJECT_VIDEOS.clips;
    const defaultClip = clips.find((c) => c.id === PROJECT_VIDEOS.defaultId) || clips[0];

    function setNote(clip) {
        if (!videoNote) return;
        if (clip.largeFile && !clip.cdnUrl) {
            videoNote.hidden = false;
            videoNote.textContent =
                clip.note ||
                'This clip is a large local file and may not load on GitHub Pages. Host on YouTube or Cloudinary and set cdnUrl in js/media-config.js.';
        } else if (clip.note) {
            videoNote.hidden = false;
            videoNote.textContent = clip.note;
        } else {
            videoNote.hidden = true;
        }
    }

    function showVideoError(clip) {
        if (!videoError) return;
        videoError.hidden = false;
        videoError.textContent = `Could not load “${clip.title}”. ${
            clip.largeFile
                ? 'Host this video on a CDN and add cdnUrl in js/media-config.js.'
                : 'Check that the file exists in the videos/ folder.'
        }`;
    }

    function hideVideoError() {
        if (videoError) videoError.hidden = true;
    }

    function loadClip(clip, scrollTop) {
        hideVideoError();
        const src = encodeVideoPath(getVideoSrc(clip));
        mainVideo.pause();
        mainVideo.removeAttribute('src');
        const source = mainVideo.querySelector('source');
        if (source) {
            source.src = src;
        } else {
            mainVideo.src = src;
        }
        mainVideo.load();
        mainVideo.play().catch(() => {});

        if (videoTitle) {
            videoTitle.textContent = clip.title;
        }
        setNote(clip);

        clipGrid.querySelectorAll('.clip-item').forEach((el) => {
            el.classList.toggle('is-active', el.dataset.clipId === clip.id);
        });

        if (scrollTop) {
            document.querySelector('.video-main-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function buildClips() {
        clipGrid.innerHTML = '';
        clips.forEach((clip) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'clip-item';
            btn.dataset.clipId = clip.id;
            btn.setAttribute('aria-label', `Play ${clip.title}`);

            const thumbEl = document.createElement('div');
            thumbEl.className = 'clip-thumb';
            if (clip.thumb) {
                thumbEl.style.backgroundImage = `url('${clip.thumb}')`;
            }
            const tag = document.createElement('span');
            tag.className = 'clip-tag';
            tag.textContent = clip.tag;
            thumbEl.appendChild(tag);

            const text = document.createElement('div');
            text.className = 'clip-text';
            text.innerHTML = `<strong>${clip.title}</strong><span>${clip.subtitle}</span>`;

            btn.appendChild(thumbEl);
            btn.appendChild(text);
            btn.addEventListener('click', () => loadClip(clip, true));
            clipGrid.appendChild(btn);
        });
    }

    mainVideo.addEventListener('error', () => {
        const active = clipGrid.querySelector('.clip-item.is-active');
        const id = active?.dataset.clipId;
        const clip = clips.find((c) => c.id === id) || defaultClip;
        showVideoError(clip);
    });

    mainVideo.addEventListener('loadeddata', hideVideoError);

    buildClips();
    loadClip(defaultClip, false);

    const toggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('site-nav');
    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            const open = nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        nav.querySelectorAll('a').forEach((a) => {
            a.addEventListener('click', () => {
                nav.classList.remove('is-open');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    }
})();
