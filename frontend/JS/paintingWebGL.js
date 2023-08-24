

// USING CLASS DRAW FOR DRAWING ===============================================================================================================
class Draw {
  constructor() {
    this.canvas = document.querySelector("#my_canvasTest");
    this.canvas.width = document.getElementById("wrap_canvas_div").clientWidth;
    this.canvas.height = document.getElementById("wrap_canvas_div").clientHeight;
    this.gl = this.canvas.getContext("experimental-webgl");

    this.vertex = this.loadVSFG('./frontend/shader/shader_black.vs');
    this.fragment = this.loadVSFG('./frontend/shader/shader_black.fs');
    // compiles shaders, links program, looks up locations
    this.programInfo = twgl.createProgramInfo(this.gl, [this.vertex, this.fragment]);
    this.sphereVerts = twgl.primitives.createSphereVertices(1, 24, 12);
    this.camera = {
      x: 0,
      y: 0,
      rotation: 0,
      zoom: 1,
    };
    this.viewProjectionMat = new Float32Array([0.0013840830652043223, 0, 0, 0, -0.004566209856420755, 0, -1, 1, 1]);
    this.startInvViewProjMat;
    this.startCamera;
    this.startPos;
    this.startClipPos;
    this.startMousePos;
    this.rotate;
    this.viewProjectionMat1;
    this.startInvViewProjMat1;
    this.startCamera1;
    this.startPos1;
    this.startClipPos1;
    this.startMousePos1;
    this.nearPointGL;
    this.scene = [];
    this.sceneCheck = [];
    this.storageSelectedLine = [];
    this.selectedLine = [];
    this.hoverLine = [];
    this.sceneSelectedLine = [];
  }

  // Load vertex and fragment shader
  loadVSFG(path) {
    var request = new XMLHttpRequest();
    request.open('GET', path, false);
    request.overrideMimeType('text\/plain; charset=x-user-defined');
    request.send();
    return ((request.status === 0) || (request.status === 200)) ? request.responseText : null;
  }

  makeCameraMatrix() {
    const zoomScale = 1 / DrawGL.camera.zoom;
    let cameraMat = m3.identity();
    cameraMat = m3.translate(cameraMat, DrawGL.camera.x, DrawGL.camera.y);
    cameraMat = m3.rotate(cameraMat, DrawGL.camera.rotation);
    cameraMat = m3.scale(cameraMat, zoomScale, zoomScale);
    return cameraMat;
  }
  updateViewProjection() {
    // same as ortho(0, width, height, 0, -1, 1)
    const projectionMat = m3.projection(this.gl.canvas.width, this.gl.canvas.height);
    const cameraMat = this.makeCameraMatrix();
    let viewMat = m3.inverse(cameraMat);
    DrawGL.viewProjectionMat = m3.multiply(projectionMat, viewMat);
  }

  drawLineSelected(thing) {
    this.updateViewProjection();
    this.gl.useProgram(this.programInfo.program);
    for (let i = 0; i < DrawGL.sceneSelectedLine.length; i++) {
      const { x, y, rotation, scale, color, bufferInfo } = DrawGL.sceneSelectedLine[i];

      // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
      twgl.setBuffersAndAttributes(this.gl, this.programInfo, bufferInfo);

      let mat = m3.identity();
      mat = m3.translate(mat, x, y);
      mat = m3.rotate(mat, rotation);
      mat = m3.scale(mat, scale, scale);
      this.gl.lineWidth(100);
      this.gl.getParameter(this.gl.LINE_WIDTH);
      this.gl.getParameter(this.gl.ALIASED_LINE_WIDTH_RANGE);
      // calls gl.uniformXXX
      twgl.setUniforms(this.programInfo, {
        u_matrix: m3.multiply(DrawGL.viewProjectionMat, mat),
        u_color: color,
      });

      // calls gl.drawArrays or gl.drawElements
      twgl.drawBufferInfo(this.gl, bufferInfo, this.gl.LINES);
    }
  }
  drawThing1(thing) {
    const { x, y, rotation, scale, color, bufferInfo } = thing;

    // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
    twgl.setBuffersAndAttributes(this.gl, this.programInfo, bufferInfo);

    let mat = m3.identity();
    mat = m3.translate(mat, x, y);
    mat = m3.rotate(mat, rotation);
    mat = m3.scale(mat, scale, scale);
    this.gl.lineWidth(100);
    this.gl.getParameter(this.gl.LINE_WIDTH);
    this.gl.getParameter(this.gl.ALIASED_LINE_WIDTH_RANGE);
    // calls gl.uniformXXX
    twgl.setUniforms(this.programInfo, {
      u_matrix: m3.multiply(DrawGL.viewProjectionMat, mat),
      u_color: color,
    });

    // calls gl.drawArrays or gl.drawElements
    twgl.drawBufferInfo(this.gl, bufferInfo);
  }

