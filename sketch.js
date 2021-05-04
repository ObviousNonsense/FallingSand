// World size, particle containers, etc
let pixelsPerParticle = 4;
let gridWidth = 100;
let gridHeight = 100;
let grid = [];
let particleSet = new Set();

// For p5.touchgui
let gui;
let guiWidth;
let guiHeight = 200;
let gui_y0 = pixelsPerParticle * gridHeight;

let particleButtonArray = new Array(4);
let activeAction = 'Sand';
// 	sandButton,
// 	waterButton,
// 	wallButton,
// 	sinkButton
// ]

// HTML5 canvas
let canvas;
let canvasContext;

// GUI elements and related
let frDisplay;
let frHistory = [];
let frHistoryIndex = 0;
let radio;
let pauseButton;
let paused = false;
let frSlider;
let brushSizeSlider;
let brushSizeDisplay;
let brushReplaceCheckbox;
let numParticleDisplay;

const PARTICLE_TYPES = {
	'Sand': SandParticle,
	// 'Sand Source': function(x, y) {return new ParticleSource(x, y, SandParticle)},
	'Water': WaterParticle,
	// 'Water Source': function(x, y) {return new ParticleSource(x, y, WaterParticle)},
	'Wall': WallParticle,
	'Sink': ParticleSink
}

function particleButtonPressed(label) {
	for (let i = 0; i < particleButtonArray.length; i++) {
		if (particleButtonArray[i].label != label) {
			particleButtonArray[i].val = false;
		}
	}

	activeAction = label;
}

function setup() {

	// ******************** SETUP CANVAS ********************

	// Create p5 Canvas
	let p5canvas = createCanvas(pixelsPerParticle * gridWidth,
		pixelsPerParticle * gridHeight + guiHeight);
	// pixelDensity(1);

	// Add the canvas to the page
	p5canvas.parent('canvas-div');

	// Initialize native JS/HTML5 canvas object, since writing basic rectangles
	// to it is faster than using p5
	canvas = document.getElementById('defaultCanvas0');
	canvasContext = canvas.getContext('2d');

	// ******************** SETUP GUI ********************
	guiWidth = width;
	gui = createGui();
	let particleButtonWidth = guiWidth / particleButtonArray.length;
	// b = createToggle('Sand', 0, 400, 100, 50);
	// b.labelOff = "test";
	// b.val = true;
	let i = 0;
	let sw = 8;
	for (let p in PARTICLE_TYPES) {
		particleButtonArray[i] = createToggle(
			p,
			sw/2 + i * particleButtonWidth,
			sw/2 + gui_y0,
			particleButtonWidth - sw,
			guiHeight / 4
		);

		if (p === 'Sand') {
			particleButtonArray[i].val = true;
		}

		let buttonColor = color(PARTICLE_TYPES[p].BASE_COLOR);

		let toggleStyle = {
			rounding: 0,
			fillBgOff: buttonColor,
			fillBgOffHover: buttonColor,
			fillBgOffActive: buttonColor,
			fillBgOn: buttonColor,
			fillBgOnHover: buttonColor,
			fillBgOnActive: buttonColor,
			strokeWeight: sw,
			strokeBgOff: color(0, 50),
			strokeBgOffHover: color(255, 50),
			strokeBgOffActive: color(255, 100),
			strokeBgOnHover: color(255, 150),
			strokeBgOnActive: color(255, 100),
			strokeBgOn: color(255, 200)
		}
		particleButtonArray[i].setStyle(toggleStyle);

		if (brightness(buttonColor) < 0.5) {
			let lightTextColor = color(200);
			let labelStyle = {
				fillLabelOff: lightTextColor,
				fillLabelOffHover: lightTextColor,
				fillLabelOffActive: lightTextColor,
				fillLabelOn: lightTextColor,
				fillLabelOnHover: lightTextColor,
				fillLabelOnActive: lightTextColor
			}
			particleButtonArray[i].setStyle(labelStyle);
		}

		particleButtonArray[i].onPress = function () {
			particleButtonPressed(p);
		};
		i++;
	}

	// Radio buttons for selecting particle type to draw
	// radio = createRadio(document.getElementById('particle-selector'));
	// radio.parent('gui-div');

	// for (let p in PARTICLE_TYPES) {
	// 	let option = document.createElement('input');
	// 	option.type = 'radio';
	// 	option.id = p;
	// 	option.value = p;
	// 	radio.child(option);

	// 	let optionLabel = document.createElement('label');
	// 	optionLabel.htmlFor = p;
	// 	radio.child(optionLabel);

	// 	radio.option(p);
	// }
	// radio.option('Delete');
	// radio.selected('Sand');

	// // Other Various UI elements:
	// brushSizeDisplay = createDiv('');
	// brushSizeDisplay.parent('gui-div');

	// brushSizeSlider = createSlider(1, min(16, min(gridWidth, gridHeight)), 2, 1);
	// // brushSizeSlider.parent('gui-div');
	// brushReplaceCheckbox = createCheckbox('Replace?', true)
	// // brushReplaceCheckbox.parent('gui-div');

	// pauseButton = createButton('Pause');
	// // pauseButton.parent('gui-div');
	// // pauseButton.mouseClicked(pauseSim);

	// frSlider = createSlider(1, 60, 60, 1);
	// // frSlider.parent('gui-div');

	// frDisplay = createP('');
	// frDisplay.parent('gui-div');
	// frHistory = new Array(60);

	// numParticleDisplay = createP('');
	// numParticleDisplay.parent('gui-div');


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
	// frameRate(frSlider.value())

	// brushSizeDisplay.html('Brush Size: ' + brushSizeSlider.value());

	handleMouseClick();
	for (let p of particleSet) {
		if (!paused) {
			p.update();
		}
	}

	canvasContext.save()
	background(51);

	drawGui();

	// Separate loop for showing because sometimes particles will be moved by others after they update
	for (let p of particleSet) {
		p.show();
	}

	canvasContext.restore();

	// frDisplay.html('Average FPS: ' + floor(averageFrameRate()));
	// numParticleDisplay.html('Number of Particles: ' + particleSet.size);
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

			// let brushSize = brushSizeSlider.value();
			let brushSize = 2;
			let imin = floor(-0.5 * (brushSize - 1));

			for (i = imin; i < imin + brushSize; i++) {
				let ix = x + i;
				for (j = imin; j < imin + brushSize; j++) {
					let iy = y + j;
					if (ix <= gridWidth - 2 && ix >= 1 && iy <= gridHeight - 2 && iy >= 1) {
						let p = grid[ix][iy];
						// let action = radio.value();
						// let action = 'Sand';
						if (p) {
							// if (brushReplaceCheckbox.checked() || action === 'Delete') {
							if (activeAction === 'Delete') {
								particleSet.delete(p);
								performSelectedAction(activeAction, ix, iy);
							}
						}
						else {
							performSelectedAction(activeAction, ix, iy);
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


/// Add these lines below sketch to prevent scrolling on mobile
function touchMoved() {
	// do some stuff
	return false;
}