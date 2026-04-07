// 全螢幕華麗雷達尋寶遊戲 - 最終進化版

let gameState = 'playing'; 
let timer = 30; 
let lastSecond;
let treasureX, treasureY;
let gridSize = 60; // 稍微加大網格
let ripples = []; // 雷達波紋
let particles = []; // 勝利煙火粒子
let winFrame = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  resetGame();
  textAlign(CENTER, CENTER);
  noCursor();
}

function draw() {
  background(10, 15, 30); // 深色背景讓發光更明顯
  drawGrid();

  if (gameState === 'playing') {
    playGame();
  } else if (gameState === 'win') {
    drawWinScreen();
  } else if (gameState === 'lose') {
    drawLoseScreen();
  }

  // 統一處理所有粒子與波紋的更新
  updateEffects();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function drawGrid() {
  stroke(40, 60, 100, 100);
  strokeWeight(1);
  for (let x = 0; x < width; x += gridSize) line(x, 0, x, height);
  for (let y = 0; y < height; y += gridSize) line(0, y, width, y);
}

function playGame() {
  let cx = floor(mouseX / gridSize) * gridSize + gridSize / 2;
  let cy = floor(mouseY / gridSize) * gridSize + gridSize / 2;
  let d = dist(cx, cy, treasureX, treasureY);
  
  // 核心邏輯：距離越近，顏色越暖，尺寸越大
  let maxD = dist(0, 0, width, height) / 2;
  let r = map(d, 0, 400, 255, 0, true);
  let g = map(d, 0, 400, 100, 200, true);
  let b = map(d, 0, 400, 0, 255, true);
  let sz = map(d, 0, 400, gridSize * 0.9, 10, true);

  // 每隔幾幀產生一個擴散圓圈 (雷達波)
  if (frameCount % 15 === 0) {
    ripples.push(new Ripple(cx, cy, color(r, g, b)));
  }

  // 繪製目前的感應圓球
  push();
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = color(r, g, b);
  fill(r, g, b);
  noStroke();
  ellipse(cx, cy, sz + sin(frameCount * 0.1) * 5);
  pop();

  drawCrosshair();
  updateTimer();
  
  // UI 文字
  fill(255);
  textSize(20);
  text(`⚡ 能量剩餘: ${timer}s`, width / 2, 40);
}

// --- 特效類別 ---

class Ripple {
  constructor(x, y, col) {
    this.x = x;
    this.y = y;
    this.size = 0;
    this.alpha = 255;
    this.col = col;
  }
  update() {
    this.size += 4;
    this.alpha -= 4;
  }
  display() {
    noFill();
    strokeWeight(2);
    stroke(red(this.col), green(this.col), blue(this.col), this.alpha);
    ellipse(this.x, this.y, this.size);
  }
}

class Firework {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-6, 6);
    this.vy = random(-10, 2);
    this.gravity = 0.15;
    this.alpha = 255;
    this.col = color(random(100, 255), random(100, 255), random(100, 255));
  }
  update() {
    this.vx *= 0.98;
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 4;
  }
  display() {
    noStroke();
    fill(red(this.col), green(this.col), blue(this.col), this.alpha);
    ellipse(this.x, this.y, random(4, 8));
  }
}

function updateEffects() {
  for (let i = ripples.length - 1; i >= 0; i--) {
    ripples[i].update();
    ripples[i].display();
    if (ripples[i].alpha <= 0) ripples.splice(i, 1);
  }
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();
    if (particles[i].alpha <= 0) particles.splice(i, 1);
  }
}

// --- 畫面設計 ---

function drawWinScreen() {
  cursor(ARROW);
  winFrame++;
  
  // 畫面震動效果
  if (winFrame < 20) translate(random(-5, 5), random(-5, 5));

  // 持續噴發煙火
  if (frameCount % 5 === 0) {
    for (let i = 0; i < 10; i++) particles.push(new Firework(random(width), height));
  }

  background(0, 0, 0, 100);
  
  // 標題文字閃爍特效
  push();
  let textCol = floor(frameCount / 10) % 2 === 0 ? color(255, 255, 0) : color(255, 0, 255);
  fill(textCol);
  textSize(80);
  drawingContext.shadowBlur = 30;
  drawingContext.shadowColor = textCol;
  text("MISSION COMPLETE", width / 2, height / 2 - 50);
  pop();

  drawButton("再應戰一次", width / 2, height / 2 + 100);
}

function drawLoseScreen() {
  cursor(ARROW);
  background(50, 0, 0, 150);
  fill(255);
  textSize(60);
  text("系統過熱：尋找失敗", width / 2, height / 2 - 50);
  
  // 顯示正確位置的雷達波
  stroke(255, 255, 0);
  noFill();
  ellipse(treasureX, treasureY, sin(frameCount*0.1)*50 + 80);

  drawButton("重啟系統", width / 2, height / 2 + 100);
}

function drawCrosshair() {
  push();
  stroke(255, 150);
  line(mouseX, 0, mouseX, height);
  line(0, mouseY, width, mouseY);
  stroke(255);
  noFill();
  ellipse(mouseX, mouseY, 30);
  pop();
}

function drawButton(txt, x, y) {
  let w = 250, h = 60;
  let hover = dist(mouseX, mouseY, x, y) < 100;
  fill(hover ? [255, 100, 0] : [0, 150, 255]);
  rectMode(CENTER);
  rect(x, y, w, h, 20);
  fill(255);
  textSize(28);
  text(txt, x, y);
}

function updateTimer() {
  if (second() !== lastSecond) {
    timer--;
    lastSecond = second();
  }
  if (timer <= 0) gameState = 'lose';
}

function resetGame() {
  gameState = 'playing';
  timer = 30;
  winFrame = 0;
  ripples = [];
  particles = [];
  let cols = floor(width / gridSize);
  let rows = floor(height / gridSize);
  treasureX = floor(random(cols)) * gridSize + gridSize / 2;
  treasureY = floor(random(rows)) * gridSize + gridSize / 2;
}

function mousePressed() {
  if (gameState === 'playing') {
    let gx = floor(mouseX / gridSize) * gridSize + gridSize / 2;
    let gy = floor(mouseY / gridSize) * gridSize + gridSize / 2;
    if (gx === treasureX && gy === treasureY) {
      gameState = 'win';
      // 成功瞬間噴發大量粒子
      for(let i=0; i<100; i++) particles.push(new Firework(width/2, height/2));
    }
  } else {
    if (dist(mouseX, mouseY, width/2, height/2 + 100) < 120) resetGame();
  }
}