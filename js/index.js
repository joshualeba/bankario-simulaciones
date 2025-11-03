/* ===============================================
   SECCIÓN: LOADER
   =============================================== */
window.addEventListener("load", () => {
    const loader = document.getElementById("loader-screen");
    loader.style.opacity = "0";
    loader.style.visibility = "hidden";
    loader.style.transition = "all 0.5s ease";
});

/* ===============================================
   SECCIÓN: NAVBAR (EFECTO SCROLL)
   =============================================== */
window.addEventListener('load', function () {
    const navbar = document.querySelector('.navbar-custom');

    function updateNavbar() {
        if (window.innerWidth < 992) {
            navbar.classList.add('scrolled');
        } else {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    }
    updateNavbar();
    window.addEventListener('scroll', updateNavbar);
    window.addEventListener('resize', updateNavbar);
});

/* ===============================================
   SECCIÓN: SMOOTH SCROLLING
   =============================================== */
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

/* ===============================================
   SECCIÓN: MENÚ MÓVIL (BLUR Y CIERRE)
   =============================================== */
const navbarCollapse = document.querySelector('.navbar-collapse');
const contentToBlur = document.querySelectorAll('#home, #features, #services, #testimonios, .section-padding, .footer');

function setContentBlur(isBlurred) {
    contentToBlur.forEach(el => {
        if (isBlurred) {
            el.classList.add('content-blur');
        } else {
            el.classList.remove('content-blur');
        }
    });
}

if (navbarCollapse) {
    navbarCollapse.addEventListener('show.bs.collapse', () => {
        setContentBlur(true);
    });
    navbarCollapse.addEventListener('hide.bs.collapse', () => {
        setContentBlur(false);
    });

    // cerrar el navbar en móviles al hacer clic en un enlace
    document.querySelectorAll('.navbar-nav .nav-link, .navbar-nav .btn-accent, .navbar-nav .btn-accent-outline').forEach(link => {
        link.addEventListener('click', () => {
            if (navbarCollapse.classList.contains('show')) {
                const bsCollapse = new bootstrap.Collapse(navbarCollapse);
                bsCollapse.hide();
            }
        });
    });
}

/* ===============================================
   SECCIÓN: CARRUSEL DE TESTIMONIOS
   =============================================== */
const swiper = new Swiper('.mySwiper', {
    slidesPerView: 3,
    spaceBetween: 30,
    loop: true,
    autoplay: {
        delay: 2000,
        disableOnInteraction: false,
    },
    speed: 1500,
    breakpoints: {
        992: { slidesPerView: 3 },
        768: { slidesPerView: 2 },
        0: { slidesPerView: 1 },
    },
});

/* ===============================================
   SECCIÓN: MODAL "MÁS INFORMACIÓN"
   =============================================== */
const modal = document.getElementById('info-modal');
const btnInfo = document.getElementById('btn-info');
const btnOk = document.getElementById('btn-ok');

if(modal && btnInfo && btnOk) {
    btnInfo.addEventListener('click', () => {
        modal.style.display = 'flex';
    });
    btnOk.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

/* ===============================================
   SECCIÓN: MODAL "TÉRMINOS Y CONDICIONES"
   =============================================== */
const termsModal = document.getElementById('terms-modal');
const termsLink = document.getElementById('termsLink');
const termsBtnOk = document.getElementById('btn-terms-ok');

if(termsModal && termsLink && termsBtnOk) {
    
    termsLink.addEventListener('click', (e) => {
        e.preventDefault(); 
        termsModal.style.display = 'flex';
    });

    termsBtnOk.addEventListener('click', () => {
        termsModal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === termsModal) {
            termsModal.style.display = 'none';
        }
    });
}

/* ===============================================
   SECCIÓN: EFECTO LAZY LOAD
   =============================================== */
document.addEventListener("DOMContentLoaded", () => {
    const lazyElements = document.querySelectorAll(".lazy-load");
    const sectionTitles = document.querySelectorAll(".section-title");

    const observerOptions = {
        threshold: 0.1
    };

    const lazyObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    lazyElements.forEach(el => lazyObserver.observe(el));
    sectionTitles.forEach(el => lazyObserver.observe(el));
});

/* ===============================================
   SECCIÓN: EFECTO TYPED (TÍTULO)
   =============================================== */
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('typed-text')) {
        var options = {
            strings: [
                'simular tu futuro financiero',
                'planificar tus ahorros',
                'entender tus créditos',
                'alcanzar tus metas financieras',
                'invertir con confianza',
                'dominar tus finanzas personales'
            ],
            typeSpeed: 50,
            backSpeed: 30,
            backDelay: 1500,
            startDelay: 500,
            loop: true,
            smartBackspace: true
        };
        var typed = new Typed('#typed-text', options);
    }
});