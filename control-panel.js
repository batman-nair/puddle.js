class ControlPanel {
    constructor() {
	this.parentContainer = document.querySelector("body");
	this.mainContainer = document.createElement("div");
	this.mainContainer.className = "controller-container";
	this.controllerMap = {};
    }
    getControlLabel(name) {
	let controlLabel = document.createElement("span");
	controlLabel.className = "control-label";
	controlLabel.innerText = name;
	return controlLabel;
    }
    addNumberControl(name, options) {
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

	this.mainContainer.appendChild(controlLabel);
	this.mainContainer.appendChild(controlValue);
    }
    addSliderControl(name, options) {
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

	this.mainContainer.appendChild(controlLabel);
	this.mainContainer.appendChild(controlValue);
    }
    addOptionControl(name, options) {
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

	this.mainContainer.appendChild(controlLabel);
	this.mainContainer.appendChild(controlValue);
    }
    addBoolControl(name, options) {
	let controlLabel = this.getControlLabel(name);
	let controlValue = document.createElement("input");
	controlValue.className = "control-value";
	controlValue.type = "checkbox";
	if (options.hasOwnProperty("default"))
	    controlValue.checked = options["default"];
	if (options.hasOwnProperty("cb"))
	    controlValue.onchange = (event) => options["cb"](event.target.checked);

	this.mainContainer.appendChild(controlLabel);
	this.mainContainer.appendChild(controlValue);

    }

    show() {
	this.parentContainer.appendChild(this.mainContainer);
    }
}

// section = document.querySelector(".section-title")
// sec_cont = document.querySelector(".section-container")
// let maxHeight = sec_cont.scrollHeight;
// sec_cont.style.maxHeight = maxHeight + "px";
// sec_cont.style.opacity = 1;
// console.log("maxHeight: ", maxHeight);

// visible = true;
// section.onclick = () => {
//     console.log("onclick ", visible, " : ", maxHeight);
//     if (visible) {
// 	sec_cont.style.maxHeight = "0";
// 	sec_cont.style.opacity = "0";
//     }
//     else {
// 	sec_cont.style.maxHeight = maxHeight + "px";
// 	sec_cont.style.opacity = "1";
//     }
//     visible = !visible;
// };


// let nodeStyle = document.getElementById("node-style");
// nodeStyle.onchange = () => { ar.setNodeStyle(nodeStyle.value) };
