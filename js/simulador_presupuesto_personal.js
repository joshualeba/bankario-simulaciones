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

    // --- LÓGICA ESPECÍFICA DEL SIMULADOR DE PRESUPUESTO PERSONAL ---

    const personalBudgetForm = document.getElementById('personalBudgetForm');
    const budgetResultsSection = document.getElementById('budget-results-section');
    const totalIncomeResult = document.getElementById('totalIncomeResult');
    const totalExpensesResult = document.getElementById('totalExpensesResult');
    const availableSavingsResult = document.getElementById('availableSavingsResult');
    const budgetSummaryMessage = document.getElementById('budget-summary-message');
    const resetBudgetFormBtn = document.getElementById('resetBudgetForm');

    personalBudgetForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const monthlyIncomeInput = document.getElementById('monthlyIncome');
        const fixedExpensesInput = document.getElementById('fixedExpenses');
        const variableExpensesInput = document.getElementById('variableExpenses');
        const desiredSavingsInput = document.getElementById('desiredSavings');

        const monthlyIncome = parseFloat(monthlyIncomeInput.value);
        const fixedExpenses = parseFloat(fixedExpensesInput.value);
        const variableExpenses = parseFloat(variableExpensesInput.value);
        const desiredSavings = parseFloat(desiredSavingsInput.value);

        let isValid = true;

        // Validación de campos
        if (isNaN(monthlyIncome) || monthlyIncome < 0) {
            monthlyIncomeInput.classList.add('is-invalid');
            monthlyIncomeInput.nextElementSibling.textContent = 'Ingresa tus ingresos mensuales (mayor o igual a 0).';
            isValid = false;
        } else {
            monthlyIncomeInput.classList.remove('is-invalid');
        }

        if (isNaN(fixedExpenses) || fixedExpenses < 0) {
            fixedExpensesInput.classList.add('is-invalid');
            fixedExpensesInput.nextElementSibling.textContent = 'Ingresa tus gastos fijos (mayor o igual a 0).';
            isValid = false;
        } else {
            fixedExpensesInput.classList.remove('is-invalid');
        }

        if (isNaN(variableExpenses) || variableExpenses < 0) {
            variableExpensesInput.classList.add('is-invalid');
            variableExpensesInput.nextElementSibling.textContent = 'Ingresa tus gastos variables (mayor o igual a 0).';
            isValid = false;
        } else {
            variableExpensesInput.classList.remove('is-invalid');
        }

        if (isNaN(desiredSavings) || desiredSavings < 0) {
            desiredSavingsInput.classList.add('is-invalid');
            desiredSavingsInput.nextElementSibling.textContent = 'Ingresa tu ahorro deseado (mayor o igual a 0).';
            isValid = false;
        } else {
            desiredSavingsInput.classList.remove('is-invalid');
        }

        if (!isValid) {
            return; // Detiene la simulación si hay errores de validación
        }

        const totalExpenses = fixedExpenses + variableExpenses;
        const availableSavings = monthlyIncome - totalExpenses;

        totalIncomeResult.textContent = formatCurrency(monthlyIncome);
        totalExpensesResult.textContent = formatCurrency(totalExpenses);
        availableSavingsResult.textContent = formatCurrency(availableSavings);

        // Mensaje de resumen
        if (availableSavings >= desiredSavings) {
            budgetSummaryMessage.className = 'alert alert-success text-center mt-4';
            budgetSummaryMessage.textContent = `¡Felicidades! Tienes ${formatCurrency(availableSavings)} de ahorro disponible, suficiente para tu meta de ${formatCurrency(desiredSavings)}.`;
        } else if (availableSavings > 0) {
            budgetSummaryMessage.className = 'alert alert-warning text-center mt-4';
            budgetSummaryMessage.textContent = `Puedes ahorrar ${formatCurrency(availableSavings)}, pero aún te faltan ${formatCurrency(desiredSavings - availableSavings)} para tu meta de ${formatCurrency(desiredSavings)}. ¡Revisa tus gastos variables!`;
        } else {
            budgetSummaryMessage.className = 'alert alert-danger text-center mt-4';
            budgetSummaryMessage.textContent = `¡Alerta! Tienes un déficit de ${formatCurrency(Math.abs(availableSavings))}. Necesitas ajustar tus gastos o aumentar tus ingresos para alcanzar tus metas.`;
        }

        // Mostrar resultados y ocultar formulario
        personalBudgetForm.classList.add('d-none');
        budgetResultsSection.classList.remove('d-none');
    });

    resetBudgetFormBtn.addEventListener('click', () => {
        personalBudgetForm.reset();
        personalBudgetForm.classList.remove('d-none');
        budgetResultsSection.classList.add('d-none');
        // Limpiar mensajes de validación
        personalBudgetForm.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        personalBudgetForm.querySelectorAll('.invalid-feedback').forEach(el => el.textContent = '');
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

    // Inicializar mostrando la sección del formulario de presupuesto
    document.getElementById('simulacion-presupuesto-section').classList.remove('d-none');
});