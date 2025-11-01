// cuando la página haya terminado de cargar, se agrega la clase "loaded" al body
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

const bgVideo = document.querySelector('.bg-video');

// vuelve a reproducir el video si el navegador lo detiene al regresar
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && bgVideo.paused) {
        bgVideo.play().catch((e) => {
            console.warn('no se pudo reproducir el video automáticamente:', e);
        });
    }
});

// redirigir al index
const logoBankario = document.querySelector('.logo-bankario'); // asegura que la clase del logo sea esta

if (logoBankario) { // verifica si el logo existe antes de añadir el evento
  logoBankario.addEventListener('click', function() {
    window.location.href = 'index.html';
  });
}


// funciones para mostrar u ocultar la contraseña
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
    document.getElementById("password-requisitos").style.display = "block";
}

function ocultarRequisitos() {
    document.getElementById("password-requisitos").style.display = "none";
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

    validarRequisitos(password); // solo actualiza los requisitos visuales de la contraseña

    // validar coincidencia de contraseñas sólo si ya se escribió algo en ambos campos
    if (password.length > 0 && confirm.length > 0) {
        if (password !== confirm) {
            message.textContent = "Las contraseñas no coinciden.";
        } else {
            message.textContent = ""; // vacía el mensaje si coinciden
        }
    } else {
        message.textContent = ""; // vacía el mensaje si aún no hay contenido suficiente
    }
}

// se mantienen los listeners para la validación visual de las contraseñas
document.getElementById("password").addEventListener("input", checkPasswords);
document.getElementById("confirm-password").addEventListener("input", checkPasswords);

// sección para el pop-up de alerta personalizado
const customAlertOverlay = document.getElementById('custom-alert-overlay');
const customAlertBox = document.getElementById('custom-alert-box');
const customAlertMessage = document.getElementById('custom-alert-message');
const customAlertOkBtn = document.getElementById('custom-alert-ok-btn');
const closeAlertBtn = document.getElementById('close-alert-btn');
const loaderP = document.querySelector('.loader_p'); // selecciona el loader

function showAlert(message) {
    customAlertMessage.textContent = message;
    customAlertOverlay.classList.add('show');
    document.body.classList.add('blur-active'); // aplica el blur al cuerpo
}

function hideAlert() {
    customAlertOverlay.classList.remove('show');
    document.body.classList.remove('blur-active'); // remueve el blur del cuerpo
}

// eventos para cerrar la alerta
customAlertOkBtn.addEventListener('click', hideAlert);
closeAlertBtn.addEventListener('click', hideAlert);
customAlertOverlay.addEventListener('click', (event) => {
    // cierra si se hace clic fuera del contenido del pop-up
    if (event.target === customAlertOverlay) {
        hideAlert();
    }
});


// manejador de envío del formulario
document.getElementById('registroForm').addEventListener('submit', function(event) {
    event.preventDefault(); // evita el envío por defecto para la validación js

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

    // validaciones
    if (!nombres || nombres.length < 2 || nombres.length > 30 || !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(nombres)) {
        showAlert('Por favor, ingresa un nombre válido (solo letras y espacios, entre 2 y 25 caracteres).');
        nombresInput.focus();
        return; // detiene la ejecución aquí, no muestra el loader
    }
    if (!apellidos || apellidos.length < 2 || apellidos.length > 30 || !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(apellidos)) {
        showAlert('Por favor, ingresa apellidos válidos (solo letras y espacios, entre 2 y 25 caracteres).');
        apellidosInput.focus();
        return; // detiene la ejecución aquí, no muestra el loader
    }
    if (!correoValidoRegex.test(correo)) {
        showAlert('Por favor, ingresa un correo electrónico válido.');
        correoInput.focus();
        return; // detiene la ejecución aquí, no muestra el loader
    }
    if (!validarRequisitos(password)) {
        showAlert('La contraseña no cumple con todos los requisitos (mayúscula, carácter especial, 8-25 caracteres).');
        passwordInput.focus();
        mostrarRequisitos(); // asegura que los requisitos sean visibles
        return; // detiene la ejecución aquí, no muestra el loader
    }
    if (password !== confirmPassword) {
        showAlert('Las contraseñas no coinciden.');
        confirmPasswordInput.focus();
        return; // detiene la ejecución aquí, no muestra el loader
    }
    if (!tycCheckbox.checked) {
        showAlert('Debes aceptar los términos y condiciones.');
        return; // detiene la ejecución aquí, no muestra el loader
    }

    // si todas las validaciones pasan, *ahora sí* muestra el loader y envía el formulario
    loaderP.style.display = 'grid'; // muestra el loader
    document.body.classList.remove('loaded'); // para que el loader se vea de nuevo si ya estaba "cargado"
    document.body.style.overflow = 'hidden'; // evita el scroll mientras carga

    // usa setTimeout para asegurar que el loader se muestra antes de enviar realmente el formulario
    setTimeout(() => {
        this.submit(); // envía el formulario a flask
    }, 500); // un pequeño retraso para que el usuario vea el loader
});