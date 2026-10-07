const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const startButton = document.getElementById('startButton');

const WORLD_WIDTH = 3600;
const GRAVITY = 0.52;
const MOVE_SPEED = 4.2;
const MAX_SPEED = 6.2;
const JUMP_FORCE = -12.2;

const keys = {};

const game = {
  running: false,
  won: false,
  cameraX: 0,
  timer: 0,
  levelMessage: '',
  resetTimer: 0
};

const player = {
  x: 80,
  y: 260,
  w: 32,
  h: 42,
  vx: 0,
  vy: 0,
  onGround: false,
  facing: 1,
  lives: 3,
  score: 0,
  invulnerable: 0,
  respawnX: 80,
  respawnY: 260,
  color: '#144e7a'
};

const platforms = [
  { x: 0, y: 490, w: 520, h: 50 },
  { x: 620, y: 490, w: 360, h: 50 },
  { x: 1120, y: 490, w: 400, h: 50 },
  { x: 1640, y: 490, w: 540, h: 50 },
  { x: 2300, y: 490, w: 520, h: 50 },
  { x: 2900, y: 490, w: 700, h: 50 },
  { x: 210, y: 410, w: 170, h: 18 },
  { x: 460, y: 360, w: 180, h: 18 },
  { x: 730, y: 310, w: 210, h: 18 },
  { x: 980, y: 260, w: 180, h: 18 },
  { x: 1280, y: 360, w: 180, h: 18 },
  { x: 1490, y: 300, w: 200, h: 18 },
  { x: 1790, y: 340, w: 200, h: 18 },
  { x: 2060, y: 285, w: 180, h: 18 },
  { x: 2440, y: 330, w: 180, h: 18 },
  { x: 2670, y: 270, w: 190, h: 18 },
  { x: 3180, y: 350, w: 180, h: 18 }
];

const enemies = [
  { x: 760, y: 454, w: 30, h: 36, minX: 620, maxX: 920, vx: 1.1, alive: true },
  { x: 1210, y: 454, w: 30, h: 36, minX: 1120, maxX: 1450, vx: 1.4, alive: true },
  { x: 1710, y: 454, w: 30, h: 36, minX: 1650, maxX: 2150, vx: 1.3, alive: true },
  { x: 2400, y: 454, w: 30, h: 36, minX: 2300, maxX: 2800, vx: 1.5, alive: true },
  { x: 3060, y: 454, w: 30, h: 36, minX: 2920, maxX: 3500, vx: 1.2, alive: true }
];

const goal = {
  x: 3430,
  y: 403,
  w: 30,
  h: 87
};

function resetPlayer() {
  player.x = player.respawnX;
  player.y = player.respawnY;
  player.vx = 0;
  player.vy = 0;
  player.onGround = false;
  player.invulnerable = 0;
}

function startGame() {
  game.running = true;
  game.won = false;
  game.timer = 0;
  game.levelMessage = '';
  player.lives = 3;
  player.score = 0;
  player.respawnX = 80;
  player.respawnY = 260;
  enemies.forEach((enemy) => {
    enemy.alive = true;
    enemy.x = enemy.minX + 20;
  });
  resetPlayer();
  overlay.classList.remove('visible');
}

function showOverlay(title, message, buttonText = 'Play Again') {
  overlay.innerHTML = `
    <h1>${title}</h1>
    <p>${message}</p>
    <button id="startButton">${buttonText}</button>
  `;
  document.getElementById('startButton').addEventListener('click', startGame);
  overlay.classList.add('visible');
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function rectsIntersect(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function handleInput() {
  if (!game.running || game.won) return;

  if (keys['ArrowLeft'] || keys['a']) {
    player.vx -= 0.75;
    player.facing = -1;
  }

  if (keys['ArrowRight'] || keys['d']) {
    player.vx += 0.75;
    player.facing = 1;
  }

  if ((keys['ArrowUp'] || keys['w'] || keys[' ']) && player.onGround) {
    player.vy = JUMP_FORCE;
    player.onGround = false;
  }

  player.vx = clamp(player.vx, -MAX_SPEED, MAX_SPEED);

  if (!keys['ArrowLeft'] && !keys['a'] && !keys['ArrowRight'] && !keys['d']) {
    player.vx *= 0.8;
    if (Math.abs(player.vx) < 0.1) player.vx = 0;
  }
}

function updatePlayer() {
  const previousY = player.y;

  player.vy += GRAVITY;
  player.x += player.vx;
  player.y += player.vy;

  player.onGround = false;

  for (const platform of platforms) {
    const playerBox = { x: player.x, y: player.y, w: player.w, h: player.h };
    const platformBox = platform;

    if (rectsIntersect(playerBox, platformBox)) {
      const prevBottom = previousY + player.h;
      const nextTop = player.y;
      const prevTop = player.y - player.vy;

      if (player.vy >= 0 && prevBottom <= platform.y + 15 && nextTop + player.h >= platform.y) {
        player.y = platform.y - player.h;
        player.vy = 0;
        player.onGround = true;
      } else if (player.vy < 0 && prevTop >= platform.y + platform.h - 8) {
        player.y = platform.y + platform.h;
        player.vy = 0;
      } else if (player.vx > 0 && player.x < platform.x + platform.w && previousY + player.h > platform.y) {
        player.x = platform.x - player.w;
        player.vx = 0;
      } else if (player.vx < 0 && player.x + player.w > platform.x && previousY + player.h > platform.y) {
        player.x = platform.x + platform.w;
        player.vx = 0;
      }
    }
  }

  if (player.x < 0) {
    player.x = 0;
    player.vx = 0;
  }

  if (player.x + player.w > WORLD_WIDTH) {
    player.x = WORLD_WIDTH - player.w;
    player.vx = 0;
  }

  if (player.y > canvas.height + 200) {
    hurtPlayer('You fell off the level!');
  }

  if (player.invulnerable > 0) {
    player.invulnerable -= 1;
  }
}

function updateEnemies() {
  for (const enemy of enemies) {
    if (!enemy.alive) continue;

    enemy.x += enemy.vx;

    if (enemy.x <= enemy.minX || enemy.x + enemy.w >= enemy.maxX) {
      enemy.vx *= -1;
      enemy.x = clamp(enemy.x, enemy.minX, enemy.maxX - enemy.w);
    }

    const enemyBox = { x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h };
    const playerBox = { x: player.x, y: player.y, w: player.w, h: player.h };

    if (rectsIntersect(enemyBox, playerBox)) {
      const playerBottom = player.y + player.h;
      const enemyTop = enemy.y;
      if (player.vy > 0 && playerBottom - enemyTop < 20 && playerBottom > enemyTop) {
        enemy.alive = false;
        player.vy = -8.5;
        player.score += 10;
      } else {
        hurtPlayer('An enemy struck you!');
      }
    }
  }
}

function hurtPlayer(message) {
  if (player.invulnerable > 0 || !game.running) return;

  player.lives -= 1;
  player.invulnerable = 100;

  if (player.lives <= 0) {
    game.running = false;
    showOverlay('Game Over', `${message} Final score: ${player.score}.`, 'Restart');
    return;
  }

  player.score = Math.max(0, player.score - 5);
  resetPlayer();
  game.levelMessage = message;
}

function updateGoal() {
  const goalBox = { x: goal.x, y: goal.y, w: goal.w, h: goal.h };
  const playerBox = { x: player.x, y: player.y, w: player.w, h: player.h };

  if (rectsIntersect(goalBox, playerBox)) {
    if (!game.won) {
      game.won = true;
      player.score += 100;
      game.running = false;
      showOverlay('You Win!', `Level complete! Final score: ${player.score}`, 'Play Again');
    }
  }
}

function updateCamera() {
  const targetX = player.x - canvas.width * 0.35;
  game.cameraX = clamp(targetX, 0, WORLD_WIDTH - canvas.width);
}

function update() {
  if (!game.running) return;

  game.timer += 1;
  handleInput();
  updatePlayer();
  updateEnemies();
  updateGoal();
  updateCamera();
}

function drawBackground() {
  ctx.fillStyle = '#bfe8ff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const skyShift = game.cameraX * 0.25;

  for (let i = 0; i < 8; i++) {
    const baseX = i * 170 - (skyShift % 170);
    ctx.fillStyle = 'rgba(255,255,255,0.70)';
    ctx.beginPath();
    ctx.arc(baseX + 40, 90, 22, 0, Math.PI * 2);
    ctx.arc(baseX + 75, 78, 30, 0, Math.PI * 2);
    ctx.arc(baseX + 115, 92, 25, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 14; i++) {
    const hillX = i * 180 - (game.cameraX * 0.4) % 180;
    ctx.fillStyle = '#9ad5a6';
    ctx.beginPath();
    ctx.moveTo(hillX, canvas.height);
    ctx.quadraticCurveTo(hillX + 60, 320, hillX + 140, canvas.height);
    ctx.fill();
    ctx.fillStyle = '#6aa96a';
    ctx.beginPath();
    ctx.moveTo(hillX + 50, canvas.height);
    ctx.quadraticCurveTo(hillX + 96, 250, hillX + 170, canvas.height);
    ctx.fill();
  }
}

function drawPlatforms() {
  for (const platform of platforms) {
    const x = platform.x - game.cameraX;
    ctx.fillStyle = '#6d4c41';
    ctx.fillRect(x, platform.y, platform.w, platform.h);
    ctx.fillStyle = '#8f6b5c';
    ctx.fillRect(x, platform.y, platform.w, 6);
  }
}

function drawGoal() {
  const x = goal.x - game.cameraX;
  ctx.fillStyle = '#f5e76a';
  ctx.fillRect(x, goal.y, 8, goal.h);
  ctx.beginPath();
  ctx.moveTo(x + 8, goal.y + 12);
  ctx.lineTo(x + 52, goal.y + 30);
  ctx.lineTo(x + 8, goal.y + 48);
  ctx.closePath();
  ctx.fillStyle = '#ff8a65';
  ctx.fill();
}

function drawEnemies() {
  for (const enemy of enemies) {
    if (!enemy.alive) continue;

    const x = enemy.x - game.cameraX;
    ctx.fillStyle = '#7d2f2f';
    ctx.fillRect(x, enemy.y, enemy.w, enemy.h);
    ctx.fillStyle = '#ef7676';
    ctx.fillRect(x + 5, enemy.y + 8, enemy.w - 10, 10);
    ctx.fillStyle = '#1b1b1b';
    ctx.fillRect(x + 5, enemy.y + 20, 4, 4);
    ctx.fillRect(x + 18, enemy.y + 20, 4, 4);
  }
}

function drawPlayer() {
  const x = player.x - game.cameraX;
  ctx.fillStyle = player.invulnerable % 8 < 4 ? '#ffb703' : '#ffd166';
  ctx.fillRect(x, player.y, player.w, player.h);

  ctx.fillStyle = '#0a1426';
  ctx.fillRect(x + 7, player.y + 8, 6, 6);
  ctx.fillRect(x + 18, player.y + 8, 6, 6);
  ctx.fillStyle = '#0a1426';
  ctx.fillRect(x + 9, player.y + 20, 14, 5);

  if (player.facing === -1) {
    ctx.fillStyle = '#0a1426';
    ctx.fillRect(x + 2, player.y + 15, 5, 5);
  } else {
    ctx.fillStyle = '#0a1426';
    ctx.fillRect(x + player.w - 7, player.y + 15, 5, 5);
  }
}

function drawHUD() {
  ctx.fillStyle = 'rgba(10, 18, 30, 0.45)';
  ctx.fillRect(16, 16, 240, 86);
  ctx.fillStyle = '#ecf7ff';
  ctx.font = 'bold 24px Arial';
  ctx.fillText(`Lives: ${player.lives}`, 30, 46);
  ctx.fillText(`Score: ${player.score}`, 30, 78);

  if (game.levelMessage) {
    ctx.fillStyle = 'rgba(255, 107, 107, 0.9)';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(game.levelMessage, 280, 46);
  }
}

function draw() {
  drawBackground();
  drawPlatforms();
  drawGoal();
  drawEnemies();
  drawPlayer();
  drawHUD();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true;
  if (event.key === ' ' || event.code === 'Space') {
    event.preventDefault();
  }
});

document.addEventListener('keyup', (event) => {
  keys[event.key] = false;
});

startButton.addEventListener('click', startGame);
showOverlay('Sky Sprint', 'Use A/D or arrow keys to move, W/Space to jump. Defeat enemies by landing on top of them and reach the flag.', 'Start Game');
loop();

