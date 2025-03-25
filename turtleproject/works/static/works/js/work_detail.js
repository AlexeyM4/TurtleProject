// Копирование ссылки на работу
function copyWorkLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        const notification = document.getElementById('share-notification');
        notification.style.display = 'block';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 2000);
    });
}

// Функция для скачивания изображения с названием работы
function downloadWorkImage() {
    try {
        // Получаем элементы со страницы
        const workImage = document.querySelector('.work-image');
        const workTitle = document.querySelector('.work-title').textContent;

        if (!workImage) {
            throw new Error('Изображение работы не найдено');
        }

        // Формируем корректное имя файла
        const sanitizeFilename = (name) => {
            return name.replace(/[^а-яА-Яa-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
        };

        const filename = `${sanitizeFilename(workTitle)}.png`;

        // Создаем временную ссылку для скачивания
        const link = document.createElement('a');
        link.href = workImage.src;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } catch (error) {
        console.error('Ошибка при скачивании:', error);
        alert('Не удалось скачать изображение');
    }
}


// Подтверждение удаления
function confirmDelete() {
    document.getElementById('deleteModal').style.display = 'block';
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
}

// Удаление работы
function deleteWork() {
    fetch(window.location.pathname + 'delete/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
    })
    .then(response => {
        if (response.ok) {
            window.location.href = '/users/profile';
        }
    });
}

function showLikesList(workId) {
    const modal = document.getElementById('likesModal');
    const likesList = document.getElementById('likesList');

    // Показываем загрузку
    likesList.innerHTML = '<div class="loading">Загрузка...</div>';
    modal.style.display = 'block';

    // Запрещаем прокрутку body при открытом модальном окне
    document.body.style.overflow = 'hidden';

    fetch(`/works/work/${workId}/likes/`)
        .then(response => response.json())
        .then(data => {
            if (data.users.length === 0) {
                likesList.innerHTML = '<div class="empty">Пока никто не оценил эту работу</div>';
                return;
            }

            let html = '';
            data.users.forEach(user => {
                html += `
                <div class="likes-list-item">
                    <span class="likes-list-username">${user.username}</span>
                </div>`;
            });

            likesList.innerHTML = html;

            // Если пользователей больше 10, добавляем подсказку о скролле
            if (data.users.length > 10) {
                const hint = document.createElement('div');
                hint.className = 'scroll-hint';
                hint.textContent = 'Прокрутите вниз, чтобы увидеть больше';
                likesList.prepend(hint);
            }
        })
        .catch(error => {
            likesList.innerHTML = '<div class="error">Ошибка загрузки списка</div>';
        });
}

function closeLikesModal() {
    document.getElementById('likesModal').style.display = 'none';
    // Восстанавливаем прокрутку body
    document.body.style.overflow = 'auto';
}

// Закрытие модального окна при клике вне его
window.addEventListener('click', function(event) {
    if (event.target === document.getElementById('likesModal')) {
        closeLikesModal();
    }
});

// Обработчик клика на счетчик лайков
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.likes-count').forEach(count => {
        count.style.cursor = 'pointer';
        count.addEventListener('click', function() {
            const workId = this.getAttribute('data-work-id');
            showLikesList(workId);
        });
    });
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