  drawPoint() {
    this.updateViewProjection();
    for (let i = 0; i < Draw.scenePoint.length; i++) {
      let bufferInfo = Draw.scenePoint[i];
      twgl.setBuffersAndAttributes(this.gl, this.programInfo, bufferInfo);
      const color = [1, 0, 0, 1];

      this.gl.lineWidth(100);
      this.gl.getParameter(this.gl.LINE_WIDTH);
      this.gl.getParameter(this.gl.ALIASED_LINE_WIDTH_RANGE);
      // calls gl.uniformXXX
      twgl.setUniforms(this.programInfo, {
        u_matrix: DrawGL.viewProjectionMat,
        u_color: color,
      });

      // calls gl.drawArrays or gl.drawElements
      twgl.drawBufferInfo(this.gl, bufferInfo, this.gl.POINTS);
    }
  }

  drawThingOpen(thing) {

  }
  drawCheckpoint(thing) {
    const { x, y, rotation, scale, color, bufferInfo } = thing;

    // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
    twgl.setBuffersAndAttributes(this.gl, this.programInfo, bufferInfo);

    let mat = m3.identity();
    mat = m3.translate(mat, x, y);
    mat = m3.rotate(mat, rotation);
    mat = m3.scale(mat, scale, scale);
    this.gl.lineWidth(100);
    this.gl.getParameter(this.gl.LINE_WIDTH);
    this.gl.getParameter(this.gl.ALIASED_LINE_WIDTH_RANGE);
    // calls gl.uniformXXX
    twgl.setUniforms(this.programInfo, {
      u_matrix: m3.multiply(DrawGL.viewProjectionMat, mat),
      u_color: color,
    });

    // calls gl.drawArrays or gl.drawElements
    twgl.drawBufferInfo(this.gl, bufferInfo);
  }

  createPointObjGL(point_x, point_y) {
    let allPointGLObj = [];
    for (let index = 0; index <= point_x.length - 1; index++) {
      let point = [point_x[index], point_y[index]];
      let PointObj = new Point(point);
      allPointGLObj.push(PointObj);
    }
    return allPointGLObj;
  }

  drawFill() {
    this.updateViewProjection();

    this.gl.useProgram(this.programInfo.program);
    Draw.scene_fill.forEach(this.drawThing1);
  }

  draw() {
    // gl.clear(gl.COLOR_BUFFER_BIT);

    this.updateViewProjection();

    this.gl.useProgram(this.programInfo.program);
    for (let i = 0; i < DrawGL.scene.length; i++) {
      const { x, y, rotation, scale, color, bufferInfo } = DrawGL.scene[i];

      // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
      twgl.setBuffersAndAttributes(this.gl, this.programInfo, bufferInfo);

      let mat = m3.identity();
      mat = m3.translate(mat, x, y);
      mat = m3.rotate(mat, rotation);
      mat = m3.scale(mat, scale, scale);
      this.gl.lineWidth(100);
      this.gl.getParameter(this.gl.LINE_WIDTH);
      this.gl.getParameter(this.gl.ALIASED_LINE_WIDTH_RANGE);
      // calls gl.uniformXXX
      twgl.setUniforms(DrawGL.programInfo, {
        u_matrix: m3.multiply(DrawGL.viewProjectionMat, mat),
        u_color: color,
      });

      // calls gl.drawArrays or gl.drawElements
      twgl.drawBufferInfo(this.gl, bufferInfo, this.gl.LINE_STRIP);
      // twgl.drawBufferInfo(gl, bufferInfo);
      twgl.drawBufferInfo(this.gl, bufferInfo, this.gl.POINTS);
    }
  }
  drawOpen() {
    // gl.clear(gl.COLOR_BUFFER_BIT);

    this.updateViewProjection();

    this.gl.useProgram(this.programInfo.program);
    for (let i = 0; i < Draw.sceneOpen.length; i++) {
      const { x, y, rotation, scale, color, bufferInfo } = Draw.sceneOpen[i];

      // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
      twgl.setBuffersAndAttributes(this.gl, this.programInfo, bufferInfo);

      let mat = m3.identity();
      mat = m3.translate(mat, x, y);
      mat = m3.rotate(mat, rotation);
      mat = m3.scale(mat, scale, scale);
      this.gl.lineWidth(100);
      this.gl.getParameter(this.gl.LINE_WIDTH);
      this.gl.getParameter(this.gl.ALIASED_LINE_WIDTH_RANGE);
      // calls gl.uniformXXX
      twgl.setUniforms(this.programInfo, {
        u_matrix: m3.multiply(DrawGL.viewProjectionMat, mat),
        u_color: color,
      });

      // calls gl.drawArrays or gl.drawElements
      twgl.drawBufferInfo(this.gl, bufferInfo, this.gl.POINTS);
      // twgl.drawBufferInfo(gl, bufferInfo);
      twgl.drawBufferInfo(this.gl, bufferInfo, this.gl.LINES);
    }
  }
  drawCheck() {
    this.updateViewProjection();

    this.gl.useProgram(this.programInfo.program);

    for (let i = 0; i < DrawGL.sceneCheck.length; i++) {
      const { bufferInfo, color } = DrawGL.sceneCheck[i];
      // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
      twgl.setBuffersAndAttributes(this.gl, this.programInfo, bufferInfo);


      this.gl.lineWidth(100);
      this.gl.getParameter(this.gl.LINE_WIDTH);
      this.gl.getParameter(this.gl.ALIASED_LINE_WIDTH_RANGE);
      // calls gl.uniformXXX
      twgl.setUniforms(this.programInfo, {
        u_matrix: DrawGL.viewProjectionMat,
        u_color: color,
      });

      // twgl.drawBufferInfo(gl, bufferInfo);
      twgl.drawBufferInfo(this.gl, bufferInfo, this.gl.LINES);
    }
  }

}
const DrawGL = new Draw();

