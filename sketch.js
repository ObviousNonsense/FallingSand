// World size, particle containers, etc
let pixelsPerParticle = 5;
let gridWidth = 100;
let gridHeight = 100;
let grid = [];
let particleSet = new Set();

// For p5.touchgui
let gui;
let guiWidth;
let guiHeight = 200;
let gui_y0 = pixelsPerParticle * gridHeight;

let particleButtonArray = new Array(5);
let activeAction = 'Sand';
let brushReplaceCheckbox;
let brushReplaceCheckboxLabel;
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
	let i = 0;
	let sw = 8;
	let particleButtonWidth = guiWidth / particleButtonArray.length;
	let particleButtonHeight = guiHeight / 4;

	let x0 = sw / 2;
	let y0 = sw / 2 + gui_y0;

	for (let p in PARTICLE_TYPES) {
		particleButtonArray[i] = createToggle(
			p,
			x0,
			y0,
			particleButtonWidth - sw,
			particleButtonHeight
		);

		x0 += particleButtonWidth;

		if (p === 'Sand') {
			particleButtonArray[i].val = true;
		}

		let buttonColor = color(PARTICLE_TYPES[p].BASE_COLOR);

		let s = generateToggleStyle(buttonColor, sw, brightness(buttonColor) < 0.5);
		particleButtonArray[i].setStyle(s);

		particleButtonArray[i].onPress = function () {
			particleButtonPressed(p);
		};
		i++;
	}

	let end = particleButtonArray.length - 1;
	particleButtonArray[end] = createToggle(
		'Delete',
		x0,
		y0,
		particleButtonWidth - sw,
		guiHeight / 4
	);

	let s = generateToggleStyle(color(50), sw, color(50) < 0.5);
	particleButtonArray[end].setStyle(s);
	particleButtonArray[end].onPress = function () {
		particleButtonPressed('Delete');
	};

	let checkboxHeight = particleButtonHeight * 3 / 4;
	x0 = 0;
	y0 = height - checkboxHeight;
	brushReplaceCheckbox = createCheckbox('Replace?', x0, y0, checkboxHeight, checkboxHeight);
	brushReplaceCheckbox.setStyle('rounding', 0);
	brushReplaceCheckbox.val = true;

	x0 += brushReplaceCheckbox.w;
	brushReplaceCheckboxLabel = createButton('Replace?', x0, y0, undefined, checkboxHeight)

	let labelStyle = {
		rounding: 0,
		fillBgHover: color(130, 130, 130, 255),
		fillBgActive: color(130, 130, 130, 255)
	}
	brushReplaceCheckboxLabel.setStyle(labelStyle)


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
							if (brushReplaceCheckbox.val || activeAction === 'Delete') {
								// if (activeAction === 'Delete') {
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


let generateToggleStyle = function (buttonColor, _strokeWeight, lightText) {
	let s = {
		rounding: 0,
		fillBgOff: buttonColor,
		fillBgOffHover: buttonColor,
		fillBgOffActive: buttonColor,
		fillBgOn: buttonColor,
		fillBgOnHover: buttonColor,
		fillBgOnActive: buttonColor,
		strokeWeight: _strokeWeight,
		strokeBgOff: color(0, 50),
		strokeBgOffHover: color(255, 50),
		strokeBgOffActive: color(255, 100),
		strokeBgOnHover: color(255, 150),
		strokeBgOnActive: color(255, 100),
		strokeBgOn: color(255, 200)
	}

	if (lightText) {
		let lightTextColor = color(200);
		s.fillLabelOff = lightTextColor;
		s.fillLabelOffHover = lightTextColor;
		s.fillLabelOffActive = lightTextColor;
		s.fillLabelOn = lightTextColor;
		s.fillLabelOnHover = lightTextColor;
		s.fillLabelOnActive = lightTextColor;
	}
	return s;
}


/// Add these lines below sketch to prevent scrolling on mobile
function touchMoved() {
	// do some stuff
	return false;
}