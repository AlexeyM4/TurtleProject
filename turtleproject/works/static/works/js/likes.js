document.addEventListener('DOMContentLoaded', function() {
    // Элементы модальных окон
    const authModal = document.getElementById('authModal');
    const workModal = document.getElementById('workModal');
    const closeModals = document.querySelectorAll('.close-modal');

    // Закрытие модальных окон
    closeModals.forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            authModal.style.display = 'none';
            workModal.style.display = 'none';
        });
    });

    // Закрытие при клике вне модального окна
    window.addEventListener('click', function(event) {
        if (event.target === authModal) authModal.style.display = 'none';
        if (event.target === workModal) workModal.style.display = 'none';
    });

    // Обработчики для карточек работ
    document.querySelectorAll('.work-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Проверяем, был ли клик по иконке лайка
            if (e.target.closest('.like-icon') || e.target.closest('.likes-count')) {
                return;
            }

            const workId = this.dataset.workId;
            fetch(`/works/get_work_details/${workId}/`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Заполняем модальное окно данными
                        document.querySelector('.work-code').textContent = data.code;
                        document.querySelector('.modal-work-image').src = data.image;

                        // Обновляем статистику
                        const stats = document.querySelector('.modal-work-stats');
                        stats.innerHTML = `
                            <span class="modal-like-icon ${data.user_has_liked ? 'liked' : ''}"
                                  data-work-id="${workId}"
                                  ${data.is_authenticated ? '' : 'data-unauth="true"'}>
                                ${data.user_has_liked ? '❤️' : '🤍'}
                            </span>
                            <span class="modal-likes-count" data-work-id="${workId}">${data.likes}</span>
                            <span class="modal-comments-count">💬 ${data.comments}</span>
                        `;

                        // Заполняем список лайков
                        const likesList = document.querySelector('.likes-list');
                        likesList.innerHTML = data.liked_by.map(user =>
                            `<li>${user.username}</li>`
                        ).join('') || '<li>Пока никто не оценил эту работу</li>';

                        // Показываем модальное окно
                        workModal.style.display = 'block';

                        // Добавляем обработчики для элементов в модальном окне
                        setupModalEventListeners();
                    }
                })
                .catch(error => console.error('Error:', error));
        });
    });

    // Обработчики для счетчиков лайков (открытие списка)
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('likes-count')) {
            const workId = e.target.dataset.workId;
            const modal = document.getElementById('workModal');

            // Если модальное окно уже открыто для этой работы, просто показываем список
            if (modal.style.display === 'block' && modal.querySelector('.modal-likes-count').dataset.workId === workId) {
                modal.querySelector('.likes-list-container').style.display = 'block';
            } else {
                // Иначе загружаем данные работы
                const card = document.querySelector(`.work-card[data-work-id="${workId}"]`);
                card.click();
            }
        }
    });

    // Общая функция для настройки обработчиков событий
    function setupEventListeners() {
        // Обработчики для всех иконок лайков (включая те, что в модальном окне)
        document.querySelectorAll('.like-icon, .modal-like-icon').forEach(icon => {
            // Анимация при наведении
            icon.addEventListener('mouseenter', function() {
                if (!this.dataset.unauth) {
                    this.style.transform = 'scale(1.1)';
                }
            });

            icon.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
            });

            // Основной обработчик клика
            icon.addEventListener('click', handleLikeClick);
        });
    }

    // Функция обработки клика по лайку
    function handleLikeClick(e) {
        e.stopPropagation();
        const icon = this;

        // Для незарегистрированных пользователей
        if (icon.dataset.unauth === "true") {
            e.preventDefault();
            authModal.style.display = 'block';
            return;
        }

        const workId = icon.dataset.workId;
        let likesCount;

        // Определяем, где находится иконка - в карточке или в модальном окне
        if (icon.closest('.work-modal-content')) {
            likesCount = icon.nextElementSibling;
        } else {
            likesCount = icon.nextElementSibling;
        }

        // Визуальный feedback при клике
        icon.style.transform = 'scale(0.9)';
        setTimeout(() => {
            icon.style.transform = 'scale(1.1)';
        }, 100);

        // Отправка запроса на сервер
        fetch(`/works/like_work/${workId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
        })
        .then(response => {
            if (!response.ok) throw new Error('Network error');
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Обновляем состояние иконки
                icon.innerHTML = data.liked ? '❤️' : '🤍';
                icon.classList.toggle('liked', data.liked);

                // Обновляем счетчик в карточке
                document.querySelectorAll(`.likes-count[data-work-id="${workId}"]`).forEach(el => {
                    el.textContent = data.likes;
                });

                // Обновляем счетчик в модальном окне, если оно открыто
                if (workModal.style.display === 'block' &&
                    workModal.querySelector('.modal-likes-count').dataset.workId === workId) {
                    workModal.querySelector('.modal-likes-count').textContent = data.likes;

                    // Обновляем список лайков
                    const likesList = workModal.querySelector('.likes-list');
                    likesList.innerHTML = data.liked_by.map(user =>
                        `<li>${user.username}</li>`
                    ).join('') || '<li>Пока никто не оценил эту работу</li>';
                }
            } else {
                throw new Error(data.error || 'Unknown error');
            }
        })
        .catch(error => {
            console.error('Like error:', error);
            // Возвращаем исходное состояние при ошибке
            icon.innerHTML = icon.classList.contains('liked') ? '❤️' : '🤍';
        })
        .finally(() => {
            icon.style.transform = 'scale(1)';
        });
    }

    // Инициализация обработчиков событий
    setupEventListeners();
});

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