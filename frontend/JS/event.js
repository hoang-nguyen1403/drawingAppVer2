function getClipSpaceMousePosition(event) {
  // get canvas relative css position
  const rect = DrawGL.canvas.getBoundingClientRect();
  const cssX = event.clientX - rect.left;
  const cssY = event.clientY - rect.top;

  // get normalized 0 to 1 position across and down canvas
  const normalizedX = cssX / DrawGL.canvas.clientWidth;
  const normalizedY = cssY / DrawGL.canvas.clientHeight;

  // convert to clip space
  const clipX = normalizedX * 2 - 1;
  const clipY = normalizedY * -2 + 1;

  return [clipX, clipY];
}

function moveCamera(event) {
  const pos = m3.transformPoint(
    DrawGL.startInvViewProjMat,
    getClipSpaceMousePosition(event));

  DrawGL.camera.x = DrawGL.startCamera.x + DrawGL.startPos[0] - pos[0];
  DrawGL.camera.y = DrawGL.startCamera.y + DrawGL.startPos[1] - pos[1];
  DrawGL.draw();
}

function rotateCamera(event) {
  const delta = (event.clientX - DrawGL.startMousePos[0]) / 100;
  // compute a matrix to pivot around the camera space DrawGL.startPos
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
  DrawGL.draw();
}

function handleMouseMove(event) {
  if (DrawGL.rotate) {
    rotateCamera(event);
  }
  if (event.buttons == 4) {
    moveCamera(event);
  }
}

function handleMouseUp() {
  DrawGL.rotate = false;
  DrawGL.draw();
  DrawGL.canvas.removeEventListener('mousemove', handleMouseMove);
  DrawGL.canvas.removeEventListener('mouseup', handleMouseUp);
}

DrawGL.canvas.addEventListener('mousedown', (event) => {
  event.preventDefault();
  DrawGL.canvas.addEventListener('mouseup', handleMouseUp);
  DrawGL.canvas.addEventListener('mousemove', handleMouseMove);
  if (event.buttons == 1) {
    DrawGL.rotate = event.shiftKey;
  }
  DrawGL.startInvViewProjMat = m3.inverse(DrawGL.viewProjectionMat);
  DrawGL.startCamera = Object.assign({}, DrawGL.camera);
  DrawGL.startClipPos = getClipSpaceMousePosition(event);
  DrawGL.startPos = m3.transformPoint(
    DrawGL.startInvViewProjMat,
    DrawGL.startClipPos
  );
  DrawGL.startMousePos = [event.clientX, event.clientY];
  DrawGL.draw();
});

function filter_change() {
  switch (DrawGL.filter_value.value) {
    case "Mode 1":
      Mesh.prototype.fillElementsGL();
      break;
    case "Mode 2":
      Mesh.prototype.fillElementsGL1();
      break;
    case "Mode 3":
      Mesh.prototype.fillElementsGL2();
      break;
  }
  DrawGL3D.draw();
  DrawGL.draw();
}

function checkSolution(event) {
  event.preventDefault();
  DrawGL.startInvViewProjMat_check = m3.inverse(DrawGL.viewProjectionMat);
  DrawGL.startCamera_check = Object.assign({}, DrawGL.camera);
  DrawGL.startClipPos_check = getClipSpaceMousePosition(event);
  DrawGL.startPos_check = m3.transformPoint(
    DrawGL.startInvViewProjMat_check,
    DrawGL.startClipPos_check);
  var currentPointGL = {
    x: DrawGL.startPos_check[0],
    y: DrawGL.startPos_check[1],
  };
  let a = DrawGL.pointcheck;
  let arrPoints1 = [];
  for (let i = 0; i < a.length; i++) {
    arrPoints1.push({ x: a[i][0], y: a[i][1] })
  }
  DrawGL.nearPointGL = processingData.prototype.getNearest(arrPoints1, currentPointGL, 10);
  if (DrawGL.nearPointGL !== undefined) {
    DrawGL.draw();
    DrawGL.drawCheckpoint({
      x: DrawGL.nearPointGL[0].x,
      y: DrawGL.nearPointGL[0].y,
      color : [1,0,0,1],
      bufferInfo: DrawGL.sphereBufferInfo,
    });
    DrawGL.canvas.addEventListener('mousedown', showproperties);
  }
  else {
    DrawGL.draw();
  }
}

