document.addEventListener('DOMContentLoaded', function () {
    const codeInput = document.getElementById('code-input');
    const lineNumbers = document.getElementById('line-numbers');
    const lineNumbersContainer = document.querySelector('.line-numbers-container');
    const runButton = document.getElementById('run-button');
    const clearButton = document.getElementById('clear-button');
    const canvas = document.getElementById('turtle-canvas');
    const errorMessage = document.getElementById('error-message');

    if (!codeInput || !lineNumbers || !runButton || !canvas || !errorMessage || !clearButton) {
        console.error('Один из элементов не найден в DOM');
        return;
    }

    const turtle = new Turtle(canvas);
    window.turtle = turtle;

    // Создаем русскоязычные функции
    window.вперёд = (расстояние) => turtle.forward(расстояние);
    window.назад = (расстояние) => turtle.backward(расстояние);
    window.направо = (угол) => turtle.right(угол);
    window.налево = (угол) => turtle.left(угол);
    window.поднять_хвост = () => turtle.penup();
    window.опустить_хвост = () => turtle.pendown();
    window.точка = (размер, цвет) => turtle.точка(размер, цвет);
    window.установить_цвет = (цвет) => turtle.установить_цвет(цвет);

    const variables = {};
    const turtleCommands = [
        'вперёд', 'назад', 'направо', 'налево', 'поднять_хвост',
        'опустить_хвост', 'точка', 'установить_цвет'
    ];


    function executeCode(code) {
        try {
            const forLoopMatch = code.match(/^ДЛЯ\s+([а-яА-Яa-zA-Z_]+)\s+В\s+\[([^,\]]+),\s*([^,\]]+)(?:,\s*([^,\]]+))?\]$/);
            if (forLoopMatch) {
                const varName = forLoopMatch[1].trim();
                const start = evaluateExpression(forLoopMatch[2].trim());
                const end = evaluateExpression(forLoopMatch[3].trim());
                const step = forLoopMatch[4] ? evaluateExpression(forLoopMatch[4].trim()) : 1;

                return {
                    type: 'FOR_LOOP',
                    varName,
                    start,
                    end,
                    step,
                };
            }

            const isTurtleCommand = turtleCommands.some(command => code.startsWith(command));

            if (isTurtleCommand) {
                const match = code.match(/^(\D+)\((.*)\)$/);
                if (match) {
                    const commandName = match[1].trim();
                    const argsString = match[2];

                    const args = argsString.split(',')
                        .map(arg => evaluateExpression(arg.trim()));

                    if (typeof window[commandName] === 'function') {
                        window[commandName](...args);
                    } else {
                        throw new Error(`Неизвестная команда: ${commandName}`);
                    }
                }
                return;
            }

            if (code.includes('=')) {
                const [varName, expression] = code.split('=').map(s => s.trim());
                variables[varName] = evaluateExpression(expression);
                return;
            }

            const result = evaluateExpression(code);
            if (typeof result !== 'undefined') {
                console.log(result);
            }
        } catch (error) {
            errorMessage.textContent = `Ошибка: ${error.message}`;
            console.error(error);
        }
    }

    function evaluateExpression(expression) {
        // Если это ключевое слово цикла, возвращаем его как есть
        if (expression === 'ДЛЯ' || expression === 'КОНЕЦДЛЯ') {
            return expression;
        }

        if (/^['"].*['"]$/.test(expression)) {
            const colorName = expression.slice(1, -1);
            const цвета = {
                'красный': '#FF0000',
                'зелёный': '#00FF00',
                'синий': '#0000FF',
                'жёлтый': '#FFFF00',
                'оранжевый': '#FFA500',
                'фиолетовый': '#800080',
                'розовый': '#FFC0CB',
                'голубой': '#00FFFF',
                'бирюзовый': '#40E0D0',
                'салатовый': '#7FFF00',
                'лавандовый': '#E6E6FA',
                'коричневый': '#A52A2A',
                'бежевый': '#F5F5DC',
                'серый': '#808080',
                'чёрный': '#000000',
                'белый': '#FFFFFF',
                'золотой': '#FFD700',
                'серебряный': '#C0C0C0',
                'бордовый': '#800000',
                'оливковый': '#808000',
                'темно-синий': '#000080',
                'темно-зелёный': '#006400',
                'светло-голубой': '#ADD8E6',
                'светло-розовый': '#FFB6C1',
                'светло-зелёный': '#90EE90',
                'тёмно-фиолетовый': '#9400D3',
                'персиковый': '#FFE5B4',
                'мятный': '#98FF98',
                'коралловый': '#FF7F50',
                'индиго': '#4B0082',
                'хаки': '#F0E68C',
                'терракотовый': '#E2725B',
                'малиновый': '#DC143C',
                'лаймовый': '#00FF00',
                'аквамарин': '#7FFFD4',
                'небесно-голубой': '#87CEEB',
                'пурпурный': '#800080',
                'сливовый': '#DDA0DD',
                'шоколадный': '#D2691E',
            };

            if (цвета[colorName]) {
                return цвета[colorName];
            } else {
                throw new Error(`Неизвестный цвет: ${colorName}`);
            }
        }

        if (/^#[0-9A-Fa-f]{3,6}$/i.test(expression)) {
            return expression;
        }

        expression = expression
            .replace(/ИЛИ/g, '||')
            .replace(/И/g, '&&')
            .replace(/НЕ/g, '!')
            .replace(/\^/g, '**')
            .replace(/\+/g, '+')
            .replace(/\-/g, '-');

        expression = expression.replace(/([a-zA-Zа-яА-Я_]+)/g, (match) => {
            if (variables.hasOwnProperty(match)) {
                return variables[match];
            }
            throw new Error(`Переменная ${match} не определена`);
        });

        console.log('Вычисляемое выражение:', expression);
        return eval(expression);
    }

    updateLineNumbers();

    runButton.addEventListener('click', function () {
        console.log('Кнопка "Запустить" нажата');
        turtle.reset();
        errorMessage.textContent = '';

        // Очистка переменных
        for (const key in variables) {
            delete variables[key];
        }

        try {
            const code = codeInput.value;
            const lines = code.split('\n').filter(line => line.trim() !== ''); // Удаляем пустые строки
            const loopStack = [];
            let i = 0;

            function processLine() {
                if (i >= lines.length) return;

                const line = lines[i].trim();
                i++;

                // Обработка начала цикла
                const forLoopMatch = line.match(/^ДЛЯ\s+([а-яА-Яa-zA-Z_]+)\s+В\s+\[([^,\]]+),\s*([^,\]]+)(?:,\s*([^,\]]+))?\]$/);
                if (forLoopMatch) {
                    const varName = forLoopMatch[1].trim();
                    const start = evaluateExpression(forLoopMatch[2].trim());
                    const end = evaluateExpression(forLoopMatch[3].trim());
                    const step = forLoopMatch[4] ? evaluateExpression(forLoopMatch[4].trim()) : 1;

                    variables[varName] = start;
                    loopStack.push({
                        varName,
                        start,
                        end,
                        step,
                        loopStartIndex: i // Индекс следующей строки после ДЛЯ
                    });

                    processLine();
                    return;
                }

                // Обработка конца цикла
                if (line === 'КОНЕЦДЛЯ') {
                    if (loopStack.length === 0) throw new Error('Неожиданный КОНЕЦДЛЯ');

                    const currentLoop = loopStack[loopStack.length - 1];
                    variables[currentLoop.varName] += currentLoop.step;

                    // Проверяем условие продолжения
                    if (
                        (currentLoop.step > 0 && variables[currentLoop.varName] <= currentLoop.end) ||
                        (currentLoop.step < 0 && variables[currentLoop.varName] >= currentLoop.end)
                    ) {
                        i = currentLoop.loopStartIndex; // Возвращаемся к телу цикла
                    } else {
                        loopStack.pop(); // Выходим из цикла
                    }

                    processLine();
                    return;
                }

                // Выполнение обычной команды
                executeCode(line);
                processLine(); // Рекурсивный вызов для синхронного выполнения
            }

            processLine();
        } catch (error) {
            errorMessage.textContent = `Ошибка: ${error.message}`;
            console.error(error);
        }
    });

    clearButton.addEventListener('click', function () {
        codeInput.value = '';
        turtle.reset();
        errorMessage.textContent = '';
        updateLineNumbers();
    });

    function updateLineNumbers() {
        const lines = codeInput.value.split('\n').length;
        lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join('<br>');
    }

    function syncScroll() {
        lineNumbersContainer.scrollTop = codeInput.scrollTop;
    }

    codeInput.addEventListener('input', updateLineNumbers);
    codeInput.addEventListener('scroll', syncScroll);
    codeInput.addEventListener('keydown', syncScroll);
    updateLineNumbers();
});

class Turtle {
    constructor(canvas) {
        console.log('Инициализация Turtle');
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.angle = 0;
        this.penDown = true;
        this.color = '#000000';
        this.reset();
    }

    reset() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height / 2;
        this.angle = 0;
        this.penDown = true;
        this.color = '#000000';
    }

    forward(distance) {
        const newX = this.x + distance * Math.cos((this.angle * Math.PI) / 180);
        const newY = this.y + distance * Math.sin((this.angle * Math.PI) / 180);
        if (this.penDown) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.x, this.y);
            this.ctx.lineTo(newX, newY);
            this.ctx.strokeStyle = this.color;
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

    точка(размер, цвет) {
        const originalColor = this.color;

        if (цвет) {
            this.установить_цвет(цвет);
        }

        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, размер / 2, 0, Math.PI * 2);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();

        this.color = originalColor;
        this.ctx.strokeStyle = originalColor;
        this.ctx.fillStyle = originalColor;
    }

    установить_цвет(цвет) {
        this.color = цвет;
        this.ctx.strokeStyle = this.color;
        this.ctx.fillStyle = this.color;
    }
}