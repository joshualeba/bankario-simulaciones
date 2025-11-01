// Loader
window.addEventListener("load", () => {
    const loader = document.getElementById("loader-screen");
    loader.style.opacity = "0";
    loader.style.visibility = "hidden";
    loader.style.transition = "all 0.5s ease";
  });

// Script para el navbar transparente que cambia al hacer scroll
window.addEventListener('load', function () {
    const navbar = document.querySelector('.navbar-custom');

    // Función para actualizar clase scrolled según scroll y ancho ventana
    function updateNavbar() {
        if (window.innerWidth < 992) {
            // Pantallas pequeñas: siempre con clase scrolled
            navbar.classList.add('scrolled');
        } else {
            // Pantallas grandes: cambiar según scroll
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    }

    // Ejecutar al cargar
    updateNavbar();

    // Ejecutar también cuando se haga scroll o se cambie tamaño
    window.addEventListener('scroll', updateNavbar);
    window.addEventListener('resize', updateNavbar);
});

// Smooth scrolling para los enlaces del navbar
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

// Cerrar el navbar en móviles cuando se hace clic en un enlace
document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    link.addEventListener('click', () => {
        const navbarCollapse = document.querySelector('.navbar-collapse');
        if (navbarCollapse.classList.contains('show')) {
            const bsCollapse = new bootstrap.Collapse(navbarCollapse);
            bsCollapse.hide();
        }
    });
});

// Inicializar el carrusel de testimonios
const swiper = new Swiper('.mySwiper', {
    slidesPerView: 3,
    spaceBetween: 30,
    loop: true,
    autoplay: {
      delay: 2000,        // Tiempo entre desplazamientos
      disableOnInteraction: false,
    },
    speed: 1500,          // Duración del desplazamiento (más alto = más lento)
    breakpoints: {
      992: { slidesPerView: 3 },
      768: { slidesPerView: 2 },
      0: { slidesPerView: 1 },
    },
  });

// Modal
const modal = document.getElementById('info-modal');
  const btnInfo = document.getElementById('btn-info');
  const btnOk = document.getElementById('btn-ok');

  // Abrir modal
  btnInfo.addEventListener('click', () => {
    modal.style.display = 'flex';
  });

  // Cerrar modal con el botón "OK"
  btnOk.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Cerrar modal haciendo clic fuera del contenido
  window.addEventListener('click', (e) => {
    if (e.target === modal) {   
      modal.style.display = 'none';
    }
  });

// Efecto lazy load para elementos y títulos de sección
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