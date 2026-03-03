// =========================
// ELEMENTOS DEL CANVAS
// =========================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// =========================
// CONFIGURACIÓN DEL JUEGO
// =========================
let gridSize = 30;       // 30x30
let box;                 // Tamaño de cada celda en pixeles
let canvasSize;          // Será un array de objetos que representan las posiciones
let snake;              
let direction;
let food;
let score;
let gameState = "start";    //Estado del juego
let growthCounter = 0;

// =========================
// IMÁGENES
// =========================
const snakeImage = new Image();
const gameOverImage = new Image();
snakeImage.src = "images/snake.png";
gameOverImage.src = "images/game_over.png";

// =========================
// CONTROL DE CARGA DE IMÁGENES
// =========================
let imagesLoaded = 0;

function checkImagesLoaded() {
    imagesLoaded++;
    if (imagesLoaded === 2) { // Cuando las dos imágenes hayan cargado
        resizeCanvas(); // Recalcula y redibuja
    }
}

snakeImage.onload = checkImagesLoaded;
gameOverImage.onload = checkImagesLoaded;

// Si ya están en caché, forzamos la comprobación
if (snakeImage.complete) checkImagesLoaded();
if (gameOverImage.complete) checkImagesLoaded();

// =========================
// CANVAS RESPONSIVE
// =========================
function resizeCanvas() {
    let size = Math.min(window.innerWidth, window.innerHeight) * 0.9; // Coge el lado más pequeño de la ventana para aplicar el 90% dejando margen
    size = Math.min(size, 500); // Limita el tamaño max a 500
    canvasSize = size;

    canvas.width = canvasSize;
    canvas.height = canvasSize;

    box = canvasSize / gridSize; // Calcula el tamaño de cada celda
}

window.addEventListener("resize", resizeCanvas); // Cada vez que el usuario cambia el tamaño de la ventana llama a resize()
resizeCanvas();

// =========================
// INICIALIZAR JUEGO
// =========================
function initGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    direction = "RIGHT";
    food = generateFood();
    score = 0;
    growthCounter = 0;
}

// =========================
// GENERAR COMIDA
// =========================
function generateFood() {
    let newFood;
    do {
        newFood = { // Crea food con coordenadas aleatorias
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)); // Si choca contra la serpiente se crea otra posición
    return newFood;
}

// =========================
// CONTROL TECLAS
// =========================
document.addEventListener("keydown", (event) => { //cada vez que se presiona una tecla, se ejecuta la función
    if (gameState === "start" && event.code === "Space") {
        gameState = "playing";
        initGame();
        return;
    }

    if (gameState === "gameover" && event.code === "Space") {
        gameState = "start";
        return;
    }

    if (gameState !== "playing") return;

    const key = event.key.toLowerCase();

    if ((key === "arrowup" || key === "w") && direction !== "DOWN") direction = "UP";
    if ((key === "arrowdown" || key === "s") && direction !== "UP") direction = "DOWN";
    if ((key === "arrowleft" || key === "a") && direction !== "RIGHT") direction = "LEFT";
    if ((key === "arrowright" || key === "d") && direction !== "LEFT") direction = "RIGHT";
});

// =========================
// CONTROL TÁCTIL (MÓVIL)
// =========================
let touchStartX, touchStartY; //Se guarda la posición inicial de todo

canvas.addEventListener('touchstart', (e) => { //Cuando el usuario toca la pantalla...
    e.preventDefault(); //Evita que el navegador haga scroll o zoom

    // SI el juego NO está en modo "playing" (Start/GameOver) y aprietas
    if (gameState !== "playing") {
        initGame(); // Se reinicia el juego
        gameState = "playing"; // Cambia el juego a jugando
        return;
    }

    // Solo si ya estamos jugando, guardaa posición para deslizamento del dedo (swipe)
    touchStartX = e.touches[0].clientX; // Primer dedo que toca la pantalla
    touchStartY = e.touches[0].clientY; // Dedo en la pantalla (deslizamiento)
}, { passive: false }); //Se añade para dejar claro que preventDefault sigue existiendo

canvas.addEventListener('touchend', (e) => { // Cuando levantas el dedo de la pantalla...
    e.preventDefault(); //Evita que el navegador haga scroll o zoom
    
    // Solo procesar swipe si estamos jugando
    if (gameState !== "playing" || !touchStartX) return; // Comprueba si el juego está activo  y si se registró toque inicial

    const touchEndX = e.changedTouches[0].clientX; //Obtiene posición del dedo al levantarlo
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchEndX - touchStartX; // Calcula la distancia que se movió y en qué dirección
    const diffY = touchEndY - touchStartY;
    
    // Detectar swipe (deslizamiento) y decidir movimiento
    if (Math.abs(diffX) > 20 || Math.abs(diffY) > 20) { // Mínimo 20px para evitar toques accidentales
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Movimiento horizontal
            if (diffX > 0 && direction !== "LEFT") direction = "RIGHT";
            else if (diffX < 0 && direction !== "RIGHT") direction = "LEFT";
        } else {
            // Movimiento vertical
            if (diffY > 0 && direction !== "UP") direction = "DOWN";
            else if (diffY < 0 && direction !== "DOWN") direction = "UP";
        }
    }
    
    touchStartX = null; // Reinicia touchStartX para que el siguiente swipe se calcule desde un nuevo toque.
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (gameState !== "playing") return;

    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;

    const head = snake[0];
    const headPixelX = head.x * box + box/2;
    const headPixelY = head.y * box + box/2;

    const diffX = touchX - headPixelX;
    const diffY = touchY - headPixelY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        direction = diffX > 0 ? "RIGHT" : "LEFT";
    } else {
        direction = diffY > 0 ? "DOWN" : "UP";
    }
}, { passive: false });

