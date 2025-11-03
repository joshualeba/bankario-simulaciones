document.addEventListener('DOMContentLoaded', () => {

    // Sección: Loader
    const loader = document.querySelector('.loader_p');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
                document.body.classList.remove('loader_bg');
            }, 500);
        }, 1000);
    }

    // Sección: Toggle para modo oscuro
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const htmlElement = document.documentElement;

    if (themeToggle && themeIcon && htmlElement) {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            htmlElement.setAttribute('data-theme', savedTheme);
            if (savedTheme === 'dark') {
                themeIcon.classList.remove('bi-sun-fill');
                themeIcon.classList.add('bi-moon-fill');
            } else {
                themeIcon.classList.remove('bi-moon-fill');
                themeIcon.classList.add('bi-sun-fill');
            }
        } else {
            htmlElement.setAttribute('data-theme', 'light');
            themeIcon.classList.add('bi-sun-fill');
        }

        themeToggle.addEventListener('click', () => {
            if (htmlElement.getAttribute('data-theme') === 'dark') {
                htmlElement.setAttribute('data-theme', 'light');
                themeIcon.classList.remove('bi-moon-fill');
                themeIcon.classList.add('bi-sun-fill');
            } else {
                htmlElement.setAttribute('data-theme', 'dark');
                themeIcon.classList.remove('bi-sun-fill');
                themeIcon.classList.add('bi-moon-fill');
            }
            localStorage.setItem('theme', htmlElement.getAttribute('data-theme'));
        });
    }

    // Sección: Lógica para dropdowns y efecto borroso
    const userBtn = document.getElementById('userBtn');
    const userDropdown = document.getElementById('userDropdown');
    const mainContent = document.querySelector('.main-content');
    const body = document.body;

    function applyBlurEffect(isActive) {
        if (mainContent) {
            if (isActive) {
                mainContent.classList.add('blurred-content');
                body.classList.add('overlay-active');
            } else {
                mainContent.classList.remove('blurred-content');
                body.classList.remove('overlay-active');
            }
        }
    }

    function toggleModalBlurEffect(show) {
        if (mainContent) {
            if (show) {
                mainContent.classList.add('blurred-content');
            } else {
                mainContent.classList.remove('blurred-content');
            }
        }
    }

    function toggleDropdown(button, dropdown) {
        const isShown = dropdown.classList.toggle('show');
        button.setAttribute('aria-expanded', isShown);
        applyBlurEffect(isShown);
    }

    if (userBtn && userDropdown) {
        userBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleDropdown(userBtn, userDropdown);
        });
    }

    document.addEventListener('click', (event) => {
        let dropdownOpen = false;
        if (userDropdown && userDropdown.classList.contains('show')) {
            if (!userDropdown.contains(event.target) && !userBtn.contains(event.target)) {
                userDropdown.classList.remove('show');
                userBtn.setAttribute('aria-expanded', 'false');
            } else {
                dropdownOpen = true;
            }
        }

        if (!dropdownOpen) {
            applyBlurEffect(false);
        }
    });

    // Sección: Lógica del modal de cerrar sesión
    const logoutBtn = document.getElementById('logoutBtn');
    const confirmLogoutBtn = document.getElementById('confirmLogout');
    let logoutModal;
    if (document.getElementById('logoutModal')) {
        logoutModal = new bootstrap.Modal(document.getElementById('logoutModal'));
        document.getElementById('logoutModal').addEventListener('show.bs.modal', () => {
            toggleModalBlurEffect(true);
        });
        document.getElementById('logoutModal').addEventListener('hide.bs.modal', () => {
            toggleModalBlurEffect(false);
        });
    }

    if (logoutBtn && logoutModal) {
        logoutBtn.addEventListener('click', () => {
            userDropdown.classList.remove('show');
            userBtn.setAttribute('aria-expanded', 'false');
            applyBlurEffect(false);
            logoutModal.show();
        });
    }

    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener('click', () => {
            window.location.href = "/logout";
            logoutModal.hide();
        });
    }

    // Sección: Lógica de búsqueda del glosario
    const glossarySearchInput = document.getElementById('glossarySearchInput');
    const glossaryTermsContainer = document.getElementById('glossaryTermsContainer');
    const filteringIndicator = document.getElementById('filteringIndicator');

    if (glossarySearchInput && glossaryTermsContainer && filteringIndicator) {
        glossarySearchInput.addEventListener('keyup', () => {
            const searchTerm = glossarySearchInput.value.toLowerCase().trim();
            const terms = glossaryTermsContainer.querySelectorAll('.glossary-item');

            if (searchTerm.length > 0) {
                filteringIndicator.style.display = 'block';
            } else {
                filteringIndicator.style.display = 'none';
            }

            terms.forEach(term => {
                const termText = term.dataset.term.toLowerCase();
                const definitionText = term.querySelector('p').textContent.toLowerCase();

                if (termText.includes(searchTerm) || definitionText.includes(searchTerm)) {
                    term.style.display = 'block';
                } else {
                    term.style.display = 'none';
                }
            });
        });
    }

    // Sección: Lógica para el modal de recomendaciones
    const recommendationsBtn = document.getElementById('recommendationsBtn');
    const recommendationsModalElement = document.getElementById('recommendationsModal');
    let recommendationsModal;

    if (recommendationsModalElement) {
        recommendationsModal = new bootstrap.Modal(recommendationsModalElement);

        if (recommendationsBtn) {
            recommendationsBtn.addEventListener('click', () => {
                recommendationsModal.show();
            });
        }

        recommendationsModalElement.addEventListener('click', (event) => {
            if (event.target.classList.contains('glossary-link')) {
                event.preventDefault(); 
                
                const termToSearch = event.target.dataset.term;
                
                if (glossarySearchInput && termToSearch) {
                    glossarySearchInput.value = termToSearch;
                    
                    const keyupEvent = new Event('keyup');
                    glossarySearchInput.dispatchEvent(keyupEvent);
                    
                    recommendationsModal.hide();
                    
                    glossarySearchInput.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                    
                    glossarySearchInput.focus();
                }
            }
        });

        recommendationsModalElement.addEventListener('show.bs.modal', () => {
            toggleModalBlurEffect(true);
        });
        recommendationsModalElement.addEventListener('hide.bs.modal', () => {
            toggleModalBlurEffect(false);
        });
    }

    // sección: lógica del botón de regresar del navegador
    const browserBackBtn = document.getElementById('browserBackBtn');
    if (browserBackBtn) {
        browserBackBtn.addEventListener('click', () => {
            window.history.back();
        });
    }
});