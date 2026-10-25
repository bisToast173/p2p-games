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

let bombs = [];
let isStun = false;

const effectsContainer = document.getElementById("effects-container");
let activeEffects = {
    yellow: { timeLeft: 0, timer: null, name: "Thu nhỏ", color: "#ffbb33" },
    gray: {timeLeft: 0, timer: null, name: "Ăn gạch xám", color: "#808080"},
    purple: {timeLeft: 0, timer: null, name: "Trúng độc", color: "#6d109a"}
};

let isPlay = false;

const pauseBtn = document.getElementById("btn-pause")
const restartBtn = document.getElementById("btn-restart");

const levels = [
        [[1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0]],

        [[0, 2, 2, 2, 2, 2, 2, 0],
        [2, 1, 1, 1, 1, 1, 1, 2],
        [2, 1, 1, 1, 1, 1, 1, 2],
        [2, 1, 1, 1, 1, 1, 1, 2],
        [0, 2, 2, 2, 2, 2, 2, 0]],

        [[0, 0, 0, 3, 3, 0, 0, 0],
        [0, 0, 2, 2, 2, 2, 0, 0],
        [0, 2, 1, 1, 1, 1, 2, 0],
        [3, 1, 1, 1, 1, 1, 1, 3],
        [0, 2, 1, 1, 1, 1, 2, 0],
        [0, 0, 2, 2, 2, 2, 0, 0]],

        [[3, 3, 0, 0, 0, 0, 3, 3],
        [3, 3, 2, 2, 2, 2, 3, 3],
        [2, 2, 1, 1, 1, 1, 2, 2],
        [2, 2, 1, 1, 1, 1, 2, 2],
        [3, 3, 2, 2, 2, 2, 3, 3],
        [3, 3, 0, 0, 0, 0, 3, 3]],

        [[3, 3, 3, 3, 3, 3, 3, 3],
        [3, 2, 2, 2, 2, 2, 2, 3],
        [3, 2, 1, 1, 1, 1, 2, 3],
        [3, 2, 1, 1, 1, 1, 2, 3],
        [4, 2, 2, 2, 2, 2, 2, 4],
        [0, 2, 4, 4, 4, 4, 2, 0]],

        [[3, 3, 0, 3, 3, 0, 3, 3],
        [2, 2, 4, 2, 2, 4, 2, 2],
        [1, 1, 4, 1, 1, 4, 1, 1],
        [1, 1, 4, 1, 1, 4, 1, 1],
        [2, 2, 4, 2, 2, 4, 2, 2],
        [3, 3, 0, 3, 3, 0, 3, 3],
        [4, 0, 4, 0, 0, 4, 0, 4],
        [0, 4, 0, 0, 0, 0, 4, 0]],

        [[0, 0, 4, 4, 4, 4, 0, 0],
        [4, 3, 3, 3, 3, 3, 3, 4],
        [4, 3, 3, 3, 3, 3, 3, 4],
        [4, 3, 3, 5, 5, 3, 3, 4],
        [4, 3, 3, 3, 3, 3, 3, 4],
        [4, 3, 3, 3, 3, 3, 3, 4],
        [0, 4, 4, 4, 4, 4, 4, 0]]
];

const brickWidth = 70;
const brickHeight = 20;
const brickPadding = 20;
const brickMarginTop = 50;
let bricks = [];

let currentLevel = 0;
let totalBricks = 0;
let brokenBricks = 0;

let ammo = 0;
let lasers = [];
const ammoDisplay = document.getElementById("ammo");

const levelButtons = document.querySelectorAll(".level");

document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    if (isPlay && currentLevel >= 5 && ammo > 0) {
        ammo--;
        ammoDisplay.innerText = ammo;
        let laser = document.createElement("div");
        laser.classList.add("laser");
        let lx = paddleX + paddleWidth / 2 - 2;
        let ly = boardHeight - 50 - paddleHeight - 15;
        laser.style.left = lx + "px";
        laser.style.top = ly + "px";
        gameBoard.appendChild(laser);
        lasers.push({ x: lx, y: ly, element: laser });
    }
});

