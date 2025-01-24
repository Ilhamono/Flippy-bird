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

        // Fungsi untuk menggambar burung
        function drawBird() {
            ctx.save();
            ctx.translate(bird.x, bird.y);
            
            // Rotate bird based on velocity for more dynamic movement
            
            
            // Draw image centered
            ctx.drawImage(birdImage, 
                -bird.width/2, 
                -bird.height/2, 
                bird.width, 
                bird.height
            );
            
            ctx.restore();
        }

        // Rest of the code remains the same as the previous version...
        // (Keeping the previous pipe, movement, collision, and game loop functions)

        // Fungsi untuk membuat pipa
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

        // Fungsi untuk menggambar pipa
        function drawPipes() {
            pipes.forEach(pipe => {
                // Pipa atas
                ctx.fillStyle = 'green';
                ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
                
                // Pipa bawah
                ctx.fillRect(pipe.x, canvas.height - pipe.bottomHeight, pipe.width, pipe.bottomHeight);
            });
        }

        // Fungsi untuk menggerakkan pipa
        function movePipes() {
            pipes.forEach((pipe, index) => {
                pipe.x -= canvas.width / 200;

                // Menghapus pipa yang sudah keluar layar
                if (pipe.x + pipe.width < 0) {
                    pipes.splice(index, 1);
                }

                // Menghitung skor
                if (!pipe.passed && pipe.x + pipe.width < bird.x) {
                    score++;
                    pipe.passed = true;
                }
            });
        }

        // Fungsi untuk memeriksa tabrakan
        function checkCollision() {
            const birdLeft = bird.x - bird.width/2;
            const birdRight = bird.x + bird.width/2;
            const birdTop = bird.y - bird.height/2;
            const birdBottom = bird.y + bird.height/2;

            pipes.forEach(pipe => {
                // Cek tabrakan dengan pipa atas
                if (
                    birdRight > pipe.x &&
                    birdLeft < pipe.x + pipe.width &&
                    birdTop < pipe.topHeight
                ) {
                    gameOver = true;
                }

                // Cek tabrakan dengan pipa bawah
                if (
                    birdRight > pipe.x &&
                    birdLeft < pipe.x + pipe.width &&
                    birdBottom > canvas.height - pipe.bottomHeight
                ) {
                    gameOver = true;
                }
            });

            // Cek tabrakan dengan lantai dan langit
            if (birdBottom > canvas.height || birdTop < 0) {
                gameOver = true;
            }
        }

        // Fungsi untuk melompat
        function jump() {
            if (!gameOver) {
                bird.velocity = -bird.jumpStrength;
                
                // Mulai game jika belum dimulai
                if (!gameStarted) {
                    gameStarted = true;
                }
            } else {
                // Reset game
                bird.y = canvas.height / 2;
                bird.velocity = 0;
                pipes.length = 0;
                score = 0;
                gameOver = false;
                gameStarted = false;
            }
        }

        // Fungsi utama game
        function gameLoop() {
            // Bersihkan canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update posisi burung hanya jika game sudah dimulai
            if (gameStarted && !gameOver) {
                // Gravitasi
                bird.velocity += bird.gravity;
                bird.y += bird.velocity;

                // Buat pipa secara acak
                if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width * 0.7) {
                    createPipes();
                }
                
                // Gerakkan pipa
                movePipes();
            }

            // Gambar pipa
            drawPipes();

            // Gambar burung
            drawBird();

            // Tampilkan skor
            ctx.fillStyle = 'black';
            ctx.font = `${canvas.width / 20}px Arial`;
            ctx.fillText(`Skor: ${score}`, canvas.width / 40, canvas.height / 10);

            // Pesan memulai game
            if (!gameStarted && !gameOver) {
                ctx.fillStyle = 'red';
                ctx.font = `${canvas.width / 15}px Arial`;
                ctx.fillText('Sentuh untuk Mulai', canvas.width / 4, canvas.height / 2);
            }

            // Periksa tabrakan
            if (gameStarted) {
                checkCollision();
            }

            // Game over
            if (gameOver) {
                ctx.fillStyle = 'red';
                ctx.font = `${canvas.width / 10}px Arial`;
                ctx.fillText('Game Over', canvas.width / 6, canvas.height / 2);
                ctx.font = `${canvas.width / 20}px Arial`;
                ctx.fillText(`Skor: ${score}`, canvas.width / 2 - 50, canvas.height / 2 + 50);
            }

            // Lanjutkan loop game
            requestAnimationFrame(gameLoop);
        }

        // Kontrol sentuh dan klik
        function handleInput(event) {
            event.preventDefault(); // Mencegah scroll atau zoom
            jump();
        }

        // Tambahkan event listener untuk sentuhan dan klik
        canvas.addEventListener('touchstart', handleInput, { passive: false });
        canvas.addEventListener('mousedown', handleInput);

        // Mulai game
        gameLoop();