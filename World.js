class World {
    constructor(gridWidth, gridHeight) {
        this.reset(gridWidth, gridHeight);
    }

    reset(gridWidth, gridHeight) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.particleSet = new Set();
        this.initializeEmptyGrid();
    }

    initializeEmptyGrid() {
        this.grid = [];
        this.redrawGrid = []
        for (let x = 0; x < this.gridWidth; x++) {
            this.grid[x] = [];
            this.redrawGrid[x] = [];
            for (let y = 0; y < this.gridHeight; y++) {

                // Initialize most grid positions to false
                this.grid[x][y] = false;
                this.redrawGrid[x][y] = true;

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

    /**
    * @param {Particle} p
    */
    addParticle(p) {
        this.grid[p.x][p.y] = p;
        this.particleSet.add(p);
    }

    /**
    * @param {Particle} p
    */
    deleteParticle(p) {
        this.grid[p.x][p.y] = false;
        this.redrawGrid[p.x][p.y] = true;
        this.particleSet.delete(p);
    }

    /**
    * @param {Particle} oldP
    * @param {Particle} newP
    */
    replaceParticle(oldP, newP) {
        this.grid[oldP.x][oldP.y] = newP;
        this.particleSet.delete(oldP);
        this.particleSet.add(newP);
    }

    /**
    * @param {Particle} p
    */
    moveParticleInGrid(p, newX, newY) {
        this.grid[p.x][p.y] = false;
        this.redrawGrid[p.x][p.y] = true;
        this.grid[newX][newY] = p;
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
                let p = this.grid[x][y];
                if (p) {
                    this.grid[x][y].show(ctx, pixelsPerParticle);
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