// GLOBAL PARAMETERS===================================================================================================================
//Draw.pointGLObj: là mảng để lưu trữ Object là điểm không bị trùng nhau
Draw.pointGLObj = [];

//Draw.newPointGL: là mảng để lưu trữ Object là điểm nhưng có thể bị trùng tọa độ điểm (nếu là hình khép kín)
Draw.newPointGL = [];

Draw.scenePoint = [];
Draw.arrMultiCurObj = [];
Draw.newLines = [];
Draw.newIntersPoints = [];
Draw.lineVertex = [];
Draw.segment_mesh = [];
Draw.point_x = [];
Draw.point_y = [];
Draw.segment = [];
Draw.sceneOpen = [];
Draw.scene_fill = [];
Draw.takePoint = [];
Draw.pointGL = [];
Draw.pointName = "";
Draw.listloadPoints = [];

Draw.lineSelect = [];
Draw.segmentSelect = [];

// CLASS LINE ==================================================================================================================================
var bufferInfo = twgl.createBufferInfoFromArrays(DrawGL.gl, {
  a_position: {
    numComponents: 2,
    data: Draw.lineVertex,
  },
  indices: processingData.allSeg,
});

var sphereBufferInfo = twgl.createBufferInfoFromArrays(DrawGL.gl, {
  a_position: DrawGL.sphereVerts.position,
  indices: DrawGL.sphereVerts.indices,
});

DrawGL.scene = [
  { x: 0, y: 0, rotation: 0, scale: 1, color: [0, 0, 0, 1], bufferInfo },
];

