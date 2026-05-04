const GAMES_PER_PAGE = 24;

let allGames = [];
let filteredGames = [];
let currentPage = 1;
let activeTag = null;
let searchQuery = '';

// Теги для каждой игры — appid: ['тег1', 'тег2', ...]
// Добавляй новые игры по тому же шаблону
const gameTags = {
    105600:  ['Sandbox', 'Survival', 'Crafting', 'Pixel Art'],
    108600:  ['Survival', 'Zombies', 'Open World', 'Crafting'],
    108710:  ['Horror', 'Atmospheric', 'Third-Person', 'Action'],
    211820:  ['Sandbox', 'RPG', 'Sci-fi', 'Exploration'],
    212680:  ['Roguelike', 'Strategy', 'Space', 'Indie'],
    219150:  ['Action', 'Top-Down', 'Difficult', 'Indie'],
    225260:  ['Action', 'Open World', 'Music', 'Comedy'],
    234140:  ['Action', 'Open World', 'Post-Apocalyptic', 'Driving'],
    235460:  ['Action', 'Hack and Slash', 'Anime', 'Character Action'],
    239140:  ['Survival', 'Open World', 'Zombies', 'Co-op'],
    250900:  ['Roguelike', 'Action', 'Dungeon Crawler', 'Indie'],
    262060:  ['RPG', 'Strategy', 'Roguelike', 'Dark Fantasy'],
    264710:  ['Survival', 'Exploration', 'Underwater', 'Atmospheric'],
    274170:  ['Action', 'Top-Down', 'Difficult', 'Indie'],
    274190:  ['Action', 'Co-op', 'Side-Scroller', 'Indie'],
    286690:  ['FPS', 'Post-Apocalyptic', 'Story Rich', 'Atmospheric'],
    287390:  ['FPS', 'Post-Apocalyptic', 'Story Rich', 'Atmospheric'],
    287700:  ['Action', 'Stealth', 'Open World', 'Story Rich'],
    292030:  ['RPG', 'Open World', 'Fantasy', 'Story Rich'],
    304240:  ['Horror', 'Survival Horror', 'Action', 'Classic'],
    311690:  ['Roguelike', 'Bullet Hell', 'Action', 'Co-op'],
    322330:  ['Survival', 'Co-op', 'Crafting', 'Sandbox'],
    323190:  ['Strategy', 'City Builder', 'Survival', 'Steampunk'],
    339340:  ['Horror', 'Survival Horror', 'Action', 'Classic'],
    347160:  ['Souls-like', 'Action RPG', 'Dark Fantasy', 'Difficult'],
    367520:  ['Metroidvania', 'Platformer', 'Difficult', 'Atmospheric'],
    374320:  ['Souls-like', 'Action RPG', 'Dark Fantasy', 'Difficult'],
    377160:  ['RPG', 'Open World', 'Post-Apocalyptic', 'Action'],
    379430:  ['RPG', 'Open World', 'Medieval', 'Story Rich'],
    381210:  ['Horror', 'Survival', 'Multiplayer', 'Asymmetric'],
    391220:  ['Action', 'Adventure', 'Third-Person', 'Story Rich'],
    403640:  ['Action', 'Stealth', 'Immersive Sim', 'First-Person'],
    412020:  ['FPS', 'Post-Apocalyptic', 'Story Rich', 'Atmospheric'],
    418370:  ['Horror', 'Survival Horror', 'First-Person', 'Story Rich'],
    423230:  ['Action', 'Hack and Slash', 'Difficult', 'Boss Rush'],
    427520:  ['Strategy', 'Simulation', 'Automation', 'Sci-fi'],
    429660:  ['JRPG', 'Action RPG', 'Anime', 'Story Rich'],
    435150:  ['RPG', 'Turn-Based', 'Co-op', 'Fantasy'],
    457140:  ['Simulation', 'Survival', 'Colony Sim', 'Sci-fi'],
    460950:  ['Action', 'Platformer', 'Pixel Art', 'Cyberpunk'],
    489830:  ['RPG', 'Open World', 'Fantasy', 'Moddable'],
    504230:  ['Platformer', 'Difficult', 'Indie', 'Story Rich'],
    524220:  ['Action RPG', 'Hack and Slash', 'Sci-fi', 'Anime'],
    526870:  ['Simulation', 'Automation', 'Open World', 'Sci-fi'],
    534380:  ['Survival', 'Open World', 'Zombies', 'Action'],
    548430:  ['Co-op', 'FPS', 'Sci-fi', 'Mining'],
    570940:  ['Souls-like', 'Action RPG', 'Dark Fantasy', 'Difficult'],
    583470:  ['Platformer', 'Difficult', 'Indie', 'Dark'],
    588650:  ['Action', 'Roguelike', 'Metroidvania', 'Indie'],
    599140:  ['Simulation', 'RPG', 'Pixel Art', 'Farming'],
    601150:  ['Action', 'Hack and Slash', 'Character Action', 'Stylish'],
    602960:  ['Survival', 'Co-op', 'Submarine', 'Horror'],
    606280:  ['Action', 'Hack and Slash', 'Open World', 'Dark Fantasy'],
    612880:  ['FPS', 'Action', 'Story Rich', 'Sci-fi'],
    614570:  ['Action', 'Stealth', 'Immersive Sim', 'DLC'],
    617290:  ['Action RPG', 'Souls-like', 'Co-op', 'Third-Person'],
    632360:  ['Roguelike', 'Action', 'Co-op', 'Third-Person'],
    646570:  ['Roguelike', 'Deckbuilding', 'Strategy', 'Card Game'],
    648800:  ['Survival', 'Co-op', 'Crafting', 'Open World'],
    678960:  ['Action RPG', 'Souls-like', 'Anime', 'Difficult'],
    692890:  ['Roguelike', 'FPS', 'Action', 'Co-op'],
    782330:  ['FPS', 'Action', 'Dark Fantasy', 'Sci-fi'],
    788100:  ['Roguelike', 'Action', 'Platformer', 'Indie'],
    814380:  ['Souls-like', 'Action', 'Difficult', 'Stealth'],
    848450:  ['Survival', 'Exploration', 'Underwater', 'Atmospheric'],
    870780:  ['Action', 'Third-Person', 'Supernatural', 'Story Rich'],
    881100:  ['Roguelike', 'Pixel Art', 'Physics', 'Indie'],
    883710:  ['Horror', 'Survival Horror', 'Action', 'Third-Person'],
    892970:  ['Survival', 'Co-op', 'Open World', 'Viking'],
    952060:  ['Horror', 'Survival Horror', 'Action', 'Third-Person'],
    962130:  ['Survival', 'Co-op', 'Crafting', 'Sci-fi'],
    977950:  ['Rhythm', 'Music', 'Difficult', 'Indie'],
    1057090: ['Platformer', 'Metroidvania', 'Atmospheric', 'Indie'],
    1086940: ['RPG', 'Turn-Based', 'Co-op', 'Fantasy'],
    1091500: ['Action RPG', 'Open World', 'Cyberpunk', 'Sci-fi'],
    1123770: ['Roguelike', 'Action', 'Dungeon Crawler', 'Dark Fantasy'],
    1145350: ['Roguelike', 'Action', 'Greek Mythology', 'Early Access'],
    1145360: ['Roguelike', 'Action', 'Greek Mythology', 'Hack and Slash'],
    1147560: ['Action', 'Roguelike', 'Pixel Art', 'Platformer'],
    1172380: ['Action', 'Third-Person', 'Sci-fi', 'Story Rich'],
    1174180: ['Action', 'Open World', 'Western', 'Story Rich'],
    1184370: ['RPG', 'Turn-Based', 'Fantasy', 'Story Rich'],
    1196590: ['Horror', 'Survival Horror', 'Action', 'First-Person'],
    1229490: ['FPS', 'Action', 'Difficult', 'Stylish'],
    1237970: ['FPS', 'Action', 'Sci-fi', 'Multiplayer'],
    1245620: ['Souls-like', 'Open World', 'Dark Fantasy', 'RPG'],
    1259420: ['Action', 'Open World', 'Third-Person', 'Story Rich'],
    1282100: ['Action RPG', 'Souls-like', 'Co-op', 'Third-Person'],
    1282730: ['Roguelike', 'Strategy', 'Pixel Art', 'Deckbuilding'],
    1313140: ['Roguelike', 'Strategy', 'Simulation', 'Indie'],
    1422450: ['Action', 'Multiplayer', 'Hero Shooter', 'Early Access'],
    1458140: ['Survival', 'Horror', 'Driving', 'Atmospheric'],
    1501750: ['Souls-like', 'Action RPG', 'Dark Fantasy', 'Co-op'],
    1517290: ['FPS', 'Multiplayer', 'Military', 'Sci-fi'],
    1604030: ['Survival', 'Vampire', 'Co-op', 'Open World'],
    1621690: ['Survival', 'Co-op', 'Mining', 'Indie'],
    1627720: ['Souls-like', 'Action RPG', 'Dark Fantasy', 'Steampunk'],
    1693980: ['Horror', 'Survival Horror', 'Action', 'Sci-fi'],
    1774580: ['Action', 'Third-Person', 'Sci-fi', 'Story Rich'],
    1808500: ['Action', 'Sci-fi', 'Co-op', 'Early Access'],
    1809540: ['Action', 'Platformer', 'Souls-like', 'Pixel Art'],
    1817230: ['Action', 'Rhythm', 'Anime', 'Character Action'],
    1876590: ['Action', 'FPS', 'Stealth', 'Indie'],
    1903340: ['RPG', 'Turn-Based', 'Fantasy', 'Story Rich'],
    1942280: ['Roguelike', 'Survival', 'Action', 'Indie'],
    1970580: ['Roguelike', 'Deckbuilding', 'Strategy', 'Indie'],
    2050650: ['Horror', 'Survival Horror', 'Action', 'Third-Person'],
    2113040: ['Roguelike', 'Puzzle', 'Platformer', 'Indie'],
    2356780: ['Roguelike', 'Puzzle', 'Deckbuilding', 'Indie'],
    2383200: ['Rhythm', 'Music', 'Action', 'Classic'],
    2407270: ['Souls-like', 'Action RPG', 'Anime', 'Difficult'],
    2622380: ['Souls-like', 'Open World', 'Co-op', 'Dark Fantasy'],
    2694490: ['Action RPG', 'Dark Fantasy', 'Isometric', 'Co-op'],
    2835570: ['Horror', 'Indie', 'Action', 'Dark'],
    3314790: ['Roguelike', 'Puzzle', 'Indie', 'Co-op'],
    3527290: ['Co-op', 'Survival', 'Multiplayer', 'Early Access'],
};

