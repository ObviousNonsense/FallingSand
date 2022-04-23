class Zone extends Placeable {}


class ParticleSink extends Zone {

    static BASE_COLOR = '#000000';

    constructor(x, y, world) {
        super(x, y, world);
        this.indestructible = true;
        // this.color = color(this.color);
        // this.color.setAlpha(0.25);
    }

    show(ctx, pixelsPerParticle) {
        this.need_to_show = true;
        super.show(ctx, pixelsPerParticle);
    }

    update() {
        let p = this.world.getParticle(this.x, this.y);
        if (p) {
            this.world.deletePlaceable(p);
        }

        super.update();
    }
}


class ParticleSource extends Zone {

    constructor(x, y, world, sourceType) {
        super(x, y, world);
        this.particleType = sourceType;
        this.color = color(sourceType.BASE_COLOR);
        this.color.setAlpha(0.5);
    }

    show(ctx, pixelsPerParticle, drawOver) {
        if (drawOver) {
            this.need_to_show = true;
        }
        super.show(ctx, pixelsPerParticle);
    }

    update() {
        if (random() < 0.25) {
            this.world.addParticle(new this.particleType(this.x, this.y, this.world));
        }

        super.update();
    }
}