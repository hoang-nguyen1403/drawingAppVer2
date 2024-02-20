
var myCanVas = document.getElementById("myCanvas");
var Gl = document.getElementById("WebGL_area");
var canVas = document.getElementById("wrap_canvas_div");
// document.getElementById("canvasGL").style.display = "none";
var cchangeMode = document.getElementById("modeGL");
cchangeMode.addEventListener("click", ChangeModeGL);
var changeModee = document.getElementById("modeDrawing");
changeModee.addEventListener("click", ChangeModeDrawing);
var mode3D = document.getElementById("Mode3D");
function ChangeModeDrawing() {
	domID("modeDrawing").value = "On";
	canVas.style.display = "block";
	myCanVas.style.display = "block";
	mode3D.style.display = "none";
	Gl.style.display = "none";
	domID("CanvasInput").style.display = "block";
	document.getElementById("property_solution").style.display = "none";
	document.getElementById("property").style.display = "block";
	document.getElementById("meshing").style.backgroundColor = "white";
	document.getElementById("modeDrawing").style.backgroundColor = "#57fa6d";
	document.getElementById("coord_div").style.display = "flex";
	PaintIn.canvas.width = document.getElementById("wrap_canvas_div").clientWidth;
	PaintIn.canvas.height = document.getElementById("wrap_canvas_div").clientHeight;
	PaintIn.renderObject(processingData.allObject);
	// resize.drawAfterResize();
}

function ChangeModeGL() {
	// this.document.getElementById("modeGL").value = "On"
	canVas.style.display = "none";
	myCanVas.style.display = "none";
	mode3D.style.display = "none";
	Gl.style.display = "block";
	Gl.style.border = "1px solid #0784d1";
	Gl.style.width = "100%";
	Gl.style.height = "100%";
	// document.getElementById("setPosition").style.display = "block";
	document.getElementById("canvasGL").style.display = "block";
	domID("CanvasInput").style.display = "none";
	// document.getElementsByClassName("tab")[0].style.width = "3%";
	// domID("tab-comments").style.display = "none";
	// domID("tab-icon").style.width = "100%";
	// domID("Show").style.width = "97%";
	// domID("tab-icon").value = "Off";
	// // domClass("tab")[0].style.display = "none";
	// domID("tab-icon").style.transform = "rotate(180deg)";
	// domID("tab-icon").title = "Open"; 
	document.getElementById("property").style.display = "none";
	document.getElementById("property_solution").style.display = "block";
	document.getElementById("meshing").style.backgroundColor = "#57fa6d";
	document.getElementById("modeDrawing").style.backgroundColor = "white";
	document.getElementById("request").style.display = "none";
	document.getElementById("settingRequest").value = "Off";
	document.getElementById("settingRequest").style.backgroundColor = "#ffff";
	// resize.drawAfterResize();
};

function ChangeModeGL3D() {
	// this.document.getElementById("modeGL").value = "On"
	canVas.style.display = "none";
	myCanVas.style.display = "none";
	// Gl.style.display = "none";
	Gl.style.border = "none";
	Gl.style.width = "0";
	Gl.style.height = "0";
	mode3D.style.display = "block";
	document.getElementById("WebGL_area").style.display = "block"
	document.getElementById("fillColor").style.display = "block";
	// document.getElementById("setPosition").style.display = "block";
	document.getElementById("canvasGL").style.display = "none";
	document.getElementById("mode").style.display = "block";
	document.getElementById("text_colorbar").style.display = "block";
	document.getElementById("canvas_colorbar").style.display = "block";
	document.getElementById("coord_div").style.display = "none";
	document.getElementById("command").style.display = "none";
	domID("CanvasInput").style.display = "none";
	// domID("tab-icon").value = "Off";
	// // domClass("tab")[0].style.display = "none";
	// document.getElementsByClassName("tab")[0].style.width = "3%";
	// domID("tab-comments").style.display = "none";
	// domID("tab-icon").style.width = "100%";
	// domID("Show").style.width = "97%";
	// domID("tab-icon").style.transform = "rotate(180deg)";
	// domID("tab-icon").title = "Open";
	document.getElementById("meshing").style.backgroundColor = "#57fa6d";
	document.getElementById("modeDrawing").style.backgroundColor = "white";
	document.getElementById("request").style.display = "none";
	document.getElementById("settingRequest").value = "Off";
	document.getElementById("settingRequest").style.backgroundColor = "#ffff";
	// resize.drawAfterResize();
};


function Tool() {
    if (domID("roof").value == "Off") {
        domID("roof").value = "On";
		domID("tool_left").style.backgroundColor = "#e6f5ff"
		domID("tool_left").style.border = "1px solid #0784d1"
        domID("tool").style.display = "flex";
        domID("roof").style.transform = "rotate(-90deg)";
		
    } else{
		domID("tool_left").style.backgroundColor = "transparent"
		domID("tool_left").style.border = "none"
		domID("roof").value = "Off";
        domID("tool").style.display = "none";
        domID("roof").style.transform = "rotate(90deg)";
    }
}