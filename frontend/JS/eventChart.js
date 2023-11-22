function getClipSpaceMousePositionChart(event) {
  // get canvas relative css position
  const rect = Chart.canvas.getBoundingClientRect();
  const cssX = event.clientX - rect.left;
  const cssY = event.clientY - rect.top;

  // get normalized 0 to 1 position across and down canvas
  const normalizedX = cssX / Chart.canvas.clientWidth;
  const normalizedY = cssY / Chart.canvas.clientHeight;

  // convert to clip space
  const clipX = normalizedX * 2 - 1;
  const clipY = normalizedY * -2 + 1;

  return [clipX, clipY];
}
let oldPickNdxChart = -1;
let oldPickColorChart;
function takeIDPoint2DInvisibleChart(event) {
  const canvas = Chart.gl.canvas;
  const rect = canvas.getBoundingClientRect();
  const cssX = event.clientX - rect.left;
  const cssY = event.clientY - rect.top;

  const pixelX = cssX * canvas.width / canvas.clientWidth;
  const pixelY = canvas.height - cssY * canvas.height / canvas.clientHeight - 1;
  const data = new Uint8Array(4);
  Chart.gl.readPixels(
    pixelX,            // x
    pixelY,            // y
    1,                 // width
    1,                 // height
    Chart.gl.RGBA,           // format
    Chart.gl.UNSIGNED_BYTE,  // type
    data);             // typed array to hold result
  const id = data[0] + (data[1] << 8) + (data[2] << 16) + (data[3] << 24);
  return id
}

function moveCameraChart(event) {
  const pos = m3.transformPoint(
    Chart.startInvViewProjMat,
    getClipSpaceMousePositionChart(event));

  Chart.camera.x = Chart.startCamera.x + Chart.startPos[0] - pos[0];
  Chart.camera.y = Chart.startCamera.y + Chart.startPos[1] - pos[1];
  Chart.drawMain();
}

function rotateCameraChart(event) {
  const delta = (event.clientX - Chart.startMousePos[0]) / 100;
  // compute a matrix to pivot around the camera space Chart.startPos
  let camMat = m3.identity();
  camMat = m3.translate(camMat, Chart.startPos[0], Chart.startPos[1]);
  camMat = m3.rotate(camMat, delta);
  camMat = m3.translate(camMat, -Chart.startPos[0], -Chart.startPos[1]);

  // multply in the original camera matrix
  Object.assign(Chart.camera, Chart.startCamera);
  camMat = m3.multiply(camMat, Chart.makeCameraMatrix());
  // now we can set the rotation and get the needed
  // camera position from the matrix
  Chart.camera.rotation = Chart.startCamera.rotation + delta;
  Chart.camera.x = camMat[6];
  Chart.camera.y = camMat[7];
  Chart.drawMain();
}

function handleMouseMoveChart(event) {
  if (event.buttons == 4) {
    moveCameraChart(event);
  }
}

function mousemoveChart(event) {
  Chart.drawMain();
}

Chart.canvas.addEventListener("mousemove", mousemoveChart);

function handleMouseUpChart() {
  Chart.rotate = false;
  Chart.drawMain();
  Chart.canvas.removeEventListener('mousemove', handleMouseMoveChart);
  Chart.canvas.removeEventListener('mouseup', handleMouseUpChart);
}

Chart.canvas.addEventListener('mousedown', (event) => {
  event.preventDefault();
  Chart.canvas.addEventListener('mouseup', handleMouseUpChart);
  Chart.canvas.addEventListener('mousemove', handleMouseMoveChart);
  if (event.buttons == 1) {
    Chart.rotate = event.shiftKey;
  }
  Chart.startInvViewProjMat = m3.inverse(Chart.viewProjectionMat);
  Chart.startCamera = Object.assign({}, Chart.camera);
  Chart.startClipPos = getClipSpaceMousePositionChart(event);
  Chart.startPos = m3.transformPoint(
    Chart.startInvViewProjMat,
    Chart.startClipPos
  );
  Chart.startMousePos = [event.clientX, event.clientY];
  Chart.drawMain();
});

// function filter_change() {
//   let data = FEsoln.find(({ name }) => name == Chart.filter_value.value);
//   Mesh.prototype.fillElementsGL(data.data);
//   Chart.drawMain();
//   Chart3D.drawMain();
// }

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

function checkSolutionChart(event) {
  if (Chart.nearPointGL[0] !== undefined) {
    Chart.drawCheckpoint({
      x: Chart.nearPointGL[0].coord[0],
      y: Chart.nearPointGL[0].coord[1],
      color: [1, 0, 0, 1],
      bufferInfo: Chart.sphereBufferInfo,
    });
  }
}

