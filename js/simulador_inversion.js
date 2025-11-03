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

    // --- LÓGICA ESPECÍFICA DEL SIMULADOR DE INVERSIÓN ---

    const investmentSimulationForm = document.getElementById('investmentSimulationForm');
    const resultsModal = new bootstrap.Modal(document.getElementById('resultsModal'));

    investmentSimulationForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const initialAmountInput = document.getElementById('initialAmount');
        const monthlyContributionInput = document.getElementById('monthlyContribution');
        const annualReturnRateInput = document.getElementById('annualReturnRate');
        const investmentTermInput = document.getElementById('investmentTerm');

        const initialAmount = parseFloat(initialAmountInput.value);
        const monthlyContribution = parseFloat(monthlyContributionInput.value);
        const annualReturnRate = parseFloat(annualReturnRateInput.value);
        const investmentTerm = parseInt(investmentTermInput.value);

        let isValid = true;

        if (isNaN(initialAmount) || initialAmount < 0) {
            initialAmountInput.classList.add('is-invalid');
            initialAmountInput.nextElementSibling.textContent = 'Ingresa un monto inicial válido (mayor o igual a 0).';
            isValid = false;
        } else {
            initialAmountInput.classList.remove('is-invalid');
        }

        if (isNaN(monthlyContribution) || monthlyContribution < 0) {
            monthlyContributionInput.classList.add('is-invalid');
            monthlyContributionInput.nextElementSibling.textContent = 'Ingresa un aporte mensual válido (mayor o igual a 0).';
            isValid = false;
        } else {
            monthlyContributionInput.classList.remove('is-invalid');
        }

        if (isNaN(annualReturnRate) || annualReturnRate < 0) {
            annualReturnRateInput.classList.add('is-invalid');
            annualReturnRateInput.nextElementSibling.textContent = 'Ingresa una tasa de rendimiento válida (mayor o igual a 0).';
            isValid = false;
        } else {
            annualReturnRateInput.classList.remove('is-invalid');
        }

        if (isNaN(investmentTerm) || investmentTerm <= 0) {
            investmentTermInput.classList.add('is-invalid');
            investmentTermInput.nextElementSibling.textContent = 'Ingresa un plazo válido (mayor a 0).';
            isValid = false;
        } else {
            investmentTermInput.classList.remove('is-invalid');
        }

        if (!isValid) {
            return;
        }

        const monthlyReturnRate = (annualReturnRate / 100) / 12;
        const totalMonths = investmentTerm * 12;

        let futureValue = initialAmount;
        let totalContributions = initialAmount;

        for (let i = 0; i < totalMonths; i++) {
            futureValue = futureValue * (1 + monthlyReturnRate) + monthlyContribution;
            if (i < totalMonths -1) {
                totalContributions += monthlyContribution;
            }
        }

        const totalGain = futureValue - totalContributions;
        
        document.getElementById('modalInitialAmount').textContent = formatCurrency(initialAmount);
        document.getElementById('modalMonthlyContribution').textContent = formatCurrency(monthlyContribution);
        document.getElementById('modalAnnualReturnRate').textContent = `${annualReturnRate}% anual`;
        document.getElementById('modalInvestmentTerm').textContent = `${investmentTerm} años`;
        document.getElementById('modalFinalAmount').textContent = `Monto final: ${formatCurrency(futureValue)}`;
        document.getElementById('modalTotalGain').textContent = `Ganancia total: ${formatCurrency(totalGain)}`;

        resultsModal.show();
    });

    function formatCurrency(amount) {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    document.getElementById('simulacion-inversion-section').classList.remove('d-none');

    // sección: lógica del botón de regresar del navegador
    const browserBackBtn = document.getElementById('browserBackBtn');
    if (browserBackBtn) {
        browserBackBtn.addEventListener('click', () => {
            window.history.back();
        });
    }
});