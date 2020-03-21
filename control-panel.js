class ControlPanel {
    constructor(name) {
	this.parentContainer = document.querySelector("body");
	this.mainContainer = document.createElement("div");
	this.mainContainer.className = "controller-container";
	this.controllerMap = {};
	this.sectionMap = {};

	this.addControlSection("Control Panel", {id: "root"}, "");
    }
    getControlLabel(name) {
	let controlLabel = document.createElement("span");
	controlLabel.className = "control-label";
	controlLabel.innerText = name;
	return controlLabel;
    }
    addElementToController(element, sectionName) {
	let sectionContainer = this.mainContainer;
	if (this.sectionMap.hasOwnProperty(sectionName))
	    sectionContainer = this.sectionMap[sectionName];
	sectionContainer.appendChild(element);
    }
    addNumberControl(name, options, sectionName="root") {
	let controlLabel = this.getControlLabel(name);
	let controlValue = document.createElement("input");
	controlValue.className = "control-value";
	controlValue.type = "number";
	if (options.hasOwnProperty("min"))
	    controlValue.min = options["min"];
	if (options.hasOwnProperty("max"))
	    controlValue.max = options["max"];
	if (options.hasOwnProperty("value"))
	    controlValue.value = options["value"];
	if (options.hasOwnProperty("step"))
	    controlValue.step = options["step"];
	if (options.hasOwnProperty("cb"))
	    controlValue.onchange = (event) => options["cb"](event.target.value);

	this.addElementToController(controlLabel, sectionName);
	this.addElementToController(controlValue, sectionName);
    }
    addSliderControl(name, options, sectionName="root") {
	let controlLabel = this.getControlLabel(name);
	let controlValue = document.createElement("input");
	controlValue.className = "control-value";
	controlValue.type = "range";
	if (options.hasOwnProperty("min"))
	    controlValue.min = options["min"];
	if (options.hasOwnProperty("max"))
	    controlValue.max = options["max"];
	if (options.hasOwnProperty("step"))
	    controlValue.step = options["step"];
	if (options.hasOwnProperty("value"))
	    controlValue.value = options["value"];
	if (options.hasOwnProperty("cb"))
	    controlValue.onchange = (event) => options["cb"](event.target.value);

	this.addElementToController(controlLabel, sectionName);
	this.addElementToController(controlValue, sectionName);
    }
    addOptionControl(name, options, sectionName="root") {
	let controlLabel = this.getControlLabel(name);
	let controlValue = document.createElement("select");
	controlValue.className = "control-value";
	let listElements = [];
	let defaultElement = "";
	if (options.hasOwnProperty("list"))
	    listElements = options["list"];
	if (options.hasOwnProperty("default"))
	    defaultElement = options["default"];
	for (const optionValue of listElements) {
	    let optionElement = document.createElement("option");
	    optionElement.innerText = optionValue;
	    if (optionValue === defaultElement)
		optionElement.selected = "selected";
	    controlValue.appendChild(optionElement);
	}
	if (options.hasOwnProperty("cb"))
	    controlValue.onchange = (event) => options["cb"](event.target.value);

	this.addElementToController(controlLabel, sectionName);
	this.addElementToController(controlValue, sectionName);
    }
    addBoolControl(name, options, sectionName="root") {
	let controlLabel = this.getControlLabel(name);
	let controlValue = document.createElement("input");
	controlValue.className = "control-value";
	controlValue.type = "checkbox";
	if (options.hasOwnProperty("default"))
	    controlValue.checked = options["default"];
	if (options.hasOwnProperty("disabled"))
	    controlValue.disabled = options["disabled"];
	if (options.hasOwnProperty("cb"))
	    controlValue.onchange = (event) => options["cb"](event.target.checked);

	this.addElementToController(controlLabel, sectionName);
	this.addElementToController(controlValue, sectionName);
    }
    addButtonControl(name, options, sectionName="root") {
	let controlButton = document.createElement("button");
	controlButton.className = "control-button";
	controlButton.type = "button";
	controlButton.innerText = name;
	if (options.hasOwnProperty("cb"))
	    controlButton.onclick = () => options["cb"]();

	this.addElementToController(controlButton, sectionName);
    }
    addControlSection(name, options, sectionName="root") {
	let sectionContainer = document.createElement("div");
	sectionContainer.className = "section-container";
	let sectionTitle = document.createElement("span");
	sectionTitle.className = "section-title";
	sectionTitle.innerText = name;
	let sectionTitleArrow = document.createElement("i");
	sectionTitleArrow.className = "section-title-arrow";
	sectionTitle.appendChild(sectionTitleArrow);
	let controllerContainer = document.createElement("div");
	controllerContainer.className = "section-controller-container";

	sectionTitle.sectionContainer = sectionContainer;
	sectionTitle.sectionTitleArrow = sectionTitleArrow;
	sectionContainer.controllerContainer = controllerContainer;
	controllerContainer.actualHeight = controllerContainer.scrollHeight;
	controllerContainer.visible = true;
	sectionTitle.onclick = () => {
	    let sectionContainer = sectionTitle.sectionContainer;
	    let controllerContainer = sectionContainer.controllerContainer;
	    if (controllerContainer.visible) {
		controllerContainer.style.maxHeight = 0;
		controllerContainer.style.opacity = 0;
		sectionTitleArrow.style.transform = "rotate(45deg)";
		sectionTitleArrow.style.marginTop = "4px";
		sectionTitle.style.marginBottom = "0px";
	    }
	    else {
		controllerContainer.style.maxHeight = controllerContainer.actualHeight + "px";
		controllerContainer.style.opacity = 1;
		sectionTitleArrow.style.transform = "rotate(-135deg)";
		sectionTitleArrow.style.marginTop = "7px";
		sectionTitle.style.marginBottom = "10px";
	    }
	    controllerContainer.visible = !controllerContainer.visible;
	};

	sectionContainer.appendChild(sectionTitle);
	sectionContainer.appendChild(controllerContainer);

	let sectionId = name;
	if (options.hasOwnProperty("id"))
	    sectionId = options["id"];
	this.sectionMap[sectionId] = controllerContainer;
	if (!sectionName) {
	    this.mainContainer.appendChild(sectionContainer);
	}
	else {
	    this.addElementToController(sectionContainer, sectionName);
	}
    }
    show() {
	this.parentContainer.appendChild(this.mainContainer);

	for (const sectionName in this.sectionMap) {
	    let controllerContainer = this.sectionMap[sectionName];
	    controllerContainer.actualHeight = controllerContainer.scrollHeight;
	    controllerContainer.style.maxHeight = controllerContainer.actualHeight + "px";
	}
    }
}
