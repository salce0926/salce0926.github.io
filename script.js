function toggleLanguage(language) {
    var enElements = document.querySelectorAll('.en');
    var jaElements = document.querySelectorAll('.ja');

    if (language === 'en') {
        enElements.forEach(function (el) {
            el.style.display = 'block';
        });
        jaElements.forEach(function (el) {
            el.style.display = 'none';
        });
    } else {
        enElements.forEach(function (el) {
            el.style.display = 'none';
        });
        jaElements.forEach(function (el) {
            el.style.display = 'block';
        });
    }
}
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
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
    });
});