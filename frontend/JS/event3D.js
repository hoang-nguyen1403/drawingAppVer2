function getClipSpaceMousePosition3D(event) {
  const canvas = DrawGL3D.gl.canvas;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const clipX = x / rect.width * 2 - 1;
  const clipY = y / rect.height * -2 + 1;
  const invViewProjectionMatrix = m4.inverse(DrawGL3D.viewProjectionMat)
  const clipSpace = [clipX, clipY, -1, 0];
  const clipSpaceEnd = [clipX, clipY, 0, 0];
  const worldSpace = m4.transformPoint(invViewProjectionMatrix, clipSpace);
  const worldSpaceEnd = m4.transformPoint(invViewProjectionMatrix, clipSpaceEnd);
  return {
    origin: worldSpaceEnd,
    direction: worldSpace
  };
}

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


function handleMouseDownSelect(event) {

  const rayDirection = getClipSpaceMousePosition3D(event);
  const selectedPoint = performRaycasting(rayDirection);
  DrawGL3D.nearestPointGL3D = [];
  DrawGL3D.nearestPointGL3D = performRaycasting(rayDirection);
  if (selectedPoint) {
    // Perform actions on the selected point
    DrawGL3D.drawCheckPoint({
      x: selectedPoint.coord[0],
      y: selectedPoint.coord[1],
      z: selectedPoint.coord[2],
      bufferInfo: DrawGL3D.sphereBufferInfo
    });
  }
}

function performRaycasting(ray) {
  let closestPoint = null;
  let closestDistance = 5 * DrawGL3D.camera.Zoom;
  console.log(closestDistance);
  for (const point of DrawGL3D.takeValueRange) {
    const intersectionDistance = calculateDistance(ray, point.coord);
    if (intersectionDistance < closestDistance) {
      closestDistance = intersectionDistance;
      closestPoint = point;
    }
  }
  return closestPoint;
}

function calculateDistance(ray, point) {
  const [originX, originY, originZ] = ray.origin;
  const [dirX, dirY, dirZ] = ray.direction;
  const [pointX, pointY, pointZ] = point;

  const dx = pointX - originX;
  const dy = pointY - originY;
  const dz = pointZ - originZ;

  const t = (dx * dirX + dy * dirY + dz * dirZ) /
    (dirX * dirX + dirY * dirY + dirZ * dirZ);

  const intersectionX = originX + t * dirX;
  const intersectionY = originY + t * dirY;
  const intersectionZ = originZ + t * dirZ;

  const distX = intersectionX - pointX;
  const distY = intersectionY - pointY;
  const distZ = intersectionZ - pointZ;

  return Math.sqrt(distX * distX + distY * distY + distZ * distZ);
}


function showproperties3D(event) {
  if (event.buttons == 1 && DrawGL3D.ui.dragging == false) {
    if (DrawGL3D.nearestPointGL3D !== null) {
      let Detail = DrawGL3D.takeValueRange.find(({ coord }) => coord[0] == DrawGL3D.nearestPointGL3D.coord[0] && coord[1] == DrawGL3D.nearestPointGL3D.coord[1] && coord[2] == DrawGL3D.nearestPointGL3D.coord[2])
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
      DrawGL.color = [1, 1, 1, 1];
      DrawGL3D.pointStorage = { x: 0, y: 0, z: 0 };
    }
  }
}