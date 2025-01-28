const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Bird image
const birdImage = new Image();
birdImage.src = 'P.jpg';

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const bird = {
    x: canvas.width / 4,
    y: canvas.height / 2,
    width: 40,
    height: 40,
    velocity: 0,
    gravity: 0.5,
    jumpStrength: 8
};

const pipes = [];
let score = 0;
let gameOver = false;
let gameStarted = false;

function drawBird() {
    ctx.save();
    ctx.translate(bird.x, bird.y);
    
    ctx.drawImage(birdImage, 
        -bird.width/2, 
        -bird.height/2, 
        bird.width, 
        bird.height
    );
    
    ctx.restore();
}

function createPipes() {
    const minHeight = canvas.height / 6;
    const maxHeight = canvas.height - minHeight;
    const pipeWidth = canvas.width / 15;
    const gapSize = canvas.height / 3;
    
    const topPipeHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    
    pipes.push({
        x: canvas.width,
        width: pipeWidth,
        topHeight: topPipeHeight,
        bottomHeight: canvas.height - topPipeHeight - gapSize,
        passed: false
    });
}

function drawPipes() {
    pipes.forEach(pipe => {
        ctx.fillStyle = 'green';
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
        ctx.fillRect(pipe.x, canvas.height - pipe.bottomHeight, pipe.width, pipe.bottomHeight);
    });
}

function movePipes() {
    pipes.forEach((pipe, index) => {
        pipe.x -= canvas.width / 200;

        if (pipe.x + pipe.width < 0) {
            pipes.splice(index, 1);
        }

        if (!pipe.passed && pipe.x + pipe.width < bird.x) {
            score++;
            pipe.passed = true;
        }
    });
}

function checkCollision() {
    const birdLeft = bird.x - bird.width/2;
    const birdRight = bird.x + bird.width/2;
    const birdTop = bird.y - bird.height/2;
    const birdBottom = bird.y + bird.height/2;

    pipes.forEach(pipe => {
        if (
            birdRight > pipe.x &&
            birdLeft < pipe.x + pipe.width &&
            birdTop < pipe.topHeight
        ) {
            gameOver = true;
        }

        if (
            birdRight > pipe.x &&
            birdLeft < pipe.x + pipe.width &&
            birdBottom > canvas.height - pipe.bottomHeight
        ) {
            gameOver = true;
        }
    });

    if (birdBottom > canvas.height || birdTop < 0) {
        gameOver = true;
    }
}

function jump() {
    if (!gameOver) {
        bird.velocity = -bird.jumpStrength;
        
        if (!gameStarted) {
            gameStarted = true;
        }
    } else {
        bird.y = canvas.height / 2;
        bird.velocity = 0;
        pipes.length = 0;
        score = 0;
        gameOver = false;
        gameStarted = false;
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameStarted && !gameOver) {
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;

        // Diubah dari 0.7 menjadi 0.4 untuk jarak yang lebih jauh antar pipa
        if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width * 0.4) {
            createPipes();
        }
        
        movePipes();
    }

    drawPipes();
    drawBird();

    ctx.fillStyle = 'black';
    ctx.font = `${canvas.width / 20}px Arial`;
    ctx.fillText(`Skor: ${score}`, canvas.width / 40, canvas.height / 10);

    if (!gameStarted && !gameOver) {
        ctx.fillStyle = 'red';
        ctx.font = `${canvas.width / 15}px Arial`;
        ctx.fillText('Sentuh untuk Mulai', canvas.width / 4, canvas.height / 2);
    }

    if (gameStarted) {
        checkCollision();
    }

    if (gameOver) {
        ctx.fillStyle = 'red';
        ctx.font = `${canvas.width / 10}px Arial`;
        ctx.fillText('Game Over', canvas.width / 6, canvas.height / 2);
        ctx.font = `${canvas.width / 20}px Arial`;
        ctx.fillText(`Skor: ${score}`, canvas.width / 2 - 50, canvas.height / 2 + 50);
    }

    requestAnimationFrame(gameLoop);
}

function handleInput(event) {
    event.preventDefault();
    jump();
}

canvas.addEventListener('touchstart', handleInput, { passive: false });
canvas.addEventListener('mousedown', handleInput);

gameLoop();