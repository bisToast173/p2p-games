const gameBoard = document.getElementById("main");
const brickContainer = document.getElementById("bricks");
const paddle = document.getElementById("paddle");
const ball = document.getElementById("ball");
const overlay = document.getElementById("overlay")

const boardWidth = gameBoard.clientWidth;
const boardHeight = gameBoard.clientHeight;

let paddleWidth = 120;
const paddleHeight = 12;
let paddleX = (boardWidth - paddleWidth) / 2;

const ballSize = 14;
let balls = [];
let items = [];
const itemSize = 20;

let effectTimer = null;
let effectTimeLeft = 0;
const timeDisplay = document.getElementById("lives");

let isPlay = false;

const pauseBtn = document.getElementById("btn-pause")

const levels = [
        [[1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0]],

        [[2, 2, 2, 2, 2, 2, 2, 2],
        [2, 1, 1, 1, 1, 1, 1, 2],
        [2, 1, 1, 1, 1, 1, 1, 2],
        [2, 1, 1, 1, 1, 1, 1, 2],
        [2, 2, 2, 0, 0, 2, 2, 2]],

        [[2, 1, 1, 1, 1, 1, 1, 2],
        [2, 1, 1, 1, 1, 1, 1, 2],
        [2, 2, 1, 1, 1, 1, 2, 2],
        [2, 2, 1, 1, 1, 1, 2, 2],
        [3, 3, 3, 2, 2, 3, 3, 3],
        [0, 0, 0, 3, 3, 0, 0, 0]],

        [[3, 3, 3, 3, 3, 3, 3, 3],
        [3, 2, 2, 2, 2, 2, 2, 3],
        [3, 2, 1, 1, 1, 1, 2, 3],
        [3, 2, 1, 1, 1, 1, 2, 3],
        [3, 2, 2, 2, 2, 2, 2, 3],
        [3, 3, 3, 3, 3, 3, 3, 3]],

        [[0, 0, 3, 3, 3, 3, 0, 0],
        [0, 2, 2, 2, 2, 2, 2, 0],
        [3, 2, 3, 3, 3, 3, 2, 3],
        [3, 2, 3, 2, 2, 3, 2, 3],
        [3, 2, 3, 2, 2, 3, 2, 3],
        [3, 2, 3, 3, 3, 3, 2, 3],
        [0, 2, 2, 2, 2, 2, 2, 0],
        [0, 0, 3, 3, 3, 3, 0, 0]]
]

const brickWidth = 70;
const brickHeight = 20;
const brickPadding = 20;
const brickMarginTop = 50;
let bricks = [];

let currentLevel = 0;
let totalBricks = 0;
let brokenBricks = 0;

const levelButtons = document.querySelectorAll(".level");

function applyYellowEffect() {
    paddleWidth = 70;
    effectTimeLeft = 10;
    updateTimerDisplay();

    if (effectTimer) clearInterval(effectTimer);

    effectTimer = setInterval(() => {
        effectTimeLeft--;
        updateTimerDisplay();

        if (effectTimeLeft <= 0) {
            clearEffects();
        }
    }, 1000);
}

function clearEffects() {
    if (effectTimer) clearInterval(effectTimer);
    effectTimer = null;
    effectTimeLeft = 0;
    updateTimerDisplay();
    paddleWidth = 120;

    if (paddleX + paddleWidth > boardWidth) {
        paddleX = boardWidth - paddleWidth;
    }
}

function updateTimerDisplay() {
    if (effectTimeLeft > 0) {
        let seconds = effectTimeLeft < 10 ? "0" + effectTimeLeft : effectTimeLeft;
        timeDisplay.innerText = "00:" + seconds;
    } else {
        timeDisplay.innerText = "00:00";
    }
}

function spawnBalls() {
    let baseBall = balls[0];
    for (let i = 0; i < 2; i++) {
        let newBall = document.createElement("div");
        newBall.classList.add("ball-extra");
        newBall.style.width = ballSize + "px";
        newBall.style.height = ballSize + "px";
        newBall.style.backgroundColor = "#ffffff";
        newBall.style.borderRadius = "50%";
        newBall.style.position = "absolute";
        newBall.style.boxShadow = "0 0 10px #ffffff"
        gameBoard.appendChild(newBall);
        balls.push({element: newBall, x: baseBall.x, y: baseBall.y, dx: baseBall.dx * (i === 0 ? 1 : -1), dy: -Math.abs(baseBall.dy)});
    }
}