function showproperties(event) {
  if (event.buttons == 1) {
    if (DrawGL.nearPointGL !== undefined) {
      let Detail = DrawGL.takevalueRange.find(({ coord }) => coord[0] == DrawGL.nearPointGL[0].x && coord[1] == DrawGL.nearPointGL[0].y)
      DrawGL.color = [0,0,1,1];
      DrawGL.nearPointGL_storage = [{x:DrawGL.nearPointGL[0].x,y:DrawGL.nearPointGL[0].y},0];
      DrawGL.drawCheckpoint({
        x: DrawGL.nearPointGL_storage[0].x,
        y: DrawGL.nearPointGL_storage[0].y,
        color : DrawGL.color,
        bufferInfo: DrawGL.sphereBufferInfo,
      });
      document.getElementById("property_solution").style.display = "inline-block"
      document.getElementById("property_solution").innerHTML = `
          <div class="property_solution_label">
          <p style="display: flex; justify-content: center; align-items: center; width: 100%">DETAIL</p>
          <div>
            <button class="property_solution-icon" title = "Close" onclick="toggleProperty()" value="Off"></button>
          </div>
        </div>
        <div class=boderProperties_solution>
            
            <div>
              <p style="display: flex; justify-content: center; align-items: center">Coordinate</p>
                <div>
                  <div style="text-align: center; width:100%; display: flex; justify-content: center; align-items: center">
                    [${math.round(DrawGL.nearPointGL[0].x, 2)}, ${math.round(DrawGL.nearPointGL[0].y, 2)}]
                  </div>
                </div>
            </div>
            <div>
                <p style="display: flex; justify-content: center; align-items: center">FEsoln</p>
                <div style="text-align: center; display: flex; justify-content: center; align-items: center">
                  ${math.round(Detail.FEsoln_value, 4)}
                </div>
            </div>
            <div>
                <p style="display: flex; justify-content: center; align-items: center">FEsol1</p>
                <div>
                    <div style="text-align: center; width:100%; display: flex; justify-content: center; align-items: center">
                        ${math.round(Detail.FEsoln_value_1, 4)}
                    </div>
                </div>
            </div>
            <div>
                <p style="display: flex; justify-content: center; align-items: center">FEsoln2</p>
                <div>
                    <div style="text-align: center; width:100%; display: flex; justify-content: center; align-items: center">
                        ${math.round(Detail.FEsoln_value_2, 4)}
                    </div>
                </div>
            </div>
          </div>
          `;
    }
    else {
      document.getElementById("property_solution").style.display = "none";
    }
  }
}

DrawGL.canvas.addEventListener('wheel', (event) => {
  event.preventDefault();
  const [clipX, clipY] = getClipSpaceMousePosition(event);

  // position before zooming
  const [preZoomX, preZoomY] = m3.transformPoint(
    m3.inverse(DrawGL.viewProjectionMat),
    [clipX, clipY]);

  // multiply the wheel movement by the current zoom level
  // so we zoom less when zoomed in and more when zoomed out
  const newZoom = DrawGL.camera.zoom * Math.pow(2, event.deltaY * -0.001);
  DrawGL.camera.zoom = Math.max(0.02, Math.min(10000, newZoom));

  DrawGL.updateViewProjection();

  // position after zooming
  const [postZoomX, postZoomY] = m3.transformPoint(
    m3.inverse(DrawGL.viewProjectionMat),
    [clipX, clipY]);

  // camera needs to be moved the difference of before and after
  DrawGL.camera.x += preZoomX - postZoomX;
  DrawGL.camera.y += preZoomY - postZoomY;

  DrawGL.draw();
});

//Change cursor
DrawGL.canvas.addEventListener('pointermove', (e) => {
  DrawGL.canvas.style.cursor = "url(frontend/img/select_cursor.svg) 0 0, default";
})
  
DrawGL.canvas.addEventListener("mousemove", function(event){
  event.preventDefault();
  DrawGL.startInvViewProjMat_check = m3.inverse(DrawGL.viewProjectionMat);
  DrawGL.startCamera_check = Object.assign({}, DrawGL.camera);
  DrawGL.startClipPos_check = getClipSpaceMousePosition(event);
  DrawGL.startPos_check = m3.transformPoint(
    DrawGL.startInvViewProjMat_check,
    DrawGL.startClipPos_check);
  document.getElementById("display_coord").innerHTML =
      "[" +
      math.round(DrawGL.startPos_check[0]) +
      " ; " +
      math.round(DrawGL.startPos_check[1]) +
      "]";
});

function toggleProperty() {
  document.getElementsByClassName("property_solution_label")[0].style.display = "flex";
  if (
    document.getElementsByClassName("boderProperties_solution")[0].style.display ===
    "none"
    ) {
      document.getElementsByClassName("boderProperties_solution")[0].style.display =
      "block";
      document.getElementsByClassName("property_solution-icon")[0].style.transform="rotate(-90deg)"
      document.getElementsByClassName("property_solution-icon")[0].title = "Close"
    } else {
      document.getElementsByClassName("boderProperties_solution")[0].style.display =
      "none";
      document.getElementsByClassName("property_solution-icon")[0].style.transform="rotate(90deg)"
      document.getElementsByClassName("property_solution-icon")[0].title = "Open"
  }
}