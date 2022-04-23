class World {
    constructor(gridWidth, gridHeight) {
        this.reset(gridWidth, gridHeight);
    }

    reset(gridWidth, gridHeight) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.particleSet = new Set();
        this.initializeEmptyGrids();
    }

    initializeEmptyGrids() {
        this.particleGrid = [];
        this.redrawGrid = [];
        this.zoneGrid = [];
        for (let x = 0; x < this.gridWidth; x++) {
            this.particleGrid[x] = [];
            this.redrawGrid[x] = [];
            this.zoneGrid[x] = [];
            for (let y = 0; y < this.gridHeight; y++) {

                // Initialize most grid positions to false
                this.particleGrid[x][y] = false;
                this.redrawGrid[x][y] = true;
                this.zoneGrid[x][y] = false;

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

    /**
    * @param {Placeable} p
    */
    addPlaceable(p) {
        if (p instanceof Particle) {
            this.addParticle(p);
        }
        else if (p instanceof Zone) {
            this.zoneGrid[p.x][p.y] = p;
        }
    }

    /**
    * @param {Particle} p
    */
    addParticle(p, replace = false) {
        if (this.getParticle(p.x, p.y)) {
            if (replace) {
                this.particleSet.delete(this.getParticle(p.x, p.y));
            }
            else {
                return;
            }
        }
        this.particleGrid[p.x][p.y] = p;
        this.particleSet.add(p);
    }

    /**
    * @param {Particle} p
    */
    deleteParticle(p) {
        this.particleGrid[p.x][p.y] = false;
        this.redrawGrid[p.x][p.y] = true;
        this.particleSet.delete(p);
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

    updateAllParticles() {
        for (let p of this.particleSet) {
            p.update();
        }
    }

    showAllParticles(ctx, pixelsPerParticle) {
        // for (let p of this.particleSet) {
        //     p.show(ctx, pixelsPerParticle);
        // }
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                let p = this.particleGrid[x][y];
                if (p) {
                    this.particleGrid[x][y].show(ctx, pixelsPerParticle);
                }
                else if (this.redrawGrid[x][y]) {
                    ctx.fillStyle = '#333333';
                    ctx.fillRect(x * pixelsPerParticle,
                        y * pixelsPerParticle,
                        pixelsPerParticle,
                        pixelsPerParticle);
                    this.redrawGrid[x][y] = false;
                }
            }
        }
    }
}