function selectLine(event) {
  if (event.buttons === 1) {
    let selectedObj = processingData.allObject.find((obj) =>
    obj.isIn([DrawGL.startPos1[0], DrawGL.startPos1[1]]));
    if (selectedObj !== undefined && selectedObj.className !== 'Point' && selectedObj.className !== 'Area') {
      DrawGL.sceneSelectedLine = [];
      const buffer = twgl.createBufferInfoFromArrays(DrawGL.gl, {
        a_position: {
          numComponents: 2,
          data: [selectedObj.Point[0].x, selectedObj.Point[0].y, selectedObj.Point[1].x, selectedObj.Point[1].y]
        }
      })
      DrawGL.sceneSelectedLine.push({ x: 0, y: 0, rotation: 0, scale: 1, color: [0, 0, 1, 1], bufferInfo: buffer });
      DrawGL.drawLineSelected();
      document.getElementById("property").style.display = "inline-block";
      document.getElementById("property").innerHTML = `
          <div class="property_label">
          <p style="display: flex; justify-content: center; align-items: center; width: 100%">PROPERTY</p>
          <div>
            <button class="property-icon" title = "Close" onclick="PaintIn.toggleProperty()" value="Off"></button>
          </div>
        </div>
        <div class=boderProperties>
            <div>
              <p style="display: flex; justify-content: center; align-items: center">Object</p>
              <div style="display: flex; justify-content: center; align-items: center">${selectedObj.className}</div>
            </div>
            <div>
              <p style="display: flex; justify-content: center; align-items: center">Point 1</p>
                <div>
                  <div style="text-align: center; width:100%; display: flex; justify-content: center; align-items: center">
                    [${[Math.round(selectedObj.Point[0].x * 100) / 100, Math.round(selectedObj.Point[0].y * 100) / 100]}]
                  </div>
                </div>
            </div>
            <div>
              <p style="display: flex; justify-content: center; align-items: center">Point 2</p>
                <div>
                  <div style="text-align: center; width:100%; display: flex; justify-content: center; align-items: center">
                    [${[Math.round(selectedObj.Point[1].x * 100) / 100, Math.round(selectedObj.Point[1].y * 100) / 100]}]
                  </div>
                </div>
            </div>
            <div>
              <p style="display: flex; justify-content: center; align-items: center">Length</p>
                <div>
                  <div style="text-align: center; width:100%; display: flex; justify-content: center; align-items: center">
                    ${Math.round(selectedObj.length * 100) / 100}
                  </div>
                </div>
            </div>
          </div>
          `;
      is_dragging = true;
    } else {
      DrawGL.sceneSelectedLine = [];
      DrawGL.drawLineSelected();  
    }
  }
}

let mouse_up = function (event) {
  if (!is_dragging) {
    return;
  }

  event.preventDefault();

  Draw.lineVertex = [];
  Draw.point_x = [];
  Draw.point_y = [];
  Draw.pointGL = [];
  DrawGL.scene = [];
  Draw.scene_fill = [];
  DrawGL.draw();
  Draw.sceneOpen = [];
  DrawGL.drawOpen();
  var segments = [];
  var segment = [];
  var takePoints = [];
  var lineVertex = [];
  let nodes = [];

  for (let point of processingData.allPoint) {
    nodes.push(point.point);
  }
  for (let line of processingData.allLine) {
    let index1 = nodes.findIndex(
      (value) =>
        JSON.stringify(value) === JSON.stringify(line.Point[0].point)
    );
    let index2 = nodes.findIndex(
      (value) =>
        JSON.stringify(value) === JSON.stringify(line.Point[1].point)
    );
    let segment = [index1, index2];
    segments.push(segment);
  }
  for (let i = 0; i < processingData.allPoint.length; i++) {
    takePoints.push(processingData.allPoint[i].point);
  }

  for (let i = 0; i < segments.length; i++) {
    segment.push(segments[i]);
  }
  Draw.pointGL = takePoints;
  takePoints = takePoints.flat();
  segment = segment.flat();
  lineVertex = takePoints;

  // calls gl.createBuffer, gl.bindBuffer, gl.bufferData
  var bufferInfo = twgl.createBufferInfoFromArrays(DrawGL.gl, {
    a_position: {
      numComponents: 2,
      data: lineVertex,
    },
    indices: segment,
  });

  var sphereBufferInfo = twgl.createBufferInfoFromArrays(DrawGL.gl, {
    a_position: DrawGL.sphereVerts.position,
    indices: DrawGL.sphereVerts.indices,
  });

  Draw.sceneOpen = [
    { x: 0, y: 0, rotation: 0, scale: 1, color: [0, 0, 0, 1], bufferInfo },
  ];
  DrawGL.drawOpen(sphereBufferInfo);

  is_dragging = false;
}

let mouse_out = function (event) {
  if (!is_dragging) {
    return;
  }

  event.preventDefault();
  is_dragging = false;
}

let mouse_move = function (event) {

  if (!is_dragging) {
    DrawGL.canvas.addEventListener("mousemove", hoverLine)
    // DrawGL.canvas.addEventListener("pointermove",drawCheckOldPoint)
    return;
  }
  else {
    DrawGL.sceneSelectedLine=[];
    DrawGL.drawLineSelected();
    if (DrawGL.storageSelectedLine[0] !== undefined && DrawGL.storageSelectedLine[0].className !== 'Point' ) {
      processingData.prototype.moveObject(DrawGL.storageSelectedLine[0]);
    } else {
      let selectedObj = processingData.allObject.find((obj) =>
    obj.isIn([DrawGL.startPos1[0], DrawGL.startPos1[1]])
  );
  if (DrawGL.storageSelectedLine[0] !== undefined && DrawGL.storageSelectedLine[0].className !== 'Line' && DrawGL.storageSelectedLine[0].className !== 'Area'  ) {
    processingData.prototype.moveObject(DrawGL.storageSelectedLine[0]);
  }

    }
    DrawGL.canvas.removeEventListener("mousemove", hoverLine)
    // DrawGL.canvas.removeEventListener("pointermove",drawCheckOldPoint)
    DrawGL.sceneCheck = [];
    var bufferData = twgl.createBufferInfoFromArrays(DrawGL.gl, {
      a_position: {
        numComponents: 2,
        data: [DrawGL.storageSelectedLine[0].Point[0].x, DrawGL.storageSelectedLine[0].Point[0].y, DrawGL.storageSelectedLine[0].Point[1].x, DrawGL.storageSelectedLine[0].Point[1].y]
      }
    });
    let color = [1, 0, 0, 1];
    DrawGL.sceneCheck.push({ bufferInfo: bufferData, color: color });
    DrawGL.drawCheck();
  }
}