// Игры которые не отображаются на сайте — добавляй App ID сюда
const excludedGames = new Set([
    2427520, 1296360, 346110, 407530, 1168660, 1611740, 3081410, 1367300,
    3595230, 1591520, 730, 939100, 2709440, 322170, 269210, 677120, 581320,
    1256670, 1594940, 1449560, 774171, 2909110, 1522820, 2694490, 1549180,
    1172620, 367540, 625960, 464920, 389730, 2076040, 2074930, 297130,
    623990, 359550, 431960, 490910, 2807960, 2062430,
]);

const myReviews = {
    1245620: {
        score: '9.5',
        developer: 'FromSoftware',
        year: 2022,
        tags: ['Action RPG', 'Souls-like', 'Открытый мир'],
        text: 'Elden Ring — масштабная action-RPG от FromSoftware, создавших Dark Souls и Sekiro. Огромный открытый мир, сотни часов контента и незабываемые боссы. Обязателен к прохождению.'
    }
};

// ─── Загрузка игр ────────────────────────────────────────────────────────────

async function loadGames() {
    const grid = document.getElementById('gamesGrid');

    let games = null;
    try {
        const r = await fetch('/api/steam-games');
        if (r.ok) games = await r.json();
    } catch {}

    if (!games) {
        grid.innerHTML = '<p class="loading-text">Не удалось загрузить игры. Проверь интернет и обнови страницу.</p>';
        return;
    }

    allGames = games
        .filter(g => !excludedGames.has(g.appid))
        .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    filteredGames = allGames;

    renderGenreFilters();
    renderPage(1);
}

