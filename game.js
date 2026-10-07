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

// Level definitions - each level has platforms, enemies, and goal position
const levels = [
  {
    name: 'Level 1: Sky Sprint',
    platforms: [
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
    ],
    enemies: [
      { x: 760, y: 454, w: 30, h: 36, minX: 620, maxX: 920, vx: 1.1, alive: true },
      { x: 1210, y: 454, w: 30, h: 36, minX: 1120, maxX: 1450, vx: 1.4, alive: true },
      { x: 1710, y: 454, w: 30, h: 36, minX: 1650, maxX: 2150, vx: 1.3, alive: true },
      { x: 2400, y: 454, w: 30, h: 36, minX: 2300, maxX: 2800, vx: 1.5, alive: true },
      { x: 3060, y: 454, w: 30, h: 36, minX: 2920, maxX: 3500, vx: 1.2, alive: true }
    ],
    goal: { x: 3430, y: 403 }
  },
  {
    name: 'Level 2: Mountain Maze',
    platforms: [
      { x: 0, y: 490, w: 300, h: 50 },
      { x: 400, y: 490, w: 300, h: 50 },
      { x: 800, y: 490, w: 300, h: 50 },
      { x: 1200, y: 490, w: 300, h: 50 },
      { x: 1600, y: 490, w: 300, h: 50 },
      { x: 2000, y: 490, w: 300, h: 50 },
      { x: 2400, y: 490, w: 300, h: 50 },
      { x: 2800, y: 490, w: 800, h: 50 },
      { x: 150, y: 380, w: 200, h: 18 },
      { x: 550, y: 300, w: 200, h: 18 },
      { x: 950, y: 220, w: 200, h: 18 },
      { x: 1350, y: 280, w: 200, h: 18 },
      { x: 1750, y: 360, w: 200, h: 18 },
      { x: 2150, y: 240, w: 200, h: 18 },
      { x: 2550, y: 320, w: 200, h: 18 },
      { x: 2950, y: 380, w: 200, h: 18 },
      { x: 3350, y: 250, w: 200, h: 18 }
    ],
    enemies: [
      { x: 550, y: 454, w: 30, h: 36, minX: 400, maxX: 700, vx: 1.5, alive: true },
      { x: 950, y: 454, w: 30, h: 36, minX: 800, maxX: 1100, vx: 1.3, alive: true },
      { x: 1350, y: 454, w: 30, h: 36, minX: 1200, maxX: 1500, vx: 1.6, alive: true },
      { x: 1750, y: 454, w: 30, h: 36, minX: 1600, maxX: 1900, vx: 1.2, alive: true },
      { x: 2150, y: 454, w: 30, h: 36, minX: 2000, maxX: 2300, vx: 1.4, alive: true },
      { x: 2550, y: 454, w: 30, h: 36, minX: 2400, maxX: 2700, vx: 1.5, alive: true },
      { x: 2950, y: 454, w: 30, h: 36, minX: 2800, maxX: 3100, vx: 1.3, alive: true }
    ],
    goal: { x: 3430, y: 403 }
  },
  {
    name: 'Level 3: Cloud Kingdom',
    platforms: [
      { x: 0, y: 490, w: 250, h: 50 },
      { x: 350, y: 350, w: 250, h: 50 },
      { x: 700, y: 280, w: 250, h: 50 },
      { x: 1050, y: 380, w: 250, h: 50 },
      { x: 1400, y: 240, w: 250, h: 50 },
      { x: 1750, y: 370, w: 250, h: 50 },
      { x: 2100, y: 300, w: 250, h: 50 },
      { x: 2450, y: 420, w: 250, h: 50 },
      { x: 2800, y: 320, w: 250, h: 50 },
      { x: 3150, y: 420, w: 300, h: 50 },
      { x: 150, y: 200, w: 150, h: 18 },
      { x: 550, y: 150, w: 150, h: 18 },
      { x: 950, y: 180, w: 150, h: 18 },
      { x: 1350, y: 130, w: 150, h: 18 },
      { x: 1750, y: 160, w: 150, h: 18 },
      { x: 2150, y: 140, w: 150, h: 18 },
      { x: 2550, y: 170, w: 150, h: 18 },
      { x: 2950, y: 150, w: 150, h: 18 },
      { x: 3300, y: 200, w: 150, h: 18 }
    ],
    enemies: [
      { x: 550, y: 314, w: 30, h: 36, minX: 350, maxX: 600, vx: 1.8, alive: true },
      { x: 900, y: 244, w: 30, h: 36, minX: 700, maxX: 950, vx: 1.4, alive: true },
      { x: 1250, y: 344, w: 30, h: 36, minX: 1050, maxX: 1300, vx: 1.6, alive: true },
      { x: 1600, y: 204, w: 30, h: 36, minX: 1400, maxX: 1650, vx: 1.5, alive: true },
      { x: 1950, y: 334, w: 30, h: 36, minX: 1750, maxX: 2000, vx: 1.7, alive: true },
      { x: 2300, y: 264, w: 30, h: 36, minX: 2100, maxX: 2400, vx: 1.3, alive: true },
      { x: 2650, y: 384, w: 30, h: 36, minX: 2450, maxX: 2800, vx: 1.6, alive: true },
      { x: 3000, y: 284, w: 30, h: 36, minX: 2800, maxX: 3100, vx: 1.4, alive: true }
    ],
    goal: { x: 3430, y: 403 }
  }
];