// SELECT LINE
// function getMousePosition1(event) {
//   let mPosition = takePoints1(event);
//   return {
//     x: Math.round(mPosition[0]),
//     y: Math.round(mPosition[1]),
//   };
// }

function hoverLine() {
  let selectedObj = processingData.allObject.find((obj) =>
    obj.isIn([DrawGL.startPos1[0], DrawGL.startPos1[1]])
  );
  if (selectedObj !== undefined) {
    // console.log(selectedObj);
    DrawGL.selectedLine = [];
    DrawGL.storageSelectedLine.splice(0, 1);
    DrawGL.selectedLine.push(selectedObj);
    DrawGL.storageSelectedLine.push(selectedObj);
    // DrawGL.canvas.removeEventListener("mousemove", hoverLine);
    // console.log(selectedObj);
  } else DrawGL.selectedLine = [];
  if (DrawGL.selectedLine[0] !== undefined && DrawGL.selectedLine[0].className !== 'Point' && selectedObj.className !== "Area") {
    DrawGL.sceneCheck = [];
    var bufferData = twgl.createBufferInfoFromArrays(DrawGL.gl, {
      a_position: {
        numComponents: 2,
        data: [DrawGL.selectedLine[0].Point[0].x, DrawGL.selectedLine[0].Point[0].y, DrawGL.selectedLine[0].Point[1].x, DrawGL.selectedLine[0].Point[1].y]
      }
    });
    let color = [1, 0, 0, 1];
    DrawGL.sceneCheck.push({ bufferInfo: bufferData, color: color });
    DrawGL.drawCheck();
  }

}

function drawText(Obj, text) {
  ctx.save();
  ctx.font = "13px Arial";

  // this.ctx.textAlign = "center";
  try {
    //Line
    ctx.fillStyle = "red";
    let alpha1 = (PaintIn.getAngleLineAndOx(Obj) * 180) / Math.PI;

    if (alpha1 > 90 && alpha1 <= 180) {
      let l = Obj.Point[0];
      Obj.Point[0] = Obj.Point[1];
      Obj.Point[1] = l;
    }

    let dx = Obj.Point[1].x - Obj.Point[0].x;
    let dy = Obj.Point[1].y - Obj.Point[0].y;
    let alpha = Math.atan2(dy, dx); //radians

    //move the center of canvas to  (line.Point[0].x + line.Point[1].x) / 2, (line.Point[0].y + line.Point[1].y) / 2
    ctx.translate(
      (Obj.Point[0].x + Obj.Point[1].x) / 2,
      (Obj.Point[0].y + Obj.Point[1].y) / 2
    );
    //rotate text
    ctx.rotate(alpha);
    //after move, hold the position
    ctx.fillText(text, 0, -10);
    ctx.restore();
    // console.log(alpha * 180 / Math.PI)
  } catch (error) {
    try {
      //Area
      ctx.fillStyle = "blue";
      // let xC = Obj.center[0];
      // let yC = Obj.center[1];
      let xC = Obj.coordNaming[0];
      let yC = Obj.coordNaming[1];
      ctx.fillText(text, xC, yC);
    } catch (error) {
      // Point
      ctx.fillStyle = "green";
      let alpha = Math.PI / 4;
      let xC = Obj.x - 5 * (1 + Math.cos(alpha));
      let yC = Obj.y - 5 * (1 + Math.cos(alpha));
      ctx.fillText(text, xC, yC);
    }
    ctx.restore();
  }
}

