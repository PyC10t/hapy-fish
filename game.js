const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const menuBtn = document.getElementById('menuBtn');
const menu = document.getElementById('menu');
const gameOverScreen = document.getElementById('gameOverScreen');
const endMessage = document.getElementById('endMessage');

// Ajuste responsive
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Variables del juego
let fish, pipes, score, highScore = localStorage.getItem('hapyHighScore') || 0;
let gameOver = false;
let speed = 3.5;
let gap = 160;
let pipeInterval;
let countdown = 3;
let countdownActive = false;

// Fondo animado - burbujas
const burbujas = [];
for (let i = 0; i < 25; i++) {
  burbujas.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radio: Math.random() * 4 + 2,
    velocidad: Math.random() * 0.5 + 0.2
  });
}

// Reiniciar juego
function resetGame() {
  fish = {
    x: canvas.width / 4,
    y: canvas.height / 2,
    radius: 25,
    gravity: 0.4,
    lift: -8,
    velocity: 0,
    rotation: 0
  };
  pipes = [];
  score = 0;
  gameOver = false;
  speed = 3.5;
  gap = 160;
  clearInterval(pipeInterval);
}

// Iniciar juego
function startGame() {
  menu.style.display = 'none';
  gameOverScreen.style.display = 'none';
  canvas.style.display = 'block';
  resetGame();
  countdown = 3;
  countdownActive = true;
  countdownStart();
}

// Cuenta regresiva antes de empezar
function countdownStart() {
  const interval = setInterval(() => {
    drawFondoMarino();
    ctx.fillStyle = 'white';
    ctx.font = '100px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(countdown, canvas.width / 2, canvas.height / 2);
    countdown--;
    if (countdown < 0) {
      clearInterval(interval);
      countdownActive = false;
      createPipe();
      startPipeSpawner();
      animate();
    }
  }, 1000);
}

// Generar tubos
function createPipe() {
  const topHeight = Math.random() * (canvas.height / 2);
  pipes.push({
    x: canvas.width,
    top: topHeight,
    bottom: topHeight + gap
  });
}

// Crear tubos de forma periódica
function startPipeSpawner() {
  pipeInterval = setInterval(() => {
    if (!gameOver) createPipe();
  }, 3000);
}

// Dibujar pez con animación de caída
function drawFish() {
  ctx.save();
  ctx.translate(fish.x, fish.y);
  ctx.rotate(fish.rotation);

  // Cuerpo
  const gradient = ctx.createLinearGradient(-30, -20, 30, 20);
  gradient.addColorStop(0, "#ffcf33");
  gradient.addColorStop(1, "#ff9c00");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(0, 0, 35, 25, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cola
  ctx.beginPath();
  ctx.moveTo(-30, 0);
  ctx.lineTo(-50, -15);
  ctx.lineTo(-50, 15);
  ctx.closePath();
  ctx.fillStyle = "#ff6a00";
  ctx.fill();



  // Ojo
  ctx.beginPath();
  ctx.arc(15, -5, 5, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(15, -5, 5, 0, Math.PI * 2);
  ctx.fillStyle = "black";
  ctx.fill();

  ctx.restore();
}

// Fondo marino con burbujas animadas
function drawFondoMarino() {
  const degradado = ctx.createLinearGradient(0, 0, 0, canvas.height);
  degradado.addColorStop(0, '#36abdaff');
  degradado.addColorStop(1, '#1b18ceff');
  ctx.fillStyle = degradado;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Burbujas
  burbujas.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radio, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fill();
    b.y -= b.velocidad;
    if (b.y + b.radio < 0) {
      b.y = canvas.height + b.radio;
      b.x = Math.random() * canvas.width;
    }
  });

  // Algas
  ctx.fillStyle = '#006600';
  for (let i = 0; i < 20; i++) {
    const baseX = i * 70 + 20;
    ctx.beginPath();
    ctx.moveTo(baseX, canvas.height);
    for (let y = canvas.height; y > canvas.height - 120; y -= 20) {
      const offsetX = Math.sin((y + performance.now() / 200) / 20) * 10;
      ctx.lineTo(baseX + offsetX, y);
    }
    ctx.lineTo(baseX, canvas.height);
    ctx.fill();
  }

  // Corales
  ctx.fillStyle = '#cc6b33ff';
  ctx.beginPath();
  ctx.moveTo(30, canvas.height);
  ctx.quadraticCurveTo(50, canvas.height - 40, 40, canvas.height - 60);
  ctx.quadraticCurveTo(60, canvas.height - 20, 80, canvas.height - 60);
  ctx.lineTo(80, canvas.height);
  ctx.fill();
}

// Animación principal
function animate() {
  if (gameOver) return;
  drawFondoMarino();

  // Movimiento del pez con rotación
  fish.velocity += fish.gravity;
  fish.y += fish.velocity;
  fish.rotation = Math.min(Math.max(fish.velocity / 10, -0.5), 1.2);
  drawFish();

  // Dibujar tubos y verificar colisiones
  for (let i = 0; i < pipes.length; i++) {
    const p = pipes[i];
    ctx.fillStyle = '#006400';
    ctx.fillRect(p.x, 0, 80, p.top);
    ctx.fillRect(p.x, p.bottom, 80, canvas.height - p.bottom);
    p.x -= speed;

    // Pasar tubo
    if (p.x + 80 < 0) {
      pipes.splice(i, 1);
      score++;
      if (score > highScore) highScore = score;
      i--;

      // 🔥 Aumenta velocidad cada 5 puntos
      if (score % 5 === 0) {
        speed += 0.3;
        gap -= 10;
        if (gap < 100) gap = 100;
      }
    }

    // Colisiones
    if (
      fish.y + fish.radius > canvas.height ||
      fish.y - fish.radius < 0 ||
      (fish.x + fish.radius > p.x && fish.x - fish.radius < p.x + 80 &&
       (fish.y - fish.radius < p.top || fish.y + fish.radius > p.bottom))
    ) {
      gameOver = true;
      clearInterval(pipeInterval);
      showEndScreen("Perdiste");
    }
  }

  // HUD
  ctx.fillStyle = 'white';
  ctx.font = '26px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`Puntaje: ${score}`, 20, 40);
  ctx.fillText(`Record: ${highScore}`, 20, 80);

  requestAnimationFrame(animate);
}

// Pantalla final
function showEndScreen(msg) {
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  endMessage.textContent = msg;
  gameOverScreen.style.display = 'block';
  canvas.style.display = 'none';
  localStorage.setItem('hapyHighScore', highScore);
}

// Controles
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !gameOver && !countdownActive) {
    fish.velocity = fish.lift;
  }
});

canvas.addEventListener('touchstart', () => {
  if (!gameOver && !countdownActive) fish.velocity = fish.lift;
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
menuBtn.addEventListener('click', () => {
  gameOverScreen.style.display = 'none';
  menu.style.display = 'block';
  canvas.style.display = 'none';
});