// =========================
// PANTALLA INICIO
// =========================
function drawStartScreen() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    if (snakeImage.complete) { // Comprueba que la imagen funcione
        ctx.drawImage(snakeImage, 0, 0, canvasSize, canvasSize); // Inserta la imagen ocupando todo el canvas
    }

    // Se utilizan variables y cálculos para que sea compatible con todo tipo de pantalla
    const fontSizeText = Math.min(16, Math.floor(canvasSize * 0.04));
    const interline = fontSizeText * 2;
    const margin = fontSizeText * 4;

    ctx.fillStyle = "white"; // Texto
    ctx.font = `${fontSizeText}px 'Press Start 2P'`;
    ctx.textAlign = "center";
    
    const spaceY = canvasSize - margin; // Posición de Press space: altura total del canvas menos el margen 
    const controlsY = spaceY - interline; // Línea de controles justo encima de Press space
    
    ctx.fillText("Controls: AWSD or Arrows", canvasSize / 2, controlsY); // Divide entre 2 para centrar el texto
    ctx.fillText(">> PRESS SPACE <<", canvasSize / 2, spaceY);
}

// =========================
// PANTALLA GAME OVER
// =========================
function drawGameOverScreen() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    if (gameOverImage.complete) {
        ctx.drawImage(gameOverImage, 0, 0, canvasSize, canvasSize);
    }

    const fontSizeText = Math.min(16, Math.floor(canvasSize * 0.04));
    const margin = fontSizeText * 4;

    ctx.fillStyle = "white";
    ctx.font = `${fontSizeText}px 'Press Start 2P'`;
    ctx.textAlign = "center";
    
    const spaceY = canvasSize - margin;
    const scoreY = margin; // margen desde el borde
    
    ctx.fillText(`FINAL SCORE: ${score}`, canvasSize / 2, scoreY);
    ctx.fillText(">> PRESS SPACE <<", canvasSize / 2, spaceY);
}

// =========================
// DIBUJAR JUEGO
// =========================
function drawGame() {
    moveSnake(); // Actualiza la posición de la serpiente 
    
    if (gameState !== "playing") return; // Si el juego termina, no dibuja nada

    ctx.fillStyle = "black"; // Fondo negro para limpiar el canvas antes de dibujar la serpiente y la comida
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Dibuja cada segmento de la serpiente
    snake.forEach((seg, i) => { 
        ctx.fillStyle = i === 0 ? "#00ff00" : "#00ff00"; // Color cabeza (podría tener el cuerpo de otro color)
        ctx.fillRect(seg.x * box, seg.y * box, box, box); // Convertimos coordenadas de cuadrícula a píxeles
    });
    
    // Dibuja la comida
    ctx.fillStyle = "red"; 
    ctx.fillRect(food.x * box, food.y * box, box, box);

    // Dibuja el score en la esquina superior izquierda
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    const scoreFont = Math.min(14, Math.floor(canvasSize * 0.035));
    ctx.font = `${scoreFont}px 'Press Start 2P'`;
    
    const scorePadding = scoreFont / 2; // Pequeño margen desde la esquina de score
    ctx.fillText(`SCORE: ${score}`, scorePadding, scorePadding);
}

// =========================
// MOVIMIENTO Y CRECIMIENTO
// =========================
function moveSnake() {
    // Coge la posición actual de la cabeza de la serpiente
    let headX = snake[0].x;
    let headY = snake[0].y;

    // Actualiza la posición de la cabeza según la dirección
    if (direction === "LEFT") headX--;
    if (direction === "RIGHT") headX++;
    if (direction === "UP") headY--;
    if (direction === "DOWN") headY++;

    // Detecta salida de la cuadrícula y hace “teletransporte” al lado opuesto
    if (headX < 0) headX = gridSize - 1;
    if (headX >= gridSize) headX = 0;
    if (headY < 0) headY = gridSize - 1;
    if (headY >= gridSize) headY = 0;

    const newHead = { x: headX, y: headY }; // Crea el nuevo objeto de la cabeza con las nuevas coordenadas

    // Revisa si la serpiente colisiona consigo misma
    const collides = snake.some((segment, index) => {
        if (growthCounter > 0 && index === snake.length - 1) { // Ignora el último segmento si la serpiente está creciendo
            return false;
        }
        return segment.x === newHead.x && segment.y === newHead.y; // Devuelve true si alguna parte coincide con la nueva cabeza
    });

    if (collides) { // Si colisiona, terminamos el juego
        gameState = "gameover";
        return;
    }

    snake.unshift(newHead); // Añade la nueva cabeza al principio del array de la serpiente

    // Comprueba si la cabeza llegó a la comida
    if (headX === food.x && headY === food.y) {
        score++;
        growthCounter += 6; // Si lo hace crece 6
        food = generateFood(); // Se genera nueva comida
    }

    // Crecimiento
    if (growthCounter > 0) { // Si está creciendo, no eliminamos la cola
        growthCounter--;
    } else {
        snake.pop(); // Si no está creciendo, eliminar el último segmento
    }
}

// =========================
// LOOP PRINCIPAL
// =========================
function mainLoop() {
    if (gameState === "start") drawStartScreen();
    else if (gameState === "playing") drawGame();
    else if (gameState === "gameover") drawGameOverScreen();
}

setInterval(mainLoop, 100);