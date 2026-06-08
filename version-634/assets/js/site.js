import { H as Hls } from './hls.js';

const SELECTORS = {
    menuToggle: '[data-menu-toggle]',
    mainNav: '[data-main-nav]',
    searchForm: '.search-form',
    pageSearch: '[data-page-search]',
    filterTag: '[data-filter-tag]',
    clearFilter: '[data-clear-filter]',
    cardList: '[data-card-list]',
    resultCount: '[data-result-count]',
    heroCarousel: '[data-hero-carousel]',
    player: '[data-video-player]',
    backTop: '[data-back-top]'
};

function getRootPrefix() {
    return document.body.dataset.root || './';
}

function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
}

function setupMobileMenu() {
    const toggle = document.querySelector(SELECTORS.menuToggle);
    const nav = document.querySelector(SELECTORS.mainNav);
    const search = document.querySelector('.nav-search');

    if (!toggle || !nav) {
        return;
    }

    toggle.addEventListener('click', () => {
        nav.classList.toggle('is-open');
        if (search) {
            search.classList.toggle('is-open');
        }
    });
}

function setupHeaderSearch() {
    const forms = document.querySelectorAll(SELECTORS.searchForm);
    const root = getRootPrefix();

    forms.forEach((form) => {
        form.addEventListener('submit', (event) => {
            const input = form.querySelector('input[name="q"]');
            const query = input ? input.value.trim() : '';

            if (!query) {
                event.preventDefault();
                window.location.href = `${root}videos.html`;
                return;
            }
        });
    });
}

function setupCardFiltering() {
    const cards = Array.from(document.querySelectorAll('.movie-card'));
    const pageSearch = document.querySelector(SELECTORS.pageSearch);
    const resultCount = document.querySelector(SELECTORS.resultCount);
    const tagButtons = Array.from(document.querySelectorAll(SELECTORS.filterTag));
    const clearButton = document.querySelector(SELECTORS.clearFilter);
    const params = new URLSearchParams(window.location.search);
    let activeTag = params.get('tag') || '';

    if (!cards.length) {
        return;
    }

    if (pageSearch && params.get('q')) {
        pageSearch.value = params.get('q');
    }

    function cardMatches(card, query, tag) {
        const haystack = normalize([
            card.dataset.title,
            card.dataset.year,
            card.dataset.region,
            card.dataset.type,
            card.dataset.genre,
            card.dataset.tags,
            card.dataset.category
        ].join(' '));
        const queryMatched = !query || haystack.includes(query);
        const tagMatched = !tag || haystack.includes(normalize(tag));
        return queryMatched && tagMatched;
    }

    function update() {
        const query = normalize(pageSearch ? pageSearch.value : params.get('q'));
        let visible = 0;

        cards.forEach((card) => {
            const matched = cardMatches(card, query, activeTag);
            card.classList.toggle('is-hidden', !matched);
            if (matched) {
                visible += 1;
            }
        });

        tagButtons.forEach((button) => {
            button.classList.toggle('is-active', button.dataset.filterTag === activeTag);
        });

        if (resultCount) {
            resultCount.textContent = `正在显示 ${visible} 部影片`;
        }
    }

    if (pageSearch) {
        pageSearch.addEventListener('input', update);
    }

    tagButtons.forEach((button) => {
        button.addEventListener('click', () => {
            activeTag = activeTag === button.dataset.filterTag ? '' : button.dataset.filterTag;
            update();
        });
    });

    if (clearButton) {
        clearButton.addEventListener('click', () => {
            activeTag = '';
            if (pageSearch) {
                pageSearch.value = '';
            }
            update();
        });
    }

    update();
}

function setupHeroCarousel() {
    const carousel = document.querySelector(SELECTORS.heroCarousel);

    if (!carousel) {
        return;
    }

    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    const prev = carousel.querySelector('[data-hero-prev]');
    const next = carousel.querySelector('[data-hero-next]');
    let current = 0;
    let timerId = null;

    function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    function startTimer() {
        stopTimer();
        timerId = window.setInterval(() => show(current + 1), 5200);
    }

    function stopTimer() {
        if (timerId) {
            window.clearInterval(timerId);
            timerId = null;
        }
    }

    if (prev) {
        prev.addEventListener('click', () => {
            show(current - 1);
            startTimer();
        });
    }

    if (next) {
        next.addEventListener('click', () => {
            show(current + 1);
            startTimer();
        });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            show(index);
            startTimer();
        });
    });

    carousel.addEventListener('mouseenter', stopTimer);
    carousel.addEventListener('mouseleave', startTimer);
    show(0);
    startTimer();
}

function setupPlayers() {
    const players = Array.from(document.querySelectorAll(SELECTORS.player));

    players.forEach((player) => {
        const video = player.querySelector('video');
        const startButton = player.querySelector('[data-player-start]');
        const status = player.querySelector('[data-player-status]');
        const src = player.dataset.src;
        const poster = player.dataset.poster;
        let hlsInstance = null;
        let initialized = false;

        if (!video || !src) {
            return;
        }

        if (poster) {
            video.setAttribute('poster', poster);
        }

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        function initializeSource() {
            if (initialized) {
                return;
            }

            initialized = true;
            setStatus('正在加载 HLS 播放源...');

            if (Hls && Hls.isSupported()) {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hlsInstance.loadSource(src);
                hlsInstance.attachMedia(video);
                hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                    setStatus('播放源加载完成');
                });
                hlsInstance.on(Hls.Events.ERROR, (event, data) => {
                    if (!data || !data.fatal) {
                        return;
                    }

                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        setStatus('网络错误，正在重试...');
                        hlsInstance.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        setStatus('媒体错误，正在恢复...');
                        hlsInstance.recoverMediaError();
                    } else {
                        setStatus('播放失败，请刷新页面重试');
                        hlsInstance.destroy();
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
                setStatus('使用浏览器原生 HLS 播放');
            } else {
                setStatus('当前浏览器不支持 HLS 播放');
            }
        }

        function playVideo() {
            initializeSource();
            const promise = video.play();
            player.classList.add('is-playing');

            if (promise && typeof promise.catch === 'function') {
                promise.catch(() => {
                    player.classList.remove('is-playing');
                    setStatus('请再次点击播放按钮');
                });
            }
        }

        if (startButton) {
            startButton.addEventListener('click', playVideo);
        }

        video.addEventListener('play', () => player.classList.add('is-playing'));
        video.addEventListener('pause', () => player.classList.remove('is-playing'));
        video.addEventListener('error', () => setStatus('视频加载失败'));

        window.addEventListener('beforeunload', () => {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
}

function setupBackToTop() {
    const button = document.querySelector(SELECTORS.backTop);

    if (!button) {
        return;
    }

    function update() {
        button.classList.toggle('is-visible', window.scrollY > 420);
    }

    button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', update, { passive: true });
    update();
}

function setupMissingImageFallback() {
    const images = Array.from(document.querySelectorAll('img'));

    images.forEach((image) => {
        image.addEventListener('error', () => {
            image.style.opacity = '0';
            const parent = image.parentElement;
            if (parent) {
                parent.classList.add('image-fallback');
                parent.setAttribute('data-fallback', image.alt || '影视封面');
            }
        }, { once: true });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupMobileMenu();
    setupHeaderSearch();
    setupCardFiltering();
    setupHeroCarousel();
    setupPlayers();
    setupBackToTop();
    setupMissingImageFallback();
});
