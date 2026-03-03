// =========================
// ELEMENTOS DEL CANVAS
// =========================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// =========================
// CONFIGURACIÓN DEL JUEGO
// =========================
let gridSize = 30;       // Número de celdas por lado
let box;                 // Tamaño de cada celda (calculado)
let canvasSize;          

let snake;
let direction;
let food;
let score;
let gameState = "start";
let growthCounter = 0;

// =========================
// IMÁGENES
// =========================
const snakeImage = new Image();
const gameOverImage = new Image();
snakeImage.src = "https://github.com/jenhmy/snake-html/blob/main/images/snake.png?raw=true";
gameOverImage.src = "https://github.com/jenhmy/snake-html/blob/main/images/game_over.png?raw=true";

// =========================
// RESPONSIVE
// =========================
function resizeCanvas() {
    let size = Math.min(window.innerWidth, window.innerHeight) * 0.9;
    size = Math.min(size, 600); // máximo 600px
    canvasSize = size;

    canvas.width = canvasSize;
    canvas.height = canvasSize;

    box = canvasSize / gridSize;
}

window.addEventListener("resize", resizeCanvas);
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
        newFood = {
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
}

// =========================
// CONTROL TECLAS
// =========================
document.addEventListener("keydown", (event) => {
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
// PANTALLA INICIO
// =========================
function drawStartScreen() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Imagen de Snake centrada
    if (snakeImage.complete) {
        const imgWidth = canvasSize * 0.95;
        const imgHeight = (snakeImage.height / snakeImage.width) * imgWidth;
        const imgX = (canvasSize - imgWidth) / 2;
        const imgY = (canvasSize - imgHeight) / 2;
        
        ctx.drawImage(snakeImage, imgX, imgY, imgWidth, imgHeight);
    }

    // Textos
    const fontSizeText = Math.min(16, Math.floor(canvasSize * 0.04));
    const interline = fontSizeText * 2;
    const margin = fontSizeText * 3; // Margen superior E inferior IGUALES

    ctx.fillStyle = "white";
    ctx.font = `${fontSizeText}px 'Press Start 2P'`;
    ctx.textAlign = "center";
    
    // PRESS SPACE a 'margin' píxeles del borde INFERIOR
    const spaceY = canvasSize - margin;
    // Controls a 'interline' por encima de PRESS SPACE
    const controlsY = spaceY - interline;
    
    ctx.fillText("Controls: AWSD or Arrows", canvasSize / 2, controlsY);
    ctx.fillText(">> PRESS SPACE <<", canvasSize / 2, spaceY);
}

// =========================
// PANTALLA GAME OVER
// =========================
function drawGameOverScreen() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Textos
    const fontSizeText = Math.min(16, Math.floor(canvasSize * 0.04));
    const margin = fontSizeText * 3; // EL MISMO margen que en inicio

    ctx.fillStyle = "white";
    ctx.font = `${fontSizeText}px 'Press Start 2P'`;
    ctx.textAlign = "center";
    
    // PRESS SPACE a 'margin' píxeles del borde INFERIOR (IGUAL que inicio)
    const spaceY = canvasSize - margin;
    
    // FINAL SCORE a 'margin' píxeles del borde SUPERIOR (EXACTAMENTE IGUAL)
    const scoreY = margin;
    
    ctx.fillText(`Final score: ${score}`, canvasSize / 2, scoreY);
    ctx.fillText(">> PRESS SPACE <<", canvasSize / 2, spaceY);

    // Imagen de Game Over centrada (se dibuja DESPUÉS de los textos para no taparlos)
    if (gameOverImage.complete) {
        const imgWidth = canvasSize * 0.95;
        const imgHeight = (gameOverImage.height / gameOverImage.width) * imgWidth;
        const imgX = (canvasSize - imgWidth) / 2;
        const imgY = (canvasSize - imgHeight) / 2;
        
        ctx.drawImage(gameOverImage, imgX, imgY, imgWidth, imgHeight);
    }
}

// =========================
// DIBUJAR JUEGO
// =========================
function drawGame() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Serpiente
    snake.forEach((seg, i) => {
        ctx.fillStyle = i === 0 ? "#00ff88" : "#00cc66";
        ctx.fillRect(seg.x * box, seg.y * box, box, box);
    });

    // Comida
    ctx.fillStyle = "red";
    ctx.fillRect(food.x * box, food.y * box, box, box);

    moveSnake();

    // Score con padding
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    const scoreFont = Math.min(14, Math.floor(canvasSize * 0.035));
    ctx.font = `${scoreFont}px 'Press Start 2P'`;
    
    const scorePadding = scoreFont / 2;
    ctx.fillText(`SCORE: ${score}`, scorePadding, scorePadding);
}

// =========================
// MOVIMIENTO Y CRECIMIENTO
// =========================
function moveSnake() {
    let headX = snake[0].x;
    let headY = snake[0].y;

    if (direction === "LEFT") headX--;
    if (direction === "RIGHT") headX++;
    if (direction === "UP") headY--;
    if (direction === "DOWN") headY++;

    // Wrap-around
    if (headX < 0) headX = gridSize - 1;
    if (headX >= gridSize) headX = 0;
    if (headY < 0) headY = gridSize - 1;
    if (headY >= gridSize) headY = 0;

    const newHead = { x: headX, y: headY };

    if (snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
        gameState = "gameover";
        return;
    }

    snake.unshift(newHead);

    if (headX === food.x && headY === food.y) {
        score++;
        growthCounter += 6;
        food = generateFood();
    }

    if (growthCounter > 0) growthCounter--;
    else snake.pop();
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