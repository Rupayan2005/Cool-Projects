// Game constants
const BOARD_WIDTH = 460;
const BOARD_HEIGHT = 640;
const BIRD_WIDTH = 24;
const BIRD_HEIGHT = 34;
const PIPE_WIDTH = 64;
const PIPE_HEIGHT = 512;
const GRAVITY = 0.4;
const JUMP_VELOCITY = -6.5;
const PIPE_VELOCITY = -2.5;
const PIPE_SPACING = 1300;
const PIPE_GAP = BOARD_HEIGHT / 3.8;

// Game state
let board, context;
let gameStarted = false;
let gameOver = false;
let score = 0;
let highScore = parseInt(localStorage.getItem("flappyHighScore")) || 0;
let frameCount = 0;
let deltaTime = 0;
let lastTime = 0;

// Bird object with advanced properties
let bird = {
  x: BOARD_WIDTH / 8,
  y: BOARD_HEIGHT / 2,
  width: BIRD_WIDTH,
  height: BIRD_HEIGHT,
  velocityY: 0,
  rotation: 0,
  targetRotation: 0,
  scale: 1,
  targetScale: 1,
  trail: [],
};

// Pipes array
let pipes = [];
let pipeTimer = 0;

// Particle system
let particles = [];
let backgroundParticles = [];

// Images
let birdImg, topPipeImg, bottomPipeImg;
let imagesLoaded = 0;
let totalImages = 3;

// Audio context for sound effects (optional)
let audioContext;
let sounds = {};

// Performance monitoring
let fps = 60;
let fpsCounter = 0;
let fpsTime = 0;

// Animation easing functions
const easing = {
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeOutElastic: (t) =>
    t === 0
      ? 0
      : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) +
        1,
};

// Initialize game
window.onload = function () {
  board = document.getElementById("board");
  board.width = BOARD_WIDTH;
  board.height = BOARD_HEIGHT;
  context = board.getContext("2d");

  // Enable smooth rendering
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  // Load images with callback
  loadImages();

  // Initialize background particles
  initBackgroundParticles();

  // Initialize audio context
  initAudio();

  // Show instructions
  document.getElementById("instructions").classList.add("show");

  // Event listeners
  document.addEventListener("keydown", handleInput);
  document.addEventListener("click", handleInput);
  document.addEventListener("touchstart", handleInput, { passive: false });
  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Start game loop
  requestAnimationFrame(gameLoop);
};

let backgroundImg; // add this at the top with other image variables

function loadImages() {
  birdImg = new Image();
  birdImg.onload = () => {
    imagesLoaded++;
    checkImagesLoaded();
  };
  birdImg.src = "./image/flappybird.png";

  topPipeImg = new Image();
  topPipeImg.onload = () => {
    imagesLoaded++;
    checkImagesLoaded();
  };
  topPipeImg.src = "./image/toppipe.png";

  bottomPipeImg = new Image();
  bottomPipeImg.onload = () => {
    imagesLoaded++;
    checkImagesLoaded();
  };
  bottomPipeImg.src = "./image/bottompipe.png";

  // ✅ Load background image
  backgroundImg = new Image();
  backgroundImg.onload = () => {
    imagesLoaded++;
    checkImagesLoaded();
  };
  backgroundImg.src = "./image/flappybirdbg.png";

  totalImages = 4; // ✅ Update total images
}

function checkImagesLoaded() {
  if (imagesLoaded === totalImages) {
    console.log("All images loaded successfully!");
  }
}

function initAudio() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    // Create simple sound effects
    sounds.jump = createTone(800, 0.1);
    sounds.score = createTone(1200, 0.2);
    sounds.hit = createTone(300, 0.3);
  } catch (e) {
    console.log("Audio not supported");
  }
}

function createTone(frequency, duration) {
  return () => {
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + duration
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  };
}

function initBackgroundParticles() {
  for (let i = 0; i < 15; i++) {
    backgroundParticles.push({
      x: Math.random() * BOARD_WIDTH,
      y: Math.random() * BOARD_HEIGHT,
      vx: Math.random() * 0.5 + 0.1,
      vy: Math.random() * 0.3 - 0.15,
      size: Math.random() * 3 + 1,
      alpha: Math.random() * 0.3 + 0.1,
      color: `hsl(${Math.random() * 60 + 200}, 50%, 80%)`,
    });
  }
}

function handleVisibilityChange() {
  if (document.hidden && gameStarted && !gameOver) {
    // Pause game when tab is hidden
    gameStarted = false;
    document.getElementById("instructions").classList.add("show");
  }
}

