let isEnglish = true; // 初期値は英語

function toggleLanguage() {
    var enElements = document.querySelectorAll('.en');
    var jaElements = document.querySelectorAll('.ja');
    // 言語を切り替え
    isEnglish = !isEnglish;

    // 各要素の表示・非表示をトグル
    enElements.forEach(function (el) {
        el.style.display = isEnglish ? 'block' : 'none';
    });
    jaElements.forEach(function (el) {
        el.style.display = isEnglish ? 'none' : 'block';
    });

    // 言語切り替えリンクの表示を切り替え
    const languageToggleLink = document.getElementsByClassName('languageToggle');
    languageToggleLink[0].textContent = isEnglish ? '日本語' : 'English';
    languageToggleLink[1].textContent = isEnglish ? '日本語' : 'English';
}

document.querySelectorAll('nav a, .menu a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        if (!this.classList.contains('languageToggle')) {
            e.preventDefault();
            // スマホ用メニューはリンクを押したら閉じる
            document.getElementById('menu-btn').checked = false;
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                // 表示中のヘッダー（PC用かスマホ用）の高さを使う。非表示側は0になる
                const headerHeight = Math.max(...Array.from(document.querySelectorAll('header'), h => h.offsetHeight));
                window.scrollTo({
                    top: targetElement.offsetTop - headerHeight,
                    behavior: 'smooth'
                });
            }
        }
    });
});