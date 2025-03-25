document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('save-modal');
    const saveButton = document.getElementById('save-button');
    const closeModal = document.querySelector('.close-modal');
    const authMessage = document.getElementById('auth-message');
    const saveForm = document.getElementById('save-form');
    const downloadSection = document.getElementById('download-section');
    const confirmSaveButton = document.getElementById('confirm-save');
    const downloadButton = document.getElementById('download-button');
    const canvas = document.getElementById('turtle-canvas');
    const codeInput = document.getElementById('code-input'); // Получаем текстовое поле с кодом

    // Функция для сохранения изображения с белым фоном
    function saveCanvasWithWhiteBackground(canvas) {
        // Создаём временный канвас
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        // Устанавливаем размеры временного канваса
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;

        // Заливаем временный канвас белым цветом
        tempCtx.fillStyle = 'white';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        // Рисуем содержимое оригинального канваса на временный канвас
        tempCtx.drawImage(canvas, 0, 0);

        // Возвращаем временный канвас
        return tempCanvas;
    }

    // Открытие модального окна при нажатии на кнопку "Сохранить"
    saveButton.addEventListener('click', function () {
        modal.style.display = 'flex';

        // Проверка авторизации пользователя
        fetch('/users/check_auth/')  // Эндпоинт для проверки авторизации
            .then(response => response.json())
            .then(data => {
                if (data.authenticated) {
                    saveForm.style.display = 'block';
                    authMessage.style.display = 'none';
                    downloadSection.style.display = 'none';
                } else {
                    authMessage.style.display = 'block';
                    saveForm.style.display = 'none';
                    downloadSection.style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Error checking auth:', error);
            });
    });

    // Закрытие модального окна
    closeModal.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    // Сохранение работы с валидацией
    confirmSaveButton.addEventListener('click', function () {
        const titleInput = document.getElementById('work-title');
        const errorText = document.getElementById('title-error');
        const title = titleInput.value.trim();
        const code = codeInput.value;

        // Сбрасываем стиль ошибки
        titleInput.classList.remove('input-error');
        errorText.style.display = 'none';

        // Валидация названия
        if (!title) {
            titleInput.classList.add('input-error');
            errorText.style.display = 'block';
            return; // Прерываем сохранение
        }

        // Создаём изображение с белым фоном
        const canvasWithBackground = saveCanvasWithWhiteBackground(canvas);
        const imageData = canvasWithBackground.toDataURL('image/png');

        // Отправляем данные на сервер
        fetch('/works/save_work/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                title: title,
                code: code,
                image: imageData
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Работа успешно сохранена!');
                modal.style.display = 'none';
                titleInput.value = ''; // Очищаем поле после сохранения
            } else {
                alert('Ошибка при сохранении работы: ' + (data.error || ''));
            }
        })
        .catch(error => {
            console.error('Error saving work:', error);
        });
    });

    document.getElementById('work-title').addEventListener('input', function() {
        const titleInput = this;
        const errorText = document.getElementById('title-error');

        if (titleInput.value.trim().length > 0) {
            titleInput.classList.remove('input-error');
            errorText.style.display = 'none';
        }
    });

    // Скачивание изображения
    downloadButton.addEventListener('click', function () {
        // Создаём изображение с белым фоном
        const canvasWithBackground = saveCanvasWithWhiteBackground(canvas);

        // Создаём ссылку для скачивания
        const link = document.createElement('a');
        link.download = 'turtle-image.png';
        link.href = canvasWithBackground.toDataURL('image/png');
        link.click();
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
});