function showpropertiesChart(event) {
  if (event.buttons == 1 && !event.shiftKey) {
    if (Chart.nearPointGL[0] !== undefined) {
      Chart.color = [0, 0, 1, 1];
      Chart.nearPointGL_storage = [{ x: Chart.nearPointGL[0].coord[0], y: Chart.nearPointGL[0].coord[1] }, 0];
      Chart.drawCheckpoint({
        x: Chart.nearPointGL_storage[0].x,
        y: Chart.nearPointGL_storage[0].y,
        color: Chart.color,
        bufferInfo: Chart.sphereBufferInfo,
      });
      // console.log(Chart.nearPointGL_storage);
      document.getElementById("property_chart").style.display = "inline-block"
      domID("property_chart").style.left = (domID("Chart").clientWidth * 0.09 + domID("ChartGL").clientWidth - domID("property_chart").clientWidth - domID("Legend").clientWidth).toString() + "px";
      document.getElementById("property_chart").innerHTML = `
            <div class="property_chart_label">
            <p style="display: flex; justify-content: center; align-items: center; width: 100%">DETAIL</p>
            <div>
              <button class="property_chart-icon" title = "Close" onclick="togglePropertyChart()" value="Off"></button>
            </div>
          </div>
          <div class=boderProperties_chart>   
              <div>
                <p style="display: flex; justify-content: center; align-items: center">X</p>
                  <div>
                    <div style="text-align: center; width:100%; display: flex; justify-content: center; align-items: center">
                      [${math.round(Chart.nearPointGL_storage[0].x / Chart.gl.canvas.width * Chart.max_x, 6)}]
                    </div>
                  </div>
              </div>
              <div>
                <p style="display: flex; justify-content: center; align-items: center">Y</p>
                  <div>
                    <div style="text-align: center; width:100%; display: flex; justify-content: center; align-items: center">
                      [${math.round(Chart.nearPointGL_storage[0].y / Chart.gl.canvas.height * Chart.max_y, 6)}]
                    </div>
                  </div>
              </div>
            </div>
            `;
    }
    else {
      document.getElementById("property_chart").style.display = "none";
      Chart.nearPointGL_storage = [{ x: 100000000, y: 10000000000 }, 0];
      Chart.color = [1, 1, 1, 1];
    }
  }
}

Chart.canvas.addEventListener('wheel', (event) => {
  event.preventDefault();
  const [clipX, clipY] = getClipSpaceMousePositionChart(event);

  // position before zooming
  const [preZoomX, preZoomY] = m3.transformPoint(
    m3.inverse(Chart.viewProjectionMat),
    [clipX, clipY]);

  // multiply the wheel movement by the current zoom level
  // so we zoom less when zoomed in and more when zoomed out
  let newZoom;
  if (event.deltaY < 0) {
    newZoom = Chart.camera.zoom + Math.pow(2, -1);
  } else {
    newZoom = Chart.camera.zoom - Math.pow(2, -1);
  }
  Chart.camera.zoom = Math.max(0.5, Math.min(100, newZoom));

  Chart.updateViewProjection();

  // position after zooming
  const [postZoomX, postZoomY] = m3.transformPoint(
    m3.inverse(Chart.viewProjectionMat),
    [clipX, clipY]);

  // camera needs to be moved the difference of before and after
  Chart.camera.x += preZoomX - postZoomX;
  Chart.camera.y += preZoomY - postZoomY;

  Chart.drawMain();
});

//Change cursor
Chart.canvas.addEventListener('pointermove', (e) => {
  Chart.canvas.style.cursor = "url(frontend/img/select_cursor.svg) 0 0, default";
})

// Chart.canvas.addEventListener("mousemove", function (event) {
//   event.preventDefault();
//   Chart.startInvViewProjMat_check = m3.inverse(Chart.viewProjectionMat);
//   Chart.startCamera_check = Object.assign({}, Chart.camera);
//   Chart.startClipPos_check = getClipSpaceMousePositionChart(event);
//   Chart.startPos_check = m3.transformPoint(
//     Chart.startInvViewProjMat_check,
//     Chart.startClipPos_check);
//   document.getElementById("display_coord").innerHTML =
//     "[" +
//     math.round(Chart.startPos_check[0]) +
//     " ; " +
//     math.round(Chart.startPos_check[1]) +
//     "]";

// });

function togglePropertyChart() {
  document.getElementsByClassName("property_chart_label")[0].style.display = "flex";
  if (
    document.getElementsByClassName("boderProperties_chart")[0].style.display ===
    "none"
  ) {
    document.getElementsByClassName("boderProperties_chart")[0].style.display =
      "block";
    document.getElementsByClassName("property_chart-icon")[0].style.transform = "rotate(-90deg)"
    document.getElementsByClassName("property_chart-icon")[0].title = "Close"
  } else {
    document.getElementsByClassName("boderProperties_chart")[0].style.display =
      "none";
    document.getElementsByClassName("property_chart-icon")[0].style.transform = "rotate(90deg)"
    document.getElementsByClassName("property_chart-icon")[0].title = "Open"
  }
}


// function mouseChart(event) {
//   event.preventDefault();
//   startInvViewProjMat = m3.inverse(Chart.viewProjectionMat);
//   startCamera = Object.assign({}, Chart.camera);
//   startClipPos = getClipSpaceMousePositionChart(event);
//   startPos = m3.transformPoint(
//       startInvViewProjMat,
//       startClipPos);
// }

// Chart.canvas.addEventListener("mousemove",mouseChart);

var type;