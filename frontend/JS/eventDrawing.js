function mousedownDrawing(event) {
    if (event.buttons == 1 && PaintIn.pen == "line" && DrawingGL.rotate == false) {
        DrawingGL.isDrawing = true;
        DrawingGL.mouseDownPos = { x: Math.round(DrawingGL.startPos[0], 5), y: Math.round(DrawingGL.startPos[1], 5) };
        DrawingGL.arrMouseDownPosition.push(DrawingGL.mouseDownPos);
        DrawingGL.currentMouseDownPos = { x: Math.round(DrawingGL.startPos[0], 5), y: Math.round(DrawingGL.startPos[1], 5) };

        let arrPoints = [];
        processingData.allPoint.forEach((value) =>
            arrPoints.push({ x: value.x, y: value.y })
        );
        let nearPoint = processingData.prototype.getNearest(
            arrPoints,
            DrawingGL.mouseDownPos,
            10 / DrawingGL.camera.zoom
        );

        if (nearPoint !== undefined) {
            DrawingGL.mouseDownPos = nearPoint[0];
            DrawingGL.DrawSphere({ x: DrawingGL.mouseDownPos.x, y: DrawingGL.mouseDownPos.y })
        }
        DrawingGL.arrLineX.push(DrawingGL.mouseDownPos.x);
        DrawingGL.arrLineY.push(DrawingGL.mouseDownPos.y);
        if (DrawingGL.arrLineX.length >= 2) {
            processingData.prototype.inputRawData(
                PaintIn.pen,
                DrawingGL.arrLineX,
                DrawingGL.arrLineY
            );
        }
        processingData.prototype.updateStorage();
        DrawingGL.scenePoint = [];
        DrawingGL.sceneLine = [];
        if (DrawingGL.arrPoint[0] == undefined) {
            DrawingGL.arrPoint.push(DrawingGL.mouseDownPos.x, DrawingGL.mouseDownPos.y)
        } else {
            DrawingGL.handleData();
        }
        bufferInfoPoint = DrawingGL.CreateBufferInfo(DrawingGL.arrPoint, null);
        bufferInfoLine = DrawingGL.CreateBufferInfo(DrawingGL.arrLine, null);
        DrawingGL.scenePoint.push({ color: DrawingGL.colorDefault, bufferInfo: bufferInfoPoint });
        DrawingGL.sceneLine.push({ color: DrawingGL.colorDefault, bufferInfo: bufferInfoLine });
        DrawingGL.DrawMain();
    } else if (PaintIn.pen == 'select') {
        DrawingGL.isDrawing = false;
    }
}

function getMousePosition(event) {
    // get canvas relative css position
    const rect = DrawingGL.canvas.getBoundingClientRect();
    const cssX = event.clientX - rect.left;
    const cssY = event.clientY - rect.top;

    // get normalized 0 to 1 position across and down canvas
    const normalizedX = cssX / DrawingGL.canvas.clientWidth;
    const normalizedY = cssY / DrawingGL.canvas.clientHeight;

    // convert to clip space
    const clipX = normalizedX * 2 - 1;
    const clipY = normalizedY * -2 + 1;

    return [clipX, clipY];
}

function mouseMove(event) {
    event.preventDefault();
    DrawingGL.startInvViewProjMat = m3.inverse(DrawingGL.viewProjectionMat);
    DrawingGL.startCamera = Object.assign({}, DrawingGL.camera);
    DrawingGL.startClipPos = getMousePosition(event);
    DrawingGL.startPos = m3.transformPoint(
        DrawingGL.startInvViewProjMat,
        DrawingGL.startClipPos);
    document.getElementById("display_coord").innerHTML =
        "[" +
        math.round(DrawingGL.startPos[0]) +
        " ; " +
        math.round(DrawingGL.startPos[1]) +
        "]";
}


function moveCameraDrawing(event) {
    const pos = m3.transformPoint(
        DrawingGL.startInvViewProjMat,
        getMousePosition(event));

    DrawingGL.camera.x = DrawingGL.startCamera.x + DrawingGL.startPos[0] - pos[0];
    DrawingGL.camera.y = DrawingGL.startCamera.y + DrawingGL.startPos[1] - pos[1];
    DrawingGL.DrawMain();
}

function rotateCameraDrawing(event) {
    const delta = (event.clientX - DrawingGL.startMousePos[0]) / 10;
    // compute a matrix to pivot around the camera space DrawingGL.startPos
    let camMat = m3.identity();
    camMat = m3.translate(camMat, DrawingGL.startPos[0], DrawingGL.startPos[1]);
    camMat = m3.rotate(camMat, delta);
    camMat = m3.translate(camMat, -DrawingGL.startPos[0], -DrawingGL.startPos[1]);

    // multply in the original camera matrix
    Object.assign(DrawingGL.camera, DrawingGL.startCamera);
    camMat = m3.multiply(camMat, DrawingGL.makeCameraMatrix());
    // now we can set the rotation and get the needed
    // camera position from the matrix
    DrawingGL.camera.rotation = DrawingGL.startCamera.rotation + delta;
    DrawingGL.camera.x = camMat[6];
    DrawingGL.camera.y = camMat[7];
    DrawingGL.DrawMain();
}

function handleMouseMoveDrawing(event) {
    if (DrawingGL.rotate) {
        rotateCameraDrawing(event);
    }
    if (event.buttons == 4) {
        moveCameraDrawing(event);
    }
}

