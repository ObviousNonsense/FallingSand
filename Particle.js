class Particle {

    static BASE_COLOR = '#FFFFFF';
    static BURNING_COLOR = '#E65C00';

    /**
    * @param {World} world
    */
    constructor(x, y, world) {
        this.x = x;
        this.y = y;
        this.world = world;

        let c = this.constructor.BASE_COLOR;
        this.color = adjustHSBofString(c, 1, random(0.95, 1.05), random(0.95, 1.05));
        this.originalColor = this.color;

        this.flammability = 0;
        this.fuel = Infinity;
        this.originalFuel = 0;
        this._burning = false;
    }

    /**
    * @param {boolean} b
    */
    set burning(b) {
        if (b) {
            if (!this._burning) {
                this.originalFuel = max(this.originalFuel, this.fuel);
                this.originalColor = this.color;
            }
        }
        else {
            if (this instanceof FluidParticle) {
                this.color = this.originalColor;
            }
            else {
                this.color = adjustHSBofString(
                    this.originalColor, 1, 1, map(this.fuel, 0, this.originalFuel, 0.2, 1));
            }
        }
        this._burning = b;
    }

    get burning() {
        return this._burning;
    }

    show(ctx, pixelsPerParticle) {
        // Using native javascript for drawing on the canvas is faster than
        // using p5's methods
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x * pixelsPerParticle,
            this.y * pixelsPerParticle,
            pixelsPerParticle,
            pixelsPerParticle);
    }

    update() {
        if (this.burning) {
            this.burn();
        }

        return false;
    }

    delete() {
        this.world.deleteParticle(this);
    }

    burn() {
        this.color = this.burningFlickerColor();

        let neighbourList = [
            [0, -1],
            [+1, 0],
            [-1, 0],
            [0, +1],
        ];

        for (let i = 0; i < neighbourList.length; i++) {
            let d = neighbourList[i];
            let xn = this.x + d[0];
            let yn = this.y + d[1];
            let neighbour = this.world.grid[xn][yn];
            if (neighbour.flammability > 0 && !neighbour.burning) {
                if (neighbour.flammability * (1 - 0.5 * d[1]) > random()) {
                    neighbour.burning = true;
                }
            }
            else if (!neighbour && this.fuel > 0) {
                if (d[1] < 1
                    && this.world.grid[this.x - 1][this.y].burning
                    && this.world.grid[this.x + 1][this.y].burning
                ) {
                    this.world.addParticle(
                        new FlameParticle(xn, yn, this.world,
                            random([...Array(this.fuel).keys()]))
                    );
                }
            }
            else if (neighbour instanceof WaterParticle) {
                neighbour.evaporate();
                this.burning = false;
                break;
            }
        }

        this.fuel--;
        if (this.fuel < 0) {
            this.delete();
        }
    }

    burningFlickerColor() {
        return adjustHSBofString(this.constructor.BURNING_COLOR,
            random(0.95, 1.05), random(0.95, 1.05), random(0.95, 1.05));
    }
}


class ParticleSink extends Particle {

    static BASE_COLOR = '#000000';

    constructor(x, y, world) {
        super(x, y, world);
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
        let neighbour = this.world.grid[this.x + d[0]][this.y + d[1]];
        if (neighbour && !neighbour.indestructible) {
            neighbour.delete();
        }

        super.update();
    }
}


class WallParticle extends Particle {

    static BASE_COLOR = '#626770';

    constructor(x, y, world) {
        super(x, y, world);
    }
}


class WoodParticle extends Particle {
    static BASE_COLOR = '#C17736'

    constructor(x, y, world) {
        super(x, y, world);
        this.flammability = 0.1;
        this.fuel = 200;
    }
}


class IndestructibleWallParticle extends WallParticle {

    static BASE_COLOR = '#6C727B';

    // These are the particles used to define the border of the world so I don't
    // have to worry about checking the edges of the array. They are
    // indesctructible so sinks can't destroy them.
    constructor(x, y, world) {
        super(x, y, world);
        this.indestructible = true;
    }
}


class ParticleSource extends Particle {

