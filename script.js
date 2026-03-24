window.onload = function(){
    var blockSize = 30;
    var ctx;
    var delay = 100;
    var snakee;
    var applee;
    var score;
    var timeout;
    var canvasWidth, canvasHeight, widthInBlocks, heightInBlocks;

    function computeSize() {
        var maxW = Math.min(900, window.innerWidth - 20);
        var maxH = Math.min(600, window.innerHeight - 180);
        blockSize = Math.floor(Math.min(maxW / 30, maxH / 20));
        canvasWidth = blockSize * 30;
        canvasHeight = blockSize * 20;
        widthInBlocks = 30;
        heightInBlocks = 20;
    }

    init();

    function init(){
        computeSize();
        var canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.display = "block";
        document.getElementById('canvas-wrapper').appendChild(canvas);
        ctx = canvas.getContext('2d');
        snakee = new Snake([[6,4],[5,4],[4,4]], "right");
        applee = new Apple([10,10]);
        score = 0;
        refreshCanvas();
    }

    function drawBackground(){
        // Fond principal
        ctx.fillStyle = "#16213e";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Grille subtile
        ctx.strokeStyle = "rgba(255,255,255,0.03)";
        ctx.lineWidth = 1;
        for(var x = 0; x <= canvasWidth; x += blockSize){
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvasHeight);
            ctx.stroke();
        }
        for(var y = 0; y <= canvasHeight; y += blockSize){
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvasWidth, y);
            ctx.stroke();
        }
    }

    function refreshCanvas(){
        snakee.advance();
        if(snakee.checkCollision()){
            gameOver();
        } else {
            if(snakee.isEatingApple(applee)){
                score++;
                snakee.ateApple = true;
                do {
                    applee.setNewPosition();
                } while(applee.isOnSnake(snakee));
            }
            drawBackground();
            drawScore();
            snakee.draw();
            applee.draw();
            timeout = setTimeout(refreshCanvas, delay);
        }
    }

    function gameOver(){
        // Overlay semi-transparent
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        var cx = canvasWidth / 2;
        var cy = canvasHeight / 2;

        // Panneau central
        var panelW = blockSize * 20;
        var panelH = blockSize * 7;
        var panelX = cx - panelW / 2;
        var panelY = cy - panelH / 2;
        ctx.fillStyle = "rgba(15, 15, 26, 0.9)";
        roundRect(ctx, panelX, panelY, panelW, panelH, 16);
        ctx.fill();
        ctx.strokeStyle = "rgba(74, 222, 128, 0.5)";
        ctx.lineWidth = 2;
        roundRect(ctx, panelX, panelY, panelW, panelH, 16);
        ctx.stroke();

        // Texte Game Over
        ctx.font = "bold " + Math.floor(blockSize * 2) + "px Orbitron, sans-serif";
        ctx.fillStyle = "#ef4444";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("GAME OVER", cx, cy - blockSize * 1.2);

        // Score final
        ctx.font = "bold " + Math.floor(blockSize * 0.9) + "px Orbitron, sans-serif";
        ctx.fillStyle = "#4ade80";
        ctx.fillText("Score : " + score, cx, cy + blockSize * 0.3);

        // Sous-titre
        ctx.font = Math.floor(blockSize * 0.7) + "px sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fillText("Espace ou bouton Rejouer", cx, cy + blockSize * 1.6);

        ctx.restore();
    }

    function restart(){
        snakee = new Snake([[6,4],[5,4],[4,4]], "right");
        applee = new Apple([10,10]);
        score = 0;
        clearTimeout(timeout);
        refreshCanvas();
    }

    function drawScore(){
        var padding = blockSize * 0.4;
        var fontSize = Math.floor(blockSize * 0.75);

        ctx.save();
        ctx.font = "bold " + fontSize + "px Orbitron, sans-serif";
        ctx.fillStyle = "rgba(74, 222, 128, 0.9)";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText("SCORE  " + score, padding, padding);
        ctx.restore();
    }

    // Utilitaire : rectangle arrondi
    function roundRect(ctx, x, y, w, h, r){
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

    function drawSnakeSegment(position, isHead){
        var x = position[0] * blockSize;
        var y = position[1] * blockSize;
        var r = Math.max(3, blockSize * 0.25);
        var inset = 2;

        ctx.save();
        if(isHead){
            // Dégradé vert vif pour la tête
            var grad = ctx.createLinearGradient(x, y, x + blockSize, y + blockSize);
            grad.addColorStop(0, "#22c55e");
            grad.addColorStop(1, "#16a34a");
            ctx.fillStyle = grad;
        } else {
            var grad = ctx.createLinearGradient(x, y, x + blockSize, y + blockSize);
            grad.addColorStop(0, "#4ade80");
            grad.addColorStop(1, "#22c55e");
            ctx.fillStyle = grad;
        }
        roundRect(ctx, x + inset, y + inset, blockSize - inset * 2, blockSize - inset * 2, r);
        ctx.fill();

        // Reflet lumineux
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        roundRect(ctx, x + inset, y + inset, blockSize - inset * 2, (blockSize - inset * 2) * 0.45, r);
        ctx.fill();
        ctx.restore();
    }

    function Snake(body, direction){
        this.body = body;
        this.direction = direction;
        this.ateApple = false;
        this.draw = function(){
            for(var i = this.body.length - 1; i >= 0; i--){
                drawSnakeSegment(this.body[i], i === 0);
            }
        };
        this.advance = function(){
            var nextPosition = this.body[0].slice();
            switch(this.direction){
                case "left":  nextPosition[0] -= 1; break;
                case "right": nextPosition[0] += 1; break;
                case "down":  nextPosition[1] += 1; break;
                case "up":    nextPosition[1] -= 1; break;
                default: throw("Invalid Direction");
            }
            this.body.unshift(nextPosition);
            if(!this.ateApple) this.body.pop();
            else this.ateApple = false;
        };
        this.setDirection = function(newDirection){
            var allowed;
            switch(this.direction){
                case "left": case "right": allowed = ["up","down"]; break;
                case "down": case "up":   allowed = ["left","right"]; break;
                default: return;
            }
            if(allowed.indexOf(newDirection) > -1){ this.direction = newDirection; }
        };
        this.checkCollision = function(){
            var head = this.body[0];
            var rest = this.body.slice(1);
            if(head[0] < 0 || head[0] > widthInBlocks - 1 || head[1] < 0 || head[1] > heightInBlocks - 1) return true;
            for(var i = 0; i < rest.length; i++){
                if(head[0] === rest[i][0] && head[1] === rest[i][1]) return true;
            }
            return false;
        };
        this.isEatingApple = function(appleToEat){
            var head = this.body[0];
            return head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1];
        };
    }

    function Apple(position){
        this.position = position;
        this.draw = function(){
            ctx.save();
            var radius = blockSize / 2 - 2;
            var cx = this.position[0] * blockSize + blockSize / 2;
            var cy = this.position[1] * blockSize + blockSize / 2;

            // Halo
            var halo = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius * 1.5);
            halo.addColorStop(0, "rgba(239, 68, 68, 0.3)");
            halo.addColorStop(1, "rgba(239, 68, 68, 0)");
            ctx.fillStyle = halo;
            ctx.beginPath();
            ctx.arc(cx, cy, radius * 1.5, 0, Math.PI * 2);
            ctx.fill();

            // Corps de la pomme
            var grad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.1, cx, cy, radius);
            grad.addColorStop(0, "#fca5a5");
            grad.addColorStop(0.4, "#ef4444");
            grad.addColorStop(1, "#991b1b");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();

            // Reflet
            ctx.fillStyle = "rgba(255,255,255,0.35)";
            ctx.beginPath();
            ctx.ellipse(cx - radius * 0.25, cy - radius * 0.3, radius * 0.3, radius * 0.18, -0.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        };
        this.setNewPosition = function(){
            this.position = [
                Math.round(Math.random() * (widthInBlocks - 1)),
                Math.round(Math.random() * (heightInBlocks - 1))
            ];
        };
        this.isOnSnake = function(snakeToCheck){
            for(var i = 0; i < snakeToCheck.body.length; i++){
                if(this.position[0] === snakeToCheck.body[i][0] && this.position[1] === snakeToCheck.body[i][1]) return true;
            }
            return false;
        };
    }

    // --- Clavier ---
    document.onkeydown = function(e){
        var dir;
        switch(e.key){
            case "ArrowLeft":  dir = "left";  break;
            case "ArrowUp":    dir = "up";    break;
            case "ArrowRight": dir = "right"; break;
            case "ArrowDown":  dir = "down";  break;
            case ' ': restart(); return;
        }
        if(dir) snakee.setDirection(dir);
    };

    // --- Boutons directionnels ---
    document.getElementById('btn-up').addEventListener('click',    function(){ snakee.setDirection("up"); });
    document.getElementById('btn-down').addEventListener('click',  function(){ snakee.setDirection("down"); });
    document.getElementById('btn-left').addEventListener('click',  function(){ snakee.setDirection("left"); });
    document.getElementById('btn-right').addEventListener('click', function(){ snakee.setDirection("right"); });
    document.getElementById('btn-restart').addEventListener('click', function(){ restart(); });

    // --- Swipe tactile ---
    var touchStartX = 0, touchStartY = 0, touchOnDpad = false;

    document.addEventListener('touchstart', function(e){
        touchOnDpad = !!e.target.closest('#dpad');
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', function(e){
        if(touchOnDpad) return;
        var dx = e.changedTouches[0].clientX - touchStartX;
        var dy = e.changedTouches[0].clientY - touchStartY;
        var absDx = Math.abs(dx), absDy = Math.abs(dy);
        if(absDx < 20 && absDy < 20) return; // tap court ignoré
        if(absDx > absDy) snakee.setDirection(dx > 0 ? "right" : "left");
        else              snakee.setDirection(dy > 0 ? "down" : "up");
    }, { passive: true });
};