//Render BDCondition
function renderBDCondition() {
  // console.log(selectedLine.className);
  if (DrawGL.storageSelectedLine[0] !== undefined) {
    switch (DrawGL.storageSelectedLine[0].className) {
      case "Point":
        document.getElementById("BDCondition").style.display = "flex";
        document.getElementById("BDCondition").style.width = "200px";
        //display 3 button
        PaintIn.visibleButton("valueName");
        PaintIn.visibleButton("pointLoad");
        PaintIn.visibleButton("moment");
        //hidden 1 button
        PaintIn.hiddenButton("pressLoad");
        break;
      case "Line":
        document.getElementById("BDCondition").style.width = "150px";
        document.getElementById("BDCondition").style.display = "flex";
        PaintIn.visibleButton("valueName");
        PaintIn.visibleButton("pressLoad");
        //hidden 2 button
        PaintIn.hiddenButton("pointLoad");
        PaintIn.hiddenButton("moment");

        break;
    }
  }
}

function addValueName() {
  //change cursor
  DrawGL.canvas.addEventListener("pointermove", (event) => {
    // DrawGL.canvas.style.cursor = "crosshair";
    DrawGL.canvas.style.cursor = "url(frontend/img/text_cursor.svg) 0 0,  default";
  });

  // this.renderObject(processingData.allObject);

  PaintIn.offButtonDraw(PaintIn.currentValueLine, "line");
  // this.offButtonDraw(this.currentValueCircle, "circle");
  PaintIn.offButton(PaintIn.curValMoment, "moment");
  PaintIn.offButton(PaintIn.curValPointLoad, "pointLoad");
  PaintIn.offButton(PaintIn.curValPressLoad, "pressLoad");
  // PaintIn.offButton(PaintIn.curValAxialForce, "axialForce");
  PaintIn.onOffButton(PaintIn.curValName, "valueName");

  if (PaintIn.curValName.value === "On") {
    PaintIn.renderCommand("valueOn");
    addName();
  } else {
    nameID = undefined;
    nameIDs = undefined;
  }
}

function addValPointLoad() {
  //change cursor
  PaintIn.currentCursor = "url(frontend/img/force_cursor.svg) 0 0, default";
  PaintIn.canvas.style.cursor = PaintIn.currentCursor;

  PaintIn.renderObject(processingData.allObject);

  // PaintIn.offButtonDraw(PaintIn.currentValueBrush, "brush");
  // PaintIn.offButtonDraw(PaintIn.currentValueSpl, "spl");
  // PaintIn.offButtonDraw(PaintIn.currentValueRect, "rect");
  PaintIn.offButtonDraw(PaintIn.currentValueLine, "line");
  // PaintIn.offButtonDraw(PaintIn.currentValueCircle, "circle");
  // PaintIn.offButton(PaintIn.currentValueSelect, "select")
  PaintIn.offButton(PaintIn.curValName, "valueName");
  PaintIn.offButton(PaintIn.curValPressLoad, "pressLoad");
  // PaintIn.offButton(PaintIn.curValAxialForce, "axialForce");
  PaintIn.offButton(PaintIn.curValMoment, "moment");

  PaintIn.onOffButton(PaintIn.curValPointLoad, "pointLoad");
  if (PaintIn.curValPointLoad.value === "On") {
    PaintIn.renderCommand("valueOn");
    addForce();
    valueMoment = undefined;
    valueMoments = undefined;
  } else {
    valueLoad = undefined;
    valueLoads = undefined;
  }
}

function addValPressLoad() {
  //change cursor
  PaintIn.currentCursor =
    "url(frontend/img/normal_press_cursor.svg) 0 0, default";
  PaintIn.canvas.style.cursor = PaintIn.currentCursor;

  PaintIn.renderObject(processingData.allObject);

  // PaintIn.offButtonDraw(PaintIn.currentValueBrush, "brush");
  // PaintIn.offButtonDraw(PaintIn.currentValueSpl, "spl");
  // PaintIn.offButtonDraw(PaintIn.currentValueRect, "rect");
  PaintIn.offButtonDraw(PaintIn.currentValueLine, "line");
  // PaintIn.offButtonDraw(PaintIn.currentValueCircle, "circle");
  // PaintIn.offButton(PaintIn.currentValueSelect, "select")
  PaintIn.offButton(PaintIn.curValName, "valueName");
  PaintIn.offButton(PaintIn.curValPointLoad, "pointLoad");
  // PaintIn.offButton(PaintIn.curValAxialForce, "axialForce");
  PaintIn.offButton(PaintIn.curValMoment, "moment");

  PaintIn.onOffButton(PaintIn.curValPressLoad, "pressLoad");
  if (PaintIn.curValPressLoad.value === "On") {
    PaintIn.renderCommand("valueOn");
    addForce();
  } else {
    valueLoad = undefined;
    valueLoads = undefined;
  }
}

