const gameBoard = document.getElementById("main");
const brickContainer = document.getElementById("bricks");
const paddle = document.getElementById("paddle");
const ball = document.getElementById("ball");

const boardWidth = gameBoard.clientWidth;
const boardHeight = gameBoard.clientHeight;

const paddleWidth = 120;
const paddleHeight = 12;
let paddleX = (boardWidth - paddleWidth) / 2;

const ballSize = 14;
let ballX = (boardWidth - ballSize) / 2;
let ballY = 350;
let speedX = 4;
let speedY = -4;

const brickRow = 5;
const brickCol = 8;
const brickWidth = 70;
const brickHeight = 20;
const brickPadding = 20;
const brickMarginTop = 50;
const totalBrickWidth = (brickCol * brickWidth) + ((brickCol - 1) * brickPadding);
const brickMarginLeft = (boardWidth - totalBrickWidth) / 2;
let isBreak = false;
let bricks = [];

function initBricks() {
    brickContainer.innerHTML = '';
    for(let c = 0; c < brickCol; c++) {
        bricks[c] = []
        for(let r = 0; r < brickRow; r++) {
            let brickX = c * (brickWidth + brickPadding) + brickMarginLeft;
            let brickY = r * (brickHeight + brickPadding) + brickMarginTop;
            let brickElements = document.createElement("div");
            brickElements.classList.add("brick");
            brickElements.style.width = brickWidth + "px";
            brickElements.style.height = brickHeight + "px";
            brickElements.style.left = brickX + "px";
            brickElements.style.top = brickY + "px";
            brickElements.style.backgroundColor = "green";
            brickContainer.appendChild(brickElements);
            bricks[c][r] = {x: brickX, y: brickY, status: isBreak, element: brickElements};
        }
    }
}

gameBoard.addEventListener("mousemove", ev => {
    let mouseX = ev.clientX - gameBoard.getBoundingClientRect().left;
    if(mouseX > 0 && mouseX < boardWidth) {
        paddleX = mouseX - paddleWidth / 2;
        if (paddleX < 0) paddleX = 0;
        if (paddleX > boardWidth - paddleWidth) paddleX = boardWidth - paddleWidth;
    }
});

function loop() {
    ballX += speedX;
    ballY += speedY;
    //va cham tuong
    if(ballX <= 0 || ballX + ballSize >= boardWidth) speedX = -speedX;
    if(ballY <= 0) speedY = -speedY;
    //roi xuong day
    if(ballY + ballSize >= boardHeight) {
        alert("Game Over")
        document.location.reload();
    }
    //va cham giua, trai, phai cua paddle
    if(ballY + ballSize >= boardHeight - paddleHeight - 50 && ballX + ballSize >= paddleX
    && ballX <= paddleX + paddleWidth) {
        let paddleCenter = paddleX + paddleWidth / 2;
        let ballCenter = ballX + ballSize / 2;
        let hitPoint = (ballCenter - paddleCenter) / (paddleWidth / 2);
        let angle = hitPoint * (Math.PI / 3);
        let currentSpeed = Math.sqrt(speedX * speedX + speedY * speedY);

        speedX = currentSpeed * Math.sin(angle);
        speedY = -currentSpeed * Math.cos(angle);
    }

    for(let c = 0; c < brickCol; c++) {
        for (let r = 0; r < brickRow; r++) {
            let br = bricks[c][r];
            if(!br.status) {
                if(ballX + ballSize > br.x && ballX < br.x + brickWidth && ballY + ballSize > br.y && ballY < br.y + brickHeight) {
                    speedY = -speedY;
                    br.status = true;
                    br.element.style.display = "none";
                }
            }
        }
    }

    paddle.style.left = paddleX + 'px';
    paddle.style.bottom = '50px';
    paddle.style.width = paddleWidth + 'px';
    paddle.style.height = paddleHeight + 'px';

    ball.style.left = ballX + 'px';
    ball.style.top = ballY + 'px';
    ball.style.width = ballSize + 'px';
    ball.style.height = ballSize + 'px';

    requestAnimationFrame(loop);
}

initBricks();
loop();