    constructor(x, y, world, sourceType) {
        super(x, y, world);
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
        let neighbour = this.world.grid[xn][yn];
        if (!neighbour) {
            this.world.addParticle(new this.particleType(xn, yn, this.world));
        }

        super.update();
    }
}


class FlameParticle extends Particle {
    static BASE_COLOR = '#ff7700'
    static BURNING_COLOR = '#ff7700'

    constructor(x, y, world, fuel = 0) {
        super(x, y, world);
        this.fuel = fuel;
        this.burning = true;
        this.fresh = true;
        this.color = this.constructor.BASE_COLOR;
    }

    update() {
        // this.color = adjustHSBofString(this.constructor.BASE_COLOR,
        //     random(0.9, 1.1), random(0.95, 1.05), random(0.5, 1.5));

        if (!this.fresh) {
            super.update();
        }
        else {
            this.fresh = false;
        }

        if (!this.burning) {
            this.delete();
        }
    }

    burningFlickerColor() {
        return adjustHSBofString(this.constructor.BURNING_COLOR,
            random(0.9, 1.1), random(0.95, 1.05), random(0.5, 1.5));
    }
}


class PlantParticle extends Particle {

    static BASE_COLOR = '#338A1B';

    constructor(x, y, world) {
        super(x, y, world);
        this.color_watered = this.color;
        this.color_dry = adjustHSBofString(this.color, 0.8, 1, 1);
        this.watered = false;
        this.fuel = 35;
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
            this.flammability = 0.025;
        }
        else {
            this.color = this.color_dry;
            this.flammability = 0.10;
        }
    }

    get watered() {
        return this._watered;
    }

    update() {
        let d = random(this.neighbourList.slice(0, 4));
        let xn = this.x + d[0];
        let yn = this.y + d[1];
        let neighbour = this.world.grid[xn][yn];
        if (this.watered) {
            if (!neighbour) {
                // Check if the empty space I want to grow into doesn't have too
                // many neighbours
                let count = 0;
                for (let i = 0; i < this.neighbourList.length; i++) {
                    let dn = this.neighbourList[i];
                    let xnn = xn + dn[0];
                    let ynn = yn + dn[1];
                    if (this.world.grid[xnn][ynn] instanceof PlantParticle) {
                        count++;
                    }
                }
                if (count < 3) {
                    // If it doesn't, grow into it
                    if (random() > 0.5) {
                        this.world.addParticle(new PlantParticle(xn, yn, this.world));
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
                neighbour.delete();
                this.watered = true;
            }
        }

        super.update();
    }
}


class MoveableParticle extends Particle {
    // Parent for particles that can move and displace each other.
    constructor(x, y, world) {
        super(x, y, world);
        this.weight = Infinity;
        this.hasBeenDisplaced = false;
    }

    update() {
        this.hasBeenDisplaced = false;
        super.update();
    }

    tryGridPosition(x, y, trySwap = true) {

        // Do we move up or down in empty space?
        let rises = this.weight < AIR_WEIGHT;

        let p = this.world.grid[x][y];
        // Move to the given position if it's empty.
        if (!p) {
            if (
                // Whether to check if we're heavier than air or air's heavier than us
                // depends on if we move up or down
                (!rises && (this.weight * random() > AIR_WEIGHT))
                ||
                (rises && (AIR_WEIGHT * random() > this.weight))
            ) {
                this.moveToGridPosition(x, y);
                return true;
            }
        }
        // If there's something there maybe displace it as long as it's not the
        // thing that's trying to displace us and it's moveable
        else if (
            trySwap
            && p instanceof MoveableParticle
            && !p.hasBeenDisplaced
        ) {
            // Whether to check if we're heavier than it or it's heavier than us
            // depends on if we move up or down
            if (
                (!rises && (this.weight * random() > p.weight))
                ||
                (rises && (p.weight * random() > this.weight))
            ) {
                this.displaceParticle(p, rises);
                return true;
            }
        }
        // We failed to move to the given grid position
        return false;
    }

    moveToGridPosition(x, y) {
        this.world.moveParticleInGrid(this, x, y);
        this.x = x;
        this.y = y;
    }

    displaceParticle(otherParticle, rises) {
        // Move another particle so we can take its spot
        let tempX = otherParticle.x;
        let tempY = otherParticle.y;
        let dir = (rises) ? -1 : +1;

        // Positions relative to the other particle to try moving it to
        let positionsToTry = [
            [+1, +0],
            [-1, +0],
            [+1, dir],
            [-1, dir]
        ]

        let moved = false;
        for (let i = 0; i < positionsToTry.length; i++) {
            let p = positionsToTry[i];
            // Get the other particle to try the potential grid positions.
            moved = otherParticle.tryGridPosition(
                otherParticle.x + p[0],
                otherParticle.y + p[1],
                false
            );
            if (moved) {
                break;
            }
        }

        if (moved) {
            // If we got the other particle to move, then we can take its spot.
            this.moveToGridPosition(tempX, tempY);
        }
        else {
            // Worst case we put the other particle in our position and then move to
            // its position
            // TEMP: Probably add a swapParticles method in World
            otherParticle.moveToGridPosition(this.x, this.y);
            this.x = tempX;
            this.y = tempY;
            this.world.grid[tempX][tempY] = this;
        }

        otherParticle.hasBeenDisplaced = true;
    }
}


class SandParticle extends MoveableParticle {

    static BASE_COLOR = '#e5b55f';

    constructor(x, y, world) {
        super(x, y, world);
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
            let u = this.updateList[i];
            moved = this.tryGridPosition(this.x + u[0], this.y + u[1]);
            if (moved) {
                super.update();
                return moved;
            }
        }
        super.update();
        return moved;

    }
}


