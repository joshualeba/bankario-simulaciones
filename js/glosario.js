document.addEventListener('DOMContentLoaded', () => {
    // Sección: Loader
    const loader = document.querySelector('.loader_p');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
                document.body.classList.remove('loader_bg'); // Quita el overflow hidden del body
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

    // Sección: Lógica para dropdowns y efecto borroso (similar a simulacion_ahorro.js)
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
                body.classList.add('overlay-active');
            } else {
                mainContent.classList.remove('blurred-content');
                body.classList.remove('overlay-active');
            }
        }
    }

    function toggleDropdown(button, dropdown) {
        const isShown = dropdown.classList.contains('show');

        // Cierra cualquier otro dropdown abierto (si hubiera más)
        // En este caso, solo el de usuario
        if (button === userBtn && userDropdown.classList.contains('show')) {
            userDropdown.classList.remove('show');
            userBtn.setAttribute('aria-expanded', 'false');
        }

        dropdown.classList.toggle('show');
        button.setAttribute('aria-expanded', !isShown);

        const anyDropdownOpen = userDropdown.classList.contains('show');
        applyBlurEffect(anyDropdownOpen);
    }

    if (userBtn && userDropdown) {
        userBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleDropdown(userBtn, userDropdown);
        });
    }

    // Cerrar dropdowns y quitar el desenfoque al hacer clic fuera
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
            applyBlurEffect(false); // Quita el desenfoque
            logoutModal.show(); // Muestra el modal
        });
    }

    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener('click', () => {
            console.log('Cerrando sesión...');
            window.location.href = "/logout"; // Redirige a la página de logout en Flask
            logoutModal.hide(); // Oculta el modal
        });
    }

    // Sección: Lógica de búsqueda del glosario
    const glossarySearchInput = document.getElementById('glossarySearchInput');
    const glossaryTermsContainer = document.getElementById('glossaryTermsContainer');
    const filteringIndicator = document.getElementById('filteringIndicator'); // Nuevo elemento

    if (glossarySearchInput && glossaryTermsContainer && filteringIndicator) {
        glossarySearchInput.addEventListener('keyup', () => {
            const searchTerm = glossarySearchInput.value.toLowerCase().trim();
            const terms = glossaryTermsContainer.querySelectorAll('.glossary-item');

            if (searchTerm.length > 0) {
                filteringIndicator.style.display = 'block'; // Muestra el indicador
            } else {
                filteringIndicator.style.display = 'none'; // Oculta el indicador
            }

            terms.forEach(term => {
                const termText = term.dataset.term.toLowerCase(); // Usamos data-term para el nombre del término
                const definitionText = term.querySelector('p').textContent.toLowerCase(); // Texto de la definición

                if (termText.includes(searchTerm) || definitionText.includes(searchTerm)) {
                    term.style.display = 'block'; // Muestra el término
                } else {
                    term.style.display = 'none'; // Oculta el término
                }
            });
        });
    }

    // --- LÓGICA PARA EL MODAL DE RECOMENDACIONES ---

    const recommendationsBtn = document.getElementById('recommendationsBtn');
    const recommendationsModalElement = document.getElementById('recommendationsModal');
    let recommendationsModal;

    if (recommendationsModalElement) {
        recommendationsModal = new bootstrap.Modal(recommendationsModalElement);

        // Abrir el modal de recomendaciones
        if (recommendationsBtn) {
            recommendationsBtn.addEventListener('click', () => {
                recommendationsModal.show();
            });
        }

        // Lógica para los enlaces de búsqueda dentro del modal
        recommendationsModalElement.addEventListener('click', (event) => {
            if (event.target.classList.contains('glossary-link')) {
                event.preventDefault(); // Evita que el enlace "#" navegue
                
                const termToSearch = event.target.dataset.term;
                
                if (glossarySearchInput && termToSearch) {
                    // 1. Poner el término en la barra de búsqueda
                    glossarySearchInput.value = termToSearch;
                    
                    // 2. Disparar el evento 'keyup' para activar el filtro existente
                    const keyupEvent = new Event('keyup');
                    glossarySearchInput.dispatchEvent(keyupEvent);
                    
                    // 3. Cerrar el modal
                    recommendationsModal.hide();
                    
                    // 4. Hacer scroll hasta la barra de búsqueda (útil en móviles)
                    glossarySearchInput.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                    
                    // 5. Poner el foco en la barra de búsqueda
                    glossarySearchInput.focus();
                }
            }
        });

        // Aplicar efecto blur cuando el modal de recomendaciones se muestra/oculta
        recommendationsModalElement.addEventListener('show.bs.modal', () => {
            toggleModalBlurEffect(true);
        });
        recommendationsModalElement.addEventListener('hide.bs.modal', () => {
            toggleModalBlurEffect(false);
        });
    }
});