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
        for (let x = 0; x < this.gridWidth; x++) {
            this.grid[x] = [];
            for (let y = 0; y < this.gridHeight; y++) {

                // Initialize most grid positions to false
                // this.grid[x][y] = false;
                this.addParticle(new AirParticle(x, y, this));

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
        let oldP = this.grid[p.x][p.y];
        if (oldP != false){
            this.particleSet.delete(oldP);
        }
        this.grid[p.x][p.y] = p;
        this.particleSet.add(p);
    }

    /**
    * @param {Particle} p
    */
    deleteParticle(p) {
        // this.grid[p.x][p.y] = false;
        this.addParticle(new AirParticle(p.x, p.y, this));
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
        let oldP = this.grid[newX, newY];
        oldP.x = p.x;
        oldP.y = p.y;
        this.grid[p.x][p.y] = this.grid[newX, newY];
        // this.grid[p.x][p.y] = false;
        this.grid[newX][newY] = p;
    }

    updateAllParticles() {
        for (let p of this.particleSet) {
            p.update();
        }
    }

    showAllParticles(ctx, pixelsPerParticle) {
        for (let p of this.particleSet) {
            p.show(ctx, pixelsPerParticle);
        }
    }
}