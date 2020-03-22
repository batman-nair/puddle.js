class NodeBase {
    constructor(xx, yy, data, mathMode) {
	this.xx = xx;
	this.yy = yy;
	this.data = data;
	this.mathMode = mathMode

	this.omniForce = 0; // Force in all directions
	this.fx = 0;
	this.fy = 0;
	this.nextFx = 0;
	this.nextFy = 0;
	this.currentForce = 0;
	this.nextForce = 0;

	if (this.mathMode === "helias") {
	    this.updateNode = this.updateNodeHelias;
	    this.computeForceAndDrawNode = this.computeForceAndDrawNodeHelias;
	}
	else {
	    this.updateNode = this.updateNodeAnair;
	    this.computeForceAndDrawNode = this.computeForceAndDrawNodeAnair;
	}

	this.isAddedToUpdate = false;
	this.isMoveForceDelayComplete = true;
    }
    applyListeners() {
	this.element.onclick = () => this.startRipple();
	this.element.onmousemove = () => {
	    if (!this.data.rippleOnMove)
		return;
	    if (this.isMoveForceDelayComplete) {
		this.isMoveForceDelayComplete = false;
		this.startRipple();
		setTimeout(() => this.isMoveForceDelayComplete = true, 500);
	    }
	};
    }
    getNodeElement() {
	this.element = document.createElement("div");
	this.element.className = "cell";
	this.element.style.display = "block";
	this.element.style.width = "100%";
	this.element.style.height = "100%";
	this.drawNode(0);
	this.applyListeners();
	return this.element;
    }
    startRipple(rippleStrength = 0) {
	if (!rippleStrength)
	    rippleStrength = this.data.maxRippleStrength;
	this.omniForce = rippleStrength;
	this.currentForce = rippleStrength;

	this.drawNode(rippleStrength);

	for (let yChange = -1; yChange <=1; ++yChange) {
	    for (let xChange = -1; xChange <=1; ++xChange) {
		this.data.addToUpdateQueue(this.xx+xChange, this.yy+yChange);
	    }
	}
    }
    updateForces(xChange, yChange, xForce, yForce) {
	if (xChange == 0 || yChange == 0) { // Orthongonal
	    this.nextFy += yForce;
	    this.nextFx += xForce;
	}
	else {
	    this.nextFy += yForce >> 1;
	    this.nextFx += xForce >> 1;
	}
    }
    updateNodeHelias() {
	// Helias math mode taken from https://web.archive.org/web/20160418004149/http://freespace.virgin.net/hugo.elias/graphics/x_water.htm
	let nodeUp = this.data.getNode(this.xx, this.yy - 1);
	let nodeUpForce = nodeUp? nodeUp.currentForce : 0;
	let nodeDown = this.data.getNode(this.xx, this.yy + 1);
	let nodeDownForce = nodeDown? nodeDown.currentForce : 0;
	let nodeRight = this.data.getNode(this.xx + 1, this.yy);
	let nodeRightForce = nodeRight? nodeRight.currentForce : 0;
	let nodeLeft = this.data.getNode(this.xx - 1, this.yy);
	let nodeLeftForce = nodeLeft? nodeLeft.currentForce : 0;

	this.nextForce = (nodeUpForce + nodeDownForce + nodeRightForce + nodeLeftForce)/2 -this.nextForce;
	this.nextForce = this.nextForce * this.data.forceDampeningRatio;

	this.data.addToDrawQueue(this.xx, this.yy);
    }
    updateNodeAnair() {
	for (let yChange = -1; yChange <=1; ++yChange) {
	    for (let xChange = -1; xChange <=1; ++xChange) {
		if (yChange == 0 && xChange == 0) continue;
		let node = this.data.getNode(this.xx + xChange, this.yy + yChange);
		if (node == undefined) continue;
		if (node.omniForce != 0) {
		    this.updateForces(xChange, yChange, -xChange*node.omniForce, -yChange*node.omniForce);
		}
		else {
		    let deltaFx = 0, deltaFy = 0;
		    if (xChange == 0 || yChange == 0) {
			if (xChange * node.fx < 0)
			    deltaFx = node.fx;
			if (yChange * node.fy < 0)
			    deltaFy = node.fy;
		    }
		    else if (xChange * node.fx < 0 && yChange * node.fy < 0) {
			deltaFx = node.fx;
			deltaFy = node.fy;
		    }
		    this.updateForces(xChange, yChange, deltaFx, deltaFy);
		}
	    }
	}
	if (this.nextFx != 0 || this.nextFy != 0) {
	    for (let yChange = 0; yChange <= (this.nextFy!=0); ++yChange) {
		for (let xChange = 0; xChange <= (this.nextFx!=0); ++xChange) {
		    this.data.addToUpdateQueue(this.xx + Math.sign(this.nextFx)*xChange,
					       this.yy + Math.sign(this.nextFy)*yChange);
		}
	    }
	}
	this.data.addToDrawQueue(this.xx, this.yy);
    }
    drawNode(forceMagnitude) {
	if (forceMagnitude > 150)  forceMagnitude = 150;
	else if (forceMagnitude < -50)  forceMagnitude = -50;

	let hueValue = 0;
	let saturationValue = 0;
	let lightnessValue = 25 + forceMagnitude/2;
	this.element.style.background = "hsl("+ hueValue +", "+ saturationValue +"%, "+ lightnessValue +"%)";
    }
    computeForceAndDrawNodeHelias() {
	if (Math.abs(this.nextForce) < this.data.forceCutOff) this.nextForce = 0;
	this.drawNode(this.nextForce);
	let temp = this.currentForce;
	this.currentForce = this.nextForce;
	this.nextForce = temp;

	this.data.addToUpdateQueue(this.xx-1, this.yy);
	this.data.addToUpdateQueue(this.xx+1, this.yy);
	this.data.addToUpdateQueue(this.xx, this.yy-1);
	this.data.addToUpdateQueue(this.xx, this.yy+1);
    }
    computeForceAndDrawNodeAnair() {
	this.omniForce = 0;
	this.fx = Math.floor(this.nextFx * this.data.forceDampeningRatio);
	this.fy = Math.floor(this.nextFy * this.data.forceDampeningRatio);
	if (Math.abs(this.fx) < this.data.forceCutOff) this.fx = 0;
	if (Math.abs(this.fy) < this.data.forceCutOff) this.fy = 0;
	this.nextFx = 0;
	this.nextFy = 0;
	let magnitude = Math.sqrt(Math.pow(this.fx, 2) + Math.pow(this.fy, 2));
	if (magnitude > 100) magnitude = 100;
	this.drawNode(magnitude);
    }
}

