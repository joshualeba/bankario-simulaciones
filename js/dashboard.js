document.addEventListener('DOMContentLoaded', () => {
    // Sección: Loader
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

    // Sección: Toggle para modo oscuro
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

    // Sección: Lógica para dropdowns y efecto borroso
    const userBtn = document.getElementById('userBtn');
    const userDropdown = document.getElementById('userDropdown');

    const mainContent = document.querySelector('.main-content');
    const sidebar = document.getElementById('sidebar');
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
        const isShown = dropdown.classList.contains('show');

        // Simplemente alterna la clase del dropdown actual
        dropdown.classList.toggle('show');
        button.setAttribute('aria-expanded', !isShown);

        const anyDropdownOpen = userDropdown.classList.contains('show');
        applyBlurEffect(anyDropdownOpen);

        if (anyDropdownOpen && sidebar.classList.contains('show') && window.innerWidth < 992) {
            sidebar.classList.remove('show');
            body.classList.remove('sidebar-open');
        }
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

        if (sidebar.classList.contains('show') && window.innerWidth < 992) {
            if (!sidebar.contains(event.target) && !document.getElementById('sidebarToggle').contains(event.target)) {
                sidebar.classList.remove('show');
                body.classList.remove('sidebar-open');
            }
        }
    });

    // Sección: Lógica del botón de hamburguesa para el sidebar responsivo
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('show');
            body.classList.toggle('sidebar-open');
            userDropdown.classList.remove('show');
            userBtn.setAttribute('aria-expanded', 'false');
            applyBlurEffect(false);
        });
    }

    // Sección: Lógica de navegación de secciones
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    const contentSections = document.querySelectorAll('.content-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            const targetSectionId = link.dataset.section;
            
            // Si el enlace es para el glosario, redirige a la nueva página
            if (targetSectionId === 'glosario') {
                event.preventDefault(); // Evita el comportamiento por defecto del ancla
                window.location.href = "/glosario";
                return; // Termina la función aquí para no ejecutar el resto
            }

            event.preventDefault();

            userDropdown.classList.remove('show');
            userBtn.setAttribute('aria-expanded', 'false');
            applyBlurEffect(false);

            navLinks.forEach(nav => nav.classList.remove('active'));
            contentSections.forEach(section => section.classList.add('d-none'));

            link.classList.add('active');

            const targetSection = document.getElementById(targetSectionId + '-section');
            if (targetSection) {
                targetSection.classList.remove('d-none');
            }

            if (window.innerWidth < 992) {
                sidebar.classList.remove('show');
                body.classList.remove('sidebar-open');
            }

            // Si la sección es el test, cargar las preguntas
            if (targetSectionId === 'test-conocimientos') {
                loadTest();
            }
        });
    });

    const allSectionLinks = document.querySelectorAll('[data-section]');
    const sidebarLinks = document.querySelectorAll('.sidebar .nav-link');

    function showSection(sectionId) {
        contentSections.forEach(section => {
            section.classList.add('d-none');
        });
        const targetSection = document.getElementById(`${sectionId}-section`);
        if (targetSection) {
            targetSection.classList.remove('d-none');
        }

        sidebarLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionId) {
                link.classList.add('active');
            }
        });

        // Si la sección es el test, cargar las preguntas
        if (sectionId === 'test-conocimientos') {
            loadTest();
        }
    }

    allSectionLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            const sectionId = this.getAttribute('data-section');
            // Si el enlace es para el glosario, redirige a la nueva página
            if (sectionId === 'glosario') {
                event.preventDefault();
                window.location.href = "/glosario";
                return;
            }
            event.preventDefault();
            showSection(sectionId);
        });
    });

    const miPerfilBtn = document.getElementById('miPerfilBtn');
    if (miPerfilBtn) {
        miPerfilBtn.addEventListener('click', (event) => {
            event.preventDefault();
            const sectionId = miPerfilBtn.getAttribute('data-section');
            showSection(sectionId);
            userDropdown.classList.remove('show');
            userBtn.setAttribute('aria-expanded', 'false');
            applyBlurEffect(false);
            if (window.innerWidth < 992) {
                sidebar.classList.remove('show');
                body.classList.remove('sidebar-open');
            }
        });
    }

    showSection('inicio'); // Por defecto, muestra la sección de inicio al cargar

    // Sección: Lógica del modal de cerrar sesión
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
            userDropdown.classList.remove('show');
            userBtn.setAttribute('aria-expanded', 'false');
            applyBlurEffect(false);

            if (sidebar.classList.contains('show') && window.innerWidth < 992) {
                sidebar.classList.remove('show');
                body.classList.remove('sidebar-open');
            }
            logoutModal.show();
        });
    }

    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener('click', () => {
            window.location.href = "/logout";
        });
    }

    // Sección: Lógica para los otros modales (perfil y contraseña)
    const editarPerfilModalElement = document.getElementById('editarPerfilModal');
    const cambiarContrasenaModalElement = document.getElementById('cambiarContrasenaModal');

    if (editarPerfilModalElement) {
        editarPerfilModalElement.addEventListener('show.bs.modal', () => {
            toggleModalBlurEffect(true);
        });
        editarPerfilModalElement.addEventListener('hide.bs.modal', () => {
            toggleModalBlurEffect(false);
        });
    }

    if (cambiarContrasenaModalElement) {
        cambiarContrasenaModalElement.addEventListener('show.bs.modal', () => {
            toggleModalBlurEffect(true);
        });
        cambiarContrasenaModalElement.addEventListener('hide.bs.modal', () => {
            toggleModalBlurEffect(false);
        });
    }

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 992) {
            sidebar.classList.remove('show');
            body.classList.remove('sidebar-open');
        }
    });

    // Sección: Lógica para mostrar/ocultar contraseña y validación
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.dataset.target;
            const passwordInput = document.getElementById(targetId);
            const icon = this.querySelector('i');

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('bi-eye');
                icon.classList.add('bi-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('bi-eye-slash');
                icon.classList.add('bi-eye');
            }
        });
    });

    const formCambiarContrasena = document.getElementById('formCambiarContrasena');
    if (formCambiarContrasena) {
        formCambiarContrasena.addEventListener('submit', async function(event) {
            event.preventDefault();

            const nuevaContrasena = document.getElementById('nuevaContrasena').value;
            const confirmarNuevaContrasena = document.getElementById('confirmarNuevaContrasena').value;
            const nuevaContrasenaFeedback = document.getElementById('nuevaContrasenaFeedback');
            const confirmarNuevaContrasenaFeedback = document.getElementById('confirmarNuevaContrasenaFeedback');

            let isValid = true;

            const hasUpperCase = /[A-Z]/.test(nuevaContrasena);
            const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(nuevaContrasena);
            const isLengthValid = nuevaContrasena.length >= 8 && nuevaContrasena.length <= 25;

            nuevaContrasenaFeedback.textContent = '';
            if (!hasUpperCase) {
                nuevaContrasenaFeedback.textContent = 'la contraseña debe contener al menos una letra mayúscula.';
                isValid = false;
            } else if (!hasSpecialChar) {
                nuevaContrasenaFeedback.textContent = 'la contraseña debe contener al menos un carácter especial.';
                isValid = false;
            } else if (!isLengthValid) {
                nuevaContrasenaFeedback.textContent = 'la contraseña debe tener entre 8 y 25 caracteres.';
                isValid = false;
            }

            confirmarNuevaContrasenaFeedback.textContent = '';
            if (nuevaContrasena !== confirmarNuevaContrasena) {
                confirmarNuevaContrasenaFeedback.textContent = 'las contraseñas no coinciden.';
                isValid = false;
            }

            if (!isValid) {
                return;
            }

            const formData = new FormData(this);
            const response = await fetch(this.action, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                const successModal = new bootstrap.Modal(document.getElementById('successMessageModal'));
                const successModalBody = document.getElementById('successMessageModalBody');
                successModalBody.textContent = 'contraseña cambiada con éxito.';
                successModal.show();

                setTimeout(() => {
                    window.location.reload();
                }, 2000); 
            } else {
                const errorModal = new bootstrap.Modal(document.getElementById('errorMessageModal'));
                const errorMessageModalBody = document.getElementById('errorMessageModalBody');
                errorMessageModalBody.textContent = result.message || 'ocurrió un error al cambiar la contraseña.';
                errorModal.show();
            }
        });
    }

    if (!document.getElementById('successMessageModal')) {
        const successModalHtml = `
            <div class="modal fade" id="successMessageModal" tabindex="-1" aria-labelledby="successMessageModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content glass-modal">
                        <div class="modal-header border-0">
                            <h5 class="modal-title" id="successMessageModalLabel">Éxito</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                        </div>
                        <div class="modal-body">
                            <p id="successMessageModalBody"></p>
                        </div>
                        <div class="modal-footer border-0">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Aceptar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', successModalHtml);
    }

    if (!document.getElementById('errorMessageModal')) {
        const errorModalHtml = `
            <div class="modal fade" id="errorMessageModal" tabindex="-1" aria-labelledby="errorMessageModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content glass-modal">
                        <div class="modal-header border-0">
                            <h5 class="modal-title" id="errorMessageModalLabel">Error</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                        </div>
                        <div class="modal-body">
                            <p id="errorMessageModalBody"></p>
                        </div>
                        <div class="modal-footer border-0">
                            <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', errorModalHtml);
    }

    // Sección: Lógica del test de conocimientos financieros
    let questions = [];
    let currentQuestionIndex = 0;
    let userAnswers = {}; // Almacena las respuestas del usuario (ID de opción o texto)
    let correctAnswersCount = 0; // Conteo de respuestas correctas
    let totalPoints = 0; // Puntuación total con bonificación de tiempo

    let testStartTime = 0; // Tiempo de inicio del test completo
    let questionStartTime = 0; // Tiempo de inicio de la pregunta actual
    let timerInterval; // Para el temporizador de la pregunta

    const MAX_TIME_PER_QUESTION = 30; // Segundos
    const BASE_POINTS_PER_CORRECT_ANSWER = 5000; // Puntos base por respuesta correcta
    const TIME_BONUS_PER_SECOND = 100; // Puntos extra por segundo ahorrado

    const questionTextElement = document.getElementById('questionText');
    const optionsContainer = document.getElementById('optionsContainer');
    const feedbackMessage = document.getElementById('feedbackMessage');
    const prevQuestionBtn = document.getElementById('prevQuestionBtn');
    const checkAnswerBtn = document.getElementById('checkAnswerBtn');
    const nextQuestionBtn = document.getElementById('nextQuestionBtn');
    const submitTestBtn = document.getElementById('submitTestBtn');
    const progressBar = document.querySelector('.progress-bar');
    const testContainer = document.getElementById('testContainer'); // Contenedor del test en progreso
    const testResult = document.getElementById('testResult'); // Sección de resultados inmediatos
    const testCompletedSection = document.getElementById('testCompletedSection'); // Sección de test ya completado

    const scoreDisplay = document.getElementById('scoreDisplay'); // Respuestas correctas en testResult
    const totalQuestionsDisplay = document.getElementById('totalQuestionsDisplay'); // Total preguntas en testResult
    const totalPointsDisplay = document.getElementById('totalPointsDisplay'); // Puntuación total en testResult
    const resultMessage = document.getElementById('resultMessage'); // Mensaje en testResult

    const completedCorrectAnswers = document.getElementById('completedCorrectAnswers');
    const completedTotalQuestions = document.getElementById('completedTotalQuestions');
    const completedTotalPoints = document.getElementById('completedTotalPoints');
    const completedResultMessage = document.getElementById('completedResultMessage');

    const timerDisplay = document.getElementById('timerDisplay');
    const timeRemainingSpan = document.getElementById('timeRemaining');

    const testResultModal = new bootstrap.Modal(document.getElementById('testResultModal'));
    const finalScoreModal = document.getElementById('finalScoreModal');
    const totalQuestionsModal = document.getElementById('totalQuestionsModal');
    const finalTotalPointsModal = document.getElementById('finalTotalPointsModal');
    const resultMessageModal = document.getElementById('resultMessageModal');

    const viewRankingBtn = document.getElementById('viewRankingBtn');
    const viewRankingBtnCompleted = document.getElementById('viewRankingBtnCompleted');
    const viewRankingBtnModal = document.getElementById('viewRankingBtnModal');

    const rankingModalElement = document.getElementById('rankingModal'); // Referencia al elemento del modal
    const rankingModal = new bootstrap.Modal(rankingModalElement); // Instancia del modal
    const rankingTableBody = document.getElementById('rankingTableBody');
    const userRankingInfo = document.getElementById('userRankingInfo');
    const userPositionDisplay = document.getElementById('userPositionDisplay');
    const userScoreRanking = document.getElementById('userScoreRanking');
    const userTimeRanking = document.getElementById('userTimeRanking');
    const userCorrectRanking = document.getElementById('userCorrectRanking');

    // Sección: Lógica para el efecto blur del ranking modal
    if (rankingModalElement) {
        rankingModalElement.addEventListener('show.bs.modal', () => {
            toggleModalBlurEffect(true);
        });
        rankingModalElement.addEventListener('hide.bs.modal', () => {
            toggleModalBlurEffect(false);
        });
    }


    async function fetchQuestions() {
        try {
            const response = await fetch('/api/preguntas_test');
            if (!response.ok) {
                throw new Error(`error http! estado: ${response.status}`);
            }
            const data = await response.json();

            if (data.test_completado) {
                // el usuario ya completó el test
                testContainer.classList.add('d-none');
                testResult.classList.add('d-none');
                testCompletedSection.classList.remove('d-none');

                completedCorrectAnswers.textContent = data.score;
                completedTotalQuestions.textContent = data.total;
                completedTotalPoints.textContent = data.puntuacion_total;
                setResultMessage(data.puntuacion_total, data.total, completedResultMessage);

            } else {
                // el usuario no ha completado el test, mostrar el test
                questions = data.preguntas;
                if (questions.length === 0) {
                    questionTextElement.textContent = 'no hay preguntas disponibles.';
                    checkAnswerBtn.disabled = true;
                    nextQuestionBtn.disabled = true;
                    submitTestBtn.disabled = true;
                    return;
                }
                shuffleArray(questions); // mezcla las preguntas
                currentQuestionIndex = 0;
                userAnswers = {};
                correctAnswersCount = 0;
                totalPoints = 0;
                testStartTime = Date.now(); // inicia el temporizador del test completo
                
                testCompletedSection.classList.add('d-none');
                testResult.classList.add('d-none');
                testContainer.classList.remove('d-none');
                renderQuestion();
                updateProgressBar();
            }
        } catch (error) {
            console.error('error al cargar las preguntas:', error);
            questionTextElement.textContent = 'error al cargar las preguntas.';
            testContainer.classList.add('d-none');
            testResult.classList.add('d-none');
            testCompletedSection.classList.remove('d-none'); // Muestra un mensaje de error o similar
            completedResultMessage.textContent = 'error al cargar el test. por favor, inténtalo de nuevo más tarde.';
        }
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function startQuestionTimer() {
        clearInterval(timerInterval); // limpia cualquier temporizador anterior
        questionStartTime = Date.now();
        let timeLeft = MAX_TIME_PER_QUESTION;
        timeRemainingSpan.textContent = timeLeft;
        timerDisplay.classList.remove('d-none');

        timerInterval = setInterval(() => {
            timeLeft--;
            timeRemainingSpan.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                // si el tiempo se acaba, la respuesta se considera incorrecta y se avanza
                feedbackMessage.textContent = '¡tiempo agotado! la respuesta es: ' + getCorrectAnswerText(questions[currentQuestionIndex]);
                feedbackMessage.classList.remove('text-success');
                feedbackMessage.classList.add('text-danger');
                
                // deshabilita la interacción después de que el tiempo se agote
                disableQuestionInteraction();
                checkAnswerBtn.classList.add('d-none');
                if (currentQuestionIndex < questions.length - 1) {
                    nextQuestionBtn.classList.remove('d-none');
                } else {
                    submitTestBtn.classList.remove('d-none');
                }
            }
        }, 1000);
    }

    function stopQuestionTimer() {
        clearInterval(timerInterval);
        timerDisplay.classList.add('d-none');
    }

    function renderQuestion() {
        if (questions.length === 0) return;

        const currentQuestion = questions[currentQuestionIndex];
        questionTextElement.textContent = currentQuestion.pregunta;
        optionsContainer.innerHTML = '';
        feedbackMessage.textContent = '';
        feedbackMessage.classList.remove('text-success', 'text-danger');

        checkAnswerBtn.classList.remove('d-none');
        nextQuestionBtn.classList.add('d-none');
        submitTestBtn.classList.add('d-none');

        // oculta/muestra el botón anterior
        prevQuestionBtn.style.visibility = currentQuestionIndex > 0 ? 'visible' : 'hidden';

        if (currentQuestion.tipo_pregunta === 'multiple_choice' || currentQuestion.tipo_pregunta === 'true_false') {
            currentQuestion.opciones.forEach(opcion => {
                const optionCard = document.createElement('div');
                optionCard.classList.add('option-card');
                optionCard.dataset.optionId = opcion.id; // almacena el id de la opción

                const input = document.createElement('input');
                input.type = 'radio';
                input.name = `question_${currentQuestion.id}`;
                input.id = `option_${opcion.id}`;
                input.value = opcion.id;
                
                const label = document.createElement('label');
                label.htmlFor = `option_${opcion.id}`;
                label.classList.add('option-text'); // clase para el texto de la opción
                label.textContent = opcion.texto;

                optionCard.appendChild(input);
                optionCard.appendChild(label);
                optionsContainer.appendChild(optionCard);

                // restaura la selección del usuario si existe
                if (userAnswers[currentQuestion.id] && String(userAnswers[currentQuestion.id].answer) === String(opcion.id)) {
                    input.checked = true;
                    optionCard.classList.add('selected');
                }

                // agrega el evento click a la tarjeta de opción
                optionCard.addEventListener('click', () => {
                    // deselecciona todas las tarjetas de opción para esta pregunta
                    optionsContainer.querySelectorAll('.option-card').forEach(card => {
                        card.classList.remove('selected');
                        card.querySelector('input[type="radio"]').checked = false;
                    });
                    // selecciona la tarjeta actual
                    optionCard.classList.add('selected');
                    input.checked = true;
                    // no guardamos userAnswers aquí, solo cuando se comprueba
                });
            });
        } else if (currentQuestion.tipo_pregunta === 'fill_in_the_blank') {
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `input_${currentQuestion.id}`;
            input.classList.add('form-control', 'glass-input', 'w-75');
            input.placeholder = 'escribe tu respuesta aquí';
            optionsContainer.appendChild(input);

            // restaura la entrada del usuario si existe
            if (userAnswers[currentQuestion.id]) {
                input.value = userAnswers[currentQuestion.id].answer;
            }
        }
        startQuestionTimer(); // inicia el temporizador para la nueva pregunta
    }

    function updateProgressBar() {
        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
        progressBar.style.width = `${progress}%`;
        progressBar.setAttribute('aria-valuenow', progress);
        progressBar.textContent = `${currentQuestionIndex + 1} / ${questions.length}`;
    }

    function disableQuestionInteraction() {
        if (questions[currentQuestionIndex].tipo_pregunta === 'multiple_choice' || questions[currentQuestionIndex].tipo_pregunta === 'true_false') {
            optionsContainer.querySelectorAll('.option-card').forEach(card => {
                card.style.pointerEvents = 'none'; // deshabilita clics en las tarjetas
                card.querySelector('input[type="radio"]').disabled = true;
            });
        } else if (questions[currentQuestionIndex].tipo_pregunta === 'fill_in_the_blank') {
            const inputField = document.getElementById(`input_${questions[currentQuestionIndex].id}`);
            if (inputField) inputField.disabled = true;
        }
    }

    checkAnswerBtn.addEventListener('click', () => {
        stopQuestionTimer(); // detiene el temporizador al comprobar la respuesta
        const currentQuestion = questions[currentQuestionIndex];
        let userAnswer = null;
        let timeTakenForQuestion = (Date.now() - questionStartTime) / 1000;

        if (currentQuestion.tipo_pregunta === 'multiple_choice' || currentQuestion.tipo_pregunta === 'true_false') {
            const selectedOptionCard = optionsContainer.querySelector('.option-card.selected');
            if (!selectedOptionCard) {
                feedbackMessage.textContent = 'por favor, selecciona una opción.';
                feedbackMessage.classList.add('text-danger');
                startQuestionTimer(); // reinicia el temporizador si no hay selección
                return;
            }
            userAnswer = selectedOptionCard.dataset.optionId;
        } else if (currentQuestion.tipo_pregunta === 'fill_in_the_blank') {
            const inputField = document.getElementById(`input_${currentQuestion.id}`);
            if (!inputField || inputField.value.trim() === '') {
                feedbackMessage.textContent = 'por favor, escribe tu respuesta.';
                feedbackMessage.classList.add('text-danger');
                startQuestionTimer(); // reinicia el temporizador si no hay respuesta
                return;
            }
            userAnswer = inputField.value.trim();
        }

        disableQuestionInteraction(); // deshabilita la interacción después de comprobar

        const isCorrect = evaluateAnswer(currentQuestion, userAnswer);
        let currentQuestionPoints = 0;

        if (isCorrect) {
            feedbackMessage.textContent = '¡correcto!';
            feedbackMessage.classList.remove('text-danger');
            feedbackMessage.classList.add('text-success');
            correctAnswersCount++; // incrementa el conteo de respuestas correctas

            currentQuestionPoints += BASE_POINTS_PER_CORRECT_ANSWER;
            let timeSaved = MAX_TIME_PER_QUESTION - timeTakenForQuestion;
            if (timeSaved > 0) {
                currentQuestionPoints += Math.round(timeSaved * TIME_BONUS_PER_SECOND);
            }
        } else {
            feedbackMessage.textContent = 'incorrecto. la respuesta correcta es: ' + getCorrectAnswerText(currentQuestion);
            feedbackMessage.classList.remove('text-success');
            feedbackMessage.classList.add('text-danger');
        }

        totalPoints += currentQuestionPoints; // suma los puntos de la pregunta a la puntuación total

        // guarda la respuesta del usuario junto con el estado de corrección y puntos
        userAnswers[currentQuestion.id] = {
            answer: userAnswer,
            isCorrect: isCorrect,
            points: currentQuestionPoints,
            timeTaken: timeTakenForQuestion
        };

        checkAnswerBtn.classList.add('d-none');
        if (currentQuestionIndex < questions.length - 1) {
            nextQuestionBtn.classList.remove('d-none');
        } else {
            submitTestBtn.classList.remove('d-none');
        }
    });

    function evaluateAnswer(question, userAnswer) {
        if (question.tipo_pregunta === 'multiple_choice' || question.tipo_pregunta === 'true_false') {
            const correctAnswerOption = question.opciones.find(opt => opt.es_correcta);
            return correctAnswerOption && String(userAnswer) === String(correctAnswerOption.id);
        } else if (question.tipo_pregunta === 'fill_in_the_blank') {
            return userAnswer.toLowerCase() === question.respuesta_texto_correcta.toLowerCase();
        }
        return false;
    }

    function getCorrectAnswerText(question) {
        if (question.tipo_pregunta === 'multiple_choice' || question.tipo_pregunta === 'true_false') {
            const correctAnswerOption = question.opciones.find(opt => opt.es_correcta);
            return correctAnswerOption ? correctAnswerOption.texto : 'no disponible';
        } else if (question.tipo_pregunta === 'fill_in_the_blank') {
            return question.respuesta_texto_correcta || 'no disponible';
        }
        return 'no disponible';
    }

    nextQuestionBtn.addEventListener('click', () => {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            renderQuestion();
            updateProgressBar();
        }
    });

    prevQuestionBtn.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            renderQuestion();
            updateProgressBar();
        }
    });

    submitTestBtn.addEventListener('click', async () => {
        stopQuestionTimer(); // asegura que el temporizador se detenga al finalizar el test

        const confirmModal = new bootstrap.Modal(document.getElementById('confirmSubmitModal'));
        document.getElementById('confirmSubmitModalBody').textContent = '¿estás seguro de que quieres finalizar el test?';
        document.getElementById('confirmSubmitBtn').onclick = async () => {
            confirmModal.hide();
            try {
                const totalTimeTaken = (Date.now() - testStartTime) / 1000; // tiempo total del test

                const response = await fetch('/api/submit_test', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        respuestas: userAnswers,
                        puntuacion_total: totalPoints,
                        tiempo_total_segundos: totalTimeTaken,
                        respuestas_correctas_count: correctAnswersCount
                    })
                });
                const result = await response.json();

                if (result.success) {
                    // actualiza la interfaz de resultados
                    scoreDisplay.textContent = result.score; // respuestas correctas
                    totalQuestionsDisplay.textContent = result.total;
                    totalPointsDisplay.textContent = result.puntuacion_total; // puntuación con tiempo
                    setResultMessage(result.puntuacion_total, result.total, resultMessage);

                    testContainer.classList.add('d-none');
                    testResult.classList.remove('d-none');

                    // muestra el modal de resultados
                    finalScoreModal.textContent = result.score;
                    totalQuestionsModal.textContent = result.total;
                    finalTotalPointsModal.textContent = result.puntuacion_total;
                    setResultMessage(result.puntuacion_total, result.total, resultMessageModal);
                    testResultModal.show();

                    // después de enviar el test, el botón de "volver a intentar" ya no debe aparecer
                    // y la sección del test debe mostrar el mensaje de completado
                    testContainer.classList.add('d-none');
                    testResult.classList.add('d-none'); // oculta el resultado inmediato
                    testCompletedSection.classList.remove('d-none'); // muestra el mensaje de completado

                    completedCorrectAnswers.textContent = result.score;
                    completedTotalQuestions.textContent = result.total;
                    completedTotalPoints.textContent = result.puntuacion_total;
                    setResultMessage(result.puntuacion_total, result.total, completedResultMessage);

                } else {
                    const errorModal = new bootstrap.Modal(document.getElementById('errorMessageModal'));
                    document.getElementById('errorMessageModalBody').textContent = 'error al enviar el test: ' + result.message;
                    errorModal.show();
                }
            } catch (error) {
                console.error('error al enviar el test:', error);
                const errorModal = new bootstrap.Modal(document.getElementById('errorMessageModal'));
                document.getElementById('errorMessageModalBody').textContent = 'error al enviar el test.';
                errorModal.show();
            }
        };
        confirmModal.show();
    });

    function setResultMessage(points, totalQuestions, element) {
        if (points >= (totalQuestions * BASE_POINTS_PER_CORRECT_ANSWER * 0.9)) { // Ejemplo: 90% de la puntuación base máxima
            element.textContent = '¡Excelente! ¡Eres un/a experto/a financiero/a!';
        } else if (points >= (totalQuestions * BASE_POINTS_PER_CORRECT_ANSWER * 0.6)) { // Ejemplo: 60%
            element.textContent = '¡Bien hecho! tienes un buen conocimiento. sigue practicando.';
        } else {
            element.textContent = 'Puedes mejorar. ¡No te rindas, sigue aprendiendo!';
        }
    }

    // Añadir el modal de confirmación para submitTestBtn
    if (!document.getElementById('confirmSubmitModal')) {
        const confirmSubmitModalHtml = `
            <div class="modal fade" id="confirmSubmitModal" tabindex="-1" aria-labelledby="confirmSubmitModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content glass-modal">
                        <div class="modal-header border-0">
                            <h5 class="modal-title" id="confirmSubmitModalLabel">confirmar finalización</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                        </div>
                        <div class="modal-body">
                            <p id="confirmSubmitModalBody"></p>
                        </div>
                        <div class="modal-footer border-0">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">cancelar</button>
                            <button type="button" class="btn btn-primary" id="confirmSubmitBtn">finalizar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', confirmSubmitModalHtml);
    }

    // Event listeners para los botones de "Ver ranking"
    if (viewRankingBtn) {
        viewRankingBtn.addEventListener('click', () => {
            testResultModal.hide(); // Oculta el modal de resultados si está abierto
            showRanking();
        });
    }
    if (viewRankingBtnCompleted) {
        viewRankingBtnCompleted.addEventListener('click', () => {
            showRanking();
        });
    }
    if (viewRankingBtnModal) {
        viewRankingBtnModal.addEventListener('click', () => {
            testResultModal.hide(); // Oculta el modal de resultados si está abierto
            showRanking();
        });
    }

    // Función para mostrar el ranking
    async function showRanking() {
        try {
            const response = await fetch('/api/ranking');
            if (!response.ok) {
                throw new Error(`error http! estado: ${response.status}`);
            }
            const data = await response.json();

            rankingTableBody.innerHTML = ''; // Limpia la tabla
            userRankingInfo.classList.add('d-none'); // Oculta la info del usuario por defecto

            if (data.ranking && data.ranking.length > 0) {
                data.ranking.forEach(entry => {
                    const row = rankingTableBody.insertRow();
                    // Obtén el nombre completo del usuario de la sesión para la comparación
                    const sessionUserName = `{{ usuario.nombres }} {{ usuario.apellidos }}`;
                    const entryUserName = `${entry.nombres} ${entry.apellidos}`;

                    if (entryUserName === sessionUserName) {
                        row.classList.add('user-row'); // Resalta la fila del usuario actual
                    }
                    row.innerHTML = `
                        <td>${entry.posicion}</td>
                        <td>${entry.nombres} ${entry.apellidos}</td>
                        <td>${entry.puntuacion_total}</td>
                        <td>${entry.tiempo_resolucion_segundos.toFixed(2)}s</td>
                        <td>${entry.respuestas_correctas}</td>
                    `;
                });
            } else {
                const row = rankingTableBody.insertRow();
                row.innerHTML = `<td colspan="5" class="text-center">no hay datos en el ranking todavía.</td>`;
            }

            // Muestra la información del usuario si no está en el top 10
            if (data.user_result && data.user_position !== -1) {
                userRankingInfo.classList.remove('d-none');
                userPositionDisplay.textContent = data.user_position;
                userScoreRanking.textContent = data.user_result.puntuacion_total;
                userTimeRanking.textContent = data.user_result.tiempo_resolucion_segundos.toFixed(2);
                userCorrectRanking.textContent = data.user_result.respuestas_correctas;
            }

            rankingModal.show(); // Muestra el modal del ranking
        } catch (error) {
            console.error('error al cargar el ranking:', error);
            const errorModal = new bootstrap.Modal(document.getElementById('errorMessageModal'));
            document.getElementById('errorMessageModalBody').textContent = 'error al cargar el ranking.';
            errorModal.show();
        }
    }

    // Función para cargar el test al seleccionar la sección
    function loadTest() {
        fetchQuestions();
        // Asegúrate de que los botones de navegación estén en su estado inicial
        prevQuestionBtn.style.visibility = 'hidden';
        nextQuestionBtn.classList.add('d-none');
        submitTestBtn.classList.add('d-none');
        checkAnswerBtn.classList.remove('d-none');
    }

});