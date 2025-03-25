document.addEventListener('DOMContentLoaded', function() {
    // Только инициализация обработчиков
    initCommentForm();
    initDeleteCommentButtons();

    const commentsList = document.querySelector('.comments-list');
    if (commentsList) {
        commentsList.scrollTop = commentsList.scrollHeight;
    }
    // Прокрутка к комментариям при загрузке страницы
    if (window.location.hash === '#comments-section') {
        setTimeout(scrollCommentsToBottom, 100);
    }
});

function initCommentForm() {
    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Отправка...';

            // Прокручиваем к низу перед отправкой
            scrollCommentsToBottom();
        });
    }
}

// Прокрутка к нижней части комментариев
function scrollCommentsToBottom() {
    const commentsList = document.querySelector('.comments-list');
    if (commentsList) {
        commentsList.scrollTop = commentsList.scrollHeight;
    }
    window.scrollTo(0, document.body.scrollHeight);
}

function scrollToLatestComment() {
    const latestComment = document.getElementById('latest-comment');
    if (latestComment) {
        setTimeout(() => {
            latestComment.scrollIntoView({ behavior: 'smooth' });

            // Небольшой отступ от низа
            window.scrollBy(0, -50);

            // Фокусируемся на поле ввода
            const commentTextarea = document.getElementById('comment-text');
            if (commentTextarea) {
                commentTextarea.focus();
            }
        }, 100);
    }
}

// Остальной код без изменений

// Инициализация формы комментария
function initCommentForm() {
    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            // Можно добавить здесь валидацию перед отправкой
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Отправка...';

            // Форма отправится стандартным способом (с перезагрузкой страницы)
            // так как мы не отменяем событие и не используем AJAX
        });
    }
}

// Инициализация кнопок удаления комментариев
function initDeleteCommentButtons() {
    document.querySelectorAll('.delete-comment-btn').forEach(button => {
        button.addEventListener('click', function() {
            const commentId = this.getAttribute('data-comment-id');
            if (confirm('Вы уверены, что хотите удалить этот комментарий?')) {
                deleteComment(commentId);
            }
        });
    });
}

function deleteComment(commentId) {
    const currentPath = window.location.pathname;
    const deleteUrl = `${currentPath}comments/${commentId}/delete/`;

    fetch(deleteUrl, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Ошибка сервера');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`).closest('.comment-wrapper');
            if (commentElement) {
                commentElement.remove();
                updateCommentsCount(-1);
            }
        } else {
            alert(data.error || 'Ошибка при удалении комментария');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Произошла ошибка: ' + error.message);
    });
}

// Обновление счетчика комментариев
function updateCommentsCount(change) {
    const counters = document.querySelectorAll('.comments-count');
    counters.forEach(counter => {
        const currentCount = parseInt(counter.textContent.match(/\d+/)[0]);
        counter.textContent = counter.textContent.replace(/\d+/, currentCount + change);
    });
}

// Обработка якоря для прокрутки к комментариям
function handleCommentAnchor() {
    if (window.location.hash === '#comments-section') {
        const commentsSection = document.querySelector('.comments-section');
        if (commentsSection) {
            setTimeout(() => {
                commentsSection.scrollIntoView({ behavior: 'smooth' });
            }, 100); // Небольшая задержка для корректной работы после перезагрузки
        }
    }
}

// Вспомогательная функция для получения CSRF токена
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