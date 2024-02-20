// USING FOR DRAWING GEOMETRY IN WEBGL ===============================================================================================================
class Drawing {
	constructor() {
		// Declare canvas and webgl
		this.canvas = document.querySelector("#myCanvas");
		this.gl = this.canvas.getContext("webgl");
		this.canvas.width = document.getElementById("wrap_canvas_div").clientWidth;
		this.canvas.height =
			document.getElementById("wrap_canvas_div").clientHeight;
		// Load script Shader
		this.vertex = this.loadVSFG('./frontend/shader/shader_black.vs');
		this.fragment = this.loadVSFG('./frontend/shader/shader_black.fs');

		// Compiles shaders and create program
		this.programInfo = twgl.createProgramInfo(this.gl, [this.vertex, this.fragment]);

		// Declare the geometry sphere imformation from library twgl
		this.sphereVerts = twgl.primitives.createSphereVertices(1, 24, 12);
		// Create the buffer info from array for the sphere geometry
		this.sphereBufferInfo = twgl.createBufferInfoFromArrays(this.gl, {
			a_position: this.sphereVerts.position,
			indices: this.sphereVerts.indices,
		});

		// Create default values for camera view
		this.camera = {
			x: 0,
			y: 0,
			rotation: 0,
			zoom: 1,
		};


		// Declare scene view and set up mouse position
		this.viewProjectionMat = new Float32Array([0.0013840830652043223, 0, 0, 0, -0.004566209856420755, 0, -1, 1, 1]);
		this.viewProjectionMat_colorbar;
		this.startInvViewProjMat;
		this.startCamera;
		this.startPos;
		this.startClipPos;
		this.startMousePos;
		this.startInvViewProjMat_check;
		this.startCamera_check;
		this.startPos_check;
		this.startClipPos_check;
		this.startMousePos_check;

		//  Declare rotate
		this.rotate;

		// Bool for drawing or not drawing
		this.isDrawing;

		// Bool for selecting or not selecting
		this.isSelecting;

		// Bool for dragging or not dragging
		this.isDragging;

		// Data storage

		// Data storage mouse down position
		this.mouseDownPos = []; //start
		this.mouseDownPosBox = [];
		this.arrMouseDownPosition = [];
		this.currentMouseDownPos = [];

		// Data storage point coordinate
		this.arrPoint = [];
		this.arrPointStorage = [];

		// Data storage line coordinate x and y
		this.arrLineX = [];
		this.arrLineY = [];
		this.arrLine = [];
		this.arrLineStorage = [];

		// Data storage area point coordinate
		this.arrArea = [];

		// Data storage - scene
		this.scenePoint = [];
		this.sceneLine = [];
		this.sceneLineMove = [];
		this.sceneArea = [];
		this.sceneBox = [];
		this.sceneSelectedPoint = [];
		this.sceneSelectedLine = [];
		this.sceneSelectedArea = [];

		// Data storage - selected Point, Line and Area
		this.storageSelectPoint = [];
		this.storageSelectLine = [];
		this.storageSelectArea = [];
		this.selectPoint = [];
		this.selectLine = [];
		this.selectArea = [];

		// Data storage - find point near mouse when moving
		this.nearPointGL = [];

		// Hover Point, Line and Area
		this.hoverLine = [];
		this.hoverPoint = [];
		this.hoverArea = [];

		// Color
		this.colorDefault = [0, 0, 0, 1];
		this.colorDefaultArea = [0.90, 0.95, 1.00, 1.0];
		this.colorNearPoint = [1, 0, 0, 1];
		this.colorHoverLine = [1, 0, 0, 1];
		this.colorHoverArea = [0.69, 0.89, 0.98, 1.0];
		this.colorPickPoint = [0.00, 0.50, 0.00, 1.0];
		this.colorPickLine = [0, 0, 1, 1];
		this.colorPickArea = [0.71, 0.85, 0.91, 1.0];
		this.colorSceneBox = [0.74, 0.98, 1.00, 1.0];
	}
	clearData() {
		this.camera = {
			x: 0,
			y: 0,
			rotation: 0,
			zoom: 1,
		};


		// Declare scene view and set up mouse position
		this.viewProjectionMat = new Float32Array([0.0013840830652043223, 0, 0, 0, -0.004566209856420755, 0, -1, 1, 1]);
		this.viewProjectionMat_colorbar = [];
		this.startInvViewProjMat = [];
		this.startCamera = [];
		this.startPos = [];
		this.startClipPos = [];
		this.startMousePos = [];
		this.startInvViewProjMat_check = [];
		this.startCamera_check = [];
		this.startPos_check = [];
		this.startClipPos_check = [];
		this.startMousePos_check = [];

		//  Declare rotate
		this.rotate = false;

		// Bool for drawing or not drawing
		this.isDrawing;

		// Bool for selecting or not selecting
		this.isSelecting;

		// Bool for dragging or not dragging
		this.isDragging;

		// Data storage

		// Data storage mouse down position
		this.mouseDownPos = []; //start
		this.mouseDownPosBox = [];
		this.arrMouseDownPosition = [];
		this.currentMouseDownPos = [];

		// Data storage point coordinate
		this.arrPoint = [];
		this.arrPointStorage = [];

		// Data storage line coordinate x and y
		this.arrLineX = [];
		this.arrLineY = [];
		this.arrLine = [];
		this.arrLineStorage = [];

		// Data storage area point coordinate
		this.arrArea = [];

		// Data storage - scene
		this.scenePoint = [];
		this.sceneLine = [];
		this.sceneLineMove = [];
		this.sceneArea = [];
		this.sceneBox = [];
		this.sceneSelectedPoint = [];
		this.sceneSelectedLine = [];
		this.sceneSelectedArea = [];

		// Data storage - selected Point, Line and Area
		this.storageSelectPoint = [];
		this.storageSelectLine = [];
		this.storageSelectArea = [];
		this.selectPoint = [];
		this.selectLine = [];
		this.selectArea = [];

		// Data storage - find point near mouse when moving
		this.nearPointGL = [];

		// Hover Point, Line and Area
		this.hoverLine = [];
		this.hoverPoint = [];
		this.hoverArea = [];

		// Color
		this.colorDefault = [0, 0, 0, 1];
		this.colorDefaultArea = [0.90, 0.95, 1.00, 1.0];
		this.colorHoverLine = [1, 0, 0, 1];
		this.colorHoverArea = [0.69, 0.89, 0.98, 1.0];
		this.colorPickPoint = [0.00, 0.50, 0.00, 1.0];
		this.colorPickLine = [0, 0, 1, 1];
		this.colorPickArea = [0.71, 0.85, 0.91, 1.0];
		this.colorSceneBox = [0.74, 0.98, 1.00, 1.0];
	}
	// Load vertex and fragment shader
	loadVSFG(path) {
		var request = new XMLHttpRequest();
		request.open('GET', path, false);
		request.overrideMimeType('text\/plain; charset=x-user-defined');
		request.send();
		return ((request.status === 0) || (request.status === 200)) ? request.responseText : null;
	}

