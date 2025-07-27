document.addEventListener('DOMContentLoaded', () => {
    const cursos = document.querySelectorAll('.curso');
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const closeButton = document.querySelector('.close-button');

    // Objeto para almacenar los nombres de los cursos por su ID (para mensajes)
    const courseNames = {};
    document.querySelectorAll('.hidden-requisitos-info span').forEach(span => {
        courseNames[span.dataset.id] = span.dataset.name;
    });

    // Función para obtener el estado de los cursos desde localStorage
    const getApprovedCourses = () => {
        const approved = localStorage.getItem('approvedCourses');
        return approved ? JSON.parse(approved) : {};
    };

    // Función para guardar el estado de los cursos en localStorage
    const saveApprovedCourses = (approvedCourses) => {
        localStorage.setItem('approvedCourses', JSON.stringify(approvedCourses));
    };

    // Objeto para mantener el estado actual de los cursos aprobados
    let approvedCoursesState = getApprovedCourses();

    // Función para actualizar la UI de los cursos basado en su estado
    const updateCourseUI = () => {
        cursos.forEach(curso => {
            const courseId = curso.dataset.id;
            curso.classList.remove('aprobado', 'bloqueado'); // Limpiar clases antes de aplicar

            if (approvedCoursesState[courseId]) {
                curso.classList.add('aprobado');
            } else {
                const requisitos = curso.dataset.requisitos ? curso.dataset.requisitos.split(',') : [];
                const isBlocked = requisitos.some(reqId => !approvedCoursesState[reqId]);
                if (isBlocked) {
                    curso.classList.add('bloqueado');
                }
            }
        });
    };

    // Función para mostrar el modal con un mensaje
    const showModal = (title, message) => {
        modalTitle.textContent = title;
        modalMessage.innerHTML = message;
        modal.style.display = 'flex'; // Mostrar el modal
    };

    // Función para cerrar el modal
    const closeModal = () => {
        modal.style.display = 'none'; // Ocultar el modal
    };

    // Event listeners para el modal
    closeButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) { // Si se hace clic fuera del contenido del modal
            closeModal();
        }
    });

    // Añadir event listener a cada curso
    cursos.forEach(curso => {
        curso.addEventListener('click', () => {
            const courseId = curso.dataset.id;
            const courseName = curso.dataset.name;
            const requisitos = curso.dataset.requisitos ? curso.dataset.requisitos.split(',') : [];

            if (approvedCoursesState[courseId]) {
                // Si el curso ya está aprobado, se desaprueba
                delete approvedCoursesState[courseId];
                saveApprovedCourses(approvedCoursesState);
                updateCourseUI();
            } else {
                // Verificar prerrequisitos
                const missingRequisitos = requisitos.filter(reqId => !approvedCoursesState[reqId]);

                if (missingRequisitos.length === 0) {
                    // Si no hay requisitos faltantes, aprobar el curso
                    approvedCoursesState[courseId] = true;
                    saveApprovedCourses(approvedCoursesState);
                    updateCourseUI();
                } else {
                    // Si faltan requisitos, mostrar mensaje de bloqueo
                    const missingNames = missingRequisitos.map(id => courseNames[id] || id);
                    let message = `No puedes aprobar "${courseName}" porque te faltan los siguientes ramos:<br><br><ul>`;
                    missingNames.forEach(name => {
                        message += `<li>- ${name}</li>`;
                    });
                    message += `</ul>`;
                    showModal('Ramo Bloqueado', message);
                }
            }
        });
    });

    // Inicializar la UI al cargar la página (esto no muestra el modal al inicio)
    updateCourseUI();
});
