function validatePassword() {
    const password1 = document.getElementById('new_password1').value;
    const password2 = document.getElementById('new_password2').value;
    const passwordErrors = document.getElementById('password-errors');
    const passwordMatchError = document.getElementById('password-match-error');
    const resetButton = document.getElementById('reset-button');

    let isValid = true;
    let errorMessages = [];

    // Проверка минимальных требований к паролю
    if (password1.length < 8) {
        errorMessages.push('Пароль должен содержать минимум 8 символов.');
        isValid = false;
    }
    if (!/[A-Z]/.test(password1)) {
        errorMessages.push('Пароль должен содержать хотя бы одну заглавную букву.');
        isValid = false;
    }
    if (!/[0-9]/.test(password1)) {
        errorMessages.push('Пароль должен содержать хотя бы одну цифру.');
        isValid = false;
    }
    if (!/[^A-Za-z0-9]/.test(password1)) {
        errorMessages.push('Пароль должен содержать хотя бы один специальный символ.');
        isValid = false;
    }

    // Проверка совпадения паролей
    if (password1 !== password2 && password2 !== '') {
        passwordMatchError.textContent = 'Пароли не совпадают.';
        isValid = false;
    } else {
        passwordMatchError.textContent = '';
    }

    // Вывод сообщений об ошибках
    if (errorMessages.length > 0) {
        passwordErrors.innerHTML = errorMessages.join('<br>');
    } else {
        passwordErrors.textContent = '';
    }

    // Активация/деактивация кнопки сброса пароля
    if (isValid && password1 === password2) {
        resetButton.disabled = false;
    } else {
        resetButton.disabled = true;
    }
}