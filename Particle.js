class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        grid[x][y] = this;
        particleSet.add(this);
        this.color = color(0);
        this.weight = Infinity;
        this.show();
    }

    show = function () {
        noStroke();
        // strokeWeight(1);
        // stroke(0, 50);
        fill(this.color);
        rect(this.x * pixelsPerParticle,
            this.y * pixelsPerParticle,
            pixelsPerParticle,
            pixelsPerParticle);
    }

    update = function () {
        return false;
    }

    tryGridPosition = function (x, y, trySwap=true) {
        let p = grid[x][y];
        if (!p) {
            this.moveToGridPosition(x, y);
            return true;
        }
        else if (trySwap && y > this.y && p.weight < this.weight) {
            this.swapParticles(p);
            return true;
        }
        return false;
    }

    moveToGridPosition = function (x, y) {
        grid[this.x][this.y] = false;
        this.x = x;
        this.y = y;
        grid[x][y] = this;
    }

    swapParticles = function (otherParticle) {
        let tempX = otherParticle.x;
        let tempY = otherParticle.y;
        let positionsToTry = [
            [+1, +1],
            [-1, +1],
            [+1, +0],
            [-1, +0]
        ]
        // otherParticle.moveToGridPosition(this.x, this.y);
        let moved = false;
        for (let i = 0; i < positionsToTry.length; i++) {
            let p = positionsToTry[i];
            moved = otherParticle.tryGridPosition(this.x + p[0], this.y + p[1], false);
            if (moved) {
                // this.x = tempX;
                // this.y = tempY;
                // grid[tempX][tempY] = this;
                // this.update();
                this.moveToGridPosition(tempX, tempY);
                return;
            }
        }
        // this.moveToGridPosition(tempX, tempY);
        otherParticle.moveToGridPosition(this.x, this.y);
        this.x = tempX;
        this.y = tempY;
        grid[tempX][tempY] = this;
        // this.update();
    }
}

class WallParticle extends Particle {
    constructor(x, y) {
        super(x, y);
        this.color = color(65, 68, 74);
    }
}


class SandParticle extends Particle {
    constructor(x, y) {
        super(x, y);
        this.color = color(229, 181, 95);
        this.weight = 2;
        this.updateList = [
            [+0, +1],
            [-1, +1],
            [+1, +1]
        ]
    }

    update = function () {
        let moved = false;
        let i = 0;

        for (let i = 0; i < this.updateList.length; i++) {
            // while (!moved) {
            let u = this.updateList[i];
            moved = this.tryGridPosition(this.x + u[0], this.y + u[1]);
            if (moved) {
                return moved;
            }
        }
        return moved;
    }
}


class WaterParticle extends Particle {
    constructor(x, y) {
        super(x, y);
        this.color = color(43, 100, 195);
        this.weight = 1;
        this.updateList = [
            [+0, +1],
            [-1, +1],
            [+1, +1],
            [-1, +0],
            [+1, +0]
        ]
    }

    update = function () {
        let moved = false;

        for (let i = 0; i < this.updateList.length; i++) {
            let u = this.updateList[i];
            moved = this.tryGridPosition(this.x + u[0], this.y + u[1]);
            if (moved) {
                if (i === 4) {
                    let temp = this.updateList[3];
                    this.updateList[3] = this.updateList[4];
                    this.updateList[4] = temp;
                }
                return moved;
            }
        }
        return moved;
    }
}