	// Create camera matrix
	makeCameraMatrix() {
		const zoomScale = 1 / this.camera.zoom;
		let cameraMat = m3.identity();
		cameraMat = m3.translate(cameraMat, this.camera.x, this.camera.y);
		cameraMat = m3.rotate(cameraMat, this.camera.rotation);
		cameraMat = m3.scale(cameraMat, zoomScale, zoomScale);
		return cameraMat;
	}

	// Update camera matrix
	updateViewProjection() {
		// same as ortho(0, width, height, 0, -1, 1)
		const projectionMat = m3.projection(this.gl.canvas.width, this.gl.canvas.height);
		const cameraMat = this.makeCameraMatrix();
		let viewMat = m3.inverse(cameraMat);
		this.viewProjectionMat = m3.multiply(projectionMat, viewMat);
	}
	// Processing Data for Drawing
	handleData() {
		this.arrPoint = [];
		this.arrPointStorage = [];
		this.arrLine = [];
		this.arrLineStorage = [];
		// handle data for point
		for (let i = 0; i < processingData.allPoint.length; i++) {
			this.arrPoint.push(processingData.allPoint[i].x, processingData.allPoint[i].y);
			this.arrPointStorage.push(processingData.allPoint[i].x, processingData.allPoint[i].y);
		}
		// handle Data for Line
		for (let i = 0; i < processingData.allLine.length; i++) {
			this.arrLine.push(processingData.allLine[i].Point[0].x, processingData.allLine[i].Point[0].y, processingData.allLine[i].Point[1].x, processingData.allLine[i].Point[1].y);
			this.arrLineStorage.push(processingData.allLine[i].Point[0].x, processingData.allLine[i].Point[0].y, processingData.allLine[i].Point[1].x, processingData.allLine[i].Point[1].y);
		}
	}
	handleDataStorage() {
		this.arrPointStorage = [];
		this.arrLineStorage = [];
		// handle data for point
		for (let i = 0; i < processingData.allPoint.length; i++) {
			this.arrPointStorage.push(processingData.allPoint[i].x, processingData.allPoint[i].y);
		}
		// handle Data for Line
		for (let i = 0; i < processingData.allLine.length; i++) {
			this.arrLineStorage.push(processingData.allLine[i].Point[0].x, processingData.allLine[i].Point[0].y, processingData.allLine[i].Point[1].x, processingData.allLine[i].Point[1].y);
		}
	}
	handleArea() {
		this.sceneArea = [];
		for (let i = 0; i < processingData.allArea.length; i++) {
			this.arrArea = [];
			this.arrArea.push(processingData.allArea[i].pointFlow);
			this.arrArea = this.arrArea.flat();
			let triangles = earClipping(this.arrArea);
			triangles = triangles.flat();
			triangles = triangles.flat();
			let bufferInfoArea = this.CreateBufferInfo(triangles, null);
			this.sceneArea.push({ color: this.colorDefaultArea, bufferInfo: bufferInfoArea });
		}
	}

