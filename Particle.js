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

    update = function () { }

    tryGridPosition = function (x, y) {
        let p = grid[x][y];
        if (!p) {
            this.moveToGridPosition(x, y);
            return true;
        }
        else if (this.y > y && p.weight < this.weight) {
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
        otherParticle.moveToGridPosition(this.x, this.y);
        this.x = tempX;
        this.y = tempY;
        grid[tempX][tempY] = this;
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
                return;
            }
        }
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
            [+1, +0],
            [-1, +0]
        ]
    }

    update = function () {
        let moved = false;

        for (let i = 0; i < this.updateList.length; i++) {
            // while (!moved) {
            let u = this.updateList[i];
            moved = this.tryGridPosition(this.x + u[0], this.y + u[1]);
            if (moved) {
                return;
            }
        }
    }
}