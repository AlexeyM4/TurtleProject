document.addEventListener('DOMContentLoaded', function() {
    const checkButton = document.getElementById('check-button');
    const authModal = document.getElementById('authModal');

    if (checkButton) {
        checkButton.addEventListener('click', function() {
            const isSolutionCorrect = checkSolution();

            if (isSolutionCorrect) {
                fetch(window.location.href, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken'),
                        'Content-Type': 'application/json',
                    },
                    credentials: 'same-origin'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {

                        checkButton.classList.add('completed');
                        checkButton.textContent = '✓ Урок пройден';
                        checkButton.style.backgroundColor = '#4CAF50';
                        checkButton.disabled = true;
                    } else if (data.status === 'auth_required') {

                        authModal.style.display = 'block';
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            } else {
                alert('Решение неверное! Попробуйте ещё раз.');
            }
        });
    }

    // Закрытие модального окна
    const closeModal = document.querySelector('.close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            authModal.style.display = 'none';
        });
    }

    // Функция для получения CSRF токена
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }


    function checkSolution() {
        return true; // временно всегда возвращает true для теста
    }
});