const game = {
  running: false,
  won: false,
  cameraX: 0,
  timer: 0,
  levelMessage: '',
  resetTimer: 0,
  currentLevelIndex: 0
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

let platforms = [];
let enemies = [];
let goal = {};

function loadLevel(levelIndex) {
  game.currentLevelIndex = levelIndex;
  const level = levels[levelIndex];
  
  platforms = JSON.parse(JSON.stringify(level.platforms));
  enemies = JSON.parse(JSON.stringify(level.enemies));
  goal = { ...level.goal, w: 30, h: 87 };
  
  player.respawnX = 80;
  player.respawnY = 260;
}

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
  game.currentLevelIndex = 0;
  
  loadLevel(0);
  resetPlayer();
  enemies.forEach((enemy) => {
    enemy.alive = true;
    enemy.x = enemy.minX + 20;
  });
  overlay.classList.remove('visible');
}

function showOverlay(title, message, buttonText = 'Play Again') {
  overlay.innerHTML = `
    <h1>${title}</h1>
    <p>${message}</p>
    <button id="startButton">${buttonText}</button>
  `;
  document.getElementById('startButton').addEventListener('click', () => {
    if (buttonText === 'Next Level') {
      nextLevel();
    } else {
      startGame();
    }
  });
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
      
      if (game.currentLevelIndex < levels.length - 1) {
        showOverlay('Level Complete!', `Fantastic job! Score: ${player.score}`, 'Next Level');
      } else {
        showOverlay('You Win!', `All levels complete! Final score: ${player.score}`, 'Play Again');
      }
    }
  }
}

