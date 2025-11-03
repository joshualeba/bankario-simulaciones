/* ===============================================
   SECCIÓN: ELEMENTOS GLOBALES Y LOADER
   =============================================== */
const loaderP = document.querySelector('.loader_p');
const bgVideo = document.querySelector('.bg-video');
const logoBankario = document.querySelector('.logo-bankario');

window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    if (loaderP) {
        loaderP.style.display = 'none';
    }
});

/* ===============================================
   SECCIÓN: VIDEO Y NAVEGACIÓN
   =============================================== */
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && bgVideo && bgVideo.paused) {
        bgVideo.play().catch((e) => {
            console.warn('no se pudo reproducir el video automáticamente:', e);
        });
    }
});

if (logoBankario) {
  logoBankario.addEventListener('click', function() {
    window.location.href = 'index.html';
  });
}

/* ===============================================
   SECCIÓN: VALIDACIÓN DE CONTRASEÑA
   =============================================== */
function togglePasswordVisibility(inputId) {
    var passwordField = document.getElementById(inputId);
    var eyeIcon = document.getElementById('eye-icon-' + inputId);

    if (passwordField.type === "password") {
        passwordField.type = "text";
        eyeIcon.classList.remove("fa-eye");
        eyeIcon.classList.add("fa-eye-slash");
    } else {
        passwordField.type = "password";
        eyeIcon.classList.remove("fa-eye-slash");
        eyeIcon.classList.add("fa-eye");
    }
}

function mostrarRequisitos() {
    const requisitos = document.getElementById("password-requisitos");
    if (requisitos) {
        requisitos.style.display = "block";
    }
}

function ocultarRequisitos() {
    const requisitos = document.getElementById("password-requisitos");
    if (requisitos) {
        requisitos.style.display = "none";
    }
}

function validarRequisitos(password) {
    const mayuscula = /[A-Z]/.test(password);
    const especial = /[^A-Za-z0-9]/.test(password);
    const minimo = password.length >= 8;
    const maximo = password.length <= 25;

    document.getElementById("regla-mayuscula").textContent = (mayuscula ? "✅" : "❌") + " una mayúscula";
    document.getElementById("regla-especial").textContent = (especial ? "✅" : "❌") + " un carácter especial";
    document.getElementById("regla-minimo").textContent = (minimo ? "✅" : "❌") + " 8 caracteres";
    document.getElementById("regla-maximo").textContent = (maximo ? "✅" : "❌") + " menos de 25 caracteres";

    return mayuscula && especial && minimo && maximo;
}

function checkPasswords() {
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirm-password").value;
    const message = document.getElementById("password-message");

    validarRequisitos(password);

    if (password.length > 0 && confirm.length > 0) {
        if (password !== confirm) {
            message.textContent = "Las contraseñas no coinciden.";
        } else {
            message.textContent = "";
        }
    } else {
        message.textContent = "";
    }
}

document.getElementById("password").addEventListener("input", checkPasswords);
document.getElementById("confirm-password").addEventListener("input", checkPasswords);

/* ===============================================
   SECCIÓN: MODAL DE ALERTA GENÉRICO
   =============================================== */
const customAlertOverlay = document.getElementById('custom-alert-overlay');
const customAlertMessage = document.getElementById('custom-alert-message');
const customAlertOkBtn = document.getElementById('custom-alert-ok-btn');
const closeAlertBtn = document.getElementById('close-alert-btn');

function showAlert(message) {
    customAlertMessage.textContent = message;
    customAlertOverlay.classList.add('show');
    document.body.classList.add('blur-active');
}

function hideAlert() {
    customAlertOverlay.classList.remove('show');
    document.body.classList.remove('blur-active');
}

customAlertOkBtn.addEventListener('click', hideAlert);
closeAlertBtn.addEventListener('click', hideAlert);
customAlertOverlay.addEventListener('click', (event) => {
    if (event.target === customAlertOverlay) {
        hideAlert();
    }
});

/* ===============================================
   SECCIÓN: MODAL DE TÉRMINOS Y CONDICIONES
   =============================================== */
const termsLink = document.getElementById('termsLink');
const termsModalOverlay = document.getElementById('termsModalOverlay');
const closeTermsBtn = document.getElementById('closeTermsBtn');
const acceptTermsBtn = document.getElementById('acceptTermsBtn');

function showTermsModal(event) {
    event.preventDefault();
    if (termsModalOverlay) {
        termsModalOverlay.classList.add('show');
        document.body.classList.add('blur-active');
    }
}

function hideTermsModal() {
    if (termsModalOverlay) {
        termsModalOverlay.classList.remove('show');
        document.body.classList.remove('blur-active');
    }
}

if (termsLink) {
    termsLink.addEventListener('click', showTermsModal);
}
if (closeTermsBtn) {
    closeTermsBtn.addEventListener('click', hideTermsModal);
}
if (acceptTermsBtn) {
    acceptTermsBtn.addEventListener('click', hideTermsModal);
}
if (termsModalOverlay) {
    termsModalOverlay.addEventListener('click', (event) => {
        if (event.target === termsModalOverlay) {
            hideTermsModal();
        }
    });
}

/* ===============================================
   SECCIÓN: LÓGICA DE ENVÍO DE FORMULARIO
   =============================================== */
document.getElementById('registroForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const nombresInput = this.querySelector('input[name="nombres"]');
    const apellidosInput = this.querySelector('input[name="apellidos"]');
    const correoInput = document.getElementById('correo');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const tycCheckbox = document.querySelector('input[type="checkbox"]');

    const nombres = nombresInput.value.trim();
    const apellidos = apellidosInput.value.trim();
    const correo = correoInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    const correoValidoRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    if (!nombres || nombres.length < 2 || nombres.length > 30 || !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(nombres)) {
        showAlert('Por favor, ingresa un nombre válido (solo letras y espacios, entre 2 y 25 caracteres).');
        nombresInput.focus();
        return;
    }
    if (!apellidos || apellidos.length < 2 || apellidos.length > 30 || !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(apellidos)) {
        showAlert('Por favor, ingresa apellidos válidos (solo letras y espacios, entre 2 y 25 caracteres).');
        apellidosInput.focus();
        return;
    }
    if (!correoValidoRegex.test(correo)) {
        showAlert('Por favor, ingresa un correo electrónico válido.');
        correoInput.focus();
        return;
    }
    if (!validarRequisitos(password)) {
        showAlert('La contraseña no cumple con todos los requisitos (mayúscula, carácter especial, 8-25 caracteres).');
        passwordInput.focus();
        mostrarRequisitos();
        return;
    }
    if (password !== confirmPassword) {
        showAlert('Las contraseñas no coinciden.');
        confirmPasswordInput.focus();
        return;
    }
    if (!tycCheckbox.checked) {
        showAlert('Debes aceptar los términos y condiciones.');
        return;
    }

    loaderP.style.display = 'grid';
    document.body.classList.remove('loaded');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
        this.submit();
    }, 500);
});