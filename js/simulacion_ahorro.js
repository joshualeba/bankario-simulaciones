document.addEventListener('DOMContentLoaded', () => {
    // LOADER
    const loader = document.querySelector('.loader_p');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
                document.body.classList.remove('loader_bg'); // quita el overflow hidden del body
            }, 500);
        }, 1000);
    }

    // TOGGLE PARA MODO OSCURO
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

    // LÓGICA PARA DROPDOWNS Y EFECTO BORROSO
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const userBtn = document.getElementById('userBtn');
    const userDropdown = document.getElementById('userDropdown');

    const mainContent = document.querySelector('.main-content');
    const body = document.body;

    function applyBlurEffect(isActive) {
        if (mainContent) {
            if (isActive) {
                mainContent.classList.add('blurred-content');
                body.classList.add('overlay-active'); // añade la clase para el overlay
            } else {
                mainContent.classList.remove('blurred-content');
                body.classList.remove('overlay-active'); // remueve la clase del body
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

        // cierra otros dropdowns si están abiertos
        if (button === notificationBtn && userDropdown.classList.contains('show')) {
            userDropdown.classList.remove('show');
            userBtn.setAttribute('aria-expanded', 'false');
        } else if (button === userBtn && notificationDropdown.classList.contains('show')) {
            notificationDropdown.classList.remove('show');
            notificationBtn.setAttribute('aria-expanded', 'false');
        }

        dropdown.classList.toggle('show');
        button.setAttribute('aria-expanded', !isShown);

        // aplica/remueve el desenfoque si algún dropdown está abierto
        const anyDropdownOpen = notificationDropdown.classList.contains('show') || userDropdown.classList.contains('show');
        applyBlurEffect(anyDropdownOpen);
    }

    if (notificationBtn && notificationDropdown) {
        notificationBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleDropdown(notificationBtn, notificationDropdown);
        });
    }

    if (userBtn && userDropdown) {
        userBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleDropdown(userBtn, userDropdown);
        });
    }

    // cerrar dropdowns y quitar el desenfoque al hacer clic fuera
    document.addEventListener('click', (event) => {
        let dropdownOpen = false;
        if (notificationDropdown && notificationDropdown.classList.contains('show')) {
            if (!notificationDropdown.contains(event.target) && !notificationBtn.contains(event.target)) {
                notificationDropdown.classList.remove('show');
                notificationBtn.setAttribute('aria-expanded', 'false');
            } else {
                dropdownOpen = true;
            }
        }

        if (userDropdown && userDropdown.classList.contains('show')) {
            if (!userDropdown.contains(event.target) && !userBtn.contains(event.target)) {
                userDropdown.classList.remove('show');
                userBtn.setAttribute('aria-expanded', 'false');
            } else {
                dropdownOpen = true;
            }
        }

        // aplica/remueve desenfoque según si algún dropdown sigue abierto
        if (!dropdownOpen) {
            applyBlurEffect(false);
        }
    });

    // LÓGICA DEL MODAL DE CERRAR SESIÓN
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
            // cierra dropdowns antes de mostrar el modal
            notificationDropdown.classList.remove('show');
            notificationBtn.setAttribute('aria-expanded', 'false');
            userDropdown.classList.remove('show');
            userBtn.setAttribute('aria-expanded', 'false');
            applyBlurEffect(false); // quita el desenfoque
            logoutModal.show(); // muestra el modal
        });
    }

    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener('click', () => {
            console.log('cerrando sesión...');
            window.location.href = "dashboard.html"; // redirige a la página principal
            logoutModal.hide(); // oculta el modal
        });
    }

    // --- LÓGICA ESPECÍFICA DEL SIMULADOR DE AHORRO ---

    const metaCards = document.querySelectorAll('.meta-card');
    const metaSelectionSection = document.getElementById('meta-selection-section');
    const simulationFormSection = document.getElementById('simulation-form-section');
    const formTitle = document.getElementById('form-title');
    const backToMetaSelectionBtn = document.getElementById('backToMetaSelection');
    const savingSimulationForm = document.getElementById('savingSimulationForm');
    const resultsModal = new bootstrap.Modal(document.getElementById('resultsModal'));

    let selectedMeta = '';

    metaCards.forEach(card => {
        card.addEventListener('click', () => {
            // Quita la selección de todas las tarjetas
            metaCards.forEach(mc => mc.classList.remove('selected'));
            // Selecciona la tarjeta actual
            card.classList.add('selected');

            selectedMeta = card.dataset.meta;
            formTitle.textContent = `Simulación de Ahorro para ${card.querySelector('h5').textContent}`;

            // Oculta todas las secciones de detalles de meta
            document.querySelectorAll('.meta-details').forEach(detail => detail.classList.add('d-none'));

            // Muestra la sección de detalles correspondiente
            const detailsSection = document.getElementById(`${selectedMeta}-details`);
            if (detailsSection) {
                detailsSection.classList.remove('d-none');
            }

            // Muestra la sección del formulario y oculta la selección de meta
            metaSelectionSection.classList.add('d-none');
            simulationFormSection.classList.remove('d-none');
        });
    });

    backToMetaSelectionBtn.addEventListener('click', () => {
        simulationFormSection.classList.add('d-none');
        metaSelectionSection.classList.remove('d-none');
        metaCards.forEach(card => card.classList.remove('selected'));
        document.querySelectorAll('.meta-details').forEach(detail => detail.classList.add('d-none'));
        savingSimulationForm.reset(); // Limpia el formulario
        // Opcional: limpiar mensajes de validación
        savingSimulationForm.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        savingSimulationForm.querySelectorAll('.invalid-feedback').forEach(el => el.textContent = '');
    });

    savingSimulationForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Evitar el envío del formulario por defecto

        const currentAmountInput = document.getElementById('currentAmount');
        const goalAmountInput = document.getElementById('goalAmount');
        const monthlyContributionInput = document.getElementById('monthlyContribution');

        const currentAmount = parseFloat(currentAmountInput.value);
        const goalAmount = parseFloat(goalAmountInput.value);
        const monthlyContribution = parseFloat(monthlyContributionInput.value);

        let isValid = true;

        // Validación de campos
        if (isNaN(currentAmount) || currentAmount < 0) {
            currentAmountInput.classList.add('is-invalid');
            currentAmountInput.nextElementSibling.textContent = 'Ingresa una cantidad inicial válida (mayor o igual a 0).';
            isValid = false;
        } else {
            currentAmountInput.classList.remove('is-invalid');
        }

        if (isNaN(goalAmount) || goalAmount <= 0) {
            goalAmountInput.classList.add('is-invalid');
            goalAmountInput.nextElementSibling.textContent = 'Ingresa tu meta de ahorro (mayor a 0).';
            isValid = false;
        } else {
            goalAmountInput.classList.remove('is-invalid');
        }

        if (isNaN(monthlyContribution) || monthlyContribution < 0) {
            monthlyContributionInput.classList.add('is-invalid');
            monthlyContributionInput.nextElementSibling.textContent = 'Ingresa un aporte mensual válido (mayor o igual a 0).';
            isValid = false;
        } else {
            monthlyContributionInput.classList.remove('is-invalid');
        }

        if (!isValid) {
            return; // Detiene la simulación si hay errores de validación
        }

        if (currentAmount >= goalAmount) {
            // Si ya se alcanzó la meta
            document.getElementById('modalResultText').textContent = `¡Felicidades! Ya alcanzaste tu meta de ${formatCurrency(goalAmount)}.`;
        } else if (monthlyContribution === 0) {
            // Si no hay aporte mensual y la meta no se ha alcanzado
            document.getElementById('modalResultText').textContent = `Para alcanzar tu meta de ${formatCurrency(goalAmount)}, necesitas aportar más de ${formatCurrency(currentAmount)} mensualmente.`;
        } else {
            // Calcular el monto restante a ahorrar
            const remainingAmount = goalAmount - currentAmount;
            // Calcular los meses necesarios
            const monthsNeeded = Math.ceil(remainingAmount / monthlyContribution);

            let resultText = '';
            if (monthsNeeded === 1) {
                resultText = `Necesitarás aproximadamente 1 mes para alcanzar tu meta.`;
            } else if (monthsNeeded < 12) {
                resultText = `Necesitarás aproximadamente ${monthsNeeded} meses para alcanzar tu meta.`;
            } else {
                const years = Math.floor(monthsNeeded / 12);
                const remainingMonths = monthsNeeded % 12;
                if (remainingMonths === 0) {
                    resultText = `Necesitarás aproximadamente ${years} año(s) para alcanzar tu meta.`;
                } else {
                    resultText = `Necesitarás aproximadamente ${years} año(s) y ${remainingMonths} mes(es) para alcanzar tu meta.`;
                }
            }
            document.getElementById('modalResultText').textContent = resultText;
        }
        
        // Formatear y mostrar los valores en el modal
        document.getElementById('modalGoalAmount').textContent = formatCurrency(goalAmount);
        document.getElementById('modalMonthlyContribution').textContent = formatCurrency(monthlyContribution);
        document.getElementById('modalCurrentAmount').textContent = formatCurrency(currentAmount);

        resultsModal.show(); // Muestra el modal de resultados
    });

    // Función para formatear moneda
    function formatCurrency(amount) {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    // Inicializar mostrando la sección de selección de meta
    document.getElementById('simulacion-ahorro-section').classList.remove('d-none');
});