document.addEventListener('DOMContentLoaded', function () {
    const codeInput = document.getElementById('code-input');
    const lineNumbers = document.getElementById('line-numbers');
    const lineNumbersContainer = document.querySelector('.line-numbers-container');
    const runButton = document.getElementById('run-button');
    const clearButton = document.getElementById('clear-button'); // Добавляем кнопку "Очистить"
    const canvas = document.getElementById('turtle-canvas');
    const errorMessage = document.getElementById('error-message');

    // Проверка, что элементы существуют
    if (!codeInput || !lineNumbers || !runButton || !canvas || !errorMessage || !clearButton) {
        console.error('Один из элементов не найден в DOM');
        return;
    }

    // Инициализация turtle
    const turtle = new Turtle(canvas);

    // Делаем turtle доступным в глобальной области видимости
    window.turtle = turtle;

    // Создаем русскоязычные функции
    window.вперёд = (расстояние) => turtle.forward(расстояние);
    window.назад = (расстояние) => turtle.backward(расстояние);
    window.направо = (угол) => turtle.right(угол);
    window.налево = (угол) => turtle.left(угол);
    window.поднять_хвост = () => turtle.penup();
    window.опустить_хвост = () => turtle.pendown();

    // Хранилище переменных
    const variables = {};

    // Список команд черепахи
    const turtleCommands = ['вперёд', 'назад', 'направо', 'налево', 'поднять_хвост', 'опустить_хвост'];

    // Функция для выполнения кода
    function executeCode(code) {
        try {
            // Проверяем, является ли строка командой черепахи
            const isTurtleCommand = turtleCommands.some(command => code.startsWith(command));

            if (isTurtleCommand) {
                // Разбираем команду на название и аргументы
                const match = code.match(/^(\D+)\((.*)\)$/);
                if (match) {
                    const commandName = match[1].trim();
                    const argsString = match[2];

                    // Вычисляем все аргументы с учётом переменных
                    const args = argsString.split(',')
                        .map(arg => evaluateExpression(arg.trim()));

                    // Вызываем команду черепахи с вычисленными аргументами
                    if (typeof window[commandName] === 'function') {
                        window[commandName](...args);
                    } else {
                        throw new Error(`Неизвестная команда: ${commandName}`);
                    }
                }
                return;
            }

            // Обработка присваивания переменных
            if (code.includes('=')) {
                const [varName, expression] = code.split('=').map(s => s.trim());
                variables[varName] = evaluateExpression(expression);
                return;
            }

            // Выполнение арифметических операций
            const result = evaluateExpression(code);
            if (typeof result !== 'undefined') {
                console.log(result);
            }
        } catch (error) {
            errorMessage.textContent = `Ошибка: ${error.message}`;
            console.error(error);
        }
    }

    // Функция для вычисления выражений (обновлённая)
    function evaluateExpression(expression) {
        // Заменяем русские операторы на JavaScript-эквиваленты
        expression = expression
            .replace(/ИЛИ/g, '||')
            .replace(/И/g, '&&')
            .replace(/НЕ/g, '!')
            .replace(/\^/g, '**')
            .replace(/\+/g, '+') // Убедимся, что пробелы вокруг "+" не мешают
            .replace(/\-/g, '-');

        // Заменяем переменные на их значения (с учётом сложных имён)
        expression = expression.replace(/([a-zA-Zа-яА-Я_]+)/g, (match) => {
            if (variables.hasOwnProperty(match)) {
                return variables[match];
            }
            throw new Error(`Переменная ${match} не определена`);
        });

        console.log('Вычисляемое выражение:', expression); // Отладочный вывод
        return eval(expression);
    }

    // Обновление нумерации строк при загрузке страницы
    updateLineNumbers();

    runButton.addEventListener('click', function () {
        console.log('Кнопка "Запустить" нажата'); // Отладочный вывод
        // Очистка предыдущего результата
        turtle.reset();
        errorMessage.textContent = '';

        // Очистка переменных
        for (const key in variables) {
            delete variables[key];
        }

        try {
            // Получаем код из текстового поля
            const code = codeInput.value;

            // Разбиваем код на строки
            const lines = code.split('\n');

            // Выполняем код построчно
            lines.forEach(line => {
                if (line.trim()) {
                    executeCode(line.trim());
                }
            });
        } catch (error) {
            // Отображение ошибки
            errorMessage.textContent = `Ошибка: ${error.message}`;
            console.error(error);
        }
    });

    // Обработчик для кнопки "Очистить"
    clearButton.addEventListener('click', function () {
        // Очищаем текстовое поле
        codeInput.value = '';
        // Сбрасываем состояние черепахи
        turtle.reset();
        // Очищаем сообщение об ошибке
        errorMessage.textContent = '';
        // Обновляем нумерацию строк
        updateLineNumbers();
    });

    // Функция для обновления нумерации строк
    function updateLineNumbers() {
        const lines = codeInput.value.split('\n').length;
        lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join('<br>');
    }

    // Синхронизация прокрутки
    function syncScroll() {
        lineNumbersContainer.scrollTop = codeInput.scrollTop;
    }

    codeInput.addEventListener('input', updateLineNumbers);
    codeInput.addEventListener('scroll', syncScroll);
    codeInput.addEventListener('keydown', syncScroll); // Обработка клавиш
    updateLineNumbers();
});

// Класс для имитации turtle
class Turtle {
    constructor(canvas) {
        console.log('Инициализация Turtle'); // Отладочный вывод
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.angle = 0;
        this.penDown = true;
        this.reset();
    }

    reset() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height / 2;
        this.angle = 0;
        this.penDown = true;
    }

    forward(distance) {
        const newX = this.x + distance * Math.cos((this.angle * Math.PI) / 180);
        const newY = this.y + distance * Math.sin((this.angle * Math.PI) / 180);
        if (this.penDown) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.x, this.y);
            this.ctx.lineTo(newX, newY);
            this.ctx.stroke();
        }
        this.x = newX;
        this.y = newY;
    }

    backward(distance) {
        this.forward(-distance);
    }

    right(angle) {
        this.angle += angle;
    }

    left(angle) {
        this.angle -= angle;
    }

    penup() {
        this.penDown = false;
    }

    pendown() {
        this.penDown = true;
    }
}