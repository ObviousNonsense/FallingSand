let pixelsPerParticle = 4;
let grid = [];
let nextGrid = [];
let falseGrid = [];
let gridWidth = 100;
let gridHeight = 100;
var frHistory = [];
var frHistoryIndex = 0;
var fr;

function setup() {
	// frameRate(5);

	createCanvas(pixelsPerParticle * gridWidth,
		pixelsPerParticle * gridHeight);
	pixelDensity(1);

	fr = createP('');
	frHistory = new Array(60);

	for (let i = 0; i < gridWidth; i++) {
		grid[i] = [];
		nextGrid[i] = [];
		for (let j = 0; j < gridHeight; j++) {
			grid[i][j] = false;
			nextGrid[i][j] = false;
		}
	}

	// new SandParticle(gridWidth / 2, 0);
	// new SandParticle(gridWidth / 2, 1);
	// new SandParticle(gridWidth / 2, 2);
}

function draw() {
	background(0);
	new SandParticle(2, 0);
	new SandParticle(75, 50);

	for (let j = gridHeight - 1; j >= 0; j--) {
		for (let i = 0; i < gridWidth; i++) {
			let p = grid[i][j];
			if (p) {
				p.show();
				p.update();
			}
			else {
				nextGrid[i][j] = false;
			}
		}
	}

	var temp = grid;
	grid = nextGrid;
	nextGrid = temp;

	fr.html(floor(averageFrameRate()));
    // noLoop();

    function averageFrameRate() {
        frHistory[frHistoryIndex] = frameRate();
        frHistoryIndex += 1;
        if (frHistoryIndex >= frHistory.length) {
            frHistoryIndex = 0;
        }

        sum = 0;
        for (var i = 0; i < frHistory.length; i++) {
            sum += frHistory[i];
        }
        return sum/frHistory.length;
    }
}


function SandParticle(i, j) {
	this.row = j;
	this.col = i;
	grid[i][j] = this;

	this.show = function () {
		noStroke();
		fill(229, 181, 95);
		rect(this.col * pixelsPerParticle,
			this.row * pixelsPerParticle,
			pixelsPerParticle,
			pixelsPerParticle);
	}

	this.update = function () {
		if (this.row + 1 < gridHeight) {
			if (!nextGrid[this.col][this.row + 1]) {
				// console.log(this.col + ", " + this.row);
				this.updateGridPosition(this.col, this.row + 1);
			}
			else if (this.col - 1 >= 0 && !nextGrid[this.col - 1][this.row + 1]) {
				this.updateGridPosition(this.col - 1, this.row + 1);
			}
			else if (this.col + 1 < gridWidth && !nextGrid[this.col + 1][this.row + 1]) {
				this.updateGridPosition(this.col + 1, this.row + 1);
			}
			else {
				nextGrid[this.col][this.row] = this;
			}
		}
		else {
			nextGrid[this.col][this.row] = this;
		}
	}

	this.updateGridPosition = function (i, j) {
		nextGrid[this.col][this.row] = false;
		this.row = j;
		this.col = i;
		nextGrid[i][j] = this;
	}
}
