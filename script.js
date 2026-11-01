// 表示言語は <html lang> で切り替える。.en / .ja の出し分けは style.css 側で行う
function setLanguage(lang) {
    document.documentElement.lang = lang;
    try {
        localStorage.setItem('lang', lang);
    } catch (e) {}

    // 言語切り替えボタンには「切り替え先」の言語名を出す
    document.querySelectorAll('.languageToggle').forEach(function (button) {
        button.textContent = lang === 'ja' ? 'English' : '日本語';
    });
}

function toggleLanguage() {
    setLanguage(document.documentElement.lang === 'ja' ? 'en' : 'ja');
}

// 前回選んだ言語でボタンの表示をそろえる（<html lang> は head の中で反映済み）
setLanguage(document.documentElement.lang === 'ja' ? 'ja' : 'en');

document.querySelectorAll('nav a, .menu a, .hero-cta').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        // スマホ用メニューはリンクを押したら閉じる
        document.getElementById('menu-btn').checked = false;
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            // 表示中のヘッダー（PC用かスマホ用）の高さを使う。非表示側は0になる
            let offset = Math.max(...Array.from(document.querySelectorAll('header'), h => h.offsetHeight));
            // 分類へ飛ぶときは、ヘッダーの下に貼りつく分類ボタンの分もずらす
            if (targetElement.classList.contains('category')) {
                offset += document.querySelector('.category-nav').offsetHeight + 12;
                // 最後の分類は上端まで届かないことがあるので、押したボタンをそのまま強調しておく
                setActiveCategory(categories.indexOf(targetElement));
                categoryLockUntil = Date.now() + 1000;
            }
            window.scrollTo({
                top: targetElement.getBoundingClientRect().top + window.scrollY - offset,
                behavior: 'smooth'
            });
        }
    });
});

// いま見えている分類のボタンを強調する
const categoryLinks = Array.from(document.querySelectorAll('.category-nav a'));
const categories = categoryLinks.map(link => document.getElementById(link.getAttribute('href').substring(1)));

let categoryLockUntil = 0;

function updateActiveCategory() {
    if (Date.now() < categoryLockUntil) return;
    const line = document.querySelector('.category-nav').getBoundingClientRect().bottom + 20;
    let active = -1;
    categories.forEach((section, i) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= line && rect.bottom > line) active = i;
    });
    setActiveCategory(active);
}

function setActiveCategory(active) {
    const nav = document.querySelector('.category-nav');
    categoryLinks.forEach((link, i) => {
        const isActive = i === active;
        if (link.classList.contains('is-active') !== isActive) {
            link.classList.toggle('is-active', isActive);
            // 横スクロールしている分類ボタンでも、強調中のものが見えるようにする
            if (isActive && nav.scrollWidth > nav.clientWidth) {
                nav.scrollTo({ left: link.offsetLeft - (nav.clientWidth - link.offsetWidth) / 2, behavior: 'smooth' });
            }
        }
    });
}

window.addEventListener('scroll', updateActiveCategory, { passive: true });
window.addEventListener('resize', updateActiveCategory);
updateActiveCategory();
