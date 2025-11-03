document.addEventListener('DOMContentLoaded', () => {
    
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
        const annualInterestRate = parseFloat(annualInterestRateInput.value) / 100;
        const monthlyPayment = parseFloat(monthlyPaymentInput.value);

        let isValid = true;

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
            return;
        }

        const monthlyInterestRate = annualInterestRate / 12;
        let monthsToPay;
        let totalInterestPaid;

        if (monthlyInterestRate === 0) {
            monthsToPay = debtAmount / monthlyPayment;
            totalInterestPaid = 0;
        } else {
            const minPaymentRequired = debtAmount * monthlyInterestRate;

            if (monthlyPayment <= minPaymentRequired) {
                errorMessageModalBody.textContent = `Tu pago mensual de ${formatCurrency(monthlyPayment)} es demasiado bajo para cubrir los intereses (${formatCurrency(minPaymentRequired.toFixed(2))} mensuales). La deuda nunca se pagará o seguirá creciendo. Aumenta tu pago mensual.`;
                errorMessageModal.show();
                return;
            }

            monthsToPay = -Math.log(1 - (debtAmount * monthlyInterestRate) / monthlyPayment) / Math.log(1 + monthlyInterestRate);
            totalInterestPaid = (monthsToPay * monthlyPayment) - debtAmount;
        }
        
        monthsToPayResult.textContent = `${Math.ceil(monthsToPay)} mes(es)`;
        totalInterestPaidResult.textContent = formatCurrency(totalInterestPaid);

        debtSummaryMessage.className = 'alert alert-info text-center mt-4';
        debtSummaryMessage.textContent = `Con un monto de deuda de ${formatCurrency(debtAmount)}, una tasa de interés anual del ${ (annualInterestRate * 100).toFixed(2) }% y un pago mensual de ${formatCurrency(monthlyPayment)}, estimamos que te tomará ${Math.ceil(monthsToPay)} mes(es) pagar tu deuda y habrás pagado ${formatCurrency(totalInterestPaid)} en intereses.`;

        debtForm.classList.add('d-none');
        debtResultsSection.classList.remove('d-none');
    });

    resetDebtFormBtn.addEventListener('click', () => {
        debtForm.reset();
        debtForm.classList.remove('d-none');
        debtResultsSection.classList.add('d-none');
        debtForm.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        debtForm.querySelectorAll('.invalid-feedback').forEach(el => el.textContent = '');
    });

    function formatCurrency(amount) {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    document.getElementById('calculadora-deuda-section').classList.remove('d-none');

    // sección: lógica del botón de regresar del navegador
    const browserBackBtn = document.getElementById('browserBackBtn');
    if (browserBackBtn) {
        browserBackBtn.addEventListener('click', () => {
            window.history.back();
        });
    }
});