function spawnItem(x, y) {
    if (currentLevel === 0) return;
    if (Math.random() > 0.30) return;
    let rand = Math.random();
    let type = null;
    let color = null;

    if (currentLevel > 2) {
        if (rand < 0.20) {
            type = "red"; color = "red";
        } else if (rand < 0.50) {
            type = "yellow"; color = "yellow";
        } else {
            type = "green"; color = "green";
        }
    }
    else if (currentLevel > 1) {
        if (rand < 0.40) {
            type = "yellow"; color = "yellow";
        } else {
            type = "green"; color = "green";
        }
    }
    else {
        type = "green"; color = "green";
    }

    if (type) {
        let itemEl = document.createElement("div");
        itemEl.classList.add("item");
        itemEl.style.width = itemSize + "px";
        itemEl.style.height = itemSize + "px";
        itemEl.style.backgroundColor = color;
        itemEl.style.position = "absolute";
        itemEl.style.borderRadius = "50%";
        itemEl.style.boxShadow = `0 0 8px ${color}`
        gameBoard.appendChild(itemEl);

        items.push({ x: x + brickWidth / 2, y: y, dy: 3, type: type, element: itemEl });
    }
}

levelButtons.forEach((btn, index) => {
    btn.addEventListener("click", () => {
        loadLevels(index);
    });
});

function getBricksColor(type) {
    if (type === 3) return "#ff4444";
    if (type === 2) return "#ffbb33";
    return "#00C851";
}

function initBricks() {
    brickContainer.innerHTML = '';
    bricks = [];
    totalBricks = 0;
    brokenBricks = 0;
    let map = levels[currentLevel];
    let rows = map.length;
    let cols = map[0].length;
    let totalBrickWidth = (cols * brickWidth) + ((cols - 1) * brickPadding);
    let marginL = (boardWidth - totalBrickWidth) / 2;

    for(let r = 0; r < rows; r++) {
        bricks[r] = []
        for(let c = 0; c < cols; c++) {
            let brickColor = map[r][c]
            if(brickColor > 0) {
                totalBricks++;
                let brickX = c * (brickWidth + brickPadding) + marginL;
                let brickY = r * (brickHeight + brickPadding) + brickMarginTop;

                let brickElements = document.createElement("div");
                brickElements.classList.add("brick");
                brickElements.style.width = brickWidth + "px";
                brickElements.style.height = brickHeight + "px";
                brickElements.style.left = brickX + "px";
                brickElements.style.top = brickY + "px";
                brickElements.style.backgroundColor = getBricksColor(brickColor);
                brickContainer.appendChild(brickElements);
                bricks[r][c] = {x: brickX, y: brickY, color: brickColor, element: brickElements};
            } else {
                bricks[r][c] = null;
            }
        }
    }
}

function loadLevels(index) {
    currentLevel = index;

    balls.forEach(b => b.element.remove());
    items.forEach(item => item.element.remove());

    let ball = document.createElement("div");
    ball.id = "ball";
    gameBoard.appendChild(ball);

    paddleX = (boardWidth - 120) / 2;

    let startX = (boardWidth - ballSize) / 2;
    let startY = boardHeight - 50 - paddleHeight - ballSize - 2;

    balls = [{element: ball, x: startX, y: startY, dx: 4, dy: -4}];

    items = [];
    isPlay = false;
    overlay.style.display = "flex";

    clearEffects();
    initBricks();
}

pauseBtn.addEventListener("click", (e) => {
    isPlay = false;
    overlay.style.display = "flex";
})

