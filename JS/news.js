let allArticles = [];
let activeSource = null;

const FEEDS = [
    { id: 'dtf',     name: 'DTF',      color: '#FF6B35' },
    { id: 'ign',     name: 'IGN',      color: '#E63946' },
    { id: 'kotaku',  name: 'Kotaku',   color: '#F5A623' },
    { id: 'pcgamer', name: 'PC Gamer', color: '#44B4EC' },
];

// ─── Загрузка ─────────────────────────────────────────────────────────────────

async function loadNews() {
    try {
        const res = await fetch('/api/news');
        allArticles = await res.json();
    } catch {
        allArticles = [];
    }
    renderFilters();
    renderNews();
}

// ─── Утилиты ──────────────────────────────────────────────────────────────────

function formatDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date)) return '';
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ─── Фильтры ──────────────────────────────────────────────────────────────────

function renderFilters() {
    const container = document.getElementById('newsFilters');
    container.innerHTML = '';

    const allBtn = makeFilterBtn('Все', true, () => {
        activeSource = null;
        setActiveFilter(container, allBtn);
        renderNews();
    });
    container.appendChild(allBtn);

    FEEDS.forEach(feed => {
        const btn = makeFilterBtn(feed.name, false, () => {
            activeSource = feed.id;
            setActiveFilter(container, btn);
            renderNews();
        });
        container.appendChild(btn);
    });
}

function makeFilterBtn(label, isActive, onClick) {
    const btn = document.createElement('button');
    btn.className = 'genre-btn' + (isActive ? ' active' : '');
    btn.textContent = label;
    btn.addEventListener('click', onClick);
    return btn;
}

function setActiveFilter(container, activeBtn) {
    container.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active'));
    activeBtn.classList.add('active');
}

// ─── Рендер ───────────────────────────────────────────────────────────────────

function renderNews() {
    const list = document.getElementById('newsList');
    const articles = activeSource
        ? allArticles.filter(a => a.source === activeSource)
        : allArticles;

    if (articles.length === 0) {
        list.innerHTML = '<p class="loading-text">Не удалось загрузить новости. Проверь интернет и обнови страницу.</p>';
        return;
    }

    list.innerHTML = '';
    articles.forEach(article => list.appendChild(createCard(article)));
}

function createCard(article) {
    const card = document.createElement('a');
    card.className = 'news-card';
    card.href = article.link;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';

    const imgHtml = article.thumbnail
        ? `<img class="news-card_img" src="${article.thumbnail}" alt="" loading="lazy" onerror="this.classList.add('news-card_img--placeholder'); this.removeAttribute('src')">`
        : `<div class="news-card_img news-card_img--placeholder"></div>`;

    const descHtml = article.description
        ? `<p class="news-card_desc">${article.description}</p>`
        : '';

    card.innerHTML = `
        ${imgHtml}
        <div class="news-card_body">
            <span class="news-card_source" style="color: ${article.sourceColor}">${article.sourceName}</span>
            <h3 class="news-card_title">${article.title}</h3>
            ${descHtml}
            <span class="news-card_date">${formatDate(article.date)}</span>
        </div>
    `;

    return card;
}

loadNews();
