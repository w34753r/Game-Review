const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const PORT = 3000;
const DATA_DIR = path.join(ROOT, 'data');
const USERS_FILE   = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const REVIEWS_FILE  = path.join(DATA_DIR, 'reviews.json');

const MIME = {
    '.html': 'text/html',
    '.css':  'text/css',
    '.js':   'application/javascript',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.svg':  'image/svg+xml',
    '.webp': 'image/webp',
    '.ico':  'image/x-icon',
};

// ─── Страницы ─────────────────────────────────────────────────────────────────

const PAGES = {
    '/':        { file: 'pages/home.html',    title: 'Game Review' },
    '/news':    { file: 'pages/news.html',    title: 'Новости — Game Review' },
    '/reviews': { file: 'pages/reviews.html', title: 'Игровые рецензии — Game Review' },
};

function renderPage(pageFile, title) {
    const header  = fs.readFileSync(path.join(ROOT, 'templates/header.html'), 'utf8').replace('{{title}}', title);
    const content = fs.readFileSync(path.join(ROOT, pageFile), 'utf8');
    const footer  = fs.readFileSync(path.join(ROOT, 'templates/footer.html'), 'utf8');
    return header + '\n' + content + '\n' + footer + '\n</body>\n</html>';
}

// ─── RSS ──────────────────────────────────────────────────────────────────────

const FEEDS = [
    { id: 'dtf',     name: 'DTF',      color: '#FF6B35', url: 'https://dtf.ru/rss' },
    { id: 'ign',     name: 'IGN',      color: '#E63946', url: 'https://www.ign.com/feeds/all.xml' },
    { id: 'kotaku',  name: 'Kotaku',   color: '#F5A623', url: 'https://kotaku.com/feed/rss' },
    { id: 'pcgamer', name: 'PC Gamer', color: '#44B4EC', url: 'https://www.pcgamer.com/feeds/all/' },
];

// ─── Утилиты хранилища ────────────────────────────────────────────────────────

function readJson(file, fallback) {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
    catch { return fallback; }
}

function writeJson(file, data) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

// ─── Пароли и сессии ──────────────────────────────────────────────────────────

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
    const [salt, hash] = stored.split(':');
    const test = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(test, 'hex'));
}

function createSession(username) {
    const sessions = readJson(SESSIONS_FILE, {});
    const token = crypto.randomBytes(32).toString('hex');
    sessions[token] = { username, createdAt: new Date().toISOString() };
    writeJson(SESSIONS_FILE, sessions);
    return token;
}

function getSession(cookieHeader) {
    const token = parseCookies(cookieHeader).session;
    if (!token) return null;
    const sessions = readJson(SESSIONS_FILE, {});
    const session = sessions[token];
    if (!session) return null;
    if (Date.now() - new Date(session.createdAt).getTime() > 30 * 24 * 60 * 60 * 1000) {
        delete sessions[token];
        writeJson(SESSIONS_FILE, sessions);
        return null;
    }
    return { token, ...session };
}

function deleteSession(token) {
    const sessions = readJson(SESSIONS_FILE, {});
    delete sessions[token];
    writeJson(SESSIONS_FILE, sessions);
}

function parseCookies(header) {
    const cookies = {};
    if (!header) return cookies;
    header.split(';').forEach(part => {
        const [k, ...v] = part.trim().split('=');
        if (k) cookies[k.trim()] = v.join('=').trim();
    });
    return cookies;
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        let size = 0;
        req.on('data', chunk => {
            size += chunk.length;
            if (size > 16 * 1024) { req.destroy(); return reject(new Error('body too large')); }
            body += chunk;
        });
        req.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve({}); } });
        req.on('error', reject);
    });
}

function json(res, status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

// ─── RSS ──────────────────────────────────────────────────────────────────────

function fetchUrl(url, redirects = 5) {
    return new Promise((resolve, reject) => {
        if (redirects === 0) return reject(new Error('too many redirects'));
        const client = url.startsWith('https') ? https : http;
        const req = client.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RSS reader)' },
            timeout: 10000,
        }, res => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                res.resume();
                return fetchUrl(res.headers.location, redirects - 1).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) { res.resume(); return reject(new Error(`HTTP ${res.statusCode}`)); }
            const chunks = [];
            res.on('data', c => chunks.push(c));
            res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    });
}

