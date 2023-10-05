function takeIDPoint3DInvisible(event) {
  const canvas = DrawGL3D.gl.canvas;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  // const clipX = x / rect.width * 2 - 1;
  // const clipY = y / rect.height * -2 + 1;
  // const invViewProjectionMatrix = m4.inverse(DrawGL3D.viewProjectionMat)
  // const clipSpace = [clipX, clipY, -1];
  // const clipSpaceEnd = [clipX, clipY, 0];
  // const worldSpace = m4.transformPoint(invViewProjectionMatrix, clipSpace);
  // const worldSpaceEnd = m4.transformPoint(invViewProjectionMatrix, clipSpaceEnd);
  // return {
  //   origin: worldSpaceEnd,
  //   direction: worldSpace
  // };
  const pixelX = x * canvas.width / canvas.clientWidth;
  const pixelY = canvas.height - y * canvas.height / DrawGL3D.gl.canvas.clientHeight - 1;
  const data = new Uint8Array(4);
  DrawGL3D.gl.readPixels(
    pixelX,            // x
    pixelY,            // y
    1,                 // width
    1,                 // height
    DrawGL3D.gl.RGBA,           // format
    DrawGL3D.gl.UNSIGNED_BYTE,  // type
    data);             // typed array to hold result
  const id = data[0] + (data[1] << 8) + (data[2] << 16) + (data[3] << 24);
  return id
}

let oldPickNdx3D = -1;
let oldPickColor3D;

DrawGL3D.gl.canvas.addEventListener("mousedown", handleMouseDown3D);
DrawGL3D.gl.canvas.addEventListener("mouseup", handleMouseUp3D);
DrawGL3D.gl.canvas.addEventListener("mousemove", handleMouseMove3D);

function handleMouseDown3D(event) {
  if (event.buttons == 4) {
    event.preventDefault();
    DrawGL3D.mouse.prevMouseX = event.clientX;
    DrawGL3D.mouse.prevMouseY = event.clientY;
  }
}

function handleMouseUp3D(event) {
  DrawGL3D.mouse.prevMouseX = 0;
  DrawGL3D.mouse.prevMouseY = 0;
}

function handleMouseMove3D(event) {
  if (event.buttons == 4) {
    event.preventDefault();
    if (DrawGL3D.mouse.prevMouseX === 0 && DrawGL3D.mouse.prevMouseY === 0) {
      return;
    }
    const deltaX = event.clientX - DrawGL3D.mouse.prevMouseX;
    const deltaY = event.clientY - DrawGL3D.mouse.prevMouseY;
    DrawGL3D.camera.translation_x += deltaX * 1;
    DrawGL3D.camera.translation_y += deltaY * 1;
    DrawGL3D.mouse.prevMouseX = event.clientX;
    DrawGL3D.mouse.prevMouseY = event.clientY;
    DrawGL3D.drawMain();
  }
}

DrawGL3D.canvas.addEventListener("wheel", (event) => {
  event.preventDefault()
  const newZoom = DrawGL3D.camera.Zoom * Math.pow(2, event.deltaY * 0.001);
  DrawGL3D.camera.Zoom = Math.max(0.02, Math.min(10000, newZoom));
  DrawGL3D.drawMain();
})

function mousedown(event) {
  if (event.shiftKey) {
    if (event.buttons == 1) {
      var x = event.clientX;
      var y = event.clientY;
      var rect = DrawGL3D.canvas.getBoundingClientRect();
      // If we're within the rectangle, mouse is down within canvas.
      if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
        DrawGL3D.ui.mouse.lastX = x;
        DrawGL3D.ui.mouse.lastY = y;
        DrawGL3D.ui.dragging = true;
      }
    }
  }
}

function mouseup(event) {
  DrawGL3D.ui.dragging = false;
}

function mousemove(event) {
  var x = event.clientX;
  var y = event.clientY;
  if (DrawGL3D.ui.dragging) {
    // The rotation speed factor
    // dx and dy here are how for in the x or y direction the mouse moved
    var factor = 50 / DrawGL3D.canvas.height;
    var dx = factor * (x - DrawGL3D.ui.mouse.lastX);
    var dy = factor * (y - DrawGL3D.ui.mouse.lastY);
    // update the latest angle
    DrawGL3D.camera.rotation_X -= dy;
    DrawGL3D.camera.rotation_Y -= dx;
  }
  // update the last mouse position
  DrawGL3D.ui.mouse.lastX = x;
  DrawGL3D.ui.mouse.lastY = y;
  DrawGL3D.drawMain();
}

DrawGL3D.canvas.addEventListener("mousedown", mousedown);
DrawGL3D.canvas.addEventListener("mouseup", mouseup);
DrawGL3D.canvas.addEventListener("mousemove", mousemove);

function showproperties3D(event) {
  if (event.buttons == 1 && DrawGL3D.ui.dragging == false) {
    if (DrawGL3D.nearestPointGL3D[0] !== undefined) {
      let Detail = DrawGL3D.takeValueRange.find(({ coord }) => coord[0] == DrawGL3D.nearestPointGL3D[0].coord[0] && coord[1] == DrawGL3D.nearestPointGL3D[0].coord[1] && coord[2] == DrawGL3D.nearestPointGL3D[0].coord[2])
      if (Detail !== undefined) {
        DrawGL.color = [0, 0, 1, 1];
        DrawGL3D.pointStorage = { x: Detail.coord[0], y: Detail.coord[1], z: Detail.coord[2] };
        DrawGL3D.drawPointProperty({
          x: Detail.coord[0],
          y: Detail.coord[1],
          x: Detail.coord[2],
          color: DrawGL.color,
          bufferInfo: DrawGL3D.sphereBufferInfo,
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
                    [${math.round(Detail.coord[0], 2)}, ${math.round(Detail.coord[1], 2)}, ${math.round(Detail.coord[2], 2)}]
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
      DrawGL.color = [1, 1, 1, 1];
      DrawGL3D.pointStorage = { x: 100000, y: 1000000, z: 1000000 };
    }
  }
}
