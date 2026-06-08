(function () {
    const menuButton = document.querySelector('[data-menu-button]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let current = 0;

        const showSlide = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.dataset.heroDot || 0));
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    const filterContainers = Array.from(document.querySelectorAll('[data-filterable]'));

    filterContainers.forEach(function (container) {
        const cards = Array.from(container.querySelectorAll('.movie-card'));
        const section = container.closest('.content-section') || document;
        const searchInput = section.querySelector('.movie-search-input');
        const categorySelect = section.querySelector('.filter-category');
        const yearSelect = section.querySelector('.filter-year');
        const sortSelect = section.querySelector('.sort-select');
        const emptyState = section.querySelector('[data-empty-state]');
        const params = new URLSearchParams(window.location.search);
        const initialSearch = params.get('q') || params.get('search') || '';

        if (searchInput && initialSearch) {
            searchInput.value = initialSearch;
        }

        const normalize = function (value) {
            return String(value || '').toLowerCase().trim();
        };

        const textForCard = function (card) {
            return normalize([
                card.dataset.title,
                card.dataset.category,
                card.dataset.type,
                card.dataset.year,
                card.dataset.region,
                card.dataset.genre,
                card.dataset.tags
            ].join(' '));
        };

        const applyFilter = function () {
            const query = normalize(searchInput ? searchInput.value : '');
            const category = categorySelect ? categorySelect.value : 'all';
            const year = yearSelect ? yearSelect.value : 'all';
            let visibleCount = 0;

            cards.forEach(function (card) {
                const matchesQuery = !query || textForCard(card).includes(query);
                const matchesCategory = category === 'all' || card.dataset.category === category;
                const matchesYear = year === 'all' || card.dataset.year === year;
                const visible = matchesQuery && matchesCategory && matchesYear;
                card.style.display = visible ? '' : 'none';
                if (visible) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('show', visibleCount === 0);
            }
        };

        const applySort = function () {
            if (!sortSelect) {
                return;
            }

            const mode = sortSelect.value;
            const sorted = cards.slice().sort(function (a, b) {
                if (mode === 'rating') {
                    return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
                }

                if (mode === 'views') {
                    return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
                }

                if (mode === 'year') {
                    return Number(String(b.dataset.year || '').match(/\d{4}/) || 0) - Number(String(a.dataset.year || '').match(/\d{4}/) || 0);
                }

                return 0;
            });

            if (mode !== 'default') {
                sorted.forEach(function (card) {
                    container.appendChild(card);
                });
            }

            applyFilter();
        };

        [searchInput, categorySelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        if (sortSelect) {
            sortSelect.addEventListener('change', applySort);
        }

        applySort();
        applyFilter();
    });

    const playScrollLinks = Array.from(document.querySelectorAll('[data-scroll-play]'));

    playScrollLinks.forEach(function (link) {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            const player = document.querySelector('.player-wrap');
            if (player) {
                player.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const button = player.querySelector('.player-start');
                if (button) {
                    button.click();
                }
            }
        });
    });

    const players = Array.from(document.querySelectorAll('.player-wrap[data-video]'));

    players.forEach(function (wrapper) {
        const video = wrapper.querySelector('video');
        const button = wrapper.querySelector('.player-start');
        const source = wrapper.dataset.video;
        let ready = false;
        let hlsInstance = null;

        const initialize = function () {
            if (!video || !source || ready) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }

            ready = true;
        };

        const play = function () {
            initialize();
            if (video) {
                video.play().catch(function () {});
            }
        };

        if (button) {
            button.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('play', function () {
                wrapper.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                wrapper.classList.remove('is-playing');
            });
            video.addEventListener('ended', function () {
                wrapper.classList.remove('is-playing');
            });
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
