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

    // --- LÓGICA ESPECÍFICA DEL SIMULADOR DE CRÉDITO ---

    const creditCards = document.querySelectorAll('.credit-card');
    const creditTypeSelectionSection = document.getElementById('credit-type-selection-section');
    const simulationFormSection = document.getElementById('simulation-form-section');
    const formTitle = document.getElementById('form-title');
    const backToCreditTypeSelectionBtn = document.getElementById('backToCreditTypeSelection');
    const creditSimulationForm = document.getElementById('creditSimulationForm');
    const resultsModal = new bootstrap.Modal(document.getElementById('resultsModal'));

    let selectedCreditType = '';

    creditCards.forEach(card => {
        card.addEventListener('click', () => {
            // Quita la selección de todas las tarjetas
            creditCards.forEach(cc => cc.classList.remove('selected'));
            // Selecciona la tarjeta actual
            card.classList.add('selected');

            selectedCreditType = card.dataset.credittype;
            formTitle.textContent = `Simulación de crédito para ${card.querySelector('h5').textContent}`;

            // Oculta todas las secciones de detalles de crédito
            document.querySelectorAll('.credit-details').forEach(detail => detail.classList.add('d-none'));

            // Muestra la sección de detalles correspondiente
            const detailsSection = document.getElementById(`${selectedCreditType}-details`);
            if (detailsSection) {
                detailsSection.classList.remove('d-none');
            }

            // Muestra la sección del formulario y oculta la selección de tipo de crédito
            creditTypeSelectionSection.classList.add('d-none');
            simulationFormSection.classList.remove('d-none');
        });
    });

    backToCreditTypeSelectionBtn.addEventListener('click', () => {
        simulationFormSection.classList.add('d-none');
        creditTypeSelectionSection.classList.remove('d-none');
        creditCards.forEach(card => card.classList.remove('selected'));
        document.querySelectorAll('.credit-details').forEach(detail => detail.classList.add('d-none'));
        creditSimulationForm.reset(); // Limpia el formulario
        // Opcional: limpiar mensajes de validación
        creditSimulationForm.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        creditSimulationForm.querySelectorAll('.invalid-feedback').forEach(el => el.textContent = '');
    });

    creditSimulationForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Evitar el envío del formulario por defecto

        const loanAmountInput = document.getElementById('loanAmount');
        const interestRateInput = document.getElementById('interestRate');
        const loanTermInput = document.getElementById('loanTerm');

        const loanAmount = parseFloat(loanAmountInput.value);
        const interestRate = parseFloat(interestRateInput.value);
        const loanTerm = parseInt(loanTermInput.value);

        let isValid = true;

        // Validación de campos
        if (isNaN(loanAmount) || loanAmount <= 0) {
            loanAmountInput.classList.add('is-invalid');
            loanAmountInput.nextElementSibling.textContent = 'Ingresa un monto de crédito válido (mayor a 0).';
            isValid = false;
        } else {
            loanAmountInput.classList.remove('is-invalid');
        }

        if (isNaN(interestRate) || interestRate <= 0) {
            interestRateInput.classList.add('is-invalid');
            interestRateInput.nextElementSibling.textContent = 'Ingresa una tasa de interés válida (mayor a 0).';
            isValid = false;
        } else {
            interestRateInput.classList.remove('is-invalid');
        }

        if (isNaN(loanTerm) || loanTerm <= 0) {
            loanTermInput.classList.add('is-invalid');
            loanTermInput.nextElementSibling.textContent = 'Ingresa un plazo válido (mayor a 0).';
            isValid = false;
        } else {
            loanTermInput.classList.remove('is-invalid');
        }

        if (!isValid) {
            return; // Detiene la simulación si hay errores de validación
        }

        // Cálculo de la cuota mensual (fórmula de amortización)
        const monthlyInterestRate = (interestRate / 100) / 12;
        let monthlyPayment = 0;
        let totalInterestPaid = 0;

        if (monthlyInterestRate > 0) {
            monthlyPayment = loanAmount * monthlyInterestRate / (1 - Math.pow(1 + monthlyInterestRate, -loanTerm));
            totalInterestPaid = (monthlyPayment * loanTerm) - loanAmount;
        } else {
            // Caso de interés cero
            monthlyPayment = loanAmount / loanTerm;
            totalInterestPaid = 0;
        }
        
        document.getElementById('modalMonthlyPayment').textContent = `Cuota mensual: ${formatCurrency(monthlyPayment)}`;
        document.getElementById('modalTotalInterest').textContent = `Interés total pagado: ${formatCurrency(totalInterestPaid)}`;
        
        // Formatear y mostrar los valores en el modal
        document.getElementById('modalLoanAmount').textContent = formatCurrency(loanAmount);
        document.getElementById('modalInterestRate').textContent = `${interestRate}% anual`;
        document.getElementById('modalLoanTerm').textContent = `${loanTerm} meses`;

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

    // Inicializar mostrando la sección de selección de tipo de crédito
    document.getElementById('simulacion-credito-section').classList.remove('d-none');
});