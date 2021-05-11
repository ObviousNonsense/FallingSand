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
let randomButton;
let randomThresholdSlider;
let randomScaleSlider;

let radio;
let brushSizeSlider;
let brushSizeDisplay;
let brushReplaceCheckbox;

const AIR_WEIGHT = 1;

const PARTICLE_TYPES = {
	'Stone Wall': WallParticle,
	'Wood Wall': WoodParticle,
	'Sand': SandParticle,
	'Water': WaterParticle,
	'Steam': SteamParticle,
	'Plant': PlantParticle,
	'Fire': FireParticle,
	'Gasoline': GasolineParticle,
	'Hydrogen': HydrogenParticle,
	'Gunpowder': GunpowderParticle,
	'Sand Source': function (x, y) { return new ParticleSource(x, y, world, SandParticle) },
	'Water Source': function (x, y) { return new ParticleSource(x, y, world, WaterParticle) },
	'Steam Source': function (x, y) { return new ParticleSource(x, y, world, SteamParticle) },
	'Fire Source': function (x, y) { return new ParticleSource(x, y, world, FireParticle) },
	'Gasoline Source': function (x, y) { return new ParticleSource(x, y, world, GasolineParticle) },
	'Hydrogen Source': function (x, y) { return new ParticleSource(x, y, world, HydrogenParticle) },
	'Gunpowder Source': function (x, y) { return new ParticleSource(x, y, world, GunpowderParticle) },
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

	let randomDiv = createDiv();
	randomDiv.parent('gui-div');
	randomDiv.class('button-row');
	let randomSliderDiv = createDiv();
	randomSliderDiv.class('button-column');

	randomButton = createButton('Random fill with selected');
	randomButton.mousePressed(randomFill);
	randomButton.parent(randomDiv);

	randomSliderDiv.parent(randomDiv);
	randomScaleSlider = createSlider(1, 10, 4, 0.1);
	randomScaleSlider.size(70, AUTO)
	let randomScaleSliderLabel = createP('Random Detail: ')
	randomScaleSliderLabel.addClass('button-row')
	randomScaleSliderLabel.parent(randomSliderDiv);
	let randomThresholdSliderLabel = createP('Random Threshold: ')
	randomThresholdSliderLabel.addClass('button-row')
	randomThresholdSliderLabel.parent(randomSliderDiv);
	randomThresholdSlider = createSlider(-0.5, 0.5, 0, 0.05);
	randomThresholdSlider.size(70, AUTO)
	randomScaleSlider.parent(randomScaleSliderLabel);
	randomThresholdSlider.parent(randomThresholdSliderLabel);

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

	scaleSlider = createSlider(1, 16, pixelsPerParticle, 1);
	scaleSlider.parent(scaleDiv);
	scaleSlider.changed(function () {
		pixelsPerParticle = scaleSlider.value();
		resizeCanvas(world.gridWidth * pixelsPerParticle,
			world.gridHeight * pixelsPerParticle);
		let canvas = document.getElementById('defaultCanvas0');
		canvasContext = canvas.getContext('2d');
	})

	numParticleDisplay = createP('');
	numParticleDisplay.parent('gui-div');


	// mousePressed = function() {

	// }
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
	world.showAllParticles(canvasContext, pixelsPerParticle);
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
	world.reset(w, h);
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
								world.replaceParticle(p, new PARTICLE_TYPES[action](ix, iy, world));
							}
						}
						else if (action != 'Delete') {
							world.addParticle(new PARTICLE_TYPES[action](ix, iy, world));
						}
					}
				}
			}
		}
	}
}


randomFill = function () {
	let action = radio.value();
	let simplex = new SimplexNoise();

	if (action != 'Delete') {
		for (x = 1; x < world.gridWidth - 1; x++) {
			for (y = 1; y < world.gridWidth - 1; y++) {
				// TODO: Make the "map value" and threshold controllable
				let map_value = randomScaleSlider.value();
				let xnorm = map(x, 1, world.gridWidth - 1, -map_value, map_value);
				let ynorm = map(y, 1, world.gridWidth - 1, -map_value, map_value);
				if (simplex.noise2D(xnorm, ynorm) > randomThresholdSlider.value()) {
					let p = world.grid[x][y];
					if (p) {
						if (brushReplaceCheckbox.checked()) {
							world.replaceParticle(p, new PARTICLE_TYPES[action](x, y, world));
						}
					}
					else {
						world.addParticle(new PARTICLE_TYPES[action](x, y, world));
					}
				}
			}
		}
	}
}
