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

    // ASCII art de Snake
    const title = [
        "███████╗███╗   ██╗ █████╗ ██╗  ██╗███████╗",
        "██╔════╝████╗  ██║██╔══██╗██║ ██╔╝██╔════╝",
        "███████╗██╔██╗ ██║███████║█████╔╝ █████╗  ",
        "╚════██║██║╚██╗██║██╔══██║██╔═██╗ ██╔══╝  ",
        "███████║██║ ╚████║██║  ██║██║  ██╗███████╗"
    ];

    const maxFontSizeASCII = 22;
    const fontSizeASCII = Math.min(maxFontSizeASCII, Math.floor(canvasSize * 0.07));
    const lineHeight = fontSizeASCII + 2;

    // Centrar verticalmente
    const totalHeight = lineHeight * title.length;
    let startY = (canvasSize / 2) - (totalHeight / 2);

    ctx.fillStyle = "lime";
    ctx.textAlign = "center";
    ctx.font = `${fontSizeASCII}px monospace`;
    title.forEach(line => {
        ctx.fillText(line, canvasSize / 2, startY);
        startY += lineHeight;
    });

    // Controles con más separación
    const bottomLines = [
        "Controls: AWSD or Arrows",
        ">> PRESS SPACE <<"
    ];
    const fontSizeText = Math.min(18, Math.floor(canvasSize * 0.045));
    const interline = fontSizeText * 1.5;

    ctx.fillStyle = "white";
    ctx.font = `${fontSizeText}px 'Press Start 2P'`;
    let controlsY = canvasSize - 20 - interline * bottomLines.length;

    ctx.fillText(bottomLines[0], canvasSize / 2, controlsY);
    controlsY += interline + 6; // +6px extra solo entre la primera y segunda línea
    ctx.fillText(bottomLines[1], canvasSize / 2, controlsY);
}

// =========================
// PANTALLA GAME OVER
// =========================
function drawGameOverScreen() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    const gameOverArt = [
        " ██████╗  █████╗ ███╗   ███╗███████╗",
        "██╔════╝ ██╔══██╗████╗ ████║██╔════╝",
        "██║  ███╗███████║██╔████╔██║█████╗  ",
        "██║   ██║██╔══██║██║╚██╔╝██║██╔══╝  ",
        "╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗",
        "",
        " ██████╗ ██╗   ██╗███████╗██████╗ ",
        "██╔═══██╗██║   ██║██╔════╝██╔══██╗",
        "██║   ██║██║   ██║█████╗  ██████╔╝",
        "██║   ██║╚██╗ ██╔╝██╔══╝  ██╔══██╗",
        "╚██████╔╝ ╚████╔╝ ███████╗██║  ██║"
    ];

    const maxFontSizeASCII = 22;
    const fontSizeASCII = Math.min(maxFontSizeASCII, Math.floor(canvasSize * 0.07));
    const lineHeight = fontSizeASCII + 2;
    const totalHeight = lineHeight * gameOverArt.length;
    let startY = (canvasSize / 2) - (totalHeight / 2);

    ctx.fillStyle = "red";
    ctx.font = `${fontSizeASCII}px monospace`;
    ctx.textAlign = "center";
    gameOverArt.forEach(line => {
        ctx.fillText(line, canvasSize / 2, startY);
        startY += lineHeight;
    });

    // Score y mensaje
    const bottomLines = [
        `Final score: ${score}`,
        ">> PRESS SPACE <<"
    ];
    const fontSizeText = Math.min(18, Math.floor(canvasSize * 0.045));
    const interline = fontSizeText * 1.5;

    ctx.fillStyle = "white";
    ctx.font = `${fontSizeText}px 'Press Start 2P'`;
    let controlsY = canvasSize - 20 - interline * bottomLines.length;

    ctx.fillText(bottomLines[0], canvasSize / 2, controlsY);
    controlsY += interline + 6; // +6px extra solo entre la primera y segunda línea
    ctx.fillText(bottomLines[1], canvasSize / 2, controlsY);
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

    // Score
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    const scoreFont = Math.min(18, Math.floor(canvasSize * 0.045));
    ctx.font = `${scoreFont}px 'Press Start 2P'`;
    ctx.fillText(`SCORE: ${score}`, box / 2, box / 2);
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