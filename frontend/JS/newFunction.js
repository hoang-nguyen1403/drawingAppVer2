
var myCanVas = document.getElementById("myCanvas");
var Gl = document.getElementById("WebGL_area");
var canVas = document.getElementById("wrap_canvas_div");
// document.getElementById("canvasGL").style.display = "none";
var cchangeMode = document.getElementById("modeGL");
cchangeMode.addEventListener("click", ChangeModeGL);
var changeModee = document.getElementById("modeDrawing");
changeModee.addEventListener("click", ChangeModeDrawing);

function ChangeModeDrawing (){
		canVas.style.display = "block";
		myCanVas.style.display = "block";
		Gl.style.display = "none";
		// this.document.getElementById("modeGL").value = "Off"
		document.getElementById("colorpicker_label").style.display = "block";
		document.getElementById("line_size").style.display = "block";
		document.getElementById("coord_div").style.display = "block";
		document.getElementById("grid").style.display = "block";
		document.getElementById("line").style.display = "block";
		document.getElementById("command").style.display = "block";
		document.getElementById("fillColor").style.display = "none";
}

function ChangeModeGL (){
		// this.document.getElementById("modeGL").value = "On"
		canVas.style.display = "none";
		myCanVas.style.display = "none";
		Gl.style.display = "block";
		    document.getElementById("fillColor").style.display = "block";
		document.getElementById("canvasGL").style.display = "block";
		document.getElementById("colorpicker_label").style.display = "none";
		document.getElementById("line_size").style.display = "none";
		document.getElementById("coord_div").style.display = "none";
		document.getElementById("grid").style.display = "none";
		document.getElementById("line").style.display = "none";
		document.getElementById("command").style.display = "none";
		document.getElementById("tab-comments").style.display = "none";
};