class GunpowderParticle extends SandParticle {
    static BASE_COLOR = '#222222'

    constructor(x, y, world) {
        super(x, y, world);
        this.flammability = 0.7;
        this.fuel = 25;
    }
}


class FluidParticle extends MoveableParticle {

    constructor(x, y, world) {
        super(x, y, world);
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
                this.x + Math.sign(this.weight - AIR_WEIGHT) * u[0],
                this.y + Math.sign(this.weight - AIR_WEIGHT) * u[1],
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
                super.update();
                return moved;
            }
        }
        super.update();
        return moved;

    }
}


class WaterParticle extends FluidParticle {

    static BASE_COLOR = '#2b64c3';

    constructor(x, y, world) {
        super(x, y, world);
        this.weight = 60;
    }

    update() {
        super.update(true);
    }

    evaporate() {
        this.world.replaceParticle(this, new SteamParticle(this.x, this.y, this.world));
    }
}


class SteamParticle extends FluidParticle {
    static BASE_COLOR = '#c0d2f2'
    static BASE_CONDENSATION_COUNTDOWN = 100;

    constructor(x, y, world) {
        super(x, y, world);
        this.weight = 0.5;
        this.initialConensationCountdown = round(this.constructor.BASE_CONDENSATION_COUNTDOWN * random(0.7, 1.3));
        this.condensationCountdown = this.initialConensationCountdown;
    }

    update() {
        let lastY = this.y;
        super.update(true);

        if (this.condensationCountdown <= 0) {
            this.condensate();
        }

        if (this.y === lastY) {
            this.condensationCountdown--;
        }
        else {
            this.condensationCountdown = this.initialConensationCountdown;
        }
    }

    condensate() {
        this.world.replaceParticle(this, new WaterParticle(this.x, this.y, this.world))
    }
}


class HydrogenParticle extends FluidParticle {
    static BASE_COLOR = '#9379a8';

    constructor(x, y, world) {
        super(x, y, world);
        this.weight = 0.2;
        this.flammability = 0.95;
        this.fuel = 6;
    }

    update() {
        super.update(true);
    }
}

class GasolineParticle extends FluidParticle {
    static BASE_COLOR = '#6922A2'

    constructor(x, y, world) {
        super(x, y, world);
        this.weight = 50;
        this.flammability = 0.95;
        this.fuel = 15;
    }

    update() {
        super.update(true);
    }
}


adjustHSBofString = function (colorString, scaleH, scaleS, scaleB) {
    let c = color(colorString);
    colorMode(HSB);
    c = color(hue(c) * scaleH, saturation(c) * scaleS, brightness(c) * scaleB);
    // colorMode(RGB);
    return c.toString('#rrggbb')
}