function handleInput(e) {
  // Check for valid input keys
  if (e.type === "keydown") {
    if (e.code !== "Space" && e.code !== "ArrowUp" && e.code !== "KeyX") {
      return;
    }
    e.preventDefault();
  }

  // Prevent default touch behavior
  if (e.type === "touchstart") {
    e.preventDefault();
    // Resume audio context on user interaction
    if (audioContext && audioContext.state === "suspended") {
      audioContext.resume();
    }
  }

  if (!gameStarted) {
    startGame();
  } else if (gameOver) {
    resetGame();
  } else {
    jump();
  }
}

function startGame() {
  gameStarted = true;
  document.getElementById("instructions").classList.remove("show");
  jump();
}

function jump() {
  if (gameOver) return;

  bird.velocityY = JUMP_VELOCITY;
  bird.targetRotation = -25;
  bird.targetScale = 1.2;

  // Play jump sound
  if (sounds.jump) sounds.jump();

  // Add bird trail effect
  bird.trail.push({
    x: bird.x + bird.width / 2,
    y: bird.y + bird.height / 2,
    life: 1.0,
    size: 8,
  });

  // Add jump particles
  addParticles(bird.x + bird.width / 2, bird.y + bird.height / 2, "#FFD700", 6);

  // Camera shake effect
  addCameraShake(2, 100);
}

function resetGame() {
  gameOver = false;
  gameStarted = false;
  score = 0;
  bird.x = BOARD_WIDTH / 8;
  bird.y = BOARD_HEIGHT / 2;
  bird.velocityY = 0;
  bird.rotation = 0;
  bird.targetRotation = 0;
  bird.scale = 1;
  bird.targetScale = 1;
  bird.trail = [];
  pipes = [];
  particles = [];
  pipeTimer = 0;
  frameCount = 0;
  cameraShake = { x: 0, y: 0, intensity: 0, duration: 0 };
  document.getElementById("instructions").classList.add("show");
}

// Camera shake system
let cameraShake = { x: 0, y: 0, intensity: 0, duration: 0 };

function addCameraShake(intensity, duration) {
  cameraShake.intensity = intensity;
  cameraShake.duration = duration;
}

function updateCameraShake() {
  if (cameraShake.duration > 0) {
    cameraShake.x = (Math.random() - 0.5) * cameraShake.intensity;
    cameraShake.y = (Math.random() - 0.5) * cameraShake.intensity;
    cameraShake.duration--;
  } else {
    cameraShake.x = 0;
    cameraShake.y = 0;
  }
}

function gameLoop(currentTime) {
  deltaTime = currentTime - lastTime;
  lastTime = currentTime;

  // Calculate FPS
  fpsCounter++;
  fpsTime += deltaTime;
  if (fpsTime >= 1000) {
    fps = fpsCounter;
    fpsCounter = 0;
    fpsTime = 0;
  }

  update();
  draw();
  frameCount++;
  requestAnimationFrame(gameLoop);
}

function update() {
  updateCameraShake();
  updateBackgroundParticles();

  if (!gameStarted || gameOver) return;

  // Smooth bird physics
  const gravityForce = GRAVITY * (deltaTime / 16.67);
  bird.velocityY += gravityForce;
  bird.y = Math.max(bird.y + bird.velocityY * (deltaTime / 16.67), 0);

  // Smooth bird rotation
  bird.rotation +=
    (bird.targetRotation - bird.rotation) * 0.15 * (deltaTime / 16.67);
  bird.targetRotation = Math.min(bird.velocityY * 3, 90);

  // Smooth bird scaling
  bird.scale += (bird.targetScale - bird.scale) * 0.1 * (deltaTime / 16.67);

  bird.targetScale = 1;

  // Update bird trail
  updateBirdTrail();

  // Check ground collision
  if (bird.y > BOARD_HEIGHT - bird.height) {
    gameOver = true;
    addParticles(
      bird.x + bird.width / 2,
      BOARD_HEIGHT - bird.height / 2,
      "#FF4444",
      12
    );
    addCameraShake(5, 200);
    if (sounds.hit) sounds.hit();
  }

  // Update pipes with smoother timing
  pipeTimer += deltaTime;
  if (pipeTimer >= PIPE_SPACING) {
    createPipe();
    pipeTimer = 0;
  }

  // Update existing pipes
  for (let i = pipes.length - 1; i >= 0; i--) {
    let pipe = pipes[i];
    pipe.x += PIPE_VELOCITY * (deltaTime / 16.67); // Normalize to 60fps

    // Smooth pipe animations
    if (pipe.scale === undefined) pipe.scale = 1;
    pipe.scale += (1 - pipe.scale) * 0.05;

    // Check collision with improved detection
    if (detectCollision(bird, pipe)) {
      gameOver = true;
      addParticles(
        bird.x + bird.width / 2,
        bird.y + bird.height / 2,
        "#FF4444",
        15
      );
      addCameraShake(8, 300);
      if (sounds.hit) sounds.hit();
    }

    // Update score with animation
    if (!pipe.passed && bird.x > pipe.x + pipe.width) {
      score += 0.5;
      pipe.passed = true;
      if (score % 1 === 0) {
        // Only trigger on full points
        addParticles(
          pipe.x + pipe.width,
          pipe.y + pipe.height / 2,
          "#00FF88",
          8
        );
        addCameraShake(1, 50);
        if (sounds.score) sounds.score();
      }
    }

    // Remove off-screen pipes
    if (pipe.x + pipe.width < -50) {
      pipes.splice(i, 1);
    }
  }

  // Update particles
  updateParticles();

  // Update high score with animation
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("flappyHighScore", highScore.toString());
  }
}

