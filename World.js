class World {
    constructor(gridWidth, gridHeight) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.particleSet = new Set();
        this.grid = [];
    }

    initializeEmptyGrid() {
        for (let x = 0; x < this.gridWidth; x++) {
            this.grid[x] = [];
            for (let y = 0; y < this.gridHeight; y++) {

                // Initialize most grid positions to false
                this.grid[x][y] = false;

                // Initialize boundaries to indestructible walls so I don't ever
                // have to check if we're looking outside the array bounds
                if (
                    y === 0 || y === this.gridHeight - 1
                    || x === 0 || x === this.gridWidth - 1
                ) {
                    this.addParticle(new IndestructibleWallParticle(x, y));
                }
            }
        }
    }

    addParticle(p) {
        this.grid[p.x][p.y] = p;
        this.particleSet.add(p);
    }

    deleteParticle(p) {
        this.grid[p.x][p.y] = false;
        this.particleSet.delete(p);
    }

    replaceParticle(oldP, newP) {
        this.grid[oldP.x][oldP.y] = newP;
        this.particleSet.delete(oldP);
        this.particleSet.add(newP);
    }

    updateAllParticles() {
        for (let p of this.particleSet) {
            p.update();
        }
    }

    showAllParticles() {
        for (let p of this.particleSet) {
            p.show();
        }
    }
}