class World {
    constructor(gridWidth, gridHeight) {
        this.reset(gridWidth, gridHeight);
    }

    reset(gridWidth, gridHeight) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.placeableSet = new Set();
        this.initializeEmptyGrids();
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
                this.temperatureGrid[x][y] = map(x, 0, this.gridWidth, -100, 1000);

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
                let t = this.temperatureGrid[x][y];
                let r = 0;
                let g = 0;
                let b = 0;
                if (t <= ROOM_TEMP) {
                    r = map(t, -100, ROOM_TEMP, 0, 127);
                    g = map(t, -100, ROOM_TEMP, 0, 127);
                    b = map(t, -100, ROOM_TEMP, 255, 128);
                }
                else {
                    r = map(t, ROOM_TEMP, 1000, 128, 255);
                    g = map(t, ROOM_TEMP, 1000, 127, 0);
                    b = map(t, ROOM_TEMP, 1000, 128, 0);
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
            }
        }
    }
}