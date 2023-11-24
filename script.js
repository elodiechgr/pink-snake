window.onload = function () {
  canvasWidth = 900;
  canvasHeight = 600;
  const blockSize = 30;
  let ctx;
  let delay = 100;
  let snakee;
  let apple;
  const widthInBlocks = canvasWidth / blockSize;
  const heightInBlocks = canvasHeight / blockSize;
  let score;
  let timeout;

  init();

  function init() {
    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.border = "30px solid #E8AFA0";
    canvas.style.margin = "100px auto";
    canvas.style.display = "block";
    canvas.style.backgroundColor = "#FFF7EE";
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d");
    snakee = new Snake(
      [
        [6, 4],
        [5, 4],
        [4, 4],
        [3, 4],
        [2, 4],
      ],
      "right"
    );
    apple = new Apple([10, 10]);
    score = 0;
    refreshCanvas();
  }

  function refreshCanvas() {
    snakee.advance();
    if (snakee.checkCollision()) {
      gameOver();
    } else {
      if (snakee.isEatingApple(apple)) {
        score++;
        snakee.ateApple = true;
        do {
          apple.setNewPosition();
        } while (apple.isOnSnake(snakee));
      }
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      drawScore();
      snakee.draw();
      apple.draw();
      timeout = setTimeout(refreshCanvas, delay);
    }
  }

  function gameOver() {
    ctx.save();
    ctx.font = "bold 70px sans-serif";
    ctx.fillStyle = "#795344";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeStyle = "white";
    ctx.lineWidth = 5;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    ctx.fillText("Game Over ! ", centerX, centerY - 180);
    ctx.font = "bold 30px sans-serif";
    ctx.fillStyle = "#9E8479";
    ctx.fillText(
      "Appuyez sur la touche espace pour rejouer",
      centerX,
      centerY - 120
    );
    ctx.restore();
  }

  function restart() {
    snakee = new Snake(
      [
        [6, 4],
        [5, 4],
        [4, 4],
        [3, 4],
        [2, 4],
      ],
      "right"
    );
    apple = new Apple([10, 10]);
    score = 0;
    clearTimeout(timeout);
    refreshCanvas();
  }

  function drawScore() {
    ctx.save();
    ctx.font = "bold 100px sans-serif";
    ctx.fillStyle = "#B78178";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    ctx.fillText(score.toString(), centerX, centerY);
    ctx.restore();
  }

  function drawBlock(ctx, position) {
    const x = position[0] * blockSize;
    const y = position[1] * blockSize;
    ctx.fillRect(x, y, blockSize, blockSize);
  }

  function Snake(body, direction) {
    this.body = body;
    this.direction = direction;
    this.ateApple = false;
    this.draw = function () {
      ctx.save();
      ctx.fillStyle = "#DB0B32";
      for (let i = 0; i < this.body.length; i++) {
        drawBlock(ctx, this.body[i]);
      }
      ctx.restore();
    };

    this.advance = function () {
      const nextPosition = this.body[0].slice();
      switch (this.direction) {
        case "left":
          nextPosition[0] -= 1;
          break;
        case "right":
          nextPosition[0] += 1;
          break;
        case "down":
          nextPosition[1] += 1;
          break;
        case "up":
          nextPosition[1] -= 1;
          break;
        default:
          throw "Invalid Direction";
      }
      this.body.unshift(nextPosition);
      if (!this.ateApple) this.body.pop();
      else {
        this.ateApple = false;
      }
    };

    this.setDirection = function (newDirection) {
      let allowedDirections;
      switch (this.direction) {
        case "left":
        case "right":
          allowedDirections = ["up", "down"];
          break;
        case "down":
        case "up":
          allowedDirections = ["left", "right"];
          break;
        default:
          throw "Invalid Direction";
      }

      if (allowedDirections.indexOf(newDirection) > -1) {
        this.direction = newDirection;
      }
    };

    this.checkCollision = function () {
      let wallCollision = false;
      let snakeCollision = false;
      const head = this.body[0];
      const rest = this.body.slice(1);
      const snakeX = head[0];
      const snakeY = head[1];
      const minX = 0;
      const minY = 0;
      const maxX = widthInBlocks - 1;
      const maxY = heightInBlocks - 1;
      const isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX;
      const isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY;

      if (isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls) {
        wallCollision = true;
      }

      for (let i = 0; i < rest.length; i++) {
        if (snakeX === rest[i][0] && snakeY === rest[i][1]) {
          snakeCollision = true;
        }
      }

      return wallCollision || snakeCollision;
    };

    this.isEatingApple = function (appleToEat) {
      const head = this.body[0];
      if (
        head[0] === appleToEat.position[0] &&
        head[1] === appleToEat.position[1]
      ) {
        return true;
      } else {
        return false;
      }
    };
  }

  function Apple(position) {
    this.position = position;
    this.draw = function () {
      ctx.save();
      ctx.fillStyle = "#78A419";
      ctx.beginPath();
      const radius = blockSize / 2;
      const x = this.position[0] * blockSize + radius;
      const y = this.position[1] * blockSize + radius;
      ctx.arc(x, y, radius, 0, Math.PI * 2, true);
      ctx.fill();
      ctx.restore();
    };

    this.setNewPosition = function () {
      const newX = Math.round(Math.random() * (widthInBlocks - 1));
      const newY = Math.round(Math.random() * (heightInBlocks - 1));
      this.position = [newX, newY];
    };

    this.isOnSnake = function (snakeToCheck) {
      let isOnSnake = false;
      for (let i = 0; i < snakeToCheck.body.length; i++) {
        if (
          this.position[0] === snakeToCheck.body[i][0] &&
          this.position[1] === snakeToCheck.body[i][1]
        ) {
          isOnSnake = true;
        }
      }
      return isOnSnake;
    };
  }

  document.onkeydown = function handleKeyDown(e) {
    const key = e.keyCode;
    let newDirection;
    switch (key) {
      case 37:
        newDirection = "left";
        break;
      case 38:
        newDirection = "up";
        break;
      case 39:
        newDirection = "right";
        break;
      case 40:
        newDirection = "down";
        break;
      case 32:
        restart();
        return;
      default:
        return;
    }
    snakee.setDirection(newDirection);
  };
};
