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

    // --- LÓGICA ESPECÍFICA DEL SIMULADOR DE RETIRO Y JUBILACIÓN ---

    const retirementPlanForm = document.getElementById('retirementPlanForm');
    const retirementResultsSection = document.getElementById('retirement-results-section');
    const yearsToRetirementResult = document.getElementById('yearsToRetirementResult');
    const projectedSavingsResult = document.getElementById('projectedSavingsResult');
    const estimatedMonthlyIncomeResult = document.getElementById('estimatedMonthlyIncomeResult');
    const retirementSummaryMessage = document.getElementById('retirement-summary-message');
    const resetRetirementFormBtn = document.getElementById('resetRetirementForm');

    retirementPlanForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const currentAgeInput = document.getElementById('currentAge');
        const retirementAgeInput = document.getElementById('retirementAge');
        const currentSavingsInput = document.getElementById('currentSavings');
        const monthlyContributionInput = document.getElementById('monthlyContribution');
        const annualReturnRateInput = document.getElementById('annualReturnRate');
        const desiredMonthlyExpensesInput = document.getElementById('desiredMonthlyExpenses');

        const currentAge = parseInt(currentAgeInput.value);
        const retirementAge = parseInt(retirementAgeInput.value);
        const currentSavings = parseFloat(currentSavingsInput.value);
        const monthlyContribution = parseFloat(monthlyContributionInput.value);
        const annualReturnRate = parseFloat(annualReturnRateInput.value) / 100; // Convertir a decimal
        const desiredMonthlyExpenses = parseFloat(desiredMonthlyExpensesInput.value);

        let isValid = true;

        // Validación de campos
        if (isNaN(currentAge) || currentAge < 18 || currentAge > 99) {
            currentAgeInput.classList.add('is-invalid');
            isValid = false;
        } else {
            currentAgeInput.classList.remove('is-invalid');
        }

        if (isNaN(retirementAge) || retirementAge <= currentAge || retirementAge > 100) {
            retirementAgeInput.classList.add('is-invalid');
            isValid = false;
        } else {
            retirementAgeInput.classList.remove('is-invalid');
        }

        if (isNaN(currentSavings) || currentSavings < 0) {
            currentSavingsInput.classList.add('is-invalid');
            isValid = false;
        } else {
            currentSavingsInput.classList.remove('is-invalid');
        }

        if (isNaN(monthlyContribution) || monthlyContribution < 0) {
            monthlyContributionInput.classList.add('is-invalid');
            isValid = false;
        } else {
            monthlyContributionInput.classList.remove('is-invalid');
        }

        if (isNaN(annualReturnRate) || annualReturnRate < 0) {
            annualReturnRateInput.classList.add('is-invalid');
            isValid = false;
        } else {
            annualReturnRateInput.classList.remove('is-invalid');
        }

        if (isNaN(desiredMonthlyExpenses) || desiredMonthlyExpenses < 0) {
            desiredMonthlyExpensesInput.classList.add('is-invalid');
            isValid = false;
        } else {
            desiredMonthlyExpensesInput.classList.remove('is-invalid');
        }

        if (!isValid) {
            return; // Detiene la simulación si hay errores de validación
        }

        const yearsToRetirement = retirementAge - currentAge;
        const totalMonths = yearsToRetirement * 12;

        let projectedSavings = 0;
        let estimatedMonthlyIncome = 0;

        if (yearsToRetirement > 0) {
            // Valor futuro del ahorro actual (compuesto anualmente)
            const fvCurrentSavings = currentSavings * Math.pow(1 + annualReturnRate, yearsToRetirement);

            // Valor futuro de las contribuciones mensuales (anualidad)
            let fvMonthlyContributions = 0;
            if (monthlyContribution > 0 && annualReturnRate > 0) {
                const monthlyRate = Math.pow(1 + annualReturnRate, 1/12) - 1; // Tasa mensual efectiva
                fvMonthlyContributions = monthlyContribution * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
            } else if (monthlyContribution > 0 && annualReturnRate === 0) {
                fvMonthlyContributions = monthlyContribution * totalMonths; // Sin interés
            }
            
            projectedSavings = fvCurrentSavings + fvMonthlyContributions;

            // Calcular ingreso mensual estimado usando la regla del 4% (retiro anual del 4% del capital)
            estimatedMonthlyIncome = (projectedSavings * 0.04) / 12;

        } else { // Si la edad de retiro es igual o menor a la actual (ya retirado o a punto)
            projectedSavings = currentSavings;
            estimatedMonthlyIncome = (projectedSavings * 0.04) / 12;
        }


        yearsToRetirementResult.textContent = `${yearsToRetirement} año(s)`;
        projectedSavingsResult.textContent = formatCurrency(projectedSavings);
        estimatedMonthlyIncomeResult.textContent = formatCurrency(estimatedMonthlyIncome);

        // Mensaje de resumen
        if (estimatedMonthlyIncome >= desiredMonthlyExpenses) {
            retirementSummaryMessage.className = 'alert alert-success text-center mt-4';
            retirementSummaryMessage.textContent = `¡Felicidades! Tu ahorro proyectado de ${formatCurrency(projectedSavings)} podría generarte un ingreso mensual estimado de ${formatCurrency(estimatedMonthlyIncome)}, lo cual supera o iguala tus gastos deseados de ${formatCurrency(desiredMonthlyExpenses)}. ¡Estás en buen camino!`;
        } else if (projectedSavings > 0) {
            retirementSummaryMessage.className = 'alert alert-warning text-center mt-4';
            retirementSummaryMessage.textContent = `Tu ahorro proyectado de ${formatCurrency(projectedSavings)} podría generarte un ingreso mensual estimado de ${formatCurrency(estimatedMonthlyIncome)}, lo cual es menor a tus gastos deseados de ${formatCurrency(desiredMonthlyExpenses)}. Considera aumentar tus contribuciones, buscar mayor rendimiento o ajustar tus expectativas de gastos.`;
        } else {
            retirementSummaryMessage.className = 'alert alert-danger text-center mt-4';
            retirementSummaryMessage.textContent = `¡Alerta! Con tus datos actuales, tu ahorro proyectado es insuficiente para generar el ingreso mensual deseado de ${formatCurrency(desiredMonthlyExpenses)}. Necesitas revisar seriamente tu plan de ahorro y/o tus expectativas.`;
        }

        // Mostrar resultados y ocultar formulario
        retirementPlanForm.classList.add('d-none');
        retirementResultsSection.classList.remove('d-none');
    });

    resetRetirementFormBtn.addEventListener('click', () => {
        retirementPlanForm.reset();
        retirementPlanForm.classList.remove('d-none');
        retirementResultsSection.classList.add('d-none');
        // Limpiar mensajes de validación
        retirementPlanForm.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        retirementPlanForm.querySelectorAll('.invalid-feedback').forEach(el => el.textContent = '');
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
    document.getElementById('retiro-jubilacion-section').classList.remove('d-none');
});