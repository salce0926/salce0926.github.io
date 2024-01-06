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
    const languageToggleLink = document.getElementsByClassName('languageToggle')[0];
    languageToggleLink.textContent = isEnglish ? '日本語' : 'English';
}

document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        if (!this.classList.contains('languageToggle')) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const headerHeight = document.querySelector('header').offsetHeight;
                window.scrollTo({
                    top: targetElement.offsetTop - headerHeight,
                    behavior: 'smooth'
                });
            }
        }
    });
});