function handleMouseUpDrawing() {
    DrawingGL.rotate = false;
    DrawingGL.DrawMain();
    DrawingGL.canvas.removeEventListener('mousemove', handleMouseMoveDrawing);
    DrawingGL.canvas.removeEventListener('mouseup', handleMouseUpDrawing);
}

DrawingGL.canvas.addEventListener('mousedown', (event) => {
    event.preventDefault();
    DrawingGL.canvas.addEventListener('mouseup', handleMouseUpDrawing);
    DrawingGL.canvas.addEventListener('mousemove', handleMouseMoveDrawing);
    if (event.buttons == 1) {
        DrawingGL.rotate = event.shiftKey;
    }
    DrawingGL.startInvViewProjMat = m3.inverse(DrawingGL.viewProjectionMat);
    DrawingGL.startCamera = Object.assign({}, DrawingGL.camera);
    DrawingGL.startClipPos = getMousePosition(event);
    DrawingGL.startPos = m3.transformPoint(
        DrawingGL.startInvViewProjMat,
        DrawingGL.startClipPos
    );
    DrawingGL.startMousePos = [event.clientX, event.clientY];
    DrawingGL.DrawMain();
});

function checkPoint() {
    let nearPoint = processingData.prototype.getNearest(
        DrawingGL.arrMouseDownPosition,
        DrawingGL.mouseDownPos,
        10/ DrawingGL.camera.zoom
    );
    if (DrawGL.nearPointGL[0] !== undefined) {
        DrawGL.drawCheckpoint({
          x: DrawGL.nearPointGL[0].coord[0],
          y: DrawGL.nearPointGL[0].coord[1],
          color: [1, 0, 0, 1],
          bufferInfo: DrawGL.sphereBufferInfo,
        });
      }
}
DrawingGL.canvas.addEventListener("mousemove", mouseMove);
// DrawingGL.canvas.addEventListener("mousemove", checkPoint);
DrawingGL.canvas.addEventListener("mousedown", mousedownDrawing);
DrawingGL.canvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    const [clipX, clipY] = getMousePosition(event);

    // position before zooming
    const [preZoomX, preZoomY] = m3.transformPoint(
        m3.inverse(DrawingGL.viewProjectionMat),
        [clipX, clipY]);

    // multiply the wheel movement by the current zoom level
    // so we zoom less when zoomed in and more when zoomed out
    const newZoom = DrawingGL.camera.zoom * Math.pow(2, event.deltaY * -0.001);
    DrawingGL.camera.zoom = Math.max(0.02, Math.min(10000, newZoom));

    DrawingGL.updateViewProjection();

    // position after zooming
    const [postZoomX, postZoomY] = m3.transformPoint(
        m3.inverse(DrawingGL.viewProjectionMat),
        [clipX, clipY]);

    // camera needs to be moved the difference of before and after
    DrawingGL.camera.x += preZoomX - postZoomX;
    DrawingGL.camera.y += preZoomY - postZoomY;

    DrawingGL.DrawMain();
});

DrawingGL.canvas.addEventListener("keydown", (event) => {
    if (event.keyCode === 32) {
        DrawingGL.arrLineX = [];
        DrawingGL.arrLineY = [];
        if (PaintIn.pen === "line") {
            processingData.prototype.areaDetect(processingData.allLine);
            let arrAllPoint = [];
            processingData.allPoint.forEach((value) =>
                arrAllPoint.push({ x: value.x, y: value.y })
            );
        }
    }
    if (event.keyCode === 27) {
        if (PaintIn.pen === "line") {
            processingData.prototype.areaDetect(processingData.allLine);
        }
        PaintIn.pen = "select";
        PaintIn.chooseLine();
        // document.getElementById("line").value="Off";
    }
})


function earClipping(vertices) {
    const triangles = [];
    while (vertices.length > 3) {
        const n = vertices.length;
        for (let i = 0; i < n; i++) {
            const previousIndex = (i + n - 1) % n;
            const currentIndex = i;
            const nextIndex = (i + 1) % n;
            const previousVertex = vertices[previousIndex];
            const currentVertex = vertices[currentIndex];
            const nextVertex = vertices[nextIndex];
            if (isEar(previousVertex, currentVertex, nextVertex, vertices)) {
                triangles.push([
                    previousVertex,
                    currentVertex,
                    nextVertex
                ]);
                vertices.splice(currentIndex, 1);
                break;
            }
        }
    }
    triangles.push(vertices);
    return triangles;
}
function isEar(previousVertex, currentVertex, nextVertex, vertices) {
    const triangle = [previousVertex, currentVertex, nextVertex];
    for (let i = 0; i < vertices.length; i++) {
        const vertex = vertices[i];
        if (
            vertex[0] === previousVertex[0] &&
            vertex[1] === previousVertex[1]
        ) {
            continue;
        }
        if (
            vertex[0] === currentVertex[0] &&
            vertex[1] === currentVertex[1]
        ) {
            continue;
        }
        if (
            vertex[0] === nextVertex[0] &&
            vertex[1] === nextVertex[1]
        ) {
            continue;
        }
        if (isPointInTriangle(vertex, triangle)) {
            return false;
        }
    }
    return true;
}
function isPointInTriangle(point, triangle) {
    const [a, b, c] = triangle;
    const crossAB = crossProduct(a, b, point);
    const crossBC = crossProduct(b, c, point);
    const crossCA = crossProduct(c, a, point);
    return (
        (crossAB >= 0 && crossBC >= 0 && crossCA >= 0) ||
        (crossAB <= 0 && crossBC <= 0 && crossCA <= 0)
    );
}
function crossProduct(a, b, c) {
    return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
}
