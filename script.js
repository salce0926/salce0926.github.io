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

document.querySelectorAll('nav a, .menu a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        // スマホ用メニューはリンクを押したら閉じる
        document.getElementById('menu-btn').checked = false;
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            // 表示中のヘッダー（PC用かスマホ用）の高さを使う。非表示側は0になる
            const headerHeight = Math.max(...Array.from(document.querySelectorAll('header'), h => h.offsetHeight));
            window.scrollTo({
                top: targetElement.getBoundingClientRect().top + window.scrollY - headerHeight,
                behavior: 'smooth'
            });
        }
    });
});
