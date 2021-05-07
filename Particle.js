class Particle {

    static BASE_COLOR = '#FFFFFF';

    constructor(x, y) {
        this.x = x;
        this.y = y;
        grid[x][y] = this;
        particleSet.add(this);

        this.flammability = 0;

        // this.color = this.constructor.BASE_COLOR;

        let c = this.constructor.BASE_COLOR;
        // this.color = random([
        //     c,
        //     adjustHSBofString(c, 1, 0.95, 1.05),
        //     adjustHSBofString(c, 1, 1.05, 0.95)
        // ]);
        this.color = adjustHSBofString(c, 1, random(0.95, 1.05), random(0.95, 1.05));
    }

    show() {
        // Using native javascript for drawing on the canvas is faster than
        // using p5's methods
        canvasContext.fillStyle = this.color;
        canvasContext.fillRect(this.x * pixelsPerParticle,
            this.y * pixelsPerParticle,
            pixelsPerParticle,
            pixelsPerParticle);
    }

    update() {
        return false;
    }

    delete() {
        particleSet.delete(this);
        grid[this.x][this.y] = false;
    }
}


class ParticleSink extends Particle {

    static BASE_COLOR = '#000000';

    constructor(x, y) {
        super(x, y);
        // this.color = '#000000';
        this.indestructible = true;
        this.neighbourList = [
            [0, -1],
            [0, +1],
            [+1, 0],
            [-1, 0]
        ]
    }

    update() {
        // Selects a random adjacent space. If there is a particle there, delete it.
        let d = random(this.neighbourList);
        let neighbour = grid[this.x + d[0]][this.y + d[1]];
        if (neighbour && !neighbour.indestructible) {
            // particleSet.delete(neighbour);
            // grid[neighbour.x][neighbour.y] = false;
            neighbour.delete();
        }
    }
}


class WallParticle extends Particle {

    static BASE_COLOR = '#626770';

    constructor(x, y) {
        super(x, y);
        // this.color = random(['#626770', '#575D69']);
        // this.color = color(65, 68, 74);
    }
}


class IndestructibleWallParticle extends WallParticle {

    static BASE_COLOR = '#6C727B';

    // These are the particles used to define the border of the world so I don't
    // have to worry about checking the edges of the array. They are
    // indesctructible so sinks can't destroy them.
    constructor(x, y) {
        super(x, y);
        // this.color = '#6C727B';
        this.indestructible = true;
    }
}


class ParticleSource extends Particle {

    constructor(x, y, sourceType) {
        super(x, y);
        this.particleType = sourceType;
        this.neighbourList = [
            [0, -1],
            [0, +1],
            [+1, 0],
            [-1, 0]
        ]
    }

    update() {
        // Pick a random adjacent space. If it's empty create the given type of
        // particle there.
        let d = random(this.neighbourList);
        let xn = this.x + d[0];
        let yn = this.y + d[1];
        let neighbour = grid[xn][yn];
        if (!neighbour) {
            new this.particleType(xn, yn);
        }
    }
}


class FireParticle extends Particle {
    static BASE_COLOR = '#e65c00'

    constructor(x, y, fuel = 0) {
        super(x, y);
        this.fuel = fuel;
        this.fresh = true;
        this.neighbourList = [
            [0, -1],
            [0, +1],
            [+1, 0],
            [-1, 0],
        ]
    }

    update() {
        if (!this.fresh) {
            for (let i = 0; i < this.neighbourList.length; i++) {
                let d = this.neighbourList[i];
                let xn = this.x + d[0];
                let yn = this.y + d[1];
                let neighbour = grid[xn][yn];
                if (neighbour.flammability > 0) {
                    if (neighbour.flammability > random()) {
                        new FireParticle(xn, yn, neighbour.fuelValue);
                        particleSet.delete(neighbour);
                    }
                }
                else if (neighbour instanceof WaterParticle) {
                    neighbour.evaporate();
                    this.fuel--;
                }
            }

            this.fuel--;
            if (this.fuel < 0) {
                this.delete();
            }
        }
        else {
            this.fresh = false;
        }
    }


}


class PlantParticle extends Particle {

    static BASE_COLOR = '#338A1B';

    constructor(x, y) {
        super(x, y);
        this.color_watered = this.color;
        this.color_dry = adjustHSBofString(this.color, 0.8, 1, 1);
        this.watered = false;
        this.fuelValue = 1;
        this.neighbourList = [
            [0, -1],
            [0, +1],
            [+1, 0],
            [-1, 0],
            [-1, -1],
            [+1, +1],
            [+1, -1],
            [-1, +1]
        ]
    }

    set watered(w) {
        this._watered = w;
        if (w) {
            this.color = this.color_watered;
            this.flammability = 0.4;
        }
        else {
            this.color = this.color_dry;
            this.flammability = 0.9;
        }
    }

    get watered() {
        return this._watered;
    }

    update() {
        let d = random(this.neighbourList.slice(0, 4));
        let xn = this.x + d[0];
        let yn = this.y + d[1];
        let neighbour = grid[xn][yn];
        if (this.watered) {
            if (!neighbour) {
                // Check if the empty space I want to grow into doesn't have too
                // many neighbours
                let count = 0;
                for (let i = 0; i < this.neighbourList.length; i++) {
                    let dn = this.neighbourList[i];
                    let xnn = xn + dn[0];
                    let ynn = yn + dn[1];
                    if (grid[xnn][ynn] instanceof PlantParticle) {
                        count++;
                    }
                }
                if (count < 3) {
                    // If it doesn't, grow into it
                    if (random() > 0.5) {
                        new PlantParticle(xn, yn);
                        this.watered = false;
                    }
                }
            }
            else if (neighbour instanceof PlantParticle) {
                if (!neighbour.watered) {
                    neighbour.watered = true;
                    this.watered = false;
                }
            }

        }
        else {
            // If we're not watered look for water
            if (neighbour instanceof WaterParticle) {
                // if the random neighbour is water, delete it and we are now watered
                // grid[xn][yn] = false;
                // particleSet.delete(neighbour);
                neighbour.delete();
                this.watered = true;
            }
        }
    }
}