function addValMoment() {
  //change cursor
  PaintIn.currentCursor = "url(frontend/img/moment_cursor.svg), default";
  PaintIn.canvas.style.cursor = PaintIn.currentCursor;

  PaintIn.renderObject(processingData.allObject);

  // PaintIn.offButtonDraw(PaintIn.currentValueBrush, "brush");
  // PaintIn.offButtonDraw(PaintIn.currentValueSpl, "spl");
  // PaintIn.offButtonDraw(PaintIn.currentValueRect, "rect");
  PaintIn.offButtonDraw(PaintIn.currentValueLine, "line");
  // PaintIn.offButtonDraw(PaintIn.currentValueCircle, "circle");
  // PaintIn.offButton(PaintIn.currentValueSelect, "select")
  PaintIn.offButton(PaintIn.curValName, "valueName");
  PaintIn.offButton(PaintIn.curValPointLoad, "pointLoad");
  PaintIn.offButton(PaintIn.curValPressLoad, "pressLoad");
  // PaintIn.offButton(PaintIn.curValAxialForce, "axialForce");

  PaintIn.onOffButton(PaintIn.curValMoment, "moment");
  if (PaintIn.curValMoment.value === "On") {
    PaintIn.renderCommand("valueOn");
    addForce();
    valueLoad = undefined;
    valueLoads = undefined;
  } else {
    valueMoment = undefined;
    valueMoments = undefined;
  }
}

