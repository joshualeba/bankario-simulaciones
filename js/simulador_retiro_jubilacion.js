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
        const annualReturnRate = parseFloat(annualReturnRateInput.value) / 100;
        const desiredMonthlyExpenses = parseFloat(desiredMonthlyExpensesInput.value);

        let isValid = true;

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
            return;
        }

        const yearsToRetirement = retirementAge - currentAge;
        const totalMonths = yearsToRetirement * 12;

        let projectedSavings = 0;
        let estimatedMonthlyIncome = 0;

        if (yearsToRetirement > 0) {
            const fvCurrentSavings = currentSavings * Math.pow(1 + annualReturnRate, yearsToRetirement);

            let fvMonthlyContributions = 0;
            if (monthlyContribution > 0 && annualReturnRate > 0) {
                const monthlyRate = Math.pow(1 + annualReturnRate, 1/12) - 1;
                fvMonthlyContributions = monthlyContribution * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
            } else if (monthlyContribution > 0 && annualReturnRate === 0) {
                fvMonthlyContributions = monthlyContribution * totalMonths;
            }
            
            projectedSavings = fvCurrentSavings + fvMonthlyContributions;
            estimatedMonthlyIncome = (projectedSavings * 0.04) / 12;

        } else {
            projectedSavings = currentSavings;
            estimatedMonthlyIncome = (projectedSavings * 0.04) / 12;
        }

        yearsToRetirementResult.textContent = `${yearsToRetirement} año(s)`;
        projectedSavingsResult.textContent = formatCurrency(projectedSavings);
        estimatedMonthlyIncomeResult.textContent = formatCurrency(estimatedMonthlyIncome);

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

        retirementPlanForm.classList.add('d-none');
        retirementResultsSection.classList.remove('d-none');
    });

    resetRetirementFormBtn.addEventListener('click', () => {
        retirementPlanForm.reset();
        retirementPlanForm.classList.remove('d-none');
        retirementResultsSection.classList.add('d-none');
        retirementPlanForm.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        retirementPlanForm.querySelectorAll('.invalid-feedback').forEach(el => el.textContent = '');
    });

    function formatCurrency(amount) {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    document.getElementById('retiro-jubilacion-section').classList.remove('d-none');

    // Sección: lógica del botón de regresar del navegador
    const browserBackBtn = document.getElementById('browserBackBtn');
    if (browserBackBtn) {
        browserBackBtn.addEventListener('click', () => {
            window.history.back();
        });
    }
});