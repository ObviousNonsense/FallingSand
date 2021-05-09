let pixelsPerParticle = 4;
let world;

let canvasContext;
let numParticleDisplay;

let frHistory = [];
let frHistoryIndex = 0;
let frDisplay;
let frSlider;
let pauseButton;
let paused = false;
let resetButton;
let scaleSlider;
let scaleLabel;

let radio;
let brushSizeSlider;
let brushSizeDisplay;
let brushReplaceCheckbox;


const PARTICLE_TYPES = {
	'Stone Wall': WallParticle,
	'Wood Wall': WoodParticle,
	'Sand': SandParticle,
	'Water': WaterParticle,
	'Steam': SteamParticle,
	'Plant': PlantParticle,
	'Fire': FireParticle,
	'Gasoline': GasolineParticle,
	'Sand Source': function (x, y) { return new ParticleSource(x, y, SandParticle) },
	'Water Source': function (x, y) { return new ParticleSource(x, y, WaterParticle) },
	'Steam Source': function (x, y) { return new ParticleSource(x, y, SteamParticle) },
	'Fire Source': function (x, y) { return new ParticleSource(x, y, FireParticle) },
	'Gasoline Source': function (x, y) { return new ParticleSource(x, y, GasolineParticle) },
	'Particle Sink': ParticleSink,
}


function setup() {

	world = new World(100, 100)

	// ******************** SETUP UI ********************

	// Create p5 Canvas
	let p5canvas = createCanvas(pixelsPerParticle * world.gridWidth,
		pixelsPerParticle * world.gridHeight);
	// pixelDensity(1);

	// Add the canvas to the page
	p5canvas.parent('canvas-div');

	// Initialize native JS/HTML5 canvas object, since writing basic rectangles
	// to it is faster than using p5
	let canvas = document.getElementById('defaultCanvas0');
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
	let brushDiv = createDiv();
	brushDiv.parent('gui-div');
	brushDiv.class('button-row');

	brushSizeDisplay = createP('');
	brushSizeDisplay.parent(brushDiv);

	brushSizeSlider = createSlider(1, min(16, min(world.gridWidth, world.gridHeight)), 2, 1);
	brushSizeSlider.parent(brushDiv);
	brushReplaceCheckbox = createCheckbox('Replace?', true)
	brushReplaceCheckbox.parent(brushDiv);

	let simDiv = createDiv();
	simDiv.parent('gui-div');
	simDiv.class('button-row');

	pauseButton = createButton('Pause');
	pauseButton.parent(simDiv);
	pauseButton.mouseClicked(pauseSim);

	resetButton = createButton('Reset');
	resetButton.parent(simDiv);
	resetButton.mouseClicked(resetWorld);

	frSlider = createSlider(1, 60, 60, 1);
	frSlider.parent(simDiv);

	frDisplay = createP('');
	frDisplay.parent(simDiv);
	frHistory = new Array(60);

	let scaleDiv = createDiv();
	scaleDiv.parent('gui-div');
	scaleDiv.class('button-row');

	scaleLabel = createP('Scale: ');
	scaleLabel.parent(scaleDiv);

	scaleSlider = createSlider(1, 16, 4, 1);
	scaleSlider.parent(scaleDiv);
	scaleSlider.changed(function() {
		pixelsPerParticle = scaleSlider.value();
		resizeCanvas(world.gridWidth * pixelsPerParticle,
			world.gridHeight * pixelsPerParticle);
		let canvas = document.getElementById('defaultCanvas0');
		canvasContext = canvas.getContext('2d');
	})

	numParticleDisplay = createP('');
	numParticleDisplay.parent('gui-div');


	// ******************** SETUP WORLD ********************
	// world.initializeEmptyGrid();

	// noStroke();
}

function draw() {
	frameRate(frSlider.value())

	brushSizeDisplay.html('Brush Size: ' + brushSizeSlider.value());

	handleMouseClick();
	if (!paused) {
		world.updateAllParticles();
	}

	canvasContext.save()
	background('#333333');

	// Separate loop for showing because sometimes particles will be moved by others after they update
	world.showAllParticles();

	canvasContext.restore();

	frDisplay.html('Average FPS: ' + floor(averageFrameRate()));
	numParticleDisplay.html('Number of Particles: ' + world.particleSet.size);
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

resetWorld = function () {
	let w = world.gridWidth;
	let h = world.gridHeight;
	world = new World(w, h);
}


handleMouseClick = function () {
	if (mouseIsPressed) {
		let x = floor(mouseX / pixelsPerParticle);
		let y = floor(mouseY / pixelsPerParticle);

		if (x <= world.gridWidth - 2 && x >= 1 && y <= world.gridHeight - 2 && y >= 1) {

			let brushSize = brushSizeSlider.value();
			let imin = floor(-0.5 * (brushSize - 1));

			for (i = imin; i < imin + brushSize; i++) {
				let ix = x + i;
				for (j = imin; j < imin + brushSize; j++) {
					let iy = y + j;
					if (ix <= world.gridWidth - 2 && ix >= 1 && iy <= world.gridHeight - 2 && iy >= 1) {
						let p = world.grid[ix][iy];
						let action = radio.value();
						if (p) {
							if (action === 'Delete') {
								world.deleteParticle(p);
							}
							else if (brushReplaceCheckbox.checked()) {
								world.replaceParticle(p, new PARTICLE_TYPES[action](ix, iy));
							}
						}
						else if (action != 'Delete') {
							world.addParticle(new PARTICLE_TYPES[action](ix, iy));
						}
					}
				}
			}
		}
	}
}
