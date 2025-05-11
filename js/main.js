document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

function updateCopyrightYear() {
    const yearElement = document.querySelector('.footer__bottom p');
    if (yearElement) {
        const currentYear = new Date().getFullYear();
        yearElement.innerHTML = `© ${currentYear} IT-Репетитор. Все права защищены.`;
    }
}

function animateOnScroll() {
    const cards = document.querySelectorAll('.about__card, .service-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    cards.forEach(card => {
        card.classList.add('animate-ready');
        observer.observe(card);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    updateCopyrightYear();
    animateOnScroll();
    setInterval(updateCopyrightYear, 60000);
});

