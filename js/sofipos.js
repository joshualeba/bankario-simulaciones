document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. LÓGICA DE UI (NAVBAR, TEMA, DROPDOWN)
    // ==========================================

    // Loader
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

    // Botón Regresar
    const browserBackBtn = document.getElementById('browserBackBtn');
    if (browserBackBtn) {
        browserBackBtn.addEventListener('click', () => {
            // Intentar ir al dashboard, si no hay historial ir atrás
            window.history.back();
        });
    }

    // Tema Oscuro/Claro
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

    // Dropdown de Usuario
    const userBtn = document.getElementById('userBtn');
    const userDropdown = document.getElementById('userDropdown');

    if (userBtn && userDropdown) {
        userBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            userDropdown.classList.toggle('show');
            const isShown = userDropdown.classList.contains('show');
            userBtn.setAttribute('aria-expanded', isShown);
        });

        // Cerrar al hacer click fuera
        document.addEventListener('click', (event) => {
            if (!userBtn.contains(event.target) && !userDropdown.contains(event.target)) {
                userDropdown.classList.remove('show');
                userBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Modal Logout
    const logoutBtn = document.getElementById('logoutBtn');
    const confirmLogoutBtn = document.getElementById('confirmLogout');
    let logoutModal;
    if (document.getElementById('logoutModal')) {
        logoutModal = new bootstrap.Modal(document.getElementById('logoutModal'));
    }

    if (logoutBtn && logoutModal) {
        logoutBtn.addEventListener('click', () => {
            userDropdown.classList.remove('show'); // Cerrar dropdown
            logoutModal.show();
        });
    }

    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener('click', () => {
            window.location.href = "/logout";
        });
    }

    // ==========================================
    // 2. LÓGICA DE DATOS SOFIPOS (GRÁFICA)
    // ==========================================

    async function loadSofiposData() {
        try {
            const response = await fetch('/api/sofipos_data');
            const result = await response.json();

            if (result.success) {
                renderChart(result.data);
                renderCards(result.data);
            } else {
                console.error('Error al cargar datos:', result.message);
            }
        } catch (error) {
            console.error('Error de red:', error);
        }
    }

    function renderChart(data) {
        const ctx = document.getElementById('sofiposChart').getContext('2d');
        
        // Filtrar los top 10 para que la gráfica no se vea amontonada
        // O usar todos si prefieres
        const displayData = data.slice(0, 15); 

        const names = displayData.map(item => item.nombre);
        const rates = displayData.map(item => item.tasa);
        
        // Color verde para tasas arriba de 13%, azul para el resto
        const backgroundColors = displayData.map(item => 
            item.tasa >= 13.0 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(37, 99, 235, 0.5)' 
        );

        // Detectar si es modo oscuro para cambiar color de texto de la gráfica
        const isDark = htmlElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#ffffff' : '#666666';
        const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: names,
                datasets: [{
                    label: 'Tasa Anual (%)',
                    data: rates,
                    backgroundColor: backgroundColors,
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    borderWidth: 1,
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Tasa: ${context.raw}% anual`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: gridColor },
                        ticks: { color: textColor }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: textColor }
                    }
                }
            }
        });
    }

    function renderCards(data) {
        const container = document.getElementById('sofipos-cards-container');
        container.innerHTML = '';

        data.forEach(sofipo => {
            const nicapClass = sofipo.nicap === 1 ? 'nicap-1' : 'nicap-2';
            const nicapText = sofipo.nicap === 1 ? 'Nivel 1' : `Nivel ${sofipo.nicap}`;

            const html = `
                <div class="col-md-6 col-lg-4">
                    <div class="glass-panel p-4 h-100 d-flex flex-column justify-content-between">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <h5 class="fw-bold text-primary">${sofipo.nombre}</h5>
                            <span class="badge ${nicapClass}">${nicapText}</span>
                        </div>
                        <div class="text-center mb-3">
                            <h2 class="display-4 fw-bold text-success">${sofipo.tasa}%</h2>
                            <p class="text-muted">Rendimiento anual a ${sofipo.plazo} días</p>
                        </div>
                        <a href="${sofipo.url}" target="_blank" class="btn btn-outline-primary w-100 mt-auto">
                            <i class="bi bi-box-arrow-up-right me-2"></i> Visitar sitio
                        </a>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        });
    }

    loadSofiposData();
});