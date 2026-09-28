// Week 4 · Practice 3 — Star Catcher
// A short canvas game: catch falling stars, dodge rocks, survive 30 seconds.

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const timeEl = document.getElementById("time");
const startBtn = document.getElementById("start");
const resultEl = document.getElementById("result");

const W = canvas.width;
const H = canvas.height;

const DURATION = 30;      // seconds per round
const START_LIVES = 3;
const BASKET_W = 100;
const BASKET_H = 16;
const BASKET_Y = H - 48;

let state = "idle"; // idle | running | ended
let score = 0;
let lives = START_LIVES;
let timeLeft = DURATION;
let objects = [];
let startTime = 0;
let lastFrame = 0;
let spawnTimer = 0;
let basketX = W / 2;
let rafId = null;

// Static background stars so the night sky has depth.
const starField = Array.from({ length: 60 }, () => ({
  x: Math.random() * W,
  y: Math.random() * H,
  r: Math.random() * 1.4 + 0.4
}));

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// Convert a pointer's client X to the canvas coordinate space (for touch/mobile).
function toCanvasX(clientX) {
  const rect = canvas.getBoundingClientRect();
  return (clientX - rect.left) * (W / rect.width);
}

function reset() {
  score = 0;
  lives = START_LIVES;
  timeLeft = DURATION;
  objects = [];
  spawnTimer = 0;
  basketX = W / 2;
  updateHud();
}

function updateHud() {
  scoreEl.textContent = String(score);
  livesEl.textContent = String(lives);
  timeEl.textContent = String(timeLeft);
}

function spawn() {
  const margin = 20;
  const x = Math.random() * (W - margin * 2) + margin;
  const isRock = Math.random() < 0.22;
  const elapsed = (performance.now() - startTime) / 1000;
  const baseSpeed = 140 + Math.min(110, elapsed * 6);
  objects.push({
    x,
    y: -20,
    type: isRock ? "rock" : "star",
    r: isRock ? 13 : 14,
    vy: baseSpeed + Math.random() * 40
  });
}

function start() {
  reset();
  state = "running";
  startBtn.textContent = "Restart";
  resultEl.textContent = "";
  startTime = performance.now();
  lastFrame = startTime;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(loop);
}

function finish(message) {
  state = "ended";
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
  startBtn.textContent = "Play again";
  resultEl.textContent = message;
}

function drawStarShape(x, y, R) {
  const r = R * 0.45;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? R : r;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function drawRoundedRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  // Night sky.
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#0b1026");
  sky.addColorStop(1, "#1b2440");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Background stars.
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  starField.forEach((s) => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Ground line under the basket.
  ctx.strokeStyle = "#2f5fe0";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, BASKET_Y + BASKET_H + 8);
  ctx.lineTo(W, BASKET_Y + BASKET_H + 8);
  ctx.stroke();

  // Falling objects.
  objects.forEach((o) => {
    if (o.type === "star") {
      ctx.fillStyle = "#ffd166";
      drawStarShape(o.x, o.y, o.r);
    } else {
      ctx.fillStyle = "#8b93a7";
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#5a607a";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });

  // Basket.
  ctx.fillStyle = "#2f5fe0";
  drawRoundedRect(basketX - BASKET_W / 2, BASKET_Y, BASKET_W, BASKET_H, 7);
  ctx.fill();

  if (state === "idle") {
    ctx.fillStyle = "#ffffff";
    ctx.font = "600 20px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Press Start to catch the falling stars", W / 2, H / 2);
  }
}

function loop(now) {
  if (state !== "running") return;

  const dt = Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;

  const elapsed = (now - startTime) / 1000;
  timeLeft = Math.max(0, Math.ceil(DURATION - elapsed));
  updateHud();

  // Spawn on a falling interval that shortens as the round goes on.
  spawnTimer += dt * 1000;
  const interval = Math.max(420, 700 - elapsed * 8);
  if (spawnTimer >= interval) {
    spawnTimer = 0;
    spawn();
  }

  // Move objects and check catches / misses.
  for (let i = objects.length - 1; i >= 0; i--) {
    const o = objects[i];
    o.y += o.vy * dt;

    const basketLeft = basketX - BASKET_W / 2;
    const basketRight = basketX + BASKET_W / 2;
    const withinBasket = o.y + o.r >= BASKET_Y && o.y - o.r <= BASKET_Y + BASKET_H;

    if (withinBasket && o.x >= basketLeft && o.x <= basketRight) {
      if (o.type === "star") {
        score += 1;
      } else {
        lives -= 1;
      }
      objects.splice(i, 1);
      updateHud();

      if (lives <= 0) {
        draw();
        finish("Out of lives! Final score: " + score);
        return;
      }
      continue;
    }

    if (o.y - o.r > H) {
      objects.splice(i, 1);
    }
  }

  draw();

  if (timeLeft <= 0) {
    finish("Time's up! Final score: " + score);
    return;
  }

  rafId = requestAnimationFrame(loop);
}

// Controls: mouse and touch both fire pointer events.
canvas.addEventListener("pointermove", (e) => {
  if (state === "running") basketX = clamp(toCanvasX(e.clientX), BASKET_W / 2, W - BASKET_W / 2);
});
canvas.addEventListener("pointerdown", (e) => {
  if (state === "running") basketX = clamp(toCanvasX(e.clientX), BASKET_W / 2, W - BASKET_W / 2);
});

startBtn.addEventListener("click", start);

// Paint the idle screen on first load.
updateHud();
draw();