class MoveableParticle extends Particle {
    // Parent for particles that can move and displace each other.
    constructor(x, y) {
        super(x, y);
        this.weight = Infinity;
    }

    tryGridPosition = function (x, y, trySwap = true) {
        // TODO: Rewrite this to work in any direction, accounting for weight
        // TODO: Maybe add a property that says a particle has already been
        // moved this frame and can't move again

        let p = grid[x][y];
        // Move to the given position if it's empty.
        if (!p) {
            if (this.weight * random() > Math.sign(this.weight)) {
                this.moveToGridPosition(x, y);
                return true;
            }
        }
        // If there's something there maybe displace it as long as it's not the
        // thing that's trying to displace us and it's moveable and we're
        // heavier than it with some randomness involved
        else if (
            trySwap
            && p instanceof MoveableParticle
            // && y > this.y
            && random() > p.weight / this.weight
        ) {
            this.displaceParticle(p);
            return true;
        }
        // We failed to move to the given grid position
        return false;
    }

    moveToGridPosition = function (x, y) {
        grid[this.x][this.y] = false;
        this.x = x;
        this.y = y;
        grid[x][y] = this;
    }

    displaceParticle = function (otherParticle) {
        // Move another particle so we can take its spot
        let tempX = otherParticle.x;
        let tempY = otherParticle.y;

        // Positions relative to this particle to try moving the other one to,
        // in order
        let positionsToTry = [
            [+1, +1],
            [-1, +1],
            [+1, +0],
            [-1, +0]
        ]

        let moved = false;
        for (let i = 0; i < positionsToTry.length; i++) {
            let p = positionsToTry[i];
            // Get the other particle to try the potential grid positions. TODO
            // I'm not actually sure if the "tryswap = false" (the last
            // arguement) is necessary here anymore.
            moved = otherParticle.tryGridPosition(this.x + p[0], this.y + p[1], false);
            if (moved) {
                // If we got the other particle to move, then we can take its spot.
                this.moveToGridPosition(tempX, tempY);
                return;
            }
        }

        // Worst case we put the other particle in our position and then move to
        // its position
        otherParticle.moveToGridPosition(this.x, this.y);
        this.x = tempX;
        this.y = tempY;
        grid[tempX][tempY] = this;

    }
}


class SandParticle extends MoveableParticle {

    static BASE_COLOR = '#e5b55f';

    constructor(x, y) {
        super(x, y);
        // this.color = random(['#e5b55f', '#D29D3F', '#E9BB69']);
        // this.color = color(229, 181, 95);
        this.weight = 90;
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

    update() {
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


class FluidParticle extends MoveableParticle {

    constructor(x, y) {
        super(x, y);
        this.updateList = [
            [+0, +1],
            [-1, +1],
            [+1, +1],
            [-1, +0],
            [+1, +0]
        ];
    }

    update(trySwap) {
        let moved = false;

        for (let i = 0; i < this.updateList.length; i++) {
            let u = this.updateList[i];
            moved = this.tryGridPosition(
                this.x + Math.sign(this.weight) * u[0],
                this.y + Math.sign(this.weight) * u[1],
                trySwap
            );

            // HACK If we moved with the last direction in the update list (left
            // or right), then swap that with the previous one (right or left,
            // respectively). Basically, when you hit a dead end, turn around
            // until you hit another one. Repeat.
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


class WaterParticle extends FluidParticle {

    static BASE_COLOR = '#2b64c3';

    constructor(x, y) {
        super(x, y);
        // this.color = color(43, 100, 195);
        // this.color = random(['#2b64c3', '#2E68CA', '#255FC0']);
        this.weight = 60;
    }

    update() {
        super.update(true);
    }

    evaporate() {
        particleSet.delete(this);
        new SteamParticle(this.x, this.y);
    }
}


class SteamParticle extends FluidParticle {
    static BASE_COLOR = '#c0d2f2'
    static BASE_CONDENSATION_COUNTDOWN = 120;

    constructor(x, y) {
        super(x, y);
        this.weight = -3;
        this.condensationCountdown = this.constructor.BASE_CONDENSATION_COUNTDOWN + random(-10, 10);
    }

    update() {
        let lastY = this.y;
        super.update(false);
        if (this.condensationCountdown <= 0) {
            this.condensate();
        }
        else {
            // this.condensationCountdown = this.constructor.BASE_CONDENSATION_COUNTDOWN;
        }
        if (this.y === lastY) {
            this.condensationCountdown--;
        }
    }

    condensate() {
        particleSet.delete(this);
        new WaterParticle(this.x, this.y);
    }
}


adjustHSBofString = function (colorString, scaleH, scaleS, scaleB) {
    let c = color(colorString);
    colorMode(HSB);
    c = color(hue(c) * scaleH, saturation(c) * scaleS, brightness(c) * scaleB);
    // colorMode(RGB);
    return c.toString('#rrggbb')
}