class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        grid[x][y] = this;
        particleSet.add(this);
        // this.color = color(0);
        this.color = '#FFFFFF';
        this.weight = Infinity;
        this.indestructible = false;
        // this.show();
    }

    show = function () {
        // fill(this.color);

        // rect(this.x * pixelsPerParticle,
        //     this.y * pixelsPerParticle,
        //     pixelsPerParticle,
        //     pixelsPerParticle);
        canvasContext.fillStyle = this.color;
        canvasContext.fillRect(this.x * pixelsPerParticle,
            this.y * pixelsPerParticle,
            pixelsPerParticle,
            pixelsPerParticle);
    }

    update = function () {
        return false;
    }

    tryGridPosition = function (x, y, trySwap = true) {
        let p = grid[x][y];
        if (!p) {
            this.moveToGridPosition(x, y);
            return true;
        }
        else if (!p.interact(this)) {
            if (trySwap && y > this.y && random() > p.weight / this.weight) {
                // if (random() > p.weight/this.weight){
                this.displaceParticle(p);
                return true;
                // }
            }
        }
        return false;
    }

    moveToGridPosition = function (x, y) {
        grid[this.x][this.y] = false;
        this.x = x;
        this.y = y;
        grid[x][y] = this;
    }

    displaceParticle = function (otherParticle) {
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

    interact = function (otherParticle) {
        return false;
    }
}


class BlackHoleParticle extends Particle {
    constructor(x, y) {
        super(x, y);
        this.color = '#000000';
        this.indestructible = true;
        this.neighbourList = [
            [-1, -1],
            [-1, +1],
            [+1, -1],
            [+1, +1]
        ]
    }

    // interact = function (otherParticle) {
    //     particleSet.delete(otherParticle);
    //     grid[otherParticle.x][otherParticle.y] = false;
    //     return true;
    // }

    update = function() {
        let d = random(this.neighbourList);
        let neighbour = grid[this.x + d[0]][this.y + d[1]];
        if (neighbour && !neighbour.indestructible) {
            particleSet.delete(neighbour);
            grid[neighbour.x][neighbour.y] = false;
        }
    }
}


class WallParticle extends Particle {
    constructor(x, y) {
        super(x, y);
        this.color = '#626770';
        // this.color = color(65, 68, 74);
    }
}


class IndestructibleWallParticle extends WallParticle {
    constructor(x, y) {
        super(x, y);
        this.color = '#6C727B';
        this.indestructible = true;
    }
}


class SandParticle extends Particle {
    constructor(x, y) {
        super(x, y);
        this.color = '#e5b55f';
        // this.color = color(229, 181, 95);
        this.weight = 2;
        this.updateList = [
            [+0, +1],
            [-1, +1],
            [+1, +1]
        ]

        if (random() > 0.5) {
            let temp = this.updateList[1];
            this.updateList[1] = this.updateList[2];
            this.updateList[2] = temp;
        }
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
        // this.color = color(43, 100, 195);
        this.color = '#2b64c3';
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