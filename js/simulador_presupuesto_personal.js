document.addEventListener('DOMContentLoaded', () => {

    // Sección: LOADER
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

    // Sección: TOGGLE PARA MODO OSCURO
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

    // Sección: LÓGICA PARA DROPDOWNS Y EFECTO BORROSO
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

    // Sección: LÓGICA DEL MODAL DE CERRAR SESIÓN
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
            if (userDropdown) {
                userDropdown.classList.remove('show');
                userBtn.setAttribute('aria-expanded', 'false');
            }
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
            return;
        }

        const totalExpenses = fixedExpenses + variableExpenses;
        const availableSavings = monthlyIncome - totalExpenses;

        totalIncomeResult.textContent = formatCurrency(monthlyIncome);
        totalExpensesResult.textContent = formatCurrency(totalExpenses);
        availableSavingsResult.textContent = formatCurrency(availableSavings);

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

        personalBudgetForm.classList.add('d-none');
        budgetResultsSection.classList.remove('d-none');
    });

    resetBudgetFormBtn.addEventListener('click', () => {
        personalBudgetForm.reset();
        personalBudgetForm.classList.remove('d-none');
        budgetResultsSection.classList.add('d-none');
        personalBudgetForm.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        personalBudgetForm.querySelectorAll('.invalid-feedback').forEach(el => el.textContent = '');
    });

    function formatCurrency(amount) {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    document.getElementById('simulacion-presupuesto-section').classList.remove('d-none');

    // sección: lógica del botón de regresar del navegador
    const browserBackBtn = document.getElementById('browserBackBtn');
    if (browserBackBtn) {
        browserBackBtn.addEventListener('click', () => {
            window.history.back();
        });
    }
});