class WaterNode extends NodeBase {
    constructor(xx, yy, data, mathMode) {
	super(xx, yy, data, mathMode);
    }
    drawNode(forceMagnitude) {
	if (forceMagnitude > 120)  forceMagnitude = 120;
	if (forceMagnitude < -280)  forceMagnitude = -280;
	let hueValue = 198;
	let saturationValue = 70 + forceMagnitude/4;
	let lightnessValue = 70 + (forceMagnitude)/8;
	this.element.style.background = "hsl("+ hueValue +", "+ saturationValue +"%, "+ lightnessValue +"%)";
    }
}

class PartyNode extends NodeBase {
    constructor(xx, yy, data, mathMode) {
	super(xx, yy, data, mathMode);
    }
    drawNode(forceMagnitude) {
	if (forceMagnitude > 120)  forceMagnitude = 120;
	if (forceMagnitude < -200)  forceMagnitude = -200;
	let hueValue = Math.floor(Math.random()*360);
	let saturationValue = 70 + forceMagnitude/4;
	let lightnessValue = 100 - (forceMagnitude/2);
	this.element.style.background = "hsl("+ hueValue +", "+ saturationValue +"%, "+ lightnessValue +"%)";
    }
}

class AsciiNode extends NodeBase {
    constructor(xx, yy, data, mathMode) {
	super(xx, yy, data, mathMode);
	this.asciiShades = [...".,:;+cCOG@M"];
	this.asciiThreshold = [];
	for (let index = 0; index < this.asciiShades.length; ++index) {
	    this.asciiThreshold.push(index * 100.0/(this.asciiShades.length-1));
	}
	if (this.mathMode === "helias")
	    this.drawNode = this.drawNodeHelias;
	else
	    this.drawNode = this.drawNodeAnair;
    }
    getNodeElement() {
	this.element = document.createElement("span");
	this.element.style.display = "block";
	this.element.style.width = "100%";
	this.element.style.height = "100%";
	this.drawNode(0);
	this.applyListeners();
	return this.element;
    }
    drawNodeHelias(forceMagnitude) {
	if (forceMagnitude > 80) forceMagnitude = 80;
	else if (forceMagnitude < -20) forceMagnitude = -20;
	forceMagnitude += 20;
	let index = this.asciiThreshold.findIndex((el) => el >= forceMagnitude);
	this.element.innerText = this.asciiShades[index];
    }
    drawNodeAnair(forceMagnitude) {
	if (forceMagnitude > 100) forceMagnitude = 100;
	else if (forceMagnitude < 0) forceMagnitude = 0;
	let index = this.asciiThreshold.findIndex((el) => el >= forceMagnitude);
	this.element.innerText = this.asciiShades[index];
    }
}

class PuddleData {
    constructor(numRows, numCols) {
	this.nodeList = [];
	this.updateQueue = [];
	this.drawQueue = [];
	this.isUpdateDone = true;
	this.numRows = numRows;
	this.numCols = numCols;

	this.maxRippleStrength = 100.0;
	this.forceDampeningRatio = 0.8; // Force dampening percent
	this.forceCutOff = 2;	// Axial force less than this is set to 0
	this.rippleOnMove = true;
    }
    refresh(numRows, numCols) {
	this.nodeList = [];
	this.updateQueue = [];
	this.drawQueue = [];
	this.isUpdateDone = true;
	this.numRows = numRows;
	this.numCols = numCols;
    }
    appendNode(node) {
	this.nodeList.push(node);
    }
    getNode(xx, yy) {
	if (xx < 0 || xx >= this.numCols ||
	    yy < 0 || yy >= this.numRows)
	    return undefined;
	return this.nodeList[ yy*this.numCols + xx ];
    }
    addToUpdateQueue(xx, yy) {
	if (xx < 0 || xx >= this.numCols ||
	    yy < 0 || yy >= this.numRows)
	    return;
	let index = yy*this.numCols + xx;
	if (!this.nodeList[index].isAddedToUpdate) {
	    this.updateQueue.push(index);
	    this.nodeList[index].isAddedToUpdate = true;
	}
    }
    addToDrawQueue(xx, yy) {
	// Adding to draw is only done on self and so no errors should pop up
	let index = yy*this.numCols + xx;
	this.drawQueue.push(index);
    }
    drawElements() {
	let drawList = this.drawQueue;
	this.drawQueue = [];
	for (const index of drawList) {
	    let node = this.nodeList[index];
	    node.computeForceAndDrawNode();
	}
    }
    updateElements() {
	this.isUpdateDone = false;
	let updateList = this.updateQueue;
	this.updateQueue = [];
	for (const index of updateList) {
	    let node = this.nodeList[index];
	    node.isAddedToUpdate = false;
	}
	for (const index of updateList) {
	    let node = this.nodeList[index];
	    node.updateNode();
	}
	this.drawElements();
	this.isUpdateDone = true;
    }
}

class Puddle {
    constructor(queryElement, updateInterval=100) {
	this.parentNode = document.querySelector(queryElement);
	this.data = new PuddleData(this.numRows, this.numCols);
	this.areRandomRipplesGenerated = false;
	this.updateInterval = updateInterval;
	this.randomGenerationInterval = this.updateInterval;
	this.randomTimeRange = this.updateInterval;
	this.useRandomRippleStrength = true;
	this.isRandomRippleCreated = true;
	this.nodeStyle = NodeBase;
	this.nodeSize = 14;
	this.mathMode = "anair";
	this.updateLoop = undefined;
    }
    setNodeStyle(nodeStyle) {
	if (nodeStyle === "water")
	    this.nodeStyle = WaterNode;
	else if (nodeStyle === "party")
	    this.nodeStyle = PartyNode;
	else if (nodeStyle === "ascii")
	    this.nodeStyle = AsciiNode;
	else if (nodeStyle === "base")
	    this.nodeStyle = NodeBase;
	else
	    console.log("Invalid nodeStyle value");
	this.setupGrid();
    }
    getNodeSize() {
	return this.nodeSize;
    }
    setNodeSize(nodeSize) {
	this.nodeSize = nodeSize;
	if (this.elementHeight) {
	    this.numRows = Math.floor(this.elementHeight/this.nodeSize);
	    this.numCols = Math.floor(this.elementWidth/this.nodeSize);
	}
	this.setupGrid();
    }
    setMathMode(mathMode) {
	this.mathMode = mathMode;
	this.setupGrid();
    }
    setupDefaultOptions() {
	this.elementWidth = this.parentNode.scrollWidth;
	this.elementHeight = this.parentNode.scrollHeight;
	let lesserDimension = this.elementHeight < this.elementWidth? this.elementHeight : this.elementWidth;
	this.nodeSize = lesserDimension * 3 / 100;
	if (this.elementHeight) {
	    this.numRows = Math.floor(this.elementHeight/this.nodeSize);
	    this.numCols = Math.floor(this.elementWidth/this.nodeSize);
	}
    }
    setupGrid() {
	clearInterval(this.updateLoop);
	this.setupDefaultOptions();
	this.data.refresh(this.numRows, this.numCols);

	this.parentNode.innerHTML = '';
	this.parentNode.style.fontFamily = "Fira Mono, monospace";
	this.parentNode.style.fontSize = this.nodeSize+2 + "px";
	this.parentNode.style.display = "grid";
	this.parentNode.style.gridTemplateColumns = "repeat("+this.numCols+", "+this.nodeSize+"px)";
	this.parentNode.style.gridTemplateRows = "repeat("+this.numRows+", "+this.nodeSize+"px)";
	for (let yy = 0; yy < this.numRows; ++yy) {
	    for (let xx = 0; xx < this.numCols; ++xx) {
		let node = new this.nodeStyle(xx, yy, this.data, this.mathMode);
		this.data.appendNode(node);
		this.parentNode.appendChild(node.getNodeElement());
	    }
	}

	this.updateLoop = setInterval(() => this.tryUpdateElements(), this.updateInterval);
    }
    toggleRandomRipples() {
	this.areRandomRipplesGenerated = !this.areRandomRipplesGenerated;
    }
    toggleRandomRippleStrength() {
	this.useRandomRippleStrength = !this.useRandomRippleStrength;
    }
    setMaxRippleStrength(maxRippleStrength) {
	this.data.maxRippleStrength = maxRippleStrength;
    }
    setRandomRippleGenerationInterval(randomRippleGenerationInterval) {
	this.randomGenerationInterval = randomRippleGenerationInterval;
	clearTimeout(this.randomRippleTimeout);
	this.isRandomRippleCreated = true;
    }
    setRandomRippleTimeRange(randomRippleTimeRange) {
	this.randomTimeRange = randomRippleTimeRange;
    }
    setDampeningRatio(dampeningRatio) {
	this.data.forceDampeningRatio = dampeningRatio;
    }
    setUpdateInterval(updateInterval) {
	clearInterval(this.updateLoop);
	this.updateInterval = updateInterval;
	this.updateLoop = setInterval(() => this.tryUpdateElements(), this.updateInterval);
    }
    createRandomRipple() {
	let rippleStrength = Math.floor(Math.random()*this.data.maxRippleStrength);
	let randomIndex = Math.floor(Math.random()*this.data.nodeList.length);
	this.data.nodeList[randomIndex].startRipple(rippleStrength);
    }
    createTimedRandomRipple() {
	this.isRandomRippleCreated = false;
	let timeoutChange = Math.floor(Math.random()*this.randomTimeRange)
	    - this.randomTimeRange/2;
	let timeout = this.randomGenerationInterval + timeoutChange;
	this.randomRippleTimeout = setTimeout(() => {
	    this.createRandomRipple();
	    this.isRandomRippleCreated = true;
	}, timeout);
    }
    createWave() {
	for (let yy = 0; yy < this.numRows; ++yy) {
	    this.data.getNode(0, yy).startRipple(400);
	}
    }
    toggleRippleOnMove() {
	this.data.rippleOnMove = !this.data.rippleOnMove;
    }
    tryUpdateElements() {
	if (this.data.isUpdateDone)
	    this.data.updateElements()
	else
	    console.log("Previous update not completed, skipping update");
	if (this.areRandomRipplesGenerated && this.isRandomRippleCreated)
	    this.createTimedRandomRipple();
    }
}



/*
All options
puddle = new Puddle(<query-element>);

puddle.setNodeStyle(nodeStyle);  // nodeStyle one of ["water", "party", "ascii", "base"]  // Default "ascii"
puddle.setMathMode(mathMode);  // mathMode one of ["anair", "helias"]   // Default "anair"
puddle.setNodeSize(nodeSize);  // Default 3% of min(height, width)
puddle.setUpdateInterval(updateInterval);  // Default 100

puddle.toggleRandomRipples();	// Default False
puddle.toggleRandomRippleStrength(); // Default True
puddle.setMaxRippleStrength(rippleStrength);  // Default 100
puddle.setRandomRippleGenerationInterval(100); // Default updateInterval  min: updateInterval
puddle.setRandomRippleTimeRange(100);		  // Default updateInterval  max: updateInterval
// Random ripples are generated at RippleGenerationInterval (+/-) RippleTimeRange/2

puddle.createRandomRipple();
puddle.createWave();

puddle.setDampeningRatio(0.9); // Default 0.8  between 0 and 1

puddle.toggleRippleOnMove(); // Default True

*/
