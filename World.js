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
                this.temperatureGrid[x][y] = INITIAL_TEMPERATURE;
                // this.temperatureGrid[x][y] = map(x, 0, this.gridWidth, -100, 1000);
                // this.temperatureGrid[x][y] = map(random(), 0, 1, -100, 100);
                // this.temperatureGrid[x][y] = (x - y) < 10 ? -100 : 1000;


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

    getTemperature(x, y) {
        return this.temperatureGrid[x][y];
    }

    addHeat(x, y, deltaT) {
        this.temperatureGrid[x][y] += deltaT;
        this.temperatureGrid[x][y] = min(this.temperatureGrid[x][y], MAX_TEMP);
        this.temperatureGrid[x][y] = max(this.temperatureGrid[x][y], MIN_TEMP);

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

        // swap temperatures too
        let temp = this.temperatureGrid[newX][newY];
        this.temperatureGrid[newX][newY] = this.temperatureGrid[p.x][p.y];
        this.temperatureGrid[p.x][p.y] = temp;
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
                if (((x * this.gridWidth + y + this.tempUpdateOffset) % temperatureUpdateResolution) === 0) {
                    let t = this.temperatureGrid[x][y];
                    let [r, g, b] = [0, 0, 0];
                    let [t0, t1, t2, t3, t4] = [MIN_TEMP, -50, ROOM_TEMP, 400, MAX_TEMP];
                    let [c0, c1, c2, c3, c4] = [
                        [0, 0, 61],
                        [0, 35, 124],
                        [59, 74, 194],
                        [255, 107, 60],
                        [255, 255, 0]
                    ]

                    function mapColors(t1, t2, c1, c2) {
                        r = map(t, t1, t2, c1[0], c2[0]);
                        g = map(t, t1, t2, c1[1], c2[1]);
                        b = map(t, t1, t2, c1[2], c2[2]);
                        return [r, g, b]
                    }

                    if (t <= t1) {
                        [r, g, b] = mapColors(t0, t1, c0, c1)
                    }
                    else if (t > t1 && t <= t2) {
                        [r, g, b] = mapColors(t1, t2, c1, c2)
                    }
                    else if (t > t2 && t <= t3) {
                        [r, g, b] = mapColors(t2, t3, c2, c3)
                    }
                    else if (t > t3 && t <= t4) {
                        [r, g, b] = mapColors(t3, t4, c3, c4)
                    }
                    colorMode(RGB);
                    ctx.fillStyle = color(r, g, b);
                    ctx.fillRect(x * pixelsPerParticle,
                        y * pixelsPerParticle,
                        pixelsPerParticle,
                        pixelsPerParticle);
                    colorMode(HSB);
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

    updateTemperature() {
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                let thisParticle = this.particleGrid[x][y];
                // let heatCond = thisParticle ? thisParticle.heatConductivity : AIR_HEAT_COND;
                let sum = 0;
                let count = 0;
                for (let dx = -1; dx < 2; dx++) {
                    for (let dy = -1; dy < 2; dy++) {
                        let insideX = x + dx < this.gridWidth && x + dx >= 0;
                        let insideY = y + dy < this.gridHeight && y + dy >= 0;
                        if (insideX && insideY) {

                            let upBias = thisParticle ? 1 : 1 + 0.5 * dy;
                            let p = this.particleGrid[x + dx][y + dy];
                            let heatCond = p ? p.heatConductivity : AIR_HEAT_COND;
                            sum += upBias * heatCond * (
                                this.temperatureGrid[x + dx][y + dy]
                                - this.temperatureGrid[x][y]
                            );
                            count++;
                        }
                    }
                }
                this.temperatureGrid[x][y] += sum / count;
            }
        }
    }
}