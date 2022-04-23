class Placeable {

    static BASE_COLOR = '#FFFFFF';

    /**
    * @param {World} world
    */
    constructor(x, y, world) {
        this.x = x;
        this.y = y;
        this.world = world;
        this.color = this.constructor.BASE_COLOR;
    }

    update() {
        return false;
    }

    /**
     * @param {Color} c
     */
    set color(c) {
        this._color = c;
        this.need_to_show = true;
    }

    get color() {
        return this._color;
    }

    /**
     * @param {int} val
     */
    set x(val) {
        this._x = val;
        this.need_to_show = true;
    }

    get x() {
        return this._x;
    }

    /**
     * @param {int} val
     */
        set y(val) {
        this._y = val;
        this.need_to_show = true;
    }

    get y() {
        return this._y;
    }

    show(ctx, pixelsPerParticle) {
        if (this.need_to_show) {
            // Using native javascript for drawing on the canvas is faster than
            // using p5's methods
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x * pixelsPerParticle,
                this.y * pixelsPerParticle,
                pixelsPerParticle,
                pixelsPerParticle);
            this.need_to_show = false;
        }
    }

    delete() {
        this.world.deletePlaceable(this);
    }
}