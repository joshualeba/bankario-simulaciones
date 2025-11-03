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
            metaCards.forEach(mc => mc.classList.remove('selected'));
            card.classList.add('selected');

            selectedMeta = card.dataset.meta;
            formTitle.textContent = `Simulación de Ahorro para ${card.querySelector('h5').textContent}`;

            document.querySelectorAll('.meta-details').forEach(detail => detail.classList.add('d-none'));

            const detailsSection = document.getElementById(`${selectedMeta}-details`);
            if (detailsSection) {
                detailsSection.classList.remove('d-none');
            }

            metaSelectionSection.classList.add('d-none');
            simulationFormSection.classList.remove('d-none');
        });
    });

    backToMetaSelectionBtn.addEventListener('click', () => {
        simulationFormSection.classList.add('d-none');
        metaSelectionSection.classList.remove('d-none');
        metaCards.forEach(card => card.classList.remove('selected'));
        document.querySelectorAll('.meta-details').forEach(detail => detail.classList.add('d-none'));
        savingSimulationForm.reset();
        savingSimulationForm.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        savingSimulationForm.querySelectorAll('.invalid-feedback').forEach(el => el.textContent = '');
    });

    savingSimulationForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const currentAmountInput = document.getElementById('currentAmount');
        const goalAmountInput = document.getElementById('goalAmount');
        const monthlyContributionInput = document.getElementById('monthlyContribution');

        const currentAmount = parseFloat(currentAmountInput.value);
        const goalAmount = parseFloat(goalAmountInput.value);
        const monthlyContribution = parseFloat(monthlyContributionInput.value);

        let isValid = true;

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
            return;
        }

        if (currentAmount >= goalAmount) {
            document.getElementById('modalResultText').textContent = `¡Felicidades! Ya alcanzaste tu meta de ${formatCurrency(goalAmount)}.`;
        } else if (monthlyContribution === 0) {
            document.getElementById('modalResultText').textContent = `Para alcanzar tu meta de ${formatCurrency(goalAmount)}, necesitas aportar más de ${formatCurrency(currentAmount)} mensualmente.`;
        } else {
            const remainingAmount = goalAmount - currentAmount;
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
        
        document.getElementById('modalGoalAmount').textContent = formatCurrency(goalAmount);
        document.getElementById('modalMonthlyContribution').textContent = formatCurrency(monthlyContribution);
        document.getElementById('modalCurrentAmount').textContent = formatCurrency(currentAmount);

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

    document.getElementById('simulacion-ahorro-section').classList.remove('d-none');

    // sección: lógica del botón de regresar del navegador
    const browserBackBtn = document.getElementById('browserBackBtn');
    if (browserBackBtn) {
        browserBackBtn.addEventListener('click', () => {
            window.history.back();
        });
    }
});