gameBoard.addEventListener("click", (e) => {
    if(!isPlay) {
        isPlay = true;
        overlay.style.display = "none";
    }
})
    gameBoard.addEventListener("mousemove", ev => {
        if(!isPlay) return;
        let mouseX = ev.clientX - gameBoard.getBoundingClientRect().left;
        if(mouseX > 0 && mouseX < boardWidth) {
            paddleX = mouseX - paddleWidth / 2;
            if (paddleX < 0) paddleX = 0;
            if (paddleX > boardWidth - paddleWidth) paddleX = boardWidth - paddleWidth;
        }
    });

function gameOver() {
    alert("Game Over");
    document.location.reload();
}

function loop() {

    if(isPlay) {
        // console.log(Math.sqrt(speedX*speedX + speedY*speedY))
        balls.forEach((ball, index) => {
            ball.x += ball.dx;
            ball.y += ball.dy;
            //va cham tuong
            if(ball.x <= 0 || ball.x + ballSize >= boardWidth) ball.dx = -ball.dx;
            if(ball.y <= 0) ball.dy = -ball.dy;
            //roi xuong day
            if(ball.y + ballSize >= boardHeight) {
                ball.element.remove();
                balls.splice(index, 1);

                if (balls.length === 0) {
                    gameOver();
                }
            }
            //va cham giua, trai, phai cua paddle
            if(ball.y + ballSize >= boardHeight - paddleHeight - 50 && ball.y <= boardHeight - 50 && ball.x + ballSize >= paddleX && ball.x <= paddleX + paddleWidth) {
                let paddleCenter = paddleX + paddleWidth / 2;
                let ballCenter = ball.x + ballSize / 2;
                let hitPoint = (ballCenter - paddleCenter) / (paddleWidth / 2);
                let angle = hitPoint * (Math.PI / 4);
                let currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
                ball.dx = currentSpeed * Math.sin(angle);
                ball.dy = -currentSpeed * Math.cos(angle);
                // let paddleCenter = paddleX + (paddleWidth / 2);
                // let ballCenter = ballX + (ballSize / 2);
                // let hitPoint = ballCenter - paddleCenter;
                // ballDX = hitPoint * 0.15;
            }
            //cham gach
            let map = levels[currentLevel];
            for (let r = 0; r < map.length; r++) {
                for (let c = 0; c < map[0].length; c++) {
                    let br = bricks[r][c];
                    if (br && br.color > 0) {
                        if (ball.x + ballSize > br.x && ball.x < br.x + brickWidth && ball.y + ballSize > br.y && ball.y < br.y + brickHeight) {
                            ball.dy = -ball.dy;
                            br.color--;
                            if (br.color === 0) {
                                brokenBricks++;
                                br.element.style.display = "none";
                                spawnItem(br.x, br.y);
                                if (brokenBricks === totalBricks) {
                                    setTimeout(() => {
                                        alert("You win! You can go to next level")
                                        loadLevels(currentLevel + 1);
                                    }, 10)
                                }
                            } else {
                                br.element.style.backgroundColor = getBricksColor(br.color);
                            }
                        }
                    }
                }
            }
        });
        items.forEach((item, index) => {
            item.y += item.dy;
            item.element.style.left = item.x + 'px';
            item.element.style.top = item.y + 'px';
            //kiem tra va cham voi paddle
            if (item.y + itemSize >= boardHeight - paddleHeight - 50 && item.y <= boardHeight - 50 && item.x + itemSize >= paddleX && item.x <= paddleX + paddleWidth) {
                if(item.type === "green") {
                    spawnBalls();
                } else if (item.type === "red") {
                    gameOver();
                } else if (item.type === "yellow") {
                    applyYellowEffect();
                }
                item.element.remove();
                items.splice(index, 1);
            }
            else if (item.y >= boardHeight) {
                item.element.remove();
                items.splice(index, 1);
            }
        });
    }

    paddle.style.left = paddleX + 'px';
    paddle.style.bottom = '50px';
    paddle.style.width = paddleWidth + 'px';
    paddle.style.height = paddleHeight + 'px';

    balls.forEach(b => {
        b.element.style.left = b.x + 'px';
        b.element.style.top = b.y + 'px';
        b.element.style.width = ballSize + 'px';
        b.element.style.height = ballSize + 'px';
    });

    requestAnimationFrame(loop);
}

loadLevels(0);
loop();
