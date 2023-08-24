
function getClipSpaceMousePosition(e) {
  // get canvas relative css position
  const rect = DrawGL.canvas.getBoundingClientRect();
  const cssX = e.clientX - rect.left;
  const cssY = e.clientY - rect.top;

  // get normalized 0 to 1 position across and down canvas
  const normalizedX = cssX / DrawGL.canvas.clientWidth;
  const normalizedY = cssY / DrawGL.canvas.clientHeight;

  // convert to clip space
  const clipX = normalizedX * 2 - 1;
  const clipY = normalizedY * -2 + 1;
  return [clipX, clipY];
}

function moveCamera(e) {
  const pos = m3.transformPoint(
    DrawGL.startInvViewProjMat,
    getClipSpaceMousePosition(e)
  );

  DrawGL.camera.x = DrawGL.startCamera.x + DrawGL.startPos[0] - pos[0];
  DrawGL.camera.y = DrawGL.startCamera.y + DrawGL.startPos[1] - pos[1];
  console.log(DrawGL.camera);
  PaintIn.ctx.translate(DrawGL.camera.x,DrawGL.camera.y);
  PaintIn.ctx.restore();
  DrawGL.drawFill();
  DrawGL.draw();
  DrawGL.drawOpen();
  DrawGL.drawLineSelected();
  DrawGL.drawPoint()
}

function rotateCamera(e) {
  const delta = (e.clientX - DrawGL.startMousePos[0]) / 100;

  // compute a matrix to pivot around the camera space startPos
  let camMat = m3.identity();
  camMat = m3.translate(camMat, DrawGL.startPos[0], DrawGL.startPos[1]);
  camMat = m3.rotate(camMat, delta);
  camMat = m3.translate(camMat, -DrawGL.startPos[0], -DrawGL.startPos[1]);

  // multply in the original camera matrix
  Object.assign(DrawGL.camera, DrawGL.startCamera);
  camMat = m3.multiply(camMat, DrawGL.makeCameraMatrix());

  // now we can set the rotation and get the needed
  // camera position from the matrix
  DrawGL.camera.rotation = DrawGL.startCamera.rotation + delta;
  DrawGL.camera.x = camMat[6];
  DrawGL.camera.y = camMat[7];
  DrawGL.drawFill();
  DrawGL.draw();
  DrawGL.drawOpen();
  DrawGL.drawLineSelected();
  DrawGL.drawPoint()
}

function handleMouseMove(e) {
  if (rotate) {
    rotateCamera(e);
    is_dragging = false;
  }
  if (e.buttons == 4) {
    moveCamera(e);
  }
}

function handleMouseUp(e) {
  rotate = false;
  DrawGL.drawFill();
  DrawGL.draw();
  DrawGL.drawOpen();
  DrawGL.drawLineSelected();
  DrawGL.drawPoint()
  window.removeEventListener("mousemove", handleMouseMove);
  window.removeEventListener("mouseup", handleMouseUp);
}

function takePoints(e) {
  e.preventDefault();
  DrawGL.startInvViewProjMat = m3.inverse(DrawGL.viewProjectionMat);
  DrawGL.startCamera = Object.assign({}, DrawGL.camera);
  DrawGL.startClipPos = getClipSpaceMousePosition(e);
  DrawGL.startPos = m3.transformPoint(DrawGL.startInvViewProjMat, DrawGL.startClipPos);
  DrawGL.startMousePos = [e.clientX, e.clientY];
  return DrawGL.startPos;
}
function takePoints1(e) {
  e.preventDefault();
  DrawGL.startInvViewProjMat1 = m3.inverse(DrawGL.viewProjectionMat);
  DrawGL.startCamera1 = Object.assign({}, DrawGL.camera);
  DrawGL.startClipPos1 = getClipSpaceMousePosition(e);
  DrawGL.startPos1 = m3.transformPoint(DrawGL.startInvViewProjMat1, DrawGL.startClipPos1);
  DrawGL.startMousePos1 = [e.clientX, e.clientY];
  return DrawGL.startPos1;
}

