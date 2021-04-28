class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        grid[x][y] = this;
        this.color = null;
    }

    show = function () {
        // noStroke();
        strokeWeight(1);
        stroke(0, 50);
        fill(this.color);
        rect(this.x * pixelsPerParticle,
            this.y * pixelsPerParticle,
            pixelsPerParticle,
            pixelsPerParticle);
    }

    update = function () { }

    updateGridPosition = function (x, y) {
        nextGrid[this.x][this.y] = false;
        this.y = y;
        this.x = x;
        nextGrid[x][y] = this;
    };
}

class WallParticle extends Particle {
    constructor(x, y) {
        super(x, y);
        this.color = color(65, 68, 74);
    }

    update = function () {
        nextGrid[this.x][this.y] = this;
    }
}


class SandParticle extends Particle {
    constructor(x, y) {
        super(x, y);
        this.color = color(229, 181, 95);
    }

    update = function () {
        if (!nextGrid[this.x][this.y + 1]) {
            // Move straight down
            this.updateGridPosition(this.x, this.y + 1);
        }
        else if (!nextGrid[this.x - 1][this.y + 1]) {
            // Move down and left
            this.updateGridPosition(this.x - 1, this.y + 1);
        }
        else if (!nextGrid[this.x + 1][this.y + 1]) {
            // Move down and right
            this.updateGridPosition(this.x + 1, this.y + 1);
        }
        else {
            // Don't move
            nextGrid[this.x][this.y] = this;
        }
    }
}


class WaterParticle extends Particle {
    constructor(x, y) {
        super(x, y);
        this.color = color(43, 100, 195);
    }

    update = function () {
        if (!nextGrid[this.x][this.y + 1]) {
            // Move straight down
            this.updateGridPosition(this.x, this.y + 1);
        }
        else if (!nextGrid[this.x - 1][this.y + 1]) {
            // Move down and left
            this.updateGridPosition(this.x - 1, this.y + 1);
        }
        else if (!nextGrid[this.x + 1][this.y + 1]) {
            // Move down and right
            this.updateGridPosition(this.x + 1, this.y + 1);
        }
        else if (!nextGrid[this.x + 1][this.y]) {
            // Move right
            this.updateGridPosition(this.x + 1, this.y);
        }
        else if (!nextGrid[this.x - 1][this.y]) {
            // Move left
            this.updateGridPosition(this.x - 1, this.y);
        }
        else {
            // Don't move
            nextGrid[this.x][this.y] = this;
        }
    }
}