class Node {
    constructor(xx, yy, data) {
	this.xx = xx;
	this.yy = yy;
	this.data = data;

	this.omniForce = 0; // Force in all directions
	this.fx = 0;
	this.fy = 0;
	this.nextFx = 0;
	this.nextFy = 0;
	this.isAddedToUpdate = false;
	this.isMoveForceDelayComplete = true;
	this.asciiShades = [...".,:;+cCOG@M"];
	this.asciiThreshold = [];
	for (let index = 0; index < this.asciiShades.length; ++index) {
	    this.asciiThreshold.push(index * 100.0/(this.asciiShades.length-1));
	}
    }
    getNodeElement() {
	this.element = document.createElement("p");
	this.element.className = "cell";
	this.element.style.display = "block";
	this.element.style.width = "100%";
	this.element.style.height = "100%";
	this.element.innerText = ".";
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
	return this.element;
    }
    startRipple(rippleStrength = 100.0) {
	this.omniForce = rippleStrength;
	this.element.innerText = this.asciiShades[this.asciiShades.length-1];
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
	    this.nextFy += yForce * 0.7;
	    this.nextFx += xForce * 0.7;
	}
	// console.log("updated forces to: ", this.nextFy, this.nextFx);
    }
    updateNode() {
	for (let yChange = -1; yChange <=1; ++yChange) {
	    for (let xChange = -1; xChange <=1; ++xChange) {
		if (yChange == 0 && xChange == 0) continue;
		let node = this.data.getNode(this.xx + xChange, this.yy + yChange);
		if (node == undefined) continue;
		// console.log("updated forces from(", node.xx, ", ", node.yy, "): ", this.nextFy, this.nextFx);
		if (node.omniForce != 0) {
		    // console.log("omniforce guy");
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
	// console.log("final force: (", this.xx, ", ", this.yy, ") ", this.nextFx, " : ", this.nextFy);
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
    drawNode() {
	// console.log("fx: ", this.fx, "fy: ", this.fy, "nfx: ", this.nextFx, "nfy: ", this.nextFy);
	this.omniForce = 0;
	this.fx = Math.floor(this.nextFx * this.data.forceDampeningRatio);
	this.fy = Math.floor(this.nextFy * this.data.forceDampeningRatio);
	if (Math.abs(this.fx) < this.data.forceCutOff) this.fx = 0;
	if (Math.abs(this.fy) < this.data.forceCutOff) this.fy = 0;
	this.nextFx = 0;
	this.nextFy = 0;
	let magnitude = Math.sqrt(Math.pow(this.fx, 2) + Math.pow(this.fy, 2));
	if (magnitude > 100) magnitude = 100;
	let index = this.asciiThreshold.findIndex((el) => el >= magnitude);
	this.element.innerText = this.asciiShades[index];
    }
}

class AsciiRippleData {
    constructor(numRows, numCols) {
	this.nodeList = [];
	this.updateQueue = [];
	this.drawQueue = [];
	this.isUpdateDone = true;
	this.numRows = numRows;
	this.numCols = numCols;

	this.forceDampeningRatio = 0.8; // Force dampening percent
	this.forceCutOff = 5;	// Axial force less than this is set to 0
	this.rippleOnMove = false;
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
	// console.log("Trying adding to update queue: ", xx, " : ", yy);
	if (xx < 0 || xx >= this.numCols ||
	    yy < 0 || yy >= this.numRows)
	    return;
	let index = yy*this.numCols + xx;
	if (!this.nodeList[index].isAddedToUpdate) {
	    // console.log("Added to update queue: ", xx, " : ", yy);
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
	    node.drawNode();
	}
    }
    updateElements() {
	this.isUpdateDone = false;
	// console.log("Updating elements: ", this.updateQueue);
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

class AsciiRipple {
    constructor(elementID, numCols, numRows, updateInterval=100) {
	this.parentNode = document.getElementById(elementID);
	this.numRows = numRows;
	this.numCols = numCols;
	this.data = new AsciiRippleData(numRows, numCols);
	this.areRandomRipplesGenerated = false;
	this.randomGenerationInterval = updateInterval;
	this.randomTimeRange = updateInterval;
	this.useRandomRippleStrength = true;
	this.maxRandomRippleStrength = 200;
	this.isRandomRippleCreated = true;

	this.setupGrid();
	setInterval(() => this.tryUpdateElements(), updateInterval);
    }
    setupGrid() {
	this.parentNode.style.fontFamily = "Courier New, Courier, Lucida Sans Typewriter, Lucida Typewriter, monospace";
	this.parentNode.style.fontSize = "14px";
	this.parentNode.style.display = "grid";
	this.parentNode.style.gridTemplateColumns = "repeat(" + this.numCols + ", 12px)"; // Make these Node static constants
	this.parentNode.style.gridTemplateRows = "repeat(" + this.numRows + ", 12px)";
	for (let yy = 0; yy < this.numRows; ++yy) {
	    for (let xx = 0; xx < this.numCols; ++xx) {
		let node = new Node(xx, yy, this.data);
		this.data.appendNode(node);
		this.parentNode.appendChild(node.getNodeElement());
	    }
	}
    }
    toggleRandomRipples() {
	this.areRandomRipplesGenerated = !this.areRandomRipplesGenerated;
    }
    toggleRandomRippleStrength() {
	this.useRandomRippleStrength = !this.useRandomRippleStrength;
    }
    setRandomRippleGenerationInterval(randomRippleGenerationInterval) {
	this.randomGenerationInterval = randomRippleGenerationInterval;
    }
    setRandomRippleTimeRange(randomRippleTimeRange) {
	this.randomTimeRange = randomRippleTimeRange;
    }
    setDampeningRatio(dampeningRatio) {
	this.data.forceDampeningRatio = dampeningRatio;
    }
    createRandomRipple() {
	let rippleStrength = Math.floor(Math.random()*this.maxRandomRippleStrength);
	let randomIndex = Math.floor(Math.random()*this.data.nodeList.length);
	this.data.nodeList[randomIndex].startRipple(rippleStrength);
    }
    createTimedRandomRipple() {
	this.isRandomRippleCreated = false;
	let timeoutChange = Math.floor(Math.random()*this.randomTimeRange)
	    - this.randomTimeRange/2;
	let timeout = this.randomGenerationInterval + timeoutChange;
	setTimeout(() => {
	    this.createRandomRipple();
	    this.isRandomRippleCreated = true;
	}, timeout);
    }
    createWave() {
	for (let yy = 0; yy < this.numCols; ++yy) {
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