DrawGL.canvas.addEventListener("mousedown", (e) => {
  takePoints(e);
  window.addEventListener("mouseup", handleMouseUp);
  window.addEventListener("mousemove", handleMouseMove);
  if (e.buttons == 1) {

    rotate = e.shiftKey;

  }
  // Draw.lineVertex.push(startPos);
  // Draw.lineVertex = Draw.lineVertex.flat();
  DrawGL.drawFill();
  DrawGL.draw();
  DrawGL.drawOpen();
  DrawGL.drawLineSelected();
  DrawGL.drawPoint()
});

function mouseDraw(e) {
  // Draw.pointGLObj = [];
  if (e.buttons == 1) {
    drawCheckOldPoint(e);
    if (DrawGL.nearPointGL !== undefined) {
      Draw.lineVertex.push([DrawGL.nearPointGL[0].x, DrawGL.nearPointGL[0].y]);
      Draw.lineVertex = Draw.lineVertex.flat();

      for (let i = 0; i < DrawGL.startPos.length; i++) {
        if (i % 2 == 0) {
          Draw.point_x.push(DrawGL.nearPointGL[0].x);
        } else if (i % 2 !== 0) {
          Draw.point_y.push(DrawGL.nearPointGL[0].y);
        }
      }

      for (let i = 0; i < DrawGL.startPos.length; i++) {
        if (i % 2 == 0) {
          Draw.pointGL.push([DrawGL.nearPointGL[0].x, DrawGL.nearPointGL[0].y]);
        }
      }

    } else {
      Draw.lineVertex.push(DrawGL.startPos);
      Draw.lineVertex = Draw.lineVertex.flat();

      for (let i = 0; i < DrawGL.startPos.length; i++) {
        if (i % 2 == 0) {
          Draw.point_x.push(Math.round(DrawGL.startPos[i], 8));
        } else if (i % 2 !== 0) {
          Draw.point_y.push(Math.round(DrawGL.startPos[i], 8));
        }
      }

      for (let i = 0; i < DrawGL.startPos.length; i++) {
        if (i % 2 == 0) {
          Draw.pointGL.push([
            Math.round(DrawGL.startPos[i], 8),
            Math.round(DrawGL.startPos[i + 1], 8),
          ]);
        }
      }
    }

    // calls gl.createBuffer, gl.bindBuffer, gl.bufferData
    var bufferInfo = twgl.createBufferInfoFromArrays(DrawGL.gl, {
      a_position: {
        numComponents: 2,
        data: Draw.lineVertex,
      },
    });

    var sphereBufferInfo = twgl.createBufferInfoFromArrays(DrawGL.gl, {
      a_position: DrawGL.sphereVerts.position,
      indices: DrawGL.sphereVerts.indices,
    });

    Draw.newPointGL = processingData.prototype.createPoint(
      Draw.point_x,
      Draw.point_y,
      Draw.pointName,
      Draw.listloadPoints
    );
    for (let point of Draw.newPointGL) {
      processingData.prototype.addObject(point, Draw.pointGLObj);
    }

    DrawGL.scene.push({
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      color: [0, 0, 0, 1],
      bufferInfo,
    });
    DrawGL.makeCameraMatrix();
    DrawGL.updateViewProjection();
    DrawGL.drawFill();
    DrawGL.draw();

    // for (let i of Draw.newPointGL){
    //   processingData.prototype.addObject(i, Draw.pointGLObject);
    // }
    // for (let i of Draw.newPointGL){
    // processingData.prototype.addObject(Draw.newPointGL, Draw.pointGLObj);

    if (Draw.point_x.length >= 2) {
      processingData.prototype.inputRawData("line", Draw.point_x, Draw.point_y);
    }

    processingData.prototype.updateStorage();
  }
}

DrawGL.canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  const [clipX, clipY] = getClipSpaceMousePosition(e);

  // position before zooming
  const [preZoomX, preZoomY] = m3.transformPoint(
    m3.inverse(DrawGL.viewProjectionMat),
    [clipX, clipY]
  );

  // multiply the wheel movement by the current zoom level
  // so we zoom less when zoomed in and more when zoomed out
  const newZoom = DrawGL.camera.zoom * Math.pow(2, e.deltaY * -0.001);
  DrawGL.camera.zoom = Math.max(0.02, Math.min(200, newZoom));

  DrawGL.updateViewProjection();

  // position after zooming
  const [postZoomX, postZoomY] = m3.transformPoint(
    m3.inverse(DrawGL.viewProjectionMat),
    [clipX, clipY]
  );

  // camera needs to be moved the difference of before and after
  DrawGL.camera.x += preZoomX - postZoomX;
  DrawGL.camera.y += preZoomY - postZoomY;
  DrawGL.drawFill();
  DrawGL.draw(sphereBufferInfo);
  DrawGL.drawOpen(sphereBufferInfo);
});

