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

	for (let x = 0; x < gridWidth; x++) {
		grid[x] = [];
		nextGrid[x] = [];
		for (let y = 0; y < gridHeight; y++) {
			if (y === gridHeight - 1 || x === 0 || x === gridWidth - 1) {
				grid[x][y] = new WallParticle(x, y);
			}
			else {
				grid[x][y] = false;
			}
			nextGrid[x][y] = false;
		}
	}

	// new SandParticle(gridWidth / 2, 0);
	// new SandParticle(gridWidth / 2, 1);
	// new SandParticle(gridWidth / 2, 2);
}

function draw() {
	background(0);
	// new SandParticle(2, 0);
	// new SandParticle(75, 50);

	if (mouseIsPressed) {
		if (mouseX < width && mouseX >= 0 && mouseY < height && mouseY >= 0) {
			let x = floor(mouseX / pixelsPerParticle);
			let y = floor(mouseY / pixelsPerParticle);
			if (!grid[x][y]){
				new SandParticle(x, y);
			}
		}
	}

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
		return sum / frHistory.length;
	}
}


function WallParticle(i, j) {
	this.row = j;
	this.col = i;
	grid[i][j] = this;

	this.show = function () {
		noStroke();
		fill(65, 68, 74);
		rect(this.col * pixelsPerParticle,
			this.row * pixelsPerParticle,
			pixelsPerParticle,
			pixelsPerParticle);
	}

	this.update = function () {
		nextGrid[this.col][this.row] = this;
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
		if (!nextGrid[this.col][this.row + 1]) {
			// Move straight down
			this.updateGridPosition(this.col, this.row + 1);
		}
		else if (!nextGrid[this.col - 1][this.row + 1]) {
			// Move down and left
			this.updateGridPosition(this.col - 1, this.row + 1);
		}
		else if (!nextGrid[this.col + 1][this.row + 1]) {
			// Move down and right
			this.updateGridPosition(this.col + 1, this.row + 1);
		}
		else {
			// Don't move
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