function updateBirdTrail() {
  for (let i = bird.trail.length - 1; i >= 0; i--) {
    let trail = bird.trail[i];
    const decay = 0.05 * (deltaTime / 16.67);
    trail.life -= decay;
    trail.size *= Math.pow(0.95, deltaTime / 16.67);

    if (trail.life <= 0) {
      bird.trail.splice(i, 1);
    }
  }
}

function updateBackgroundParticles() {
  backgroundParticles.forEach((particle) => {
    particle.x += particle.vx;
    particle.y += particle.vy;

    if (particle.x > BOARD_WIDTH + 10) {
      particle.x = -10;
      particle.y = Math.random() * BOARD_HEIGHT;
    }

    if (particle.y > BOARD_HEIGHT + 10) {
      particle.y = -10;
    } else if (particle.y < -10) {
      particle.y = BOARD_HEIGHT + 10;
    }
  });
}

function draw() {
  // Clear canvas
  context.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

  // Apply camera shake
  context.save();
  context.translate(cameraShake.x, cameraShake.y);

  // Draw animated background gradient
  if (backgroundImg && backgroundImg.complete) {
    context.drawImage(backgroundImg, 0, 0, BOARD_WIDTH, BOARD_HEIGHT);
  } else {
    // fallback gradient if image not loaded
    const gradient = context.createLinearGradient(0, 0, 0, BOARD_HEIGHT);
    const time = frameCount * 0.01;
    const hue1 = (200 + Math.sin(time) * 20) % 360;
    const hue2 = (260 + Math.cos(time * 0.7) * 30) % 360;
    gradient.addColorStop(0, `hsl(${hue1}, 70%, 85%)`);
    gradient.addColorStop(1, `hsl(${hue2}, 60%, 70%)`);
    context.fillStyle = gradient;
    context.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
  }

  // Draw background particles
  drawBackgroundParticles();

  // Draw bird trail
  drawBirdTrail();

  // Draw bird with smooth scaling and rotation
  drawBird();

  // Draw pipes with smooth animations
  drawPipes();

  // Draw particles
  drawParticles();

  context.restore();

  // Draw UI (not affected by camera shake)
  drawUI();
}

function drawBackgroundParticles() {
  backgroundParticles.forEach((particle) => {
    context.save();
    context.globalAlpha = particle.alpha;
    context.fillStyle = particle.color;
    context.beginPath();
    context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    context.fill();
    context.restore();
  });
}

function drawBirdTrail() {
  bird.trail.forEach((trail) => {
    context.save();
    context.globalAlpha = trail.life * 0.5;
    context.fillStyle = "#FFD700";
    context.beginPath();
    context.arc(trail.x, trail.y, trail.size, 0, Math.PI * 2);
    context.fill();
    context.restore();
  });
}

function drawBird() {
  if (!birdImg.complete) return;

  context.save();
  context.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
  context.rotate((bird.rotation * Math.PI) / 180);
  context.scale(bird.scale, bird.scale);

  // Add glow effect
  context.shadowColor = "#FFD700";
  context.shadowBlur = 10;

  context.drawImage(
    birdImg,
    -bird.width / 2,
    -bird.height / 2,
    bird.width,
    bird.height
  );
  context.restore();
}

function drawPipes() {
  pipes.forEach((pipe) => {
    if (!pipe.img || !pipe.img.complete) return;

    context.save();
    context.translate(pipe.x + pipe.width / 2, pipe.y + pipe.height / 2);
    context.scale(pipe.scale || 1, pipe.scale || 1);

    // Add subtle glow
    context.shadowColor = "#228B22";
    context.shadowBlur = 5;

    context.drawImage(
      pipe.img,
      -pipe.width / 2,
      -pipe.height / 2,
      pipe.width,
      pipe.height
    );
    context.restore();
  });
}

function drawParticles() {
  particles.forEach((particle) => {
    context.save();
    context.globalAlpha = particle.life;
    context.fillStyle = particle.color;
    context.beginPath();
    context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    context.fill();
    context.restore();
  });
}

function drawUI() {
  // Animated score
  const scoreScale = 1 + Math.sin(frameCount * 0.1) * 0.05;
  context.save();
  context.translate(BOARD_WIDTH / 2, 60);
  context.scale(scoreScale, scoreScale);

  context.fillStyle = "white";
  context.font = "bold 48px Arial";
  context.textAlign = "center";
  context.strokeStyle = "black";
  context.lineWidth = 3;
  context.strokeText(Math.floor(score), 0, 0);
  context.fillText(Math.floor(score), 0, 0);
  context.restore();

  // High score with subtle animation
  context.fillStyle = "rgba(255, 255, 255, 0.9)";
  context.font = "bold 18px Arial";
  context.textAlign = "center";
  context.strokeStyle = "black";
  context.lineWidth = 1;
  context.strokeText("Best: " + Math.floor(highScore), BOARD_WIDTH / 2, 90);
  context.fillText("Best: " + Math.floor(highScore), BOARD_WIDTH / 2, 90);

  // FPS counter (optional, for debugging)
  if (false) {
    // Set to true to show FPS
    context.fillStyle = "white";
    context.font = "12px Arial";
    context.textAlign = "left";
    context.fillText("FPS: " + fps, 10, BOARD_HEIGHT - 10);
  }

  // Enhanced game over screen
  if (gameOver) {
    context.fillStyle = "rgba(0, 0, 0, 0.8)";
    context.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

    // Animated game over text
    const gameOverScale = 1 + Math.sin(frameCount * 0.2) * 0.1;
    context.save();
    context.translate(BOARD_WIDTH / 2, BOARD_HEIGHT / 2 - 50);
    context.scale(gameOverScale, gameOverScale);

    context.fillStyle = "#FF4444";
    context.font = "bold 48px Arial";
    context.textAlign = "center";
    context.strokeStyle = "black";
    context.lineWidth = 4;
    context.strokeText("GAME OVER", 0, 0);
    context.fillText("GAME OVER", 0, 0);
    context.restore();

    // Restart instructions
    context.fillStyle = "white";
    context.font = "24px Arial";
    context.textAlign = "center";
    context.strokeStyle = "black";
    context.lineWidth = 2;
    context.strokeText(
      "Press SPACE to restart",
      BOARD_WIDTH / 2,
      BOARD_HEIGHT / 2 + 20
    );
    context.fillText(
      "Press SPACE to restart",
      BOARD_WIDTH / 2,
      BOARD_HEIGHT / 2 + 20
    );

    // Final score with animation
    const finalScoreAlpha = 0.8 + Math.sin(frameCount * 0.3) * 0.2;
    context.save();
    context.globalAlpha = finalScoreAlpha;
    context.strokeText(
      "Final Score: " + Math.floor(score),
      BOARD_WIDTH / 2,
      BOARD_HEIGHT / 2 + 60
    );
    context.fillText(
      "Final Score: " + Math.floor(score),
      BOARD_WIDTH / 2,
      BOARD_HEIGHT / 2 + 60
    );
    context.restore();
  }
}

function createPipe() {
  const randomPipeY = -PIPE_HEIGHT / 4 - Math.random() * (PIPE_HEIGHT / 2);

  // Top pipe
  pipes.push({
    img: topPipeImg,
    x: BOARD_WIDTH,
    y: randomPipeY,
    width: PIPE_WIDTH,
    height: PIPE_HEIGHT,
    passed: false,
    scale: 0.8, // Start smaller for smooth entrance
  });

  // Bottom pipe
  pipes.push({
    img: bottomPipeImg,
    x: BOARD_WIDTH,
    y: randomPipeY + PIPE_HEIGHT + PIPE_GAP,
    width: PIPE_WIDTH,
    height: PIPE_HEIGHT,
    passed: false,
    scale: 0.8, // Start smaller for smooth entrance
  });
}

function detectCollision(bird, pipe) {
  // More precise collision detection
  const birdLeft = bird.x + 2;
  const birdRight = bird.x + bird.width - 2;
  const birdTop = bird.y + 2;
  const birdBottom = bird.y + bird.height - 2;

  const pipeLeft = pipe.x;
  const pipeRight = pipe.x + pipe.width;
  const pipeTop = pipe.y;
  const pipeBottom = pipe.y + pipe.height;

  return (
    birdLeft < pipeRight &&
    birdRight > pipeLeft &&
    birdTop < pipeBottom &&
    birdBottom > pipeTop
  );
}

function addParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      size: Math.random() * 4 + 2,
      color: color,
      life: 1.0,
      decay: 0.02 + Math.random() * 0.02,
    });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let particle = particles[i];
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.2; // Gravity
    particle.vx *= 0.99; // Air resistance
    particle.life -= particle.decay * (deltaTime / 16.67);
    particle.size *= Math.pow(0.98, deltaTime / 16.67);

    if (particle.life <= 0 || particle.size <= 0.5) {
      particles.splice(i, 1);
    }
  }
}