function applyPurpleEffect() {
    let effect = activeEffects.purple;
    effect.timeLeft = 7;
    gameBoard.classList.add("flash-active");

    if (effect.timer) clearInterval(effect.timer);
    effect.timer = setInterval(() => {
        effect.timeLeft--;
        updateTimerDisplay();
        if (effect.timeLeft <= 0) {
            clearInterval(effect.timer);
            effect.timer = null;
            gameBoard.classList.remove("flash-active");
        }
    }, 1000);
    updateTimerDisplay();
}

function applyGrayEffect() {
    let effect = activeEffects.gray;
    effect.timeLeft = 10;
    if(effect.timer) clearInterval(effect.timer);
    effect.timer = setInterval(() => {
        effect.timeLeft--;
        updateTimerDisplay();
        if (effect.timeLeft <= 0) {
            clearInterval(effect.timer);
            effect.timer = null;
        }
    }, 1000);
    updateTimerDisplay();
}

function applyYellowEffect() {
    let effect = activeEffects.yellow;

    paddleWidth = 70;
    effect.timeLeft = 10;

    if (effect.timer) clearInterval(effect.timer);

    effect.timer = setInterval(() => {
        effect.timeLeft--;
        updateTimerDisplay();

        if (effect.timeLeft <= 0) {
            clearInterval(effect.timer);
            effect.timer = null;

            paddleWidth = 120;
            if (paddleX + paddleWidth > boardWidth) {
                paddleX = boardWidth - paddleWidth;
            }
        }
    }, 1000);

    updateTimerDisplay();
}
function clearEffects() {
    for (let key in activeEffects) {
        let effect = activeEffects[key];
        if (effect.timer) clearInterval(effect.timer);
        effect.timeLeft = 0;
        effect.timer = null;
        gameBoard.classList.remove("flash-active");
    }
    paddleWidth = 120;
    if (paddleX + paddleWidth > boardWidth) paddleX = boardWidth - paddleWidth;

    updateTimerDisplay();
}