// Check position point for click or hover point
function drawCheckOldPoint(event) {
  takePoints1(event);
  var currentPointGL = {
    x: DrawGL.startPos1[0],
    y: DrawGL.startPos1[1],
  };
  const a = Draw.pointGL;
  let arrPoints1 = [];
  for (let i = 0; i < a.length; i++) {
    arrPoints1.push({ x: a[i][0], y: a[i][1] });
  }
  DrawGL.nearPointGL = processingData.prototype.getNearest(
    arrPoints1,
    currentPointGL,
    10/ DrawGL.camera.zoom
  );
  if (DrawGL.nearPointGL !== undefined) {
    DrawGL.drawFill();
    DrawGL.draw();
    DrawGL.drawOpen();
    DrawGL.drawLineSelected();
    DrawGL.drawCheckpoint({
      x: DrawGL.nearPointGL[0].x,
      y: DrawGL.nearPointGL[0].y,
      rotation: 0,
      scale: 8 / DrawGL.camera.zoom,
      color: [1, 0, 0, 1],
      bufferInfo: sphereBufferInfo,
    });
    // DrawGL.canvas.removeEventListener("mousemove", hoverLine);
  } else {
    DrawGL.drawFill();
    DrawGL.draw();
    DrawGL.drawOpen();
    DrawGL.drawLineSelected();
    // DrawGL.canvas.addEventListener("mousemove",hoverLine);
  }
  return DrawGL.nearPointGL;
}

// SHOW PROPERTY=====================================================================================
function showproperties(e) {
  if (e.buttons == 1) {
    drawCheckOldPoint(e);
    if (DrawGL.nearPointGL !== undefined) {
      for (let i = 0; i < Draw.pointGL.length; i++) {
        if (
          DrawGL.nearPointGL[0].x == Draw.pointGL[i][0] &&
          DrawGL.nearPointGL[0].y == Draw.pointGL[i][1]
        ) {
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
              <div style="display: flex; justify-content: center; align-items: center">${processingData.allObject[0].className}</div>
            </div>
            <div>
              <p style="display: flex; justify-content: center; align-items: center">Coordinate</p>
                <div>
                  <div style="text-align: center; width:100%; display: flex; justify-content: center; align-items: center">
                    [${math.round(DrawGL.nearPointGL[0].x, 2)}, ${math.round(
            DrawGL.nearPointGL[0].y,
            2
          )}]
                  </div>
                </div>
            </div>
          </div>
          `;
        }
      }
    }
  }
}

// MOVE + SELECT POINT AND LINE ===============================================================================================================
let offset_x;
let offset_y;

let get_offset = function () {
  let canvas_offsets = DrawGL.canvas.getBoundingClientRect();
  offset_x = canvas_offsets.left;
  offset_y = canvas_offsets.top;
}

get_offset();
window.onscroll = function () { get_offset(); }
window.onresize = function () { get_offset(); }
window.onresize = function () { get_offset(); }

let point = [];
let current_point_index = null;
let is_dragging = false;
let startX;
let startY;
let swap_point = [];


let mouse_down = function (event) {
  if (event.buttons === 1) {
    event.preventDefault();
    // console.log(event);

    startX = Math.round(event.clientX - offset_x);
    startY = Math.round(event.clientY - offset_y);

    for (let i = 0; i < processingData.allPoint.length; i++) {
      if (drawCheckOldPoint(event)) {
        var check = drawCheckOldPoint(event);
        if (processingData.allPoint[i].x == check[0].x && processingData.allPoint[i].y == check[0].y) {
          current_point_index = i;
          // console.log("yes")
          // console.log(current_point_index);
          is_dragging = true;
          return;
        } else {
          // console.log("no")
        }
      }

    }
    // let selectedObj = processingData.allObject.find((obj) =>
    //   obj.isIn([startX, startY])
    // );
    // console.log(selectedObj);
  }
}

Draw.selectedLine = [];