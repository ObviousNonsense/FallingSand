class World {
    constructor(gridWidth, gridHeight) {
        this.reset(gridWidth, gridHeight);
    }

    reset(gridWidth, gridHeight) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.placeableSet = new Set();
        this.initializeEmptyGrids();
        this.tempUpdateOffset = 0;
    }

    initializeEmptyGrids() {
        this.particleGrid = [];
        this.redrawGrid = [];
        this.zoneGrid = [];
        this.temperatureGrid = [];
        for (let x = 0; x < this.gridWidth; x++) {
            this.particleGrid[x] = [];
            this.redrawGrid[x] = [];
            this.zoneGrid[x] = [];
            this.temperatureGrid[x] = [];
            for (let y = 0; y < this.gridHeight; y++) {

                // Initialize most grid positions to false
                this.particleGrid[x][y] = false;
                this.redrawGrid[x][y] = true;
                this.zoneGrid[x][y] = false;
                // this.temperatureGrid[x][y] = INITIAL_TEMPERATURE;
                // this.temperatureGrid[x][y] = map(x, 0, this.gridWidth, -100, 100);
                // this.temperatureGrid[x][y] = map(random(), 0, 1, -100, 100);
                this.temperatureGrid[x][y] = x < 50 ? -100 : 1000;


                // Initialize boundaries to indestructible walls so I don't ever
                // have to check if we're looking outside the array bounds
                if (
                    y === 0 || y === this.gridHeight - 1
                    || x === 0 || x === this.gridWidth - 1
                ) {
                    this.addParticle(new IndestructibleWallParticle(x, y, this));
                }
            }
        }
        // this.temperatureGrid[50][50] = 1000;
    }

    getParticle(x, y) {
        return this.particleGrid[x][y];
    }

    getPlaceable(x, y) {
        if (this.zoneGrid[x][y]) {
            return this.zoneGrid[x][y];
        }
        else {
            return this.getParticle(x, y);
        }
    }

    /**
    * @param {Placeable} p
    */
    addPlaceable(p, replace = false) {
        if (p instanceof Particle) {
            this.addParticle(p, replace);
        }
        else if (p instanceof Zone) {
            this.addZone(p, replace);
        }
    }

    addZone(p, replace = false) {
        if (this.zoneGrid[p.x][p.y]) {
            if (replace) {
                this.placeableSet.delete(this.zoneGrid[p.x][p.y]);
            }
            else {
                return;
            }
        }
        this.zoneGrid[p.x][p.y] = p;
        this.placeableSet.add(p);
    }

    /**
    * @param {Particle} p
    */
    addParticle(p, replace = false) {
        if (this.getParticle(p.x, p.y)) {
            if (replace) {
                this.placeableSet.delete(this.getParticle(p.x, p.y));
            }
            else {
                return;
            }
        }
        this.particleGrid[p.x][p.y] = p;
        this.placeableSet.add(p);
    }

    /**
    * @param {Placeable} p
    */
    deletePlaceable(p) {
        if (p instanceof Particle) {
            this.particleGrid[p.x][p.y] = false;
        }
        else if (p instanceof Zone) {
            this.zoneGrid[p.x][p.y] = false;
        }
        this.redrawGrid[p.x][p.y] = true;
        this.placeableSet.delete(p);
    }

    /**
    * @param {Particle} p
    */
    moveParticleInGrid(p, newX, newY, deleteOldSpace = true) {
        if (deleteOldSpace) {
            this.particleGrid[p.x][p.y] = false;
            this.redrawGrid[p.x][p.y] = true;
        }
        this.particleGrid[newX][newY] = p;
    }

    updateAll() {
        for (let p of this.placeableSet) {
            p.update();
        }
        this.updateTemperature();
    }

    forceShowAllPlaceables() {
        for (let p of this.placeableSet) {
            p.need_to_show = true;
        }
    }

    showAllPlaceables(ctx, pixelsPerParticle) {
        // for (let p of this.particleSet) {
        //     p.show(ctx, pixelsPerParticle);
        // }
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                let drawn = false;
                let p = this.particleGrid[x][y];
                if (p) {
                    drawn = p.need_to_show;
                    p.show(ctx, pixelsPerParticle);
                }
                else if (this.redrawGrid[x][y]) {
                    ctx.fillStyle = BACKGROUND_COLOR;
                    ctx.fillRect(x * pixelsPerParticle,
                        y * pixelsPerParticle,
                        pixelsPerParticle,
                        pixelsPerParticle);
                    this.redrawGrid[x][y] = false;
                    drawn = true;
                }

                let z = this.zoneGrid[x][y];
                if (z) {
                    z.show(ctx, pixelsPerParticle, drawn);
                }
            }
        }
    }

    showTemperature(ctx, pixelsPerParticle) {
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                if (this.redrawGrid[x][y]) {
                    let t = this.temperatureGrid[x][y];
                    let r = 0;
                    let g = 0;
                    let b = 0;
                    if (t <= ROOM_TEMP) {
                        r = map(t, MIN_TEMP, ROOM_TEMP, 0, 127);
                        g = map(t, MIN_TEMP, ROOM_TEMP, 0, 127);
                        b = map(t, MIN_TEMP, ROOM_TEMP, 255, 128);
                    }
                    else {
                        r = map(t, ROOM_TEMP, MAX_TEMP, 128, 255);
                        g = map(t, ROOM_TEMP, MAX_TEMP, 127, 0);
                        b = map(t, ROOM_TEMP, MAX_TEMP, 128, 0);
                    }
                    // if (x === 0 && y === 0) {
                    //     console.log(b);
                    // }
                    colorMode(RGB);
                    ctx.fillStyle = color(r, g, b);
                    ctx.fillRect(x * pixelsPerParticle,
                        y * pixelsPerParticle,
                        pixelsPerParticle,
                        pixelsPerParticle);

                    this.redrawGrid[x][y] = false;
                }
            }
        }
    }

    updateTemperature() {
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                // if (this.particleGrid[x][y]) {
                    //this.particleGrid[x][y].updateTemperature();
                // }
                // else {
                    let sum = 0;
                    let count = 0;
                    for (let dx = -1; dx < 2; dx++) {
                        for (let dy = -1; dy < 2; dy++) {
                            if (x + dx < this.gridWidth
                                && x + dx >= 0
                                && y + dy < this.gridHeight
                                && y + dy >= 0) {

                                    sum += AIR_HEAT_COND * (
                                        this.temperatureGrid[x + dx][y + dy] - this.temperatureGrid[x][y]);
                                    count++;
                                }
                            }
                        }
                        this.temperatureGrid[x][y] += sum / count;
                // }
                if (((x * this.gridWidth + y + this.tempUpdateOffset) % temperatureUpdateResolution) === 0) {
                    this.redrawGrid[x][y] = true;
                }
            }
        }

        if (this.tempUpdateOffset > temperatureUpdateResolution) {
            this.tempUpdateOffset = 0;
        }
        else {
            this.tempUpdateOffset++;
        }
    }
}