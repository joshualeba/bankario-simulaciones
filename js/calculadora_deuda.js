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
            if (notificationDropdown) {
                notificationDropdown.classList.remove('show');
                notificationBtn.setAttribute('aria-expanded', 'false');
            }
            if (userDropdown) {
                userDropdown.classList.remove('show');
                userBtn.setAttribute('aria-expanded', 'false');
            }
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

    // --- LÓGICA ESPECÍFICA DE LA CALCULADORA DE DEUDA ---

    const debtForm = document.getElementById('debtForm');
    const debtResultsSection = document.getElementById('debt-results-section');
    const monthsToPayResult = document.getElementById('monthsToPayResult');
    const totalInterestPaidResult = document.getElementById('totalInterestPaidResult');
    const debtSummaryMessage = document.getElementById('debt-summary-message');
    const resetDebtFormBtn = document.getElementById('resetDebtForm');
    const errorMessageModal = new bootstrap.Modal(document.getElementById('errorMessageModal'));
    const errorMessageModalBody = document.getElementById('errorMessageModalBody');

    debtForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const debtAmountInput = document.getElementById('debtAmount');
        const annualInterestRateInput = document.getElementById('annualInterestRate');
        const monthlyPaymentInput = document.getElementById('monthlyPayment');

        const debtAmount = parseFloat(debtAmountInput.value);
        const annualInterestRate = parseFloat(annualInterestRateInput.value) / 100; // Convertir a decimal
        const monthlyPayment = parseFloat(monthlyPaymentInput.value);

        let isValid = true;

        // Validación de campos
        if (isNaN(debtAmount) || debtAmount <= 0) {
            debtAmountInput.classList.add('is-invalid');
            isValid = false;
        } else {
            debtAmountInput.classList.remove('is-invalid');
        }

        if (isNaN(annualInterestRate) || annualInterestRate < 0) {
            annualInterestRateInput.classList.add('is-invalid');
            isValid = false;
        } else {
            annualInterestRateInput.classList.remove('is-invalid');
        }

        if (isNaN(monthlyPayment) || monthlyPayment <= 0) {
            monthlyPaymentInput.classList.add('is-invalid');
            isValid = false;
        } else {
            monthlyPaymentInput.classList.remove('is-invalid');
        }

        if (!isValid) {
            return; // Detiene la simulación si hay errores de validación
        }

        const monthlyInterestRate = annualInterestRate / 12;
        let monthsToPay;
        let totalInterestPaid;

        if (monthlyInterestRate === 0) {
            // Sin interés
            monthsToPay = debtAmount / monthlyPayment;
            totalInterestPaid = 0;
        } else {
            // Con interés
            const minPaymentRequired = debtAmount * monthlyInterestRate;

            if (monthlyPayment <= minPaymentRequired) {
                // El pago mensual no cubre ni siquiera los intereses, la deuda nunca se pagará o crecerá
                errorMessageModalBody.textContent = `Tu pago mensual de ${formatCurrency(monthlyPayment)} es demasiado bajo para cubrir los intereses (${formatCurrency(minPaymentRequired.toFixed(2))} mensuales). La deuda nunca se pagará o seguirá creciendo. Aumenta tu pago mensual.`;
                errorMessageModal.show();
                return;
            }

            monthsToPay = -Math.log(1 - (debtAmount * monthlyInterestRate) / monthlyPayment) / Math.log(1 + monthlyInterestRate);
            totalInterestPaid = (monthsToPay * monthlyPayment) - debtAmount;
        }
        
        monthsToPayResult.textContent = `${Math.ceil(monthsToPay)} mes(es)`; // Redondear hacia arriba para meses completos
        totalInterestPaidResult.textContent = formatCurrency(totalInterestPaid);

        // Mensaje de resumen
        debtSummaryMessage.className = 'alert alert-info text-center mt-4';
        debtSummaryMessage.textContent = `Con un monto de deuda de ${formatCurrency(debtAmount)}, una tasa de interés anual del ${ (annualInterestRate * 100).toFixed(2) }% y un pago mensual de ${formatCurrency(monthlyPayment)}, estimamos que te tomará ${Math.ceil(monthsToPay)} mes(es) pagar tu deuda y habrás pagado ${formatCurrency(totalInterestPaid)} en intereses.`;


        // Mostrar resultados y ocultar formulario
        debtForm.classList.add('d-none');
        debtResultsSection.classList.remove('d-none');
    });

    resetDebtFormBtn.addEventListener('click', () => {
        debtForm.reset();
        debtForm.classList.remove('d-none');
        debtResultsSection.classList.add('d-none');
        // Limpiar mensajes de validación
        debtForm.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        debtForm.querySelectorAll('.invalid-feedback').forEach(el => el.textContent = '');
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

    // Inicializar mostrando la sección del formulario
    document.getElementById('calculadora-deuda-section').classList.remove('d-none');
});