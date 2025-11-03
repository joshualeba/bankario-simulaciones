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
            creditCards.forEach(cc => cc.classList.remove('selected'));
            card.classList.add('selected');

            selectedCreditType = card.dataset.credittype;
            formTitle.textContent = `Simulación de crédito para ${card.querySelector('h5').textContent}`;

            document.querySelectorAll('.credit-details').forEach(detail => detail.classList.add('d-none'));

            const detailsSection = document.getElementById(`${selectedCreditType}-details`);
            if (detailsSection) {
                detailsSection.classList.remove('d-none');
            }

            creditTypeSelectionSection.classList.add('d-none');
            simulationFormSection.classList.remove('d-none');
        });
    });

    backToCreditTypeSelectionBtn.addEventListener('click', () => {
        simulationFormSection.classList.add('d-none');
        creditTypeSelectionSection.classList.remove('d-none');
        creditCards.forEach(card => card.classList.remove('selected'));
        document.querySelectorAll('.credit-details').forEach(detail => detail.classList.add('d-none'));
        creditSimulationForm.reset();
        creditSimulationForm.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        creditSimulationForm.querySelectorAll('.invalid-feedback').forEach(el => el.textContent = '');
    });

    creditSimulationForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const loanAmountInput = document.getElementById('loanAmount');
        const interestRateInput = document.getElementById('interestRate');
        const loanTermInput = document.getElementById('loanTerm');

        const loanAmount = parseFloat(loanAmountInput.value);
        const interestRate = parseFloat(interestRateInput.value);
        const loanTerm = parseInt(loanTermInput.value);

        let isValid = true;

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
            return;
        }

        const monthlyInterestRate = (interestRate / 100) / 12;
        let monthlyPayment = 0;
        let totalInterestPaid = 0;

        if (monthlyInterestRate > 0) {
            monthlyPayment = loanAmount * monthlyInterestRate / (1 - Math.pow(1 + monthlyInterestRate, -loanTerm));
            totalInterestPaid = (monthlyPayment * loanTerm) - loanAmount;
        } else {
            monthlyPayment = loanAmount / loanTerm;
            totalInterestPaid = 0;
        }
        
        document.getElementById('modalMonthlyPayment').textContent = `Cuota mensual: ${formatCurrency(monthlyPayment)}`;
        document.getElementById('modalTotalInterest').textContent = `Interés total pagado: ${formatCurrency(totalInterestPaid)}`;
        
        document.getElementById('modalLoanAmount').textContent = formatCurrency(loanAmount);
        document.getElementById('modalInterestRate').textContent = `${interestRate}% anual`;
        document.getElementById('modalLoanTerm').textContent = `${loanTerm} meses`;

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

    document.getElementById('simulacion-credito-section').classList.remove('d-none');

    // sección: lógica del botón de regresar del navegador
    const browserBackBtn = document.getElementById('browserBackBtn');
    if (browserBackBtn) {
        browserBackBtn.addEventListener('click', () => {
            window.history.back();
        });
    }
});