function nextLevel() {
  game.currentLevelIndex++;
  loadLevel(game.currentLevelIndex);
  resetPlayer();
  enemies.forEach((enemy) => {
    enemy.alive = true;
    enemy.x = enemy.minX + 20;
  });
  game.running = true;
  game.won = false;
  game.timer = 0;
  game.levelMessage = '';
  overlay.classList.remove('visible');
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
  
  // Cute zebra character with stripes
  const isInvulnerable = player.invulnerable % 8 < 4;
  
  // Body (white/light cream)
  ctx.fillStyle = isInvulnerable ? '#fff5cc' : '#fffacd';
  ctx.beginPath();
  ctx.ellipse(x + 16, player.y + 22, 14, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Head (cute round shape)
  ctx.fillStyle = isInvulnerable ? '#fff5cc' : '#fffacd';
  ctx.beginPath();
  ctx.arc(x + 16, player.y + 8, 9, 0, Math.PI * 2);
  ctx.fill();
  
  // Ears (small rounded triangles)
  ctx.fillStyle = isInvulnerable ? '#fff5cc' : '#fffacd';
  ctx.beginPath();
  ctx.arc(x + 10, player.y + 2, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 22, player.y + 2, 4, 0, Math.PI * 2);
  ctx.fill();
  
  // Black stripes on body (vertical stripes)
  ctx.fillStyle = '#000';
  ctx.fillRect(x + 8, player.y + 10, 2, 20);
  ctx.fillRect(x + 14, player.y + 10, 2, 20);
  ctx.fillRect(x + 20, player.y + 10, 2, 20);
  ctx.fillRect(x + 26, player.y + 10, 2, 20);
  
  // Black stripes on head
  ctx.fillRect(x + 12, player.y + 2, 2, 6);
  ctx.fillRect(x + 20, player.y + 2, 2, 6);
  
  // Eyes (big and cute)
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(x + 12, player.y + 7, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 20, player.y + 7, 2.5, 0, Math.PI * 2);
  ctx.fill();
  
  // Eye highlights (cute shine)
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x + 13, player.y + 6, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 21, player.y + 6, 1, 0, Math.PI * 2);
  ctx.fill();
  
  // Snout/Muzzle (cute pink circle)
  ctx.fillStyle = '#ffb6c1';
  ctx.beginPath();
  ctx.arc(x + 16, player.y + 12, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Nose
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(x + 16, player.y + 12, 1.2, 0, Math.PI * 2);
  ctx.fill();
  
  // Legs (simple rectangles)
  ctx.fillStyle = isInvulnerable ? '#fff5cc' : '#fffacd';
  ctx.fillRect(x + 6, player.y + 30, 4, 10);
  ctx.fillRect(x + 14, player.y + 30, 4, 10);
  ctx.fillRect(x + 20, player.y + 30, 4, 10);
  ctx.fillRect(x + 28, player.y + 30, 4, 10);
  
  // Leg stripes
  ctx.fillStyle = '#000';
  ctx.fillRect(x + 6, player.y + 32, 4, 2);
  ctx.fillRect(x + 14, player.y + 32, 4, 2);
  ctx.fillRect(x + 20, player.y + 32, 4, 2);
  ctx.fillRect(x + 28, player.y + 32, 4, 2);
  
  // Tail (simple curved line)
  if (player.facing === 1) {
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 30, player.y + 18);
    ctx.quadraticCurveTo(x + 38, player.y + 15, x + 40, player.y + 22);
    ctx.stroke();
  } else {
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 2, player.y + 18);
    ctx.quadraticCurveTo(x - 6, player.y + 15, x - 8, player.y + 22);
    ctx.stroke();
  }
}

function drawHUD() {
  ctx.fillStyle = 'rgba(10, 18, 30, 0.45)';
  ctx.fillRect(16, 16, 360, 86);
  ctx.fillStyle = '#ecf7ff';
  ctx.font = 'bold 24px Arial';
  ctx.fillText(`Lives: ${player.lives}`, 30, 46);
  ctx.fillText(`Score: ${player.score}`, 30, 78);
  
  // Level indicator
  ctx.font = 'bold 18px Arial';
  ctx.fillText(`${levels[game.currentLevelIndex].name}`, 250, 46);

  if (game.levelMessage) {
    ctx.fillStyle = 'rgba(255, 107, 107, 0.9)';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(game.levelMessage, 280, 78);
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
showOverlay('Sky Sprint', 'Use A/D or arrow keys to move, W/Space to jump. Defeat enemies by landing on top of them and reach the flag. Complete all 3 levels!', 'Start Game');
loop();
