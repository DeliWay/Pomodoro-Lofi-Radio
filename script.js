document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const timerDisplay = document.getElementById('timer');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const skipBtn = document.getElementById('skipBtn');
    const toggleRadioBtn = document.getElementById('toggleRadio');
    const volumeControl = document.getElementById('volumeControl');
    const radio = document.getElementById('radio');
    const notificationSound = document.getElementById('notification');
    const workModeBtn = document.getElementById('workMode');
    const breakModeBtn = document.getElementById('breakMode');
    const sessionCountEl = document.getElementById('sessionCount');
    const currentModeEl = document.getElementById('currentMode');
    const nextModeEl = document.getElementById('nextMode');
    
    // Переменные таймера
    let timer;
    let timeLeft;
    let isRunning = false;
    let isBreak = false;
    let sessionCount = 1;
    const workTime = 25 * 60; // 25 минут в секундах
    const shortBreakTime = 5 * 60; // 5 минут в секундах
    const longBreakTime = 15 * 60; // 15 минут в секундах
    
    // Переменные радио
    let radioPlaying = false;
    let radioInitialized = false;
    let userInteracted = false;
    
    // Инициализация
    function init() {
        timeLeft = workTime;
        updateDisplay();
        volumeControl.value = 20;
        updateModeInfo();
        
        // Загрузка уведомления
        notificationSound.src = 'nice-sound.mp3';
        
        // Настройка радио
        setupRadio();
        
        // Обработка пользовательского взаимодействия
        document.body.addEventListener('click', handleUserInteraction);
        document.body.addEventListener('touchstart', handleUserInteraction);
    }
    
    // Обработка пользовательского взаимодействия
    function handleUserInteraction() {
        if (!userInteracted) {
            userInteracted = true;
            console.log('User interaction detected');
            
            // Пытаемся инициализировать радио после взаимодействия
            if (!radioInitialized) {
                setupRadio();
            }
        }
    }
    
    // Настройка радио
    function setupRadio() {
        if (radioInitialized) return;
        
        // Прямая ссылка на стрим Lofi Girl
        // Эти ссылки могут меняться, возможно потребуется обновление
        const streamUrls = [
            'https://play.streamafrica.net/lofiradio',
            'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one',
            'https://mediaserv33.live-streams.nl:18058/live'
        ];
        
        // Попробуем установить источник для радио
        radio.src = streamUrls[0];
        radio.volume = volumeControl.value / 100;
        
        radio.addEventListener('canplay', function() {
            console.log('Radio can play');
            radioInitialized = true;
        });
        
        radio.addEventListener('error', function(e) {
            console.log('Radio error, trying backup stream', e);
            // Попробуем backup стрим при ошибке
            if (streamUrls.length > 1) {
                radio.src = streamUrls[1];
            }
        });
        
        // Предзагрузка радио
        radio.load();
    }
    
    // Управление радио
    function toggleRadio() {
        if (!radioInitialized && userInteracted) {
            setupRadio();
        }
        
        if (!radioInitialized) {
            showNotice('Нажмите на страницу, чтобы активировать радио');
            return;
        }
        
        if (radioPlaying) {
            pauseRadio();
            toggleRadioBtn.textContent = '▶';
        } else {
            playRadio();
            toggleRadioBtn.textContent = '❚❚';
        }
        radioPlaying = !radioPlaying;
    }
    
    // Показать уведомление
    function showNotice(message) {
        // Создаем элемент уведомления, если его нет
        let notice = document.querySelector('.interaction-notice');
        if (!notice) {
            notice = document.createElement('div');
            notice.className = 'interaction-notice';
            document.body.appendChild(notice);
        }
        
        notice.textContent = message;
        notice.style.display = 'block';
        
        // Скрываем уведомление через 3 секунды
        setTimeout(() => {
            notice.style.display = 'none';
        }, 3000);
    }
    
    // Воспроизведение радио
    function playRadio() {
        if (radioInitialized) {
            const playPromise = radio.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log('Play error:', error);
                    showNotice('Нажмите на страницу, чтобы включить радио');
                });
            }
        }
    }
    
    // Пауза радио
    function pauseRadio() {
        if (radioInitialized) {
            radio.pause();
        }
    }
    
    // Установка громкости радио
    function setRadioVolume() {
        if (radioInitialized) {
            radio.volume = volumeControl.value / 100;
        }
    }
    
    // Обновление отображения таймера
    function updateDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Обновление информации о режимах
    function updateModeInfo() {
        sessionCountEl.textContent = sessionCount;
        currentModeEl.textContent = isBreak ? (sessionCount === 4 ? 'Длинный перерыв' : 'Короткий перерыв') : 'Работа';
        
        if (!isBreak) {
            nextModeEl.textContent = sessionCount === 4 ? 'Длинный перерыв' : 'Короткий перерыв';
        } else {
            nextModeEl.textContent = 'Работа';
        }
    }
    
    // Переключение между режимами работы и перерыва
    function switchMode() {
        isBreak = !isBreak;
        
        if (isBreak) {
            // Определяем тип перерыва
            if (sessionCount === 4) {
                timeLeft = longBreakTime;
            } else {
                timeLeft = shortBreakTime;
            }
        } else {
            timeLeft = workTime;
            // Увеличиваем счетчик сессий после завершения перерыва
            if (sessionCount < 4) {
                sessionCount++;
            } else {
                sessionCount = 1; // Сброс после 4 сессий
            }
        }
        
        updateDisplay();
        updateModeInfo();
    }
    
    // Запуск таймера
    function startTimer() {
        if (!isRunning) {
            isRunning = true;
            timer = setInterval(() => {
                timeLeft--;
                updateDisplay();
                
                if (timeLeft === 0) {
                    clearInterval(timer);
                    isRunning = false;
                    
                    // Приглушаем радио во время уведомления
                    if (radioPlaying && radioInitialized) {
                        const originalVolume = radio.volume;
                        radio.volume = 0.2; // Приглушаем радио
                        
                        // Восстанавливаем громкость радио после уведомления
                        notificationSound.onended = function() {
                            radio.volume = originalVolume;
                        };
                    }
                    
                    // Воспроизводим уведомление
                    notificationSound.play();
                    timerDisplay.classList.add('pulse');
                    
                    // Убираем пульсацию после уведомления
                    notificationSound.onended = function() {
                        timerDisplay.classList.remove('pulse');
                        
                        // Переключение режима
                        switchMode();
                    };
                }
            }, 1000);
        }
    }
    
    // Пауза таймера
    function pauseTimer() {
        clearInterval(timer);
        isRunning = false;
    }
    
    // Сброс таймера
    function resetTimer() {
        clearInterval(timer);
        isRunning = false;
        
        if (isBreak) {
            timeLeft = sessionCount === 4 ? longBreakTime : shortBreakTime;
        } else {
            timeLeft = workTime;
        }
        
        updateDisplay();
    }
    
    // Пропуск текущего этапа
    function skipStage() {
        clearInterval(timer);
        isRunning = false;
        switchMode();
    }
    
    // Установка режима работы
    function setWorkMode() {
        if (isBreak) {
            clearInterval(timer);
            isRunning = false;
            isBreak = false;
            timeLeft = workTime;
            updateDisplay();
            updateModeInfo();
            
            workModeBtn.classList.add('active');
            breakModeBtn.classList.remove('active');
        }
    }
    
    // Установка режима перерыва
    function setBreakMode() {
        if (!isBreak) {
            clearInterval(timer);
            isRunning = false;
            isBreak = true;
            
            // Определяем тип перерыва
            if (sessionCount === 4) {
                timeLeft = longBreakTime;
            } else {
                timeLeft = shortBreakTime;
            }
            
            updateDisplay();
            updateModeInfo();
            
            breakModeBtn.classList.add('active');
            workModeBtn.classList.remove('active');
        }
    }
    
    // Назначение обработчиков событий
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    skipBtn.addEventListener('click', skipStage);
    toggleRadioBtn.addEventListener('click', toggleRadio);
    volumeControl.addEventListener('input', setRadioVolume);
    workModeBtn.addEventListener('click', setWorkMode);
    breakModeBtn.addEventListener('click', setBreakMode);
    
    // Инициализация
    init();
});