// ─── Фильтрация ───────────────────────────────────────────────────────────────

function applyFilters() {
    filteredGames = allGames.filter(game => {
        // Проверяем совпадение с поисковым запросом
        const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;

        // Если выбран жанр — показываем только игры с этим тегом в рецензии
        if (activeTag) {
            return getTagsForGame(game.appid).includes(activeTag);
        }

        return true;
    });

    renderPage(1);
}

// ─── Жанровые фильтры ────────────────────────────────────────────────────────

function renderGenreFilters() {
    // Собираем все уникальные теги из написанных рецензий
    const allTags = new Set();
    Object.values(myReviews).forEach(r => r.tags?.forEach(t => allTags.add(t)));

    const container = document.getElementById('genreFilters');

    // Если тегов нет — скрываем блок
    if (allTags.size === 0) {
        container.style.display = 'none';
        return;
    }

    container.innerHTML = '';

    allTags.forEach(tag => {
        const btn = document.createElement('button');
        btn.className = 'genre-btn';
        btn.textContent = tag;
        btn.addEventListener('click', () => {
            // Повторный клик по активному тегу — сбрасывает фильтр
            activeTag = activeTag === tag ? null : tag;
            container.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active'));
            if (activeTag) btn.classList.add('active');
            applyFilters();
        });
        container.appendChild(btn);
    });
}