function updateTimerDisplay() {
    effectsContainer.innerHTML = "";
    let hasEffect = false;
    for (let key in activeEffects) {
        let effect = activeEffects[key];
        if (effect.timeLeft > 0) {
            hasEffect = true;
            let seconds = effect.timeLeft < 10 ? "0" + effect.timeLeft : effect.timeLeft;
            let row = document.createElement("div");
            row.classList.add("effect-row");
            row.style.borderLeft = `4px solid ${effect.color}`;
            row.innerHTML = `<span>${effect.name}</span><span>00:${seconds}</span>`;
            effectsContainer.appendChild(row);
        }
        if (!hasEffect) {
            effectsContainer.innerHTML = `<span style="color: #aaa; font-size: 14px;">Không có</span>`;
        }
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
            gameBoard.appendChild(newBall);
            balls.push({
                element: newBall,
                x: baseBall.x,
                y: baseBall.y,
                dx: baseBall.dx * (i === 0 ? 1 : -1),
                dy: -Math.abs(baseBall.dy)
            });
        }
    }

    function spawnItem(x, y) {
        if (currentLevel === 0) return;
        if (Math.random() > 0.30) return;
        let rand = Math.random();
        let type = null;
        let color = null;

        if(currentLevel >= 5) {
            if (rand < 0.1) {
                type = "red";
                color = "red";
            } else if (rand < 0.3) {
                type = "gray";
                color = "#808080";
            } else if (rand < 0.45) {
                type = "yellow";
                color = "yellow";
            } else if (rand < 0.6) {
                type = "purple";
                color = "purple";
            } else if (rand < 0.75) {
                type = "cyan";
                color = "cyan";
            } else {
                type = "green";
                color = "green";
            }
        }

        else if (currentLevel >= 4) {
            if (rand < 0.15) {
                type = "red";
                color = "red";
            } else if (rand < 0.35) {
                type = "gray";
                color = "#808080";
            } else if (rand < 0.65) {
                type = "yellow";
                color = "yellow";
            } else {
                type = "green";
                color = "green";
            }
        }
        else if (currentLevel === 3) {
            if (rand < 0.20) {
                type = "red"; color = "red";
            } else if (rand < 0.50) {
                type = "yellow"; color = "yellow";
            } else {
                type = "green"; color = "green";
            }
        }
        else if (currentLevel === 2) {
            if (rand < 0.60) {
                type = "yellow"; color = "yellow";
            } else {
                type = "green"; color = "green";
            }
        }
        else {
            if (rand < 0.6) {
                type = "green"; color = "green";
            }

        }

        if (type) {
            let itemEl = document.createElement("div");
            itemEl.classList.add("item");
            itemEl.style.width = itemSize + "px";
            itemEl.style.height = itemSize + "px";
            itemEl.style.backgroundColor = color;
            itemEl.style.position = "absolute";
            itemEl.style.borderRadius = "50%";
            gameBoard.appendChild(itemEl);

            items.push({x: x + brickWidth / 2, y: y, dy: 3, type: type, element: itemEl});
        }
    }

    levelButtons.forEach((btn, index) => {
        btn.addEventListener("click", () => {
            loadLevels(index);
        });
    });

    function getBricksColor(type) {
        if (type === 5) return "purple";
        if (type === 4) return "#808080";
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

        for (let r = 0; r < rows; r++) {
            bricks[r] = []
            for (let c = 0; c < cols; c++) {
                let brickColor = map[r][c]
                if (brickColor > 0) {
                    if (brickColor !== 4) {
                        totalBricks++;
                    }
                    let brickX = c * (brickWidth + brickPadding) + marginL;
                    let brickY = r * (brickHeight + brickPadding) + brickMarginTop;

                    let brickElements = document.createElement("div");
                    brickElements.classList.add("brick");
                    brickElements.style.width = brickWidth + "px";
                    brickElements.style.height = brickHeight + "px";
                    brickElements.style.left = brickX + "px";
                    brickElements.style.top = brickY + "px";
                    brickElements.style.backgroundColor = getBricksColor(brickColor);
                    if (brickColor === 5) {
                        brickElements.style.border = "3px solid cyan";
                        brickElements.style.boxSizing = "border-box";
                    }
                    brickContainer.appendChild(brickElements);
                    brickContainer.appendChild(brickElements);
                    bricks[r][c] = {x: brickX, y: brickY, color: brickColor, element: brickElements};
                } else {
                    bricks[r][c] = null;
                }
            }
        }
    }

    restartBtn.addEventListener("click", () => {
        loadLevels(currentLevel);
    })

    function loadLevels(index) {
        currentLevel = index;

        balls.forEach(b => b.element.remove());
        items.forEach(item => item.element.remove());

        lasers.forEach(l => l.element.remove());
        lasers = [];
        if (currentLevel >= 5) {
            ammo = 2;
        } else {
            ammo = 0;
        }
        ammoDisplay.innerText = ammo;

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
        if (!isPlay) {
            isPlay = true;
            overlay.style.display = "none";
        }
    })
    gameBoard.addEventListener("mousemove", ev => {
        if (!isPlay) return;
        if (isStun) return;
        let mouseX = ev.clientX - gameBoard.getBoundingClientRect().left;
        if (mouseX > 0 && mouseX < boardWidth) {
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
    if (isPlay) {
        balls.forEach((ball, index) => {
            ball.x += ball.dx;
            ball.y += ball.dy;

            if (ball.x <= 0) { ball.x = 0; ball.dx = -ball.dx; }
            if (ball.x + ballSize >= boardWidth) { ball.x = boardWidth - ballSize; ball.dx = -ball.dx; }
            if (ball.y <= 0) { ball.y = 0; ball.dy = -ball.dy; }

            if (ball.y + ballSize >= boardHeight) {
                ball.element.remove();
                balls.splice(index, 1);
                if (balls.length === 0) gameOver();
            }

            if (ball.y + ballSize >= boardHeight - paddleHeight - 50 && ball.y <= boardHeight - 50 && ball.x + ballSize >= paddleX && ball.x <= paddleX + paddleWidth) {
                let paddleCenter = paddleX + paddleWidth / 2;
                let ballCenter = ball.x + ballSize / 2;
                let hitPoint = (ballCenter - paddleCenter) / (paddleWidth / 2);
                ball.dx = hitPoint * 3;
                if (Math.abs(ball.dx) < 0.5) ball.dx = hitPoint >= 0 ? 0.5 : -0.5;
                ball.dy = -Math.sqrt(16 - (ball.dx * ball.dx));
            }

            let map = levels[currentLevel];
            for (let r = 0; r < map.length; r++) {
                for (let c = 0; c < map[0].length; c++) {
                    let br = bricks[r][c];
                    if (br && br.color > 0) {
                        if (ball.x + ballSize > br.x && ball.x < br.x + brickWidth && ball.y + ballSize > br.y && ball.y < br.y + brickHeight) {
                            if (ball.dy > 0) ball.y = br.y - ballSize;
                            else ball.y = br.y + brickHeight;
                            ball.dy = -ball.dy;

                            if (br.color === 5) {
                                let anyBlock = false;
                                for (let i = 0; i < map.length; i++) {
                                    for (let j = 0; j < map[0].length; j++) {
                                        if (bricks[i][j] && bricks[i][j].color > 0 && bricks[i][j].color < 4) {
                                            anyBlock = true;
                                            break;
                                        }
                                    }
                                    if (anyBlock) break;
                                }
                                if (!anyBlock) {
                                    if (br.bossHp === undefined) {
                                        br.bossHp = 10;
                                        br.element.style.border = "none"
                                    }
                                    br.bossHp--;

                                    if (br.bossHp <= 0) {
                                        br.color = 0;
                                        brokenBricks++;
                                        br.element.style.display = "none";
                                        spawnItem(br.x, br.y);
                                        if (brokenBricks >= totalBricks) {
                                            setTimeout(() => { alert("Chúc mừng đã phá đảo trò chơi"); loadLevels(0); }, 10);
                                        }
                                    }
                                }
                            }
                            else if (br.color === 4) {
                                if (activeEffects.gray && activeEffects.gray.timeLeft > 0) {
                                    br.color = 0;
                                    br.element.style.display = "none";
                                    spawnItem(br.x, br.y);
                                }
                            } else {
                                br.color--;
                                if (br.color === 0) {
                                    brokenBricks++;
                                    br.element.style.display = "none";
                                    spawnItem(br.x, br.y);
                                    if (brokenBricks >= totalBricks) {
                                        setTimeout(() => {
                                            alert("You win! You can go to next level");
                                            loadLevels(currentLevel + 1);
                                        }, 10);
                                    }
                                } else {
                                    br.element.style.backgroundColor = getBricksColor(br.color);
                                }
                            }
                            break;
                        }
                    }
                }
            }
        });

        for (let i = lasers.length - 1; i >= 0; i--) {
            let l = lasers[i];
            l.y -= 8;
            l.element.style.top = l.y + "px";

            // Xóa laser nếu bay ra khỏi màn hình
            if (l.y < 0) {
                l.element.remove();
                lasers.splice(i, 1);
                continue;
            }

            // Xét va chạm giữa laser và gạch
            let hit = false;
            let map = levels[currentLevel];
            for (let r = 0; r < map.length; r++) {
                for (let c = 0; c < map[0].length; c++) {
                    let br = bricks[r][c];
                    if (br && br.color > 0) {
                        if (l.x > br.x && l.x < br.x + brickWidth && l.y > br.y && l.y < br.y + brickHeight) {
                            hit = true;
                            if (br.color === 5) {
                                let anyBlock = false;
                                for (let i = 0; i < map.length; i++) {
                                    for (let j = 0; j < map[0].length; j++) {
                                        if (bricks[i][j] && bricks[i][j].color > 0 && bricks[i][j].color < 4) {
                                            anyBlock = true;
                                            break;
                                        }
                                    }
                                    if (anyBlock) break;
                                }

                                if (!anyBlock) {
                                    if (br.bossHp === undefined) {
                                        br.bossHp = 10;
                                        br.element.style.border = "none"
                                    }
                                    br.bossHp--;

                                    if (br.bossHp <= 0) {
                                        br.color = 0;
                                        brokenBricks++;
                                        br.element.style.display = "none";
                                        if (brokenBricks >= totalBricks) {
                                            setTimeout(() => { alert("Chúc mừng đã phá đảo trò chơi"); loadLevels(0); }, 10);
                                        }
                                    }
                                }
                            }
                            if (br.color === 4) {
                                br.color = 0;
                                br.element.style.display = "none";
                                spawnItem(br.x, br.y);
                            } else {
                                br.color = 0;
                                brokenBricks++;
                                br.element.style.display = "none";
                                spawnItem(br.x, br.y);
                                if (brokenBricks >= totalBricks) {
                                    setTimeout(() => {
                                        alert("You win! You can go to next level");
                                        loadLevels(currentLevel + 1);
                                    }, 10);
                                }
                            }
                            break;
                        }
                    }
                }
                if (hit) break;
            }

            if (hit) {
                l.element.remove();
                lasers.splice(i, 1);
            }
        }
        if (currentLevel === 6) {
            if (Math.random() < 0.008) {
                let bombEl = document.createElement("div");
                bombEl.style.position = "absolute";
                bombEl.style.width = "20px";
                bombEl.style.height = "20px";
                bombEl.style.backgroundColor = "black";
                bombEl.style.borderRadius = "50%";
                bombEl.style.boxShadow = "0 0 10px red";
                gameBoard.appendChild(bombEl);

                bombs.push({ x: Math.random() * (boardWidth - 20), y: 0, element: bombEl, dy: 3 });
            }

            // Xử lý bom rơi
            bombs.forEach((bomb, index) => {
                bomb.y += bomb.dy;
                bomb.element.style.left = bomb.x + "px";
                bomb.element.style.top = bomb.y + "px";
                if (bomb.y + 20 >= boardHeight - paddleHeight - 50 && bomb.y <= boardHeight - 50 && bomb.x + 20 >= paddleX && bomb.x <= paddleX + paddleWidth) {
                    bomb.element.remove();
                    bombs.splice(index, 1);
                    isStun = true;
                    paddle.style.backgroundColor = "gray";
                    setTimeout(() => {
                        isStun = false;
                        paddle.style.backgroundColor = "";
                    }, 1500);
                } else if (bomb.y > boardHeight) {
                    bomb.element.remove();
                    bombs.splice(index, 1);
                }
            });
        }
        items.forEach((item, index) => {
            item.y += item.dy;
            item.element.style.left = item.x + 'px';
            item.element.style.top = item.y + 'px';

            if (item.y + itemSize >= boardHeight - paddleHeight - 50 && item.y <= boardHeight - 50 && item.x + itemSize >= paddleX && item.x <= paddleX + paddleWidth) {
                if (item.type === "green") spawnBalls();
                else if (item.type === "red") gameOver();
                else if (item.type === "yellow") applyYellowEffect();
                else if (item.type === "gray") applyGrayEffect();
                else if (item.type === "purple") applyPurpleEffect();
                else if (item.type === "cyan") {
                    ammo++;
                    ammoDisplay.innerText = ammo;
                }

                item.element.remove();
                items.splice(index, 1);
            } else if (item.y >= boardHeight) {
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