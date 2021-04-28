let pixelsPerParticle = 16;
let grid = [];
let nextGrid = [];
let falseGrid = [];
let gridWidth = 32;
let gridHeight = 32;
let frHistory = [];
let frHistoryIndex = 0;
let fr;
let radio;


function setup() {
	frameRate(30);

	createCanvas(pixelsPerParticle * gridWidth,
		pixelsPerParticle * gridHeight);
	pixelDensity(1);

	radio = createRadio();
	radio.option('Sand');
	radio.option('Wall');
	radio.option('Water');
	radio.selected('Sand');

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

	// new WaterParticle(5, 5);
}

function draw() {
	background(0);
	new SandParticle(gridWidth / 2, 0);
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
		}
	}

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