// ─── Поиск ───────────────────────────────────────────────────────────────────

// debounce — задержка перед вызовом функции.
// Без неё поиск срабатывал бы на каждую нажатую букву.
// С ней — ждём 250мс после последнего ввода и только тогда фильтруем.
function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

document.getElementById('searchInput').addEventListener(
    'input',
    debounce(e => {
        searchQuery = e.target.value;
        applyFilters();
    }, 250)
);

// ─── Рендер страницы ─────────────────────────────────────────────────────────

function renderPage(page) {
    currentPage = page;

    const start = (page - 1) * GAMES_PER_PAGE;
    const pageGames = filteredGames.slice(start, start + GAMES_PER_PAGE);

    const grid = document.getElementById('gamesGrid');

    if (filteredGames.length === 0) {
        grid.innerHTML = '<p class="loading-text">Ничего не найдено.</p>';
        renderPagination();
        return;
    }

    grid.innerHTML = '';
    pageGames.forEach(game => grid.appendChild(createCard(game)));

    renderPagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── Пагинация ───────────────────────────────────────────────────────────────

function renderPagination() {
    const totalPages = Math.ceil(filteredGames.length / GAMES_PER_PAGE);

    let pagination = document.getElementById('pagination');
    if (!pagination) {
        pagination = document.createElement('div');
        pagination.id = 'pagination';
        pagination.className = 'pagination';
        document.getElementById('gamesGrid').after(pagination);
    }

    pagination.innerHTML = '';

    if (totalPages <= 1) return;

    const prev = document.createElement('button');
    prev.className = 'pagination_btn';
    prev.textContent = '←';
    prev.disabled = currentPage === 1;
    prev.addEventListener('click', () => renderPage(currentPage - 1));
    pagination.appendChild(prev);

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = 'pagination_btn' + (i === currentPage ? ' active' : '');
        btn.textContent = i;
        btn.addEventListener('click', () => renderPage(i));
        pagination.appendChild(btn);
    }

    const next = document.createElement('button');
    next.className = 'pagination_btn';
    next.textContent = '→';
    next.disabled = currentPage === totalPages;
    next.addEventListener('click', () => renderPage(currentPage + 1));
    pagination.appendChild(next);
}

// ─── Теги ────────────────────────────────────────────────────────────────────

function getTagsForGame(appid) {
    // Приоритет: теги из рецензии → теги из gameTags
    const reviewTags = myReviews[appid]?.tags;
    return reviewTags?.length ? reviewTags : (gameTags[appid] ?? []);
}

