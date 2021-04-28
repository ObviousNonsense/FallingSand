let pixelsPerParticle = 4;
let grid = [];
let nextGrid = [];
let falseGrid = [];
let gridWidth = 100;
let gridHeight = 100;
let frHistory = [];
let frHistoryIndex = 0;
let fr;
let radio;


function setup() {
	// frameRate(5);

	createCanvas(pixelsPerParticle * gridWidth,
		pixelsPerParticle * gridHeight);
	pixelDensity(1);

	radio = createRadio();
	radio.option('Sand');
	radio.option('Wall');
	radio.option('Water');
	radio.selected(0);

	fr = createP('');
	frHistory = new Array(60);

	for (let x = 0; x < gridWidth; x++) {
		grid[x] = [];
		nextGrid[x] = [];
		for (let y = 0; y < gridHeight; y++) {
			if (y === gridHeight - 1 || x === 0 || x === gridWidth - 1) {
				grid[x][y] = new WallParticle(x, y);
				nextGrid[x][y] = new WallParticle(x, y);
			}
			else {
				grid[x][y] = false;
				nextGrid[x][y] = false;
			}
		}
	}

	new WaterParticle(5, 5);
}

function draw() {
	background(0);
	// new SandParticle(2, 0);
	// new SandParticle(75, 50);

	if (mouseIsPressed) {
		if (mouseX < width && mouseX >= 0 && mouseY < height && mouseY >= 0) {
			let x = floor(mouseX / pixelsPerParticle);
			let y = floor(mouseY / pixelsPerParticle);
			if (!grid[x][y]) {
				let type = radio.value();
				switch (type) {
					case 'Sand':
						new SandParticle(x, y);
						break;
					case 'Wall':
						new WallParticle(x, y);
						break;
					case 'Water':
						new WaterParticle(x, y);
						break;
				}
			}
		}
	}

	for (let y = gridHeight - 1; y >= 0; y--) {
		for (let x = 0; x < gridWidth; x++) {
			let p = grid[x][y];
			if (p) {
				p.show();
				p.update();
			}
			// else {
				// nextGrid[x][y] = false;
			// }
		}
	}

	// let temp = grid;
	// grid = nextGrid;
	// nextGrid = temp;
	for (let n = 0; n < grid.length; n++) {
		grid[n] = nextGrid[n].slice();
	}

	fr.html(floor(averageFrameRate()));
	// noLoop();

	function averageFrameRate() {
		frHistory[frHistoryIndex] = frameRate();
		frHistoryIndex += 1;
		if (frHistoryIndex >= frHistory.length) {
			frHistoryIndex = 0;
		}

		sum = 0;
		for (let i = 0; i < frHistory.length; i++) {
			sum += frHistory[i];
		}
		return sum / frHistory.length;
	}
}


function WallParticle(x, y) {
	this.x = y;
	this.y = x;
	grid[x][y] = this;

	this.show = function () {
		// noStroke();
		strokeWeight(1);
		stroke(0, 50);
		fill(65, 68, 74);
		rect(this.y * pixelsPerParticle,
			this.x * pixelsPerParticle,
			pixelsPerParticle,
			pixelsPerParticle);
	}

	this.update = function () {
		nextGrid[this.y][this.x] = this;
	}
}


function SandParticle(x, y) {
	this.y = y;
	this.x = x;
	grid[x][y] = this;

	this.show = function () {
		// noStroke();
		strokeWeight(1);
		stroke(0, 50);
		fill(229, 181, 95);
		rect(this.x * pixelsPerParticle,
			this.y * pixelsPerParticle,
			pixelsPerParticle,
			pixelsPerParticle);
	}

	this.update = function () {
		if (!nextGrid[this.x][this.y + 1]) {
			// Move straight down
			this.updateGridPosition(this.x, this.y + 1);
		}
		else if (!nextGrid[this.x - 1][this.y + 1]) {
			// Move down and left
			this.updateGridPosition(this.x - 1, this.y + 1);
		}
		else if (!nextGrid[this.x + 1][this.y + 1]) {
			// Move down and right
			this.updateGridPosition(this.x + 1, this.y + 1);
		}
		else {
			// Don't move
			nextGrid[this.x][this.y] = this;
		}
	}

	this.updateGridPosition = function (x, y) {
		nextGrid[this.x][this.y] = false;
		this.y = y;
		this.x = x;
		nextGrid[x][y] = this;
	}
}


function WaterParticle(x, y) {
	this.y = y;
	this.x = x;
	grid[x][y] = this;

	this.show = function () {
		// noStroke();
		strokeWeight(1);
		stroke(0, 50);
		fill(43, 100, 195);
		rect(this.x * pixelsPerParticle,
			this.y * pixelsPerParticle,
			pixelsPerParticle,
			pixelsPerParticle);
	}

	this.update = function () {
		if (!nextGrid[this.x][this.y + 1]) {
			// Move straight down
			this.updateGridPosition(this.x, this.y + 1);
		}
		else if (!nextGrid[this.x - 1][this.y + 1]) {
			// Move down and left
			this.updateGridPosition(this.x - 1, this.y + 1);
		}
		else if (!nextGrid[this.x + 1][this.y + 1]) {
			// Move down and right
			this.updateGridPosition(this.x + 1, this.y + 1);
		}
		else if (!nextGrid[this.x + 1][this.y]) {
			// Move right
			this.updateGridPosition(this.x + 1, this.y);
		}
		else if (!nextGrid[this.x - 1][this.y]) {
			// Move left
			this.updateGridPosition(this.x - 1, this.y);
		}
		else {
			// Don't move
			nextGrid[this.x][this.y] = this;
		}
	}

	this.updateGridPosition = function (x, y) {
		nextGrid[this.x][this.y] = false;
		this.y = y;
		this.x = x;
		nextGrid[x][y] = this;
	}
}
