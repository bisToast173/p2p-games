const gameBoard = document.getElementById("main");
const brickContainer = document.getElementById("bricks");
const paddle = document.getElementById("paddle");
const ball = document.getElementById("ball");
const overlay = document.getElementById("overlay")

const boardWidth = gameBoard.clientWidth;
const boardHeight = gameBoard.clientHeight;

const paddleWidth = 120;
const paddleHeight = 12;
let paddleX = (boardWidth - paddleWidth) / 2;

const ballSize = 14;
let balls = [];
let items = [];
const itemSize = 20;

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

        [[3, 3, 3, 3, 3, 3, 3, 3],
        [2, 2, 1, 1, 1, 1, 2, 2],
        [2, 2, 1, 1, 1, 1, 2, 2],
        [2, 2, 1, 1, 1, 1, 2, 2],
        [2, 2, 2, 1, 1, 2, 2, 2],
        [3, 3, 3, 2, 2, 3, 3, 3]]
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
    if (currentLevel > 0 && Math.random() < 0.3) {
        let itemEl = document.createElement("div");
        itemEl.classList.add("item");
        itemEl.style.width = itemSize + "px";
        itemEl.style.height = itemSize + "px";
        itemEl.style.backgroundColor = "yellow";
        itemEl.style.position = "absolute";
        itemEl.style.borderRadius = "50%";
        gameBoard.appendChild(itemEl);

        items.push({ x: x + brickWidth / 2, y: y, dy: 3, element: itemEl });
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
    balls.forEach((b, index) => { if (index > 0) b.element.remove(); });
    items.forEach(item => item.element.remove());
    balls = [{
        element: document.getElementById("ball"),
        x: (boardWidth - ballSize) / 2, y: 350, dx: 4, dy: -4
    }];
    items = [];
    isPlay = false;
    overlay.style.display = "flex";
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
                    alert("Game Over");
                    document.location.reload();
                }
            }
            //va cham giua, trai, phai cua paddle
            if(ball.y + ballSize >= boardHeight - paddleHeight - 50 && ball.x + ballSize >= paddleX && ball.x <= paddleX + paddleWidth) {
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

            if (item.y + itemSize >= boardHeight - paddleHeight - 50 && item.x + itemSize >= paddleX && item.x <= paddleX + paddleWidth) {
                spawnBalls();
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
