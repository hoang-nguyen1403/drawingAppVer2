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
let oldPickNdx2D = -1;
let oldPickColor2D;
function takeIDPoint2DInvisible(event) {
  const canvas = DrawGL.gl.canvas;
  const rect = canvas.getBoundingClientRect();
  const cssX = event.clientX - rect.left;
  const cssY = event.clientY - rect.top;

  const pixelX = cssX * canvas.width / canvas.clientWidth;
  const pixelY = canvas.height - cssY * canvas.height / canvas.clientHeight - 1;
  const data = new Uint8Array(4);
  DrawGL.gl.readPixels(
    pixelX,            // x
    pixelY,            // y
    1,                 // width
    1,                 // height
    DrawGL.gl.RGBA,           // format
    DrawGL.gl.UNSIGNED_BYTE,  // type
    data);             // typed array to hold result
  const id = data[0] + (data[1] << 8) + (data[2] << 16) + (data[3] << 24);
  return id
}

function moveCamera(event) {
  const pos = m3.transformPoint(
    DrawGL.startInvViewProjMat,
    getClipSpaceMousePosition(event));

  DrawGL.camera.x = DrawGL.startCamera.x + DrawGL.startPos[0] - pos[0];
  DrawGL.camera.y = DrawGL.startCamera.y + DrawGL.startPos[1] - pos[1];
  DrawGL.drawMain();
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
  DrawGL.drawMain();
}

function handleMouseMove(event) {
  if (DrawGL.rotate) {
    rotateCamera(event);
  }
  if (event.buttons == 4) {
    moveCamera(event);
  }
}

function mousemove(event) {
  DrawGL.drawMain();
}

DrawGL.canvas.addEventListener("mousemove", mousemove);

function handleMouseUp() {
  DrawGL.rotate = false;
  DrawGL.drawMain();
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
  DrawGL.drawMain();
});

function filter_change() {
  let data = FEsoln.find(({ name }) => name == DrawGL.filter_value.value);
  Mesh.prototype.fillElementsGL(data.data);
  DrawGL.drawMain();
  DrawGL3D.drawMain();
}

function mode_change() {
  let value = document.getElementById("modeSolution_value").value;
  switch (value) {
    case "3D":
      ChangeModeGL3D();
      break;
    case "2D":
      ChangeModeGL();
  }
}

function checkSolution(event) {
  // event.preventDefault();
  // DrawGL.startInvViewProjMat_check = m3.inverse(DrawGL.viewProjectionMat);
  // DrawGL.startCamera_check = Object.assign({}, DrawGL.camera);
  // DrawGL.startClipPos_check = getClipSpaceMousePosition(event);
  // DrawGL.startPos_check = m3.transformPoint(
  //   DrawGL.startInvViewProjMat_check,
  //   DrawGL.startClipPos_check);
  // var currentPointGL = {
  //   x: DrawGL.startPos_check[0],
  //   y: DrawGL.startPos_check[1],
  // };
  // let a = DrawGL.pointcheck;
  // let arrPoints1 = [];
  // for (let i = 0; i < a.length; i++) {
  //   arrPoints1.push({ x: a[i][0], y: a[i][1] })
  // }
  // DrawGL.nearPointGL = processingData.prototype.getNearest(arrPoints1, currentPointGL, 10);
  // if (DrawGL.nearPointGL !== undefined) {
  //   DrawGL.drawMain();
  //   DrawGL.drawCheckpoint({
  //     x: DrawGL.nearPointGL[0].x,
  //     y: DrawGL.nearPointGL[0].y,
  //     color: [1, 0, 0, 1],
  //     bufferInfo: DrawGL.sphereBufferInfo,
  //   });
  //   DrawGL.canvas.addEventListener('mousedown', showproperties);
  // }
  // else {
  //   DrawGL.drawMain();
  // }
  if (DrawGL.nearPointGL[0] !== undefined) {
    DrawGL.drawCheckpoint({
      x: DrawGL.nearPointGL[0].coord[0],
      y: DrawGL.nearPointGL[0].coord[1],
      color: [1, 0, 0, 1],
      bufferInfo: DrawGL.sphereBufferInfo,
    });
  }
}

function showproperties(event) {
  if (event.buttons == 1 && !event.shiftKey) {
    if (DrawGL.nearPointGL[0] !== undefined) {
      let Detail = DrawGL.takevalueRange.find(({ coord }) => coord[0] == DrawGL.nearPointGL[0].coord[0] && coord[1] == DrawGL.nearPointGL[0].coord[1])
      if (Detail !== undefined) {
        DrawGL.color = [0, 0, 1, 1];
        DrawGL.nearPointGL_storage = [{ x: DrawGL.nearPointGL[0].coord[0], y: DrawGL.nearPointGL[0].coord[1] }, 0];
        DrawGL.drawCheckpoint({
          x: DrawGL.nearPointGL_storage[0].x,
          y: DrawGL.nearPointGL_storage[0].y,
          color: DrawGL.color,
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
                    [${math.round(DrawGL.nearPointGL_storage[0].x, 2)}, ${math.round(DrawGL.nearPointGL_storage[0].y, 2)}]
                  </div>
                </div>
            </div>
          </div>
          `;
        for (let i = 0; i < FEsoln.length; i++) {
          var a = FEsoln[i].name;
          document.getElementsByClassName("boderProperties_solution")[0].innerHTML += `
            <div>
            <p style="display: flex; justify-content: center; align-items: center">${a}</p>
            <div style="text-align: center; display: flex; justify-content: center; align-items: center">
              ${math.round(Detail[a], 4)}
            </div>
        </div>
            `
        }
      }
    }
    else {
      document.getElementById("property_solution").style.display = "none";
      DrawGL.nearPointGL_storage = [{ x: 100000000, y: 10000000000 }, 0];
      DrawGL.color = [1, 1, 1, 1];
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

  DrawGL.drawMain();
});

//Change cursor
DrawGL.canvas.addEventListener('pointermove', (e) => {
  DrawGL.canvas.style.cursor = "url(frontend/img/select_cursor.svg) 0 0, default";
})

DrawGL.canvas.addEventListener("mousemove", function (event) {
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
    document.getElementsByClassName("property_solution-icon")[0].style.transform = "rotate(-90deg)"
    document.getElementsByClassName("property_solution-icon")[0].title = "Close"
  } else {
    document.getElementsByClassName("boderProperties_solution")[0].style.display =
      "none";
    document.getElementsByClassName("property_solution-icon")[0].style.transform = "rotate(90deg)"
    document.getElementsByClassName("property_solution-icon")[0].title = "Open"
  }
}

// function resetCameraView(){
//   if (document.getElementById("modeSolution_value").value === "2D") {
//     DrawGL.camera = {
//       x: 0,
//       y: 0,
//       rotation: 0,
//       zoom: 1,
//     }
//     DrawGL.drawMain();
//   }
//   else {
//     DrawGL3D.camera = {
//       rotation_X: 0, // degrees
//       rotation_Y: 0, // degrees
//       rotation_Z: 0, // degrees
//       Deep: 400000,
//       Zoom: 1,
//       translation_x: 0,
//       translation_y: 0,
//       translation_z: math.max(math.abs(DrawGL.pointcheck)),
//     }
//     DrawGL3D.drawMain();
//   }
// }