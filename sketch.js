let pixelsPerParticle = 4;
let grid = [];
let particleSet = new Set();
let gridWidth = 100;
let gridHeight = 100;
let frHistory = [];
let frHistoryIndex = 0;
let frDisplay;
let radio;
let pauseButton;
let frSlider;
let paused = false;
let brushSizeSlider;
let brushSizeDisplay;
let brushReplaceCheckbox;
let canvas;
let canvasContext;
let numParticleDisplay;

const PARTICLE_TYPES = {
	'Sand': SandParticle,
	'Sand Source': function(x, y) {return new ParticleSource(x, y, SandParticle)},
	'Water': WaterParticle,
	'Water Source': function(x, y) {return new ParticleSource(x, y, WaterParticle)},
	'Steam': SteamParticle,
	'Plant': PlantParticle,
	'Fire': FireParticle,
	'Fire Source': function(x, y) {return new ParticleSource(x, y, FireParticle)},
	'Wall': WallParticle,
	'Sink': ParticleSink
}


function setup() {

	// ******************** SETUP UI ********************

	// Create p5 Canvas
	let p5canvas = createCanvas(pixelsPerParticle * gridWidth,
		pixelsPerParticle * gridHeight);
	// pixelDensity(1);

	// Add the canvas to the page
	p5canvas.parent('canvas-div');

	// Initialize native JS/HTML5 canvas object, since writing basic rectangles
	// to it is faster than using p5
	canvas = document.getElementById('defaultCanvas0');
	canvasContext = canvas.getContext('2d');

	// Radio buttons for selecting particle type to draw
	radio = createRadio(document.getElementById('particle-selector'));
	radio.parent('gui-div');

	for (let p in PARTICLE_TYPES) {
		let option = document.createElement('input');
		option.type = 'radio';
		option.id = p;
		option.value = p;
		radio.child(option);

		let optionLabel = document.createElement('label');
		optionLabel.htmlFor = p;
		radio.child(optionLabel);

		radio.option(p);
	}
	radio.option('Delete');
	radio.selected('Sand');

	// Other Various UI elements:
	brushSizeDisplay = createDiv('');
	brushSizeDisplay.parent('gui-div');

	brushSizeSlider = createSlider(1, min(16, min(gridWidth, gridHeight)), 2, 1);
	brushSizeSlider.parent('gui-div');
	brushReplaceCheckbox = createCheckbox('Replace?', true)
	brushReplaceCheckbox.parent('gui-div');

	pauseButton = createButton('Pause');
	pauseButton.parent('gui-div');
	pauseButton.mouseClicked(pauseSim);

	frSlider = createSlider(1, 60, 60, 1);
	frSlider.parent('gui-div');

	frDisplay = createP('');
	frDisplay.parent('gui-div');
	frHistory = new Array(60);

	numParticleDisplay = createP('');
	numParticleDisplay.parent('gui-div');


	// ******************** SETUP WORLD ********************
	for (let x = 0; x < gridWidth; x++) {
		grid[x] = [];
		for (let y = 0; y < gridHeight; y++) {

			// Initialize most grid positions to false
			grid[x][y] = false;

			// Initialize boundaries to indestructible walls so I don't ever
			// have to check if we're looking outside the array bounds
			if (y === 0 || y === gridHeight - 1 || x === 0 || x === gridWidth - 1) {
				new IndestructibleWallParticle(x, y);
			}
		}
	}


	// noStroke();
}

function draw() {
	frameRate(frSlider.value())
	// canvasContext.fillStyle = '#000000'
	// canvasContext.rect(0, 0, width, height);

	brushSizeDisplay.html('Brush Size: ' + brushSizeSlider.value());

	handleMouseClick();
	for (let p of particleSet) {
		if (!paused) {
			p.update();
		}
	}

	canvasContext.save()
	background('#333333');

	// Separate loop for showing because sometimes particles will be moved by others after they update
	for (let p of particleSet) {
		p.show();
	}

	canvasContext.restore();

	frDisplay.html('Average FPS: ' + floor(averageFrameRate()));
	numParticleDisplay.html('Number of Particles: ' + particleSet.size);
	// noLoop();
}


averageFrameRate = function () {
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


pauseSim = function () {
	paused = !paused;
}


handleMouseClick = function () {
	if (mouseIsPressed) {
		let x = floor(mouseX / pixelsPerParticle);
		let y = floor(mouseY / pixelsPerParticle);

		if (x <= gridWidth - 2 && x >= 1 && y <= gridHeight - 2 && y >= 1) {

			let brushSize = brushSizeSlider.value();
			let imin = floor(-0.5 * (brushSize - 1));

			for (i = imin; i < imin + brushSize; i++) {
				let ix = x + i;
				for (j = imin; j < imin + brushSize; j++) {
					let iy = y + j;
					if (ix <= gridWidth - 2 && ix >= 1 && iy <= gridHeight - 2 && iy >= 1) {
						let p = grid[ix][iy];
						let action = radio.value();
						if (p) {
							if (brushReplaceCheckbox.checked() || action === 'Delete') {
								particleSet.delete(p);
								performSelectedAction(action, ix, iy);
							}
						}
						else {
							performSelectedAction(action, ix, iy);
						}

					}
				}
			}
		}
	}
}


performSelectedAction = function (action, x, y) {
	if (action === 'Delete') {
		grid[x][y] = false;
	}
	else {
		new PARTICLE_TYPES[action](x, y);
	}
}