	// Create buffer Info 
	CreateBufferInfo(vertices, indices) {
		if (indices == null) {
			let bufferInfo = twgl.createBufferInfoFromArrays(this.gl, {
				a_position: {
					numComponents: 2,
					data: vertices
				},
			})
			return bufferInfo
		} else {
			let bufferInfo = twgl.createBufferInfoFromArrays(this.gl, {
				a_position: {
					numComponents: 2,
					data: vertices
				},
				indices: indices
			})
			return bufferInfo
		}
	}

	// Drawing Point in webGL
	DrawPoint() {
		for (let i = 0; i < DrawingGL.scenePoint.length; i++) {
			const { color, bufferInfo } = DrawingGL.scenePoint[i];
			twgl.setBuffersAndAttributes(this.gl, this.programInfo, bufferInfo);
			twgl.setUniforms(this.programInfo, {
				u_matrix: this.viewProjectionMat,
				u_color: color,
			});
			twgl.drawBufferInfo(this.gl, bufferInfo, this.gl.POINTS);
		}
	}

	// Drawing sphere check near Point
	DrawSphere(thing, color = this.colorNearPoint) {
		this.gl.useProgram(this.programInfo.program);
		const { x, y } = thing;
		twgl.setBuffersAndAttributes(this.gl, this.programInfo, this.sphereBufferInfo);
		let mat = m3.identity();
		mat = m3.translate(mat, x, y);
		mat = m3.rotate(mat, 0);
		mat = m3.scale(mat, 6 / this.camera.zoom, 6 / this.camera.zoom);
		this.gl.getParameter(this.gl.LINE_WIDTH);
		this.gl.getParameter(this.gl.ALIASED_LINE_WIDTH_RANGE);
		// calls gl.uniformXXX
		twgl.setUniforms(this.programInfo, {
			u_matrix: m3.multiply(this.viewProjectionMat, mat),
			u_color: color,
		});
		// calls gl.drawArrays or gl.drawElements
		twgl.drawBufferInfo(this.gl, this.sphereBufferInfo);
	}
	DrawPointPicked(thing, color) {
		this.gl.useProgram(this.programInfo.program);
		const { x, y } = thing;
		twgl.setBuffersAndAttributes(this.gl, this.programInfo, this.sphereBufferInfo);
		let mat = m3.identity();
		mat = m3.translate(mat, x, y);
		mat = m3.rotate(mat, 0);
		mat = m3.scale(mat, 6 / this.camera.zoom, 6 / this.camera.zoom);
		this.gl.getParameter(this.gl.LINE_WIDTH);
		this.gl.getParameter(this.gl.ALIASED_LINE_WIDTH_RANGE);
		// calls gl.uniformXXX
		twgl.setUniforms(this.programInfo, {
			u_matrix: m3.multiply(this.viewProjectionMat, mat),
			u_color: color,
		});
		// calls gl.drawArrays or gl.drawElements
		twgl.drawBufferInfo(this.gl, this.sphereBufferInfo);
	}
	DrawMultiPoint() {
		for (let data of this.sceneSelectedPoint) {
			this.gl.useProgram(this.programInfo.program);
			const { x, y, color } = data;
			twgl.setBuffersAndAttributes(this.gl, this.programInfo, this.sphereBufferInfo);
			let mat = m3.identity();
			mat = m3.translate(mat, x, y);
			mat = m3.rotate(mat, 0);
			mat = m3.scale(mat, 6 / this.camera.zoom, 6 / this.camera.zoom);
			this.gl.getParameter(this.gl.LINE_WIDTH);
			this.gl.getParameter(this.gl.ALIASED_LINE_WIDTH_RANGE);
			// calls gl.uniformXXX
			twgl.setUniforms(this.programInfo, {
				u_matrix: m3.multiply(this.viewProjectionMat, mat),
				u_color: color,
			});
			// calls gl.drawArrays or gl.drawElements
			twgl.drawBufferInfo(this.gl, this.sphereBufferInfo);
		}
	}

