class Zone extends Placeable {}


class ParticleSink extends Zone {

    static BASE_COLOR = '#000000';

    constructor(x, y, world) {
        super(x, y, world);
        this.indestructible = true;
        this.color = color(this.constructor.BASE_COLOR);
        this.color.setAlpha(0.25);
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
        let neighbour = this.world.getParticle(this.x + d[0], this.y + d[1]);
        if (neighbour && !neighbour.indestructible) {
            neighbour.delete();
        }

        super.update();
    }
}


class ParticleSource extends Zone {

    constructor(x, y, world, sourceType) {
        super(x, y, world);
        this.particleType = sourceType;
        this.color = color(sourceType.BASE_COLOR);
        this.color.setAlpha(0.25);
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
        let neighbour = this.world.getParticle(xn, yn);
        if (!neighbour) {
            this.world.addParticle(new this.particleType(xn, yn, this.world));
        }

        super.update();
    }
}