function stripHtml(html) {
    return html.replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ').trim();
}

function extractImg(html) {
    const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    return m ? m[1] : '';
}

function parseRss(xml, feed) {
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null && items.length < 15) {
        const block = match[1];
        const get = (...patterns) => {
            for (const p of patterns) { const m = block.match(p); if (m && m[1]) return m[1].trim(); }
            return '';
        };
        const title = get(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/, /<title>([\s\S]*?)<\/title>/);
        const link = get(/<link><!\[CDATA\[([\s\S]*?)\]\]><\/link>/, /<link>(https?:\/\/[^\s<]+)<\/link>/, /<link>([\s\S]*?)<\/link>/);
        const pubDate = get(/<pubDate>([\s\S]*?)<\/pubDate>/);
        const description = get(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/, /<description>([\s\S]*?)<\/description>/);
        const thumbnail = get(/<enclosure[^>]+url=["']([^"']+)["']/, /<media:thumbnail[^>]+url=["']([^"']+)["']/, /<media:content[^>]+url=["']([^"']+)["'][^>]+medium=["']image["']/) || extractImg(description);
        if (title && link) items.push({ title, link, date: pubDate ? new Date(pubDate).toISOString() : null, description: stripHtml(description).slice(0, 200), thumbnail, source: feed.id, sourceName: feed.name, sourceColor: feed.color });
    }
    return items;
}

async function fetchAllNews() {
    const results = await Promise.allSettled(
        FEEDS.map(async feed => {
            console.log(`Загружаю ${feed.name}...`);
            const xml = await fetchUrl(feed.url);
            const items = parseRss(xml, feed);
            console.log(`${feed.name}: ${items.length} новостей`);
            return items;
        })
    );
    return results.filter(r => r.status === 'fulfilled').flatMap(r => r.value)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
}

// ─── Сервер ───────────────────────────────────────────────────────────────────

http.createServer(async (req, res) => {
    const { method, headers } = req;
    const url = req.url.split('?')[0];

    // POST /api/register
    if (method === 'POST' && url === '/api/register') {
        const { username, password } = await readBody(req);
        if (!username || !password) return json(res, 400, { error: 'Заполни все поля' });
        if (username.length < 3) return json(res, 400, { error: 'Имя минимум 3 символа' });
        if (password.length < 6) return json(res, 400, { error: 'Пароль минимум 6 символов' });

        const users = readJson(USERS_FILE, []);
        if (users.find(u => u.username.toLowerCase() === username.toLowerCase()))
            return json(res, 400, { error: 'Такой пользователь уже существует' });

        users.push({ username, passwordHash: hashPassword(password) });
        writeJson(USERS_FILE, users);

        const token = createSession(username);
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Set-Cookie': `session=${token}; HttpOnly; Path=/; SameSite=Strict`,
        });
        res.end(JSON.stringify({ username }));
        return;
    }

    // POST /api/login
    if (method === 'POST' && url === '/api/login') {
        const { username, password } = await readBody(req);
        if (!username || !password) return json(res, 400, { error: 'Заполни все поля' });

        const users = readJson(USERS_FILE, []);
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
        if (!user || !verifyPassword(password, user.passwordHash))
            return json(res, 401, { error: 'Неверный логин или пароль' });

        const token = createSession(user.username);
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Set-Cookie': `session=${token}; HttpOnly; Path=/; SameSite=Strict`,
        });
        res.end(JSON.stringify({ username: user.username }));
        return;
    }

    // POST /api/logout
    if (method === 'POST' && url === '/api/logout') {
        const session = getSession(headers.cookie);
        if (session) deleteSession(session.token);
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Set-Cookie': 'session=; HttpOnly; Path=/; Max-Age=0',
        });
        res.end(JSON.stringify({ ok: true }));
        return;
    }

    // GET /api/me
    if (method === 'GET' && url === '/api/me') {
        const session = getSession(headers.cookie);
        if (!session) return json(res, 401, { error: 'Не авторизован' });
        return json(res, 200, { username: session.username });
    }

    // GET /api/reviews?appid=...
    if (method === 'GET' && url === '/api/reviews') {
        const appid = new URL(req.url, 'http://localhost').searchParams.get('appid');
        const all = readJson(REVIEWS_FILE, {});
        return json(res, 200, appid ? (all[appid] || []) : []);
    }

    // POST /api/reviews
    if (method === 'POST' && url === '/api/reviews') {
        const session = getSession(headers.cookie);
        if (!session) return json(res, 401, { error: 'Нужно войти в аккаунт' });

        const { appid, score, text } = await readBody(req);
        if (!appid) return json(res, 400, { error: 'Не указана игра' });

        const scoreNum = parseFloat(score);
        if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 10)
            return json(res, 400, { error: 'Оценка должна быть от 0 до 10' });
        if (!text || !text.trim())
            return json(res, 400, { error: 'Напиши текст рецензии' });
        if (text.trim().length > 300)
            return json(res, 400, { error: 'Рецензия не более 300 символов' });

        const all = readJson(REVIEWS_FILE, {});
        if (!all[appid]) all[appid] = [];
        all[appid] = all[appid].filter(r => r.username !== session.username);
        all[appid].push({
            username: session.username,
            score: Math.round(scoreNum * 10) / 10,
            text: text.trim(),
            date: new Date().toISOString(),
        });
        writeJson(REVIEWS_FILE, all);
        return json(res, 200, { ok: true });
    }

    // DELETE /api/reviews?appid=...  (удалить свою рецензию)
    if (method === 'DELETE' && url === '/api/reviews') {
        const session = getSession(headers.cookie);
        if (!session) return json(res, 401, { error: 'Нужно войти в аккаунт' });

        const appid = new URL(req.url, 'http://localhost').searchParams.get('appid');
        if (!appid) return json(res, 400, { error: 'Не указана игра' });

        const all = readJson(REVIEWS_FILE, {});
        if (all[appid]) all[appid] = all[appid].filter(r => r.username !== session.username);
        writeJson(REVIEWS_FILE, all);
        return json(res, 200, { ok: true });
    }

    // GET /api/steam-games
    if (method === 'GET' && url === '/api/steam-games') {
        try {
            const STEAM_API_KEY = '7521F7BE7A34DAD05626A9C5D181CE01';
            const STEAM_ID = '76561198440636739';
            const apiUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_API_KEY}&steamid=${STEAM_ID}&include_appinfo=true&format=json`;
            const data = await fetchUrl(apiUrl);
            const parsed = JSON.parse(data);
            return json(res, 200, parsed.response?.games || []);
        } catch (err) {
            return json(res, 500, { error: 'Не удалось загрузить игры' });
        }
    }

    // GET /api/news
    if (method === 'GET' && url === '/api/news') {
        try {
            const articles = await fetchAllNews();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(articles));
        } catch (err) {
            console.error('Ошибка загрузки новостей:', err.message);
            res.writeHead(500);
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    // Страницы
    const page = PAGES[url];
    if (page) {
        try {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(renderPage(page.file, page.title));
        } catch (err) {
            res.writeHead(500);
            res.end('Ошибка сервера: ' + err.message);
        }
        return;
    }

    // Статические файлы
    const filePath = path.join(ROOT, url);
    const blocked = ['data', '.claude'].map(d => path.join(ROOT, d) + path.sep);
    if (!filePath.startsWith(ROOT + path.sep) || blocked.some(b => filePath.startsWith(b))) {
        res.writeHead(403); res.end('Forbidden'); return;
    }
    fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not found'); return; }
        const ext = path.extname(filePath);
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
        res.end(data);
    });

}).listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
    console.log('Нажми Ctrl+C чтобы остановить');
});