	// Drawing Line in webGL
	DrawLine() {
		for (let i = 0; i < DrawingGL.sceneLine.length; i++) {
			const { color, bufferInfo } = DrawingGL.sceneLine[i];
			twgl.setBuffersAndAttributes(this.gl, this.programInfo, bufferInfo);
			twgl.setUniforms(this.programInfo, {
				u_matrix: this.viewProjectionMat,
				u_color: color,
			});
			twgl.drawBufferInfo(this.gl, bufferInfo, this.gl.LINES);
		}
	}

	DrawLineMove() {
		for (let i = 0; i < DrawingGL.sceneLineMove.length; i++) {
			const { color, bufferInfo } = DrawingGL.sceneLineMove[i];
			twgl.setBuffersAndAttributes(this.gl, this.programInfo, bufferInfo);
			twgl.setUniforms(this.programInfo, {
				u_matrix: this.viewProjectionMat,
				u_color: color,
			});
			twgl.drawBufferInfo(this.gl, bufferInfo, this.gl.LINES);
		}
	}

	DrawLineSelect() {
		for (let i = 0; i < DrawingGL.selectLine.length; i++) {
			const { color, bufferInfo } = DrawingGL.selectLine[i];
			twgl.setBuffersAndAttributes(this.gl, this.programInfo, bufferInfo);
			twgl.setUniforms(this.programInfo, {
				u_matrix: this.viewProjectionMat,
				u_color: color,
			});
			twgl.drawBufferInfo(this.gl, bufferInfo, this.gl.LINES);
		}
	}

	DrawLinePicked() {
		for (let i = 0; i < DrawingGL.sceneSelectedLine.length; i++) {
			const { color, bufferInfo } = DrawingGL.sceneSelectedLine[i];
			twgl.setBuffersAndAttributes(this.gl, this.programInfo, bufferInfo);
			twgl.setUniforms(this.programInfo, {
				u_matrix: this.viewProjectionMat,
				u_color: color,
			});
			twgl.drawBufferInfo(this.gl, bufferInfo, this.gl.LINES);
		}
	}

	// Drawing Area in webGL
	DrawArea() {
		for (let i = 0; i < DrawingGL.sceneArea.length; i++) {
			const { color, bufferInfo } = DrawingGL.sceneArea[i];
			twgl.setBuffersAndAttributes(this.gl, this.programInfo, bufferInfo);
			twgl.setUniforms(this.programInfo, {
				u_matrix: this.viewProjectionMat,
				u_color: color,
			});
			twgl.drawBufferInfo(this.gl, bufferInfo);
		}
	}

	DrawAreaSelect() {
		for (let i = 0; i < DrawingGL.selectArea.length; i++) {
			const { color, bufferInfo } = DrawingGL.selectArea[i];
			twgl.setBuffersAndAttributes(this.gl, this.programInfo, bufferInfo);
			twgl.setUniforms(this.programInfo, {
				u_matrix: this.viewProjectionMat,
				u_color: color,
			});
			twgl.drawBufferInfo(this.gl, bufferInfo);
		}
	}

	DrawAreaPicked() {
		for (let i = 0; i < DrawingGL.sceneSelectedArea.length; i++) {
			const { color, bufferInfo } = DrawingGL.sceneSelectedArea[i];
			twgl.setBuffersAndAttributes(this.gl, this.programInfo, bufferInfo);
			twgl.setUniforms(this.programInfo, {
				u_matrix: this.viewProjectionMat,
				u_color: color,
			});
			twgl.drawBufferInfo(this.gl, bufferInfo);
		}
	}

	DrawBox() {
		for (let i = 0; i < DrawingGL.sceneBox.length; i++) {
			const { color, bufferInfo } = DrawingGL.sceneBox[i];
			twgl.setBuffersAndAttributes(this.gl, this.programInfo, bufferInfo);
			twgl.setUniforms(this.programInfo, {
				u_matrix: this.viewProjectionMat,
				u_color: color,
			});
			twgl.drawBufferInfo(this.gl, bufferInfo, this.gl.TRIANGLE_FAN);
		}
	}

	DrawMain() {
		twgl.resizeCanvasToDisplaySize(this.gl.canvas)
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.depthFunc(this.gl.LEQUAL);
		this.updateViewProjection();
		this.gl.useProgram(this.programInfo.program);
		this.DrawArea();
		this.DrawAreaSelect();
		this.DrawAreaPicked();
		this.DrawBox();
		this.DrawLine();
		this.DrawLinePicked();
		this.DrawLineSelect();
		this.DrawLineMove();
		this.DrawPoint();
		this.DrawPointPicked({ x: DrawingGL.storageSelectPoint.x, y: DrawingGL.storageSelectPoint.y }, DrawingGL.colorPickPoint);
		this.DrawMultiPoint();
	}
}
const DrawingGL = new Drawing();

// var tt;