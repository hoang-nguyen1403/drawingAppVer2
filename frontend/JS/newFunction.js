
var domId = function (id){
	return document.getElementById(id);
}
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
	canVas.style.display = "block";
	myCanVas.style.display = "block";
	mode3D.style.display = "none";
	Gl.style.display = "none";
	// this.document.getElementById("modeGL").value = "Off"
	document.getElementById("colorpicker_label").style.display = "block";
	document.getElementById("line_size").style.display = "block";
	document.getElementById("coord_div").style.display = "block";
	document.getElementById("grid").style.display = "block";
	document.getElementById("line").style.display = "block";
	document.getElementById("fillColor").style.display = "none";
	// document.getElementById("setPosition").style.display = "none";
	document.getElementById("property_solution").style.display = "none";
	document.getElementById("property").style.display = "block";
	document.getElementById("meshing").style.backgroundColor = "white";
	document.getElementById("modeDrawing").style.backgroundColor = "#57fa6d";

}

function ChangeModeGL() {
	// this.document.getElementById("modeGL").value = "On"
	canVas.style.display = "none";
	myCanVas.style.display = "none";
	mode3D.style.display = "none";
	Gl.style.display = "block";
	Gl.style.border = "1px solid #0784d1";
	document.getElementById("fillColor").style.display = "block";
	// document.getElementById("setPosition").style.display = "block";
	document.getElementById("canvasGL").style.display = "block";
	// document.getElementById("mode").style.display = "none";
	document.getElementById("colorpicker_label").style.display = "none";
	document.getElementById("line_size").style.display = "none";
	document.getElementById("coord_div").style.display = "block";
	document.getElementById("grid").style.display = "none";
	document.getElementById("line").style.display = "none";
	document.getElementById("command").style.display = "none";
	document.getElementById("tab-comments").style.display = "none";
	document.getElementById("property").style.display = "none";
	document.getElementById("property_solution").style.display = "block";
	document.getElementById("meshing").style.backgroundColor = "#57fa6d";
	document.getElementById("modeDrawing").style.backgroundColor = "white";
};

function ChangeModeGL3D() {
	// this.document.getElementById("modeGL").value = "On"
	canVas.style.display = "none";
	myCanVas.style.display = "none";
	// Gl.style.display = "none";
	Gl.style.border = "none";
	mode3D.style.display = "block";
	document.getElementById("WebGL_area").style.display = "block"
	document.getElementById("fillColor").style.display = "block";
	// document.getElementById("setPosition").style.display = "block";
	document.getElementById("canvasGL").style.display = "none";
	document.getElementById("mode").style.display = "block";
	document.getElementById("text_colorbar").style.display = "block";
	document.getElementById("canvas_colorbar").style.display = "block";
	document.getElementById("colorpicker_label").style.display = "none";
	document.getElementById("line_size").style.display = "none";
	document.getElementById("coord_div").style.display = "none";
	document.getElementById("grid").style.display = "none";
	document.getElementById("line").style.display = "none";
	document.getElementById("command").style.display = "none";
	document.getElementById("tab-comments").style.display = "none";
	document.getElementById("meshing").style.backgroundColor = "#57fa6d";
	document.getElementById("modeDrawing").style.backgroundColor = "white";
};