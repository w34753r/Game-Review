(function () {
    // ─── Стили ────────────────────────────────────────────────────────────────

    const style = document.createElement('style');
    style.textContent = `
        .auth-modal-overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.75);
            z-index: 1000;
            align-items: center;
            justify-content: center;
        }
        .auth-modal-overlay.open { display: flex; }

        .auth-modal {
            background: #1a1a2e;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 16px;
            padding: 36px 40px;
            width: 100%;
            max-width: 400px;
            position: relative;
        }

        .auth-modal__close {
            position: absolute;
            top: 16px;
            right: 20px;
            background: none;
            border: none;
            color: rgba(255,255,255,0.4);
            font-size: 20px;
            cursor: pointer;
            line-height: 1;
        }
        .auth-modal__close:hover { color: #fff; }

        .auth-modal__tabs {
            display: flex;
            gap: 8px;
            margin-bottom: 28px;
        }

        .auth-modal__tab {
            flex: 1;
            padding: 10px;
            border: none;
            border-radius: 8px;
            background: rgba(255,255,255,0.06);
            color: rgba(255,255,255,0.5);
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s, color 0.2s;
        }
        .auth-modal__tab.active {
            background: #FF6B35;
            color: #fff;
        }

        .auth-modal__form { display: flex; flex-direction: column; gap: 14px; }

        .auth-modal__input {
            width: 100%;
            padding: 12px 16px;
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            color: #fff;
            font-size: 15px;
            outline: none;
            box-sizing: border-box;
            transition: border-color 0.2s;
        }
        .auth-modal__input:focus { border-color: #FF6B35; }
        .auth-modal__input::placeholder { color: rgba(255,255,255,0.3); }

        .auth-modal__error {
            color: #E63946;
            font-size: 13px;
            min-height: 18px;
        }

        .auth-modal__submit {
            width: 100%;
            padding: 13px;
            background: #FF6B35;
            border: none;
            border-radius: 8px;
            color: #fff;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            transition: opacity 0.2s;
        }
        .auth-modal__submit:hover { opacity: 0.85; }
        .auth-modal__submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .header_user {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .header_username {
            color: #fff;
            font-size: 14px;
            font-weight: 600;
        }

        .btn--danger {
            border: 2px solid #4f1718;
            background: #4f1718;
            color: #fff;
            border-radius: 8px;
            padding: 8px 18px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.2s;
        }
        .btn--danger:hover { opacity: 0.8; }
    `;
    document.head.appendChild(style);

    // ─── Разметка ─────────────────────────────────────────────────────────────

    const overlay = document.createElement('div');
    overlay.className = 'auth-modal-overlay';
    overlay.innerHTML = `
        <div class="auth-modal">
            <button class="auth-modal__close">✕</button>
            <div class="auth-modal__tabs">
                <button class="auth-modal__tab active" data-tab="login">Войти</button>
                <button class="auth-modal__tab" data-tab="register">Регистрация</button>
            </div>
            <form class="auth-modal__form">
                <input class="auth-modal__input" type="text" name="username" placeholder="Имя пользователя" autocomplete="username" />
                <input class="auth-modal__input" type="password" name="password" placeholder="Пароль" autocomplete="current-password" />
                <div class="auth-modal__error"></div>
                <button class="auth-modal__submit" type="submit">Войти</button>
            </form>
        </div>
    `;
    document.body.appendChild(overlay);

    const modal       = overlay.querySelector('.auth-modal');
    const closeBtn    = overlay.querySelector('.auth-modal__close');
    const tabs        = overlay.querySelectorAll('.auth-modal__tab');
    const form        = overlay.querySelector('.auth-modal__form');
    const usernameInput = form.querySelector('[name="username"]');
    const passwordInput = form.querySelector('[name="password"]');
    const errorEl     = overlay.querySelector('.auth-modal__error');
    const submitBtn   = overlay.querySelector('.auth-modal__submit');

    let currentTab = 'login';

    // ─── Логика модалки ───────────────────────────────────────────────────────

    function openModal(tab = 'login') {
        switchTab(tab);
        overlay.classList.add('open');
        usernameInput.focus();
    }

    function closeModal() {
        overlay.classList.remove('open');
        form.reset();
        errorEl.textContent = '';
    }

    function switchTab(tab) {
        currentTab = tab;
        tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
        submitBtn.textContent = tab === 'login' ? 'Войти' : 'Зарегистрироваться';
        errorEl.textContent = '';
    }

    tabs.forEach(tab => tab.addEventListener('click', () => switchTab(tab.dataset.tab)));
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

    form.addEventListener('submit', async e => {
        e.preventDefault();
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        errorEl.textContent = '';
        submitBtn.disabled = true;

        try {
            const res = await fetch(`/api/${currentTab}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                errorEl.textContent = data.error || 'Что-то пошло не так';
            } else {
                closeModal();
                setLoggedIn(data.username);
            }
        } catch {
            errorEl.textContent = 'Ошибка соединения с сервером';
        } finally {
            submitBtn.disabled = false;
        }
    });

    // ─── Шапка ────────────────────────────────────────────────────────────────

    function setLoggedIn(username) {
        const authEl = document.querySelector('.header_auth');
        if (!authEl) return;
        authEl.innerHTML = `
            <div class="header_user">
                <span class="header_username">${escapeHtml(username)}</span>
                <button class="btn--danger" id="logoutBtn">Выйти</button>
            </div>
        `;
        document.getElementById('logoutBtn').addEventListener('click', logout);
    }

    function setLoggedOut() {
        const authEl = document.querySelector('.header_auth');
        if (!authEl) return;
        authEl.innerHTML = `
            <a href="#" class="btn btn--ghost" id="loginBtn">Войти</a>
            <a href="#" class="btn btn--primary" id="registerBtn">Регистрация</a>
        `;
        document.getElementById('loginBtn').addEventListener('click', e => { e.preventDefault(); openModal('login'); });
        document.getElementById('registerBtn').addEventListener('click', e => { e.preventDefault(); openModal('register'); });
    }

    async function logout() {
        await fetch('/api/logout', { method: 'POST' });
        setLoggedOut();
    }

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // ─── Инициализация ────────────────────────────────────────────────────────

    async function init() {
        try {
            const res = await fetch('/api/me');
            if (res.ok) {
                const { username } = await res.json();
                setLoggedIn(username);
                return;
            }
        } catch {}
        setLoggedOut();
    }

    init();
})();