// ─── Создание карточки ───────────────────────────────────────────────────────

function createCard(game) {
    const { appid, name } = game;
    const review = myReviews[appid];
    const coverUrl = `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/library_600x900_2x.jpg`;
    const tags = getTagsForGame(appid);

    const card = document.createElement('div');
    card.className = 'game-card';
    card.dataset.appid = appid;

    card.innerHTML = `
        <img class="game-card_cover" alt="${name}" loading="lazy">
        <div class="game-card_overlay">
            ${review ? `<div class="game-card_score">${review.score}</div>` : '<div></div>'}
            <div class="game-card_overlay-body">
                ${review?.developer ? `<p class="game-card_developer">${review.developer}</p>` : ''}
                ${review?.year ? `<p class="game-card_year-text">${review.year}</p>` : ''}
                <div class="game-card_tags">
                    ${tags.map(t => `<span class="tag">${t}</span>`).join('')}
                </div>
                <a
                    href="https://store.steampowered.com/app/${appid}"
                    class="game-card_steam-btn"
                    target="_blank"
                    onclick="event.stopPropagation()"
                >Открыть в Steam</a>
            </div>
        </div>
        <div class="game-card_info">
            <h3 class="game-card_title">${name}</h3>
        </div>
    `;

    // Цепочка fallback-ов: пробуем каждый URL по очереди пока не найдём рабочий
    const img = card.querySelector('.game-card_cover');
    const fallbacks = [
        `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/library_600x900_2x.jpg`,
        `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/library_600x900.jpg`,
        `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/header.jpg`,
    ];
    let fi = 0;
    img.src = fallbacks[fi];
    img.onerror = function () {
        fi++;
        if (fi < fallbacks.length) {
            this.src = fallbacks[fi];
        } else {
            this.onerror = null;
            this.style.background = '#1e1e1e';
            this.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        }
    };

    card.addEventListener('click', (e) => {
        if (!e.target.closest('.game-card_steam-btn')) openDrawer(game).catch(console.error);
    });

    return card;
}

// ─── Стили рецензий ───────────────────────────────────────────────────────────

const reviewStyles = document.createElement('style');
reviewStyles.textContent = `
    .user-reviews { margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; }
    .user-reviews__title { font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 14px; }
    .user-review { background: rgba(255,255,255,0.04); border-radius: 10px; padding: 14px; margin-bottom: 10px; }
    .user-review__header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .user-review__name { font-size: 14px; font-weight: 700; color: #fff; }
    .user-review__score { background: #FF6B35; color: #fff; font-size: 13px; font-weight: 700; border-radius: 6px; padding: 2px 8px; }
    .user-review__date { font-size: 12px; color: rgba(255,255,255,0.3); margin-left: auto; }
    .user-review__text { font-size: 14px; color: rgba(255,255,255,0.75); line-height: 1.5; }
    .user-review__delete { background: none; border: none; color: rgba(255,255,255,0.25); font-size: 12px; cursor: pointer; margin-left: 6px; }
    .user-review__delete:hover { color: #E63946; }

    .review-form { margin-top: 16px; }
    .review-form__title { font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 14px; }
    .review-form__score-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .review-form__score-label { font-size: 13px; color: rgba(255,255,255,0.5); white-space: nowrap; }
    .review-form__score-input { width: 80px; padding: 8px 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 15px; font-weight: 700; outline: none; }
    .review-form__score-input:focus { border-color: #FF6B35; }
    .review-form__textarea { width: 100%; box-sizing: border-box; padding: 10px 12px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 14px; line-height: 1.5; resize: vertical; min-height: 90px; outline: none; font-family: inherit; }
    .review-form__textarea:focus { border-color: #FF6B35; }
    .review-form__textarea::placeholder { color: rgba(255,255,255,0.25); }
    .review-form__footer { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
    .review-form__counter { font-size: 12px; color: rgba(255,255,255,0.3); }
    .review-form__counter.over { color: #E63946; }
    .review-form__submit { padding: 9px 20px; background: #FF6B35; border: none; border-radius: 8px; color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; transition: opacity 0.2s; }
    .review-form__submit:hover { opacity: 0.85; }
    .review-form__submit:disabled { opacity: 0.4; cursor: not-allowed; }
    .review-form__error { font-size: 13px; color: #E63946; margin-top: 8px; min-height: 18px; }
    .reviews-login-hint { font-size: 13px; color: rgba(255,255,255,0.3); margin-top: 16px; text-align: center; }

    .drawer_scores { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
    .drawer_scores .drawer_score { margin-bottom: 0; }
    .drawer_avg-score { display: inline-flex; align-items: center; justify-content: center; background: #FF6B35; border-radius: 8px; padding: 4px 20px; }
    .drawer_avg-score__value { font-size: 28px; font-weight: 700; color: #fff; font-family: 'Rajdhani', sans-serif; }
`;
document.head.appendChild(reviewStyles);

// ─── Панель рецензии ─────────────────────────────────────────────────────────

async function openDrawer(game) {
    const { appid, name } = game;
    const review = myReviews[appid];

    document.getElementById('drawerCover').src = `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/header.jpg`;
    document.getElementById('drawerCover').alt = name;
    document.getElementById('drawerTitle').textContent = name;

    const metaParts = [review?.developer, review?.year].filter(Boolean);
    document.getElementById('drawerMeta').textContent = metaParts.join(' · ');

    const scoreEl = document.getElementById('drawerScore');
    if (review?.score) {
        scoreEl.textContent = review.score;
        scoreEl.style.display = 'inline-block';
    } else {
        scoreEl.style.display = 'none';
    }
    getOrCreateAvgScore().style.display = 'none';

    document.getElementById('drawerText').innerHTML = review?.text
        ? `<p>${review.text}</p>`
        : '';

    document.getElementById('drawer').classList.add('open');
    document.getElementById('drawerOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';

    const section = getOrCreateReviewsSection();
    section.innerHTML = '<p style="font-size:13px;color:rgba(255,255,255,0.3)">Загрузка...</p>';

    const [userReviews, meRes] = await Promise.all([
        fetch(`/api/reviews?appid=${appid}`).then(r => r.json()).catch(() => []),
        fetch('/api/me').then(r => r.ok ? r.json() : null).catch(() => null),
    ]);

    updateAvgScore(userReviews);
    renderReviewsSection(section, appid, userReviews, meRes?.username || null);
}

function getOrCreateAvgScore() {
    let el = document.getElementById('drawerAvgScore');
    if (!el) {
        const scoreEl = document.getElementById('drawerScore');
        let wrapper = document.getElementById('drawerScoresWrapper');
        if (!wrapper) {
            wrapper = document.createElement('div');
            wrapper.id = 'drawerScoresWrapper';
            wrapper.className = 'drawer_scores';
            scoreEl.parentNode.insertBefore(wrapper, scoreEl);
            wrapper.appendChild(scoreEl);
        }
        el = document.createElement('div');
        el.id = 'drawerAvgScore';
        el.className = 'drawer_avg-score';
        el.innerHTML = '<span class="drawer_avg-score__value"></span>';
        wrapper.appendChild(el);
    }
    return el;
}

function updateAvgScore(userReviews) {
    const el = getOrCreateAvgScore();
    if (userReviews.length === 0) {
        el.style.display = 'none';
        return;
    }
    const avg = (userReviews.reduce((s, r) => s + r.score, 0) / userReviews.length).toFixed(1);
    el.querySelector('.drawer_avg-score__value').textContent = avg;
    el.style.display = 'inline-flex';
}

function getOrCreateReviewsSection() {
    let el = document.getElementById('drawerReviews');
    if (!el) {
        el = document.createElement('div');
        el.id = 'drawerReviews';
        document.getElementById('drawerText').after(el);
    }
    return el;
}

function renderReviewsSection(section, appid, reviews, currentUser) {
    section.innerHTML = '';
    updateAvgScore(reviews);

    // Список рецензий пользователей
    if (reviews.length > 0) {
        const titleEl = document.createElement('div');
        titleEl.className = 'user-reviews';
        titleEl.innerHTML = `<p class="user-reviews__title">Рецензии игроков</p>`;

        reviews.forEach(r => {
            const date = new Date(r.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
            const isOwn = r.username === currentUser;
            const item = document.createElement('div');
            item.className = 'user-review';
            item.innerHTML = `
                <div class="user-review__header">
                    <span class="user-review__name">${escapeHtml(r.username)}</span>
                    <span class="user-review__score">${r.score}</span>
                    <span class="user-review__date">${date}</span>
                    ${isOwn ? `<button class="user-review__delete" data-appid="${appid}">удалить</button>` : ''}
                </div>
                <p class="user-review__text">${escapeHtml(r.text)}</p>
            `;
            if (isOwn) {
                item.querySelector('.user-review__delete').addEventListener('click', () => deleteReview(appid, section, reviews, currentUser));
            }
            titleEl.appendChild(item);
        });

        section.appendChild(titleEl);
    }

    // Форма или подсказка
    const hasOwnReview = reviews.some(r => r.username === currentUser);

    if (currentUser && !hasOwnReview) {
        section.appendChild(buildReviewForm(appid, section, reviews, currentUser));
    } else if (!currentUser) {
        const hint = document.createElement('p');
        hint.className = 'reviews-login-hint';
        hint.textContent = 'Войдите, чтобы оставить рецензию';
        section.appendChild(hint);
    }
}

function buildReviewForm(appid, section, reviews, currentUser) {
    const wrap = document.createElement('div');
    wrap.className = 'review-form';
    wrap.innerHTML = `
        <p class="review-form__title">Написать рецензию</p>
        <div class="review-form__score-row">
            <span class="review-form__score-label">Оценка:</span>
            <input class="review-form__score-input" type="number" min="0" max="10" step="0.1" placeholder="0–10">
        </div>
        <textarea class="review-form__textarea" maxlength="300" placeholder="Поделись впечатлениями… (до 300 символов)"></textarea>
        <div class="review-form__footer">
            <span class="review-form__counter">0 / 300</span>
            <button class="review-form__submit">Опубликовать</button>
        </div>
        <p class="review-form__error"></p>
    `;

    const textarea = wrap.querySelector('.review-form__textarea');
    const counter  = wrap.querySelector('.review-form__counter');
    const submit   = wrap.querySelector('.review-form__submit');
    const errorEl  = wrap.querySelector('.review-form__error');
    const scoreInput = wrap.querySelector('.review-form__score-input');

    textarea.addEventListener('input', () => {
        const len = textarea.value.length;
        counter.textContent = `${len} / 300`;
        counter.classList.toggle('over', len > 300);
    });

    submit.addEventListener('click', async () => {
        errorEl.textContent = '';
        submit.disabled = true;
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appid, score: scoreInput.value, text: textarea.value }),
            });
            const data = await res.json();
            if (!res.ok) {
                errorEl.textContent = data.error;
            } else {
                const fresh = await fetch(`/api/reviews?appid=${appid}`).then(r => r.json());
                renderReviewsSection(section, appid, fresh, currentUser);
            }
        } catch {
            errorEl.textContent = 'Ошибка соединения';
        } finally {
            submit.disabled = false;
        }
    });

    return wrap;
}

async function deleteReview(appid, section, reviews, currentUser) {
    await fetch(`/api/reviews?appid=${appid}`, { method: 'DELETE' });
    const fresh = await fetch(`/api/reviews?appid=${appid}`).then(r => r.json());
    renderReviewsSection(section, appid, fresh, currentUser);
}

function escapeHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function closeDrawer() {
    document.getElementById('drawer').classList.remove('open');
    document.getElementById('drawerOverlay').classList.remove('open');
    document.body.style.overflow = '';
}

document.getElementById('drawerClose').addEventListener('click', closeDrawer);
document.getElementById('drawerOverlay').addEventListener('click', closeDrawer);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

loadGames();