var lineVertex1 = [];
var segment_mesh = [];
//ADD KEYDOWN EVENT FOR 'L' AND 'E'=======================================================================================================
window.addEventListener("keydown", function (e) {
  switch (e.keyCode) {

    // USING BUTTON 'L'
    case 76:
      Draw.lineVertex = [];
      Draw.segment = [];
      Draw.point_x = [];
      Draw.point_y = [];
      DrawGL.canvas.addEventListener("pointermove", (event) => {
        // canvas.style.cursor = "url(frontend/img/select_cursor.svg) 0 0,  default";
        DrawGL.canvas.style.cursor = "crosshair";
      });

      DrawGL.canvas.addEventListener("mousedown", mouseDraw);
      DrawGL.canvas.addEventListener("pointermove", drawCheckOldPoint);
      DrawGL.canvas.removeEventListener("mousedown", showproperties);
      DrawGL.canvas.removeEventListener("mousedown", mouse_down);
      DrawGL.canvas.removeEventListener("mouseup", mouse_up);
      DrawGL.canvas.removeEventListener("mouseout", mouse_out);
      DrawGL.canvas.removeEventListener("mousemove", mouse_move);
      DrawGL.canvas.removeEventListener("mousedown", selectLine);
      // canvas.removeEventListener("mousemove", mouse_move_line);
      DrawGL.canvas.removeEventListener('mousemove', hoverLine);
      PaintIn.renderCommand("line");
      break;

    //USING BUTTON 'E'
    case 69:
      DrawGL.canvas.addEventListener("pointermove", (e) => {
        DrawGL.canvas.style.cursor = "pointer";
      });
      DrawGL.canvas.removeEventListener("mousedown", mouseDraw);
      DrawGL.canvas.addEventListener("pointermove", drawCheckOldPoint);

      processingData.prototype.areaDetect(processingData.allLine);
      DrawGL.canvas.addEventListener("mousedown", showproperties);

      DrawGL.canvas.addEventListener("mousedown", mouse_down);
      DrawGL.canvas.addEventListener("mouseup", mouse_up);
      DrawGL.canvas.addEventListener("mouseout", mouse_out);
      DrawGL.canvas.addEventListener("mousemove", mouse_move);
      DrawGL.canvas.addEventListener("mousedown", selectLine);
      DrawGL.canvas.addEventListener('mousemove', hoverLine);
      DrawGL.canvas.addEventListener('mousedown', renderBDCondition);
      PaintIn.renderCommand("drawmode");


      // // Initial render of the point
      // gl.clear(gl.COLOR_BUFFER_BIT);
      // gl.drawArrays(gl.POINTS, 0, 1);

      //RESET DATA
      Draw.lineVertex = [];
      Draw.point_x = [];
      Draw.point_y = [];
      Draw.pointGL = [];
      DrawGL.scene = [];
      Draw.scene_fill = [];
      DrawGL.draw();
      Draw.sceneOpen = [];
      DrawGL.drawOpen();
      var segments = [];
      var segment = [];
      var takePoints = [];
      var lineVertex = [];
      let nodes = [];

      for (let point of processingData.allPoint) {
        nodes.push(point.point);
      }
      for (let line of processingData.allLine) {
        let index1 = nodes.findIndex(
          (value) =>
            JSON.stringify(value) === JSON.stringify(line.Point[0].point)
        );
        let index2 = nodes.findIndex(
          (value) =>
            JSON.stringify(value) === JSON.stringify(line.Point[1].point)
        );
        let segment = [index1, index2];
        segments.push(segment);
      }
      for (let i = 0; i < processingData.allPoint.length; i++) {
        takePoints.push(processingData.allPoint[i].point);
      }

      for (let i = 0; i < segments.length; i++) {
        segment.push(segments[i]);
      }
      Draw.pointGL = takePoints;
      takePoints = takePoints.flat();
      segment = segment.flat();
      lineVertex = takePoints;

      // calls gl.createBuffer, gl.bindBuffer, gl.bufferData
      var bufferInfo = twgl.createBufferInfoFromArrays(DrawGL.gl, {
        a_position: {
          numComponents: 2,
          data: lineVertex,
        },
        indices: segment,
      });

      var sphereBufferInfo = twgl.createBufferInfoFromArrays(DrawGL.gl, {
        a_position: DrawGL.sphereVerts.position,
        indices: DrawGL.sphereVerts.indices,
      });

      Draw.sceneOpen = [
        { x: 0, y: 0, rotation: 0, scale: 1, color: [0, 0, 0, 1], bufferInfo },
      ];
      DrawGL.drawOpen(sphereBufferInfo);

      break;
    case 70:
      for (let z = 0; z < processingData.allArea.length; z++) {
        switch (processingData.allArea[z].pointFlow.length) {
          case 3:
            lineVertex1 = [];
            segment_mesh = [];
            segment_mesh.push(0);
            segment_mesh.push(1);
            segment_mesh.push(2);
            lineVertex1.push(processingData.allArea[z].pointFlow);
            break;
          case 4:
            lineVertex1 = [];
            segment_mesh = [];
            segment_mesh.push(0);
            segment_mesh.push(1);
            segment_mesh.push(2);
            segment_mesh.push(0);
            segment_mesh.push(2);
            segment_mesh.push(3);
            lineVertex1.push(processingData.allArea[z].pointFlow);
            break;
          case 5:
            lineVertex1 = [];
            segment_mesh = [];
            segment_mesh.push(0);
            segment_mesh.push(1);
            segment_mesh.push(2);
            segment_mesh.push(0);
            segment_mesh.push(2);
            segment_mesh.push(3);
            segment_mesh.push(0);
            segment_mesh.push(3);
            segment_mesh.push(4);
            lineVertex1.push(processingData.allArea[z].pointFlow);
            break;
          case 6:
            lineVertex1 = [];
            segment_mesh = [];
            segment_mesh.push(0);
            segment_mesh.push(1);
            segment_mesh.push(2);
            segment_mesh.push(0);
            segment_mesh.push(2);
            segment_mesh.push(3);
            segment_mesh.push(0);
            segment_mesh.push(3);
            segment_mesh.push(4);
            segment_mesh.push(0);
            segment_mesh.push(4);
            segment_mesh.push(5);
            lineVertex1.push(processingData.allArea[z].pointFlow);
            break;
          case 7:
            lineVertex1 = [];
            segment_mesh = [];
            segment_mesh.push(0);
            segment_mesh.push(1);
            segment_mesh.push(2);
            segment_mesh.push(0);
            segment_mesh.push(2);
            segment_mesh.push(3);
            segment_mesh.push(0);
            segment_mesh.push(3);
            segment_mesh.push(4);
            segment_mesh.push(0);
            segment_mesh.push(4);
            segment_mesh.push(5);
            segment_mesh.push(0);
            segment_mesh.push(5);
            segment_mesh.push(6);
            lineVertex1.push(processingData.allArea[z].pointFlow);
            break;
        }
        lineVertex1 = lineVertex1.flat();
        lineVertex1 = lineVertex1.flat();
        var bufferInfo_mesh = twgl.createBufferInfoFromArrays(gl, {
          a_position: {
            numComponents: 2,
            data: lineVertex1,
          },
          indices: segment_mesh,
        });
        Draw.scene_fill.push({
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          color: [0.96, 0.75, 0.97, 1],
          bufferInfo: bufferInfo_mesh,
        });
      }
      DrawGL.drawFill();

  }
});
