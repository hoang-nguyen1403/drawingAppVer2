function mousedownDrawing(event) {
    if (event.buttons == 1 && PaintIn.pen == "line" && DrawingGL.rotate == false) {
        DrawingGL.startInvViewProjMat = m3.inverse(DrawingGL.viewProjectionMat);
        DrawingGL.startCamera = Object.assign({}, DrawingGL.camera);
        DrawingGL.startClipPos = getMousePosition(event);
        DrawingGL.startPos = m3.transformPoint(
            DrawingGL.startInvViewProjMat,
            DrawingGL.startClipPos
        );
        DrawingGL.startMousePos = [event.clientX, event.clientY];
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
        // processingData.prototype.updateStorage();
        DrawingGL.scenePoint = [];
        DrawingGL.sceneLine = [];
        if (DrawingGL.arrPoint[0] == undefined) {
            DrawingGL.arrPoint.push(DrawingGL.mouseDownPos.x, DrawingGL.mouseDownPos.y)
            DrawingGL.arrPointStorage.push(DrawingGL.mouseDownPos.x, DrawingGL.mouseDownPos.y)
        } else {
            DrawingGL.handleData();
        }
        bufferInfoPoint = DrawingGL.CreateBufferInfo(DrawingGL.arrPointStorage, null);
        bufferInfoLine = DrawingGL.CreateBufferInfo(DrawingGL.arrLineStorage, null);
        DrawingGL.scenePoint.push({ color: [1, 0, 0, 1], bufferInfo: bufferInfoPoint });
        DrawingGL.sceneLine.push({ color: DrawingGL.colorDefault, bufferInfo: bufferInfoLine });
        DrawingGL.DrawMain();
    } else if (PaintIn.pen == 'select') {
        DrawingGL.isDrawing = false;
    }
}


function lineDraw() {
    var storage = [];
    DrawingGL.sceneLineMove = [];
    if (DrawingGL.arrLine.length === 0) {
        storage = [DrawingGL.arrPoint[DrawingGL.arrPoint.length - 2], DrawingGL.arrPoint[DrawingGL.arrPoint.length - 1]];
    } else {
        storage = [DrawingGL.arrLine[DrawingGL.arrLine.length - 2], DrawingGL.arrLine[DrawingGL.arrLine.length - 1]];
    }
    storage.push(Math.round(startPos[0], 5), Math.round(startPos[1], 5))
    bufferInfoLine = DrawingGL.CreateBufferInfo(storage, null);
    DrawingGL.sceneLineMove.push({ color: DrawingGL.colorDefault, bufferInfo: bufferInfoLine });
}

function getMousePosition(event) {
    // get canvas relative css position
    const rect = domID("CanvasInput").getBoundingClientRect();
    const cssX = event.clientX - rect.left;
    const cssY = event.clientY - rect.top;

    // get normalized 0 to 1 position across and down canvas
    const normalizedX = cssX / domID("CanvasInput").clientWidth;
    const normalizedY = cssY / domID("CanvasInput").clientHeight;

    // convert to clip space
    const clipX = normalizedX * 2 - 1;
    const clipY = normalizedY * -2 + 1;

    return [clipX, clipY];
}

var startInvViewProjMat;
var startCamera;
var startClipPos;
var startPos = [0, 0];

function convertToHeightWidth(mouse) {
    var screen_width = DrawingGL.gl.canvas.clientWidth;
    var screen_height = DrawingGL.gl.canvas.clientHeight;
    var mouse_x = mouse[0];
    var mouse_y = mouse[1];
    var height = (mouse_y + 1) * (screen_height / 2);
    var width = (mouse_x + 1) * (screen_width / 2);

    // Round the height and width values to the nearest integer
    height = Math.round(height, 2);
    width = Math.round(width, 2);

    return { height: height, width: width };
}

function mouseMove(event) {
    event.preventDefault();
    startInvViewProjMat = m3.inverse(DrawingGL.viewProjectionMat);
    startCamera = Object.assign({}, DrawingGL.camera);
    startClipPos = getMousePosition(event);
    startPos = m3.transformPoint(
        startInvViewProjMat,
        startClipPos);
    // console.log(m3.transformPoint(m3.inverse(startInvViewProjMat),startPos));
    document.getElementById("display_coord").innerHTML =
        "[" +
        math.round(startPos[0]) +
        " ; " +
        math.round(startPos[1]) +
        "]";
}

function showPointNearest() {
    if (PaintIn.pen == "line") {
        var currentPointGL = {
            x: startPos[0],
            y: startPos[1],
        };
        let arrPoint = [];
        if (DrawingGL.arrPointStorage != null) {
            for (let i = 0; i < DrawingGL.arrPointStorage.length; i += 2) {
                arrPoint.push({ x: DrawingGL.arrPointStorage[i], y: DrawingGL.arrPointStorage[i + 1] })
            }
        }
        DrawingGL.nearPointGL = processingData.prototype.getNearest(arrPoint, currentPointGL, 10 / DrawingGL.camera.zoom);
        if (DrawingGL.nearPointGL !== undefined) {
            DrawingGL.DrawMain();
            DrawingGL.DrawSphere({
                x: DrawingGL.nearPointGL[0].x,
                y: DrawingGL.nearPointGL[0].y,
            });
        }
        else {
            DrawingGL.DrawMain();
        }
    }
}

function moveCameraDrawing(event) {
    const pos = m3.transformPoint(
        DrawingGL.startInvViewProjMat,
        getMousePosition(event));
    DrawingGL.camera.x = DrawingGL.startCamera.x + DrawingGL.startPos[0] - pos[0];
    DrawingGL.camera.y = DrawingGL.startCamera.y + DrawingGL.startPos[1] - pos[1];
    DrawingGL.DrawMain();
    domID("CanvasInput").innerHTML = ``
}

function rotateCameraDrawing(event) {
    const delta = (-event.clientX + DrawingGL.startMousePos[0]) / 100;
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
    if (isAdd == false) {
        if (DrawingGL.rotate) {
            rotateCameraDrawing(event);
        }
        if (event.buttons == 4) {
            moveCameraDrawing(event);
        }
    }
}

function handleMouseUpDrawing() {
    DrawingGL.rotate = false;
    DrawingGL.DrawMain();
    renderName();
    domID("CanvasInput").removeEventListener('mousemove', handleMouseMoveDrawing);
    domID("CanvasInput").removeEventListener('mouseup', handleMouseUpDrawing);
}

domID("CanvasInput").addEventListener('mousedown', (event) => {
    event.preventDefault();
    domID("CanvasInput").addEventListener('mouseup', handleMouseUpDrawing);
    domID("CanvasInput").addEventListener('mousemove', handleMouseMoveDrawing);
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
    // console.log(DrawingGL.startPos);
    DrawingGL.DrawMain();
});


domID("CanvasInput").addEventListener("mousemove", mouseMove);
domID("CanvasInput").addEventListener("mousedown", mousedownDrawing);
domID("CanvasInput").addEventListener("mousemove", showPointNearest);
domID("CanvasInput").addEventListener('wheel', (event) => {
    if (isAdd == false) {
        event.preventDefault();
        const [clipX, clipY] = getMousePosition(event);

        // position before zooming
        const [preZoomX, preZoomY] = m3.transformPoint(
            m3.inverse(DrawingGL.viewProjectionMat),
            [clipX, clipY]);

        // multiply the wheel movement by the current zoom level
        // so we zoom less when zoomed in and more when zoomed out
        let newZoom;
        if (event.deltaY < 0) {
            newZoom = DrawingGL.camera.zoom + Math.pow(2, -1);
        } else {
            newZoom = DrawingGL.camera.zoom - Math.pow(2, -1);
        }
        DrawingGL.camera.zoom = Math.max(0.5, Math.min(100, newZoom));

        DrawingGL.updateViewProjection();

        // position after zooming
        const [postZoomX, postZoomY] = m3.transformPoint(
            m3.inverse(DrawingGL.viewProjectionMat),
            [clipX, clipY]);

        // camera needs to be moved the difference of before and after
        DrawingGL.camera.x += preZoomX - postZoomX;
        DrawingGL.camera.y += preZoomY - postZoomY;

        DrawingGL.DrawMain();
        renderName();
    }
});
var storage = [];
var lastDraw;
document.addEventListener("keydown", (event) => {
    if (event.keyCode === 76) {
        if (PaintIn.pen === "line") {
            console.log(1);
            domID("CanvasInput").removeEventListener("mousemove", lineDraw);
            lastDraw = [];
            lastDraw = storageData(DrawingGL.arrLineX, DrawingGL.arrLineY);
            if (lastDraw.length !== 0) {
                storage.push(storageData(
                    DrawingGL.arrLineX,
                    DrawingGL.arrLineY
                ))
            }
            var all_line = checkBox(storage, lastDraw);
            var unique = [all_line[0]];
            for (let line of all_line) {
                var count = 0;
                for (let lineCheck of unique) {
                    if (JSON.stringify(lineCheck) === JSON.stringify(line)) {
                        count += 1;
                    }
                }
                if (count < 1) {
                    unique.push(line)
                }
            }
            all_line = unique
            console.log(all_line);
            if (all_line.length > 2) {
                detect = true;
                DrawingGL.sceneLineMove = [];
                DrawingGL.DrawMain();
                detectArea(all_line);
            }
            else {
                detect = false
                storage_line.push(all_line)
                storage_point.push([all_line[0].Point[0], all_line[0].Point[1]]);
                processingData.allArea = storage_area.flat();
                processingData.allLine = storage_line.flat();
                processingData.allPoint = storage_point.flat();
                domID("CanvasInput").removeEventListener("mousemove", lineDraw);
                DrawingGL.sceneLineMove = [];
                DrawingGL.arrPoint = [];
                DrawingGL.arrLine = [];
                DrawingGL.arrLineX = [];
                DrawingGL.arrLineY = [];
                DrawingGL.arrPointStorage.splice(DrawingGL.arrPointStorage.length - 2, 1);
                DrawingGL.arrPointStorage.splice(DrawingGL.arrPointStorage.length - 1, 1);
                DrawingGL.scenePoint = [];
                DrawingGL.sceneLine = [];
                DrawingGL.handleDataStorage();
                bufferInfoPoint = DrawingGL.CreateBufferInfo(DrawingGL.arrPointStorage, null);
                bufferInfoLine = DrawingGL.CreateBufferInfo(DrawingGL.arrLineStorage, null);
                DrawingGL.scenePoint.push({ color: [1, 0, 0, 1], bufferInfo: bufferInfoPoint });
                DrawingGL.sceneLine.push({ color: DrawingGL.colorDefault, bufferInfo: bufferInfoLine });
                DrawingGL.DrawMain();
            }
            domID("CanvasInput").addEventListener("mousemove", lineDraw);
        }
    }
    if (event.keyCode === 27) {
        if (PaintIn.pen === "line") {
            PaintIn.pen = "select";
            PaintIn.chooseLine();
            PaintIn.renderCommand("Off");
            if (DrawingGL.arrLineX.length >= 2) {
                lastDraw = [];
                lastDraw = storageData(DrawingGL.arrLineX, DrawingGL.arrLineY);
                // console.log(DrawingGL.arrLineX, DrawingGL.arrLineY);
                // console.log(processingData.allObject);
                if (lastDraw.length !== 0) {
                    storage.push(storageData(
                        DrawingGL.arrLineX,
                        DrawingGL.arrLineY
                    ))
                }

                var all_line = checkBox(storage, lastDraw);
                var unique = [all_line[0]];
                for (let line of all_line) {
                    var count = 0;
                    for (let lineCheck of unique) {
                        if (JSON.stringify(lineCheck) === JSON.stringify(line)) {
                            count += 1;
                        }
                    }
                    if (count < 1) {
                        unique.push(line)
                    }
                }
                all_line = unique
                console.log(all_line);
                if (all_line.length > 2) {
                    detect = true;
                    DrawingGL.sceneLineMove = [];
                    DrawingGL.DrawMain();
                    detectArea(all_line);
                }
                else {
                    detect = false
                    storage_line.push(all_line)
                    storage_point.push([all_line[0].Point[0], all_line[0].Point[1]]);
                    processingData.allArea = storage_area.flat();
                    processingData.allLine = storage_line.flat();
                    processingData.allPoint = storage_point.flat();
                    domID("CanvasInput").removeEventListener("mousemove", lineDraw);
                    DrawingGL.sceneLineMove = [];
                    DrawingGL.arrPoint = [];
                    DrawingGL.arrLine = [];
                    DrawingGL.arrLineX = [];
                    DrawingGL.arrLineY = [];
                    DrawingGL.arrPointStorage.splice(DrawingGL.arrPointStorage.length - 2, 1);
                    DrawingGL.arrPointStorage.splice(DrawingGL.arrPointStorage.length - 1, 1);
                    DrawingGL.scenePoint = [];
                    DrawingGL.sceneLine = [];
                    DrawingGL.handleDataStorage();
                    bufferInfoPoint = DrawingGL.CreateBufferInfo(DrawingGL.arrPointStorage, null);
                    bufferInfoLine = DrawingGL.CreateBufferInfo(DrawingGL.arrLineStorage, null);
                    DrawingGL.scenePoint.push({ color: [1, 0, 0, 1], bufferInfo: bufferInfoPoint });
                    DrawingGL.sceneLine.push({ color: DrawingGL.colorDefault, bufferInfo: bufferInfoLine });
                    DrawingGL.DrawMain();
                }
            } else {
                domID("CanvasInput").removeEventListener("mousemove", lineDraw);
                DrawingGL.sceneLineMove = [];
                DrawingGL.arrPoint = [];
                DrawingGL.arrLineX = [];
                DrawingGL.arrLineY = [];
                DrawingGL.arrPointStorage.splice(DrawingGL.arrPointStorage.length - 2, 1);
                DrawingGL.arrPointStorage.splice(DrawingGL.arrPointStorage.length - 1, 1);
                DrawingGL.scenePoint = [];
                DrawingGL.sceneLine = [];
                DrawingGL.handleDataStorage();
                bufferInfoPoint = DrawingGL.CreateBufferInfo(DrawingGL.arrPointStorage, null);
                bufferInfoLine = DrawingGL.CreateBufferInfo(DrawingGL.arrLineStorage, null);
                DrawingGL.scenePoint.push({ color: [1, 0, 0, 1], bufferInfo: bufferInfoPoint });
                DrawingGL.sceneLine.push({ color: DrawingGL.colorDefault, bufferInfo: bufferInfoLine });
                DrawingGL.DrawMain();
            }
        } if (update.length > 1) {
            detect = true;
            // DrawingGL.sceneLineMove = [];
            // DrawingGL.DrawMain();
            detectArea(update);
            DrawingGL.storageSelectPoint = { x: 10000000, y: 100000000 }
            DrawingGL.sceneSelectedPoint = [];
            DrawingGL.sceneSelectedLine = [];
            DrawingGL.sceneSelectedArea = [];
            PaintIn.arrMultiCurObj = [];
            PaintIn.renderProperty("off");
            domID("BDCondition").style.display = "none";
            PaintIn.canvas.style.cursor = "url(frontend/img/select_cursor.svg) 0 0,  default";
            PaintIn.renderCommand("Off");
            DrawingGL.DrawMain();
            PaintIn.offButtonDraw(PaintIn.currentValueLine, "line");
            PaintIn.offButton(PaintIn.curValMoment, "moment");
            PaintIn.offButton(PaintIn.curValPointLoad, "pointLoad");
            PaintIn.offButton(PaintIn.curValPressLoad, "pressLoad");
            PaintIn.offButton(PaintIn.curValName, "valueName");
            domID("inputAdd").style.display = "none";
            isAdd = false;
        }
        else {
            DrawingGL.storageSelectPoint = { x: 10000000, y: 100000000 }
            DrawingGL.sceneSelectedPoint = [];
            DrawingGL.sceneSelectedLine = [];
            DrawingGL.sceneSelectedArea = [];
            PaintIn.arrMultiCurObj = [];
            PaintIn.renderProperty("off");
            domID("BDCondition").style.display = "none";
            PaintIn.canvas.style.cursor = "url(frontend/img/select_cursor.svg) 0 0,  default";
            PaintIn.renderCommand("Off");
            DrawingGL.DrawMain();
            PaintIn.offButtonDraw(PaintIn.currentValueLine, "line");
            PaintIn.offButton(PaintIn.curValMoment, "moment");
            PaintIn.offButton(PaintIn.curValPointLoad, "pointLoad");
            PaintIn.offButton(PaintIn.curValPressLoad, "pressLoad");
            PaintIn.offButton(PaintIn.curValName, "valueName");
            domID("inputAdd").style.display = "none";
            isAdd = false;
        }
    }
});


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
var stor = [];
var select = null;
var drag = false;
var isChose = false;
function selectObj(event) {
    if (event.buttons === 1) {
        let selectedObj = processingData.allObject.find((obj) =>
            obj.isIn([startPos[0], startPos[1]])
        );
        if (selectedObj !== undefined && PaintIn.pen == "select") {
            if (event.ctrlKey) {
            } else {
                select = selectedObj;
                stor.push(selectedObj);
                PaintIn.renderProperty(selectedObj.className, selectedObj);
                renderSelect(selectedObj)
                domID("CanvasInput").addEventListener("mousedown", mouseDownMove)
                isChose = true;
            }
        } else {
            if (!event.ctrlKey && isAdd == false) {
                DrawingGL.storageSelectPoint = { x: 10000000, y: 100000000 }
                DrawingGL.sceneSelectedPoint = [];
                DrawingGL.sceneSelectedLine = [];
                DrawingGL.sceneSelectedArea = [];
                PaintIn.arrMultiCurObj = [];
                select = null
                drag = false
                isChose = false
                PaintIn.renderProperty("off");
                domID("BDCondition").style.display = "none";
                domID("CanvasInput").removeEventListener("mousedown", mouseDownMove)
            }
            selected = [];
            stor = [];
        }
    }
}

function selectMultiObj(event) {
    if (event.ctrlKey && event.buttons === 1) {
        let selectedObj = processingData.allObject.find((obj) =>
            obj.isIn([startPos[0], startPos[1]])
        );
        if (stor.length !== 0) {
            PaintIn.arrMultiCurObj = stor;
        } else {
        }
        if (selectedObj !== undefined && PaintIn.pen == "select") {
            if (selected.length !== 0) {
                PaintIn.arrMultiCurObj = selected
            }
            if (PaintIn.arrMultiCurObj.length == 0) {
                PaintIn.arrMultiCurObj.push(selectedObj);
                switch (selectedObj.className) {
                    case "Point":
                        renderMultiSelectObj("Point");
                        break;
                    case "Line":
                        renderMultiSelectObj("Line");
                        break;
                    case "Area":
                        renderMultiSelectObj("Area");
                        break;
                }
            } else {
                if (selectedObj.className === PaintIn.arrMultiCurObj[0].className) {
                    let count = 0;
                    let index;
                    switch (selectedObj.className) {
                        case "Point":
                            for (let i = 0; i < PaintIn.arrMultiCurObj.length; i++) {
                                let data = PaintIn.arrMultiCurObj[i]
                                if (data.point[0] == selectedObj.point[0] && data.point[1] == selectedObj.point[1]) {
                                    count += 1;
                                    index = i;
                                }
                            }
                            if (count < 1) {
                                PaintIn.arrMultiCurObj.push(selectedObj);
                            } else {
                                PaintIn.arrMultiCurObj.splice(index, 1);
                            }
                            renderMultiSelectObj("Point");
                            break;

                        case "Line":
                            for (let i = 0; i < PaintIn.arrMultiCurObj.length; i++) {
                                let data = PaintIn.arrMultiCurObj[i]
                                if (data.Point[0].point[0] == selectedObj.Point[0].point[0] &&
                                    data.Point[0].point[1] == selectedObj.Point[0].point[1] &&
                                    data.Point[1].point[0] == selectedObj.Point[1].point[0] &&
                                    data.Point[1].point[1] == selectedObj.Point[1].point[1]) {
                                    count += 1;
                                    index = i;
                                }
                            }
                            if (count < 1) {
                                PaintIn.arrMultiCurObj.push(selectedObj);
                            } else {
                                PaintIn.arrMultiCurObj.splice(index, 1);
                            }
                            renderMultiSelectObj("Line");
                            break;
                        case "Area":
                            for (let i = 0; i < PaintIn.arrMultiCurObj.length; i++) {
                                let data = PaintIn.arrMultiCurObj[i]
                                if (data.center[0] == selectedObj.center[0] &&
                                    data.center[1] == selectedObj.center[1]) {
                                    count += 1;
                                    index = i;
                                }
                            }
                            if (count < 1) {
                                PaintIn.arrMultiCurObj.push(selectedObj);
                            } else {
                                PaintIn.arrMultiCurObj.splice(index, 1);
                            }
                            renderMultiSelectObj("Area");
                            break;
                    }

                }
            }
            if (PaintIn.arrMultiCurObj.length !== 0) {
                PaintIn.renderProperty("multi", PaintIn.arrMultiCurObj)
            } else {
                domID("property").style.display = "none";
            }
        }
    }
}

function renderSelect(obj) {
    if (obj.className == "Point") {
        DrawingGL.storageSelectPoint = { x: obj.point[0], y: obj.point[1] };
        DrawingGL.sceneSelectedLine = [];
        DrawingGL.sceneSelectedArea = [];
        document.getElementById("BDCondition").style.display = "flex";
        document.getElementById("BDCondition").style.width = "200px";
        //display 3 button
        PaintIn.visibleButton("valueName");
        PaintIn.visibleButton("pointLoad");
        PaintIn.visibleButton("moment");
        //hidden 1 button
        PaintIn.hiddenButton("pressLoad");
    }
    else if (obj.className == "Line") {
        DrawingGL.storageSelectPoint = { x: 10000000, y: 100000000 }
        DrawingGL.sceneSelectedLine = [];
        DrawingGL.sceneSelectedArea = [];
        DrawingGL.storageSelectLine = [obj.Point[0].point, obj.Point[1].point].flat();
        var buffer = DrawingGL.CreateBufferInfo(DrawingGL.storageSelectLine);
        DrawingGL.sceneSelectedLine.push({ color: DrawingGL.colorPickLine, bufferInfo: buffer });
        document.getElementById("BDCondition").style.width = "150px";
        document.getElementById("BDCondition").style.display = "flex";
        //display 2 button
        PaintIn.visibleButton("valueName");
        PaintIn.visibleButton("pressLoad");
        //hidden 2 button
        PaintIn.hiddenButton("pointLoad");
        PaintIn.hiddenButton("moment");
    }
    else if (obj.className == "Area") {
        DrawingGL.storageSelectPoint = { x: 10000000, y: 100000000 }
        DrawingGL.sceneSelectedLine = [];
        DrawingGL.sceneSelectedArea = [];
        var arrArea = [];
        arrArea.push(obj.pointFlow);
        arrArea = arrArea.flat();
        let triangles = earClipping(arrArea);
        triangles = triangles.flat();
        triangles = triangles.flat();
        let bufferInfoArea = DrawingGL.CreateBufferInfo(triangles, null);
        DrawingGL.sceneSelectedArea.push({ color: DrawingGL.colorPickArea, bufferInfo: bufferInfoArea })
        document.getElementById("BDCondition").style.width = "70px";
        document.getElementById("BDCondition").style.display = "flex";
        //display 1 button
        PaintIn.visibleButton("valueName");
        //hidden 3 button
        PaintIn.hiddenButton("pressLoad");
        PaintIn.hiddenButton("pointLoad");
        PaintIn.hiddenButton("moment");
    }
    DrawingGL.DrawMain();
}

function nearestObj() {
    if (PaintIn.pen == "select") {
        let selectedObj = processingData.allObject.find((obj) =>
            obj.isIn([startPos[0], startPos[1]])
        );
        if (selectedObj !== undefined) {
            renderNearObject(selectedObj)
        } else {
            DrawingGL.selectLine = [];
            DrawingGL.selectArea = [];
            DrawingGL.DrawMain();
        }
    }
}

function renderNearObject(obj) {
    if (obj.className == "Point") {
        DrawingGL.DrawMain();
        DrawingGL.DrawSphere({
            x: obj.point[0],
            y: obj.point[1],
        });
    }
    if (obj.className == "Line") {
        DrawingGL.selectLine = [];
        DrawingGL.selectArea = [];
        DrawingGL.hoverLine = [obj.Point[0].point, obj.Point[1].point].flat();
        var buffer = DrawingGL.CreateBufferInfo(DrawingGL.hoverLine);
        DrawingGL.selectLine.push({ color: DrawingGL.colorHoverLine, bufferInfo: buffer });
        DrawingGL.DrawMain();
    }
    else if (obj.className == "Area") {
        DrawingGL.selectLine = [];
        DrawingGL.selectArea = [];
        var arrArea = [];
        arrArea.push(obj.pointFlow);
        arrArea = arrArea.flat();
        let triangles = earClipping(arrArea);
        triangles = triangles.flat();
        triangles = triangles.flat();
        let bufferInfoArea = DrawingGL.CreateBufferInfo(triangles, null);
        DrawingGL.selectArea.push({ color: DrawingGL.colorHoverArea, bufferInfo: bufferInfoArea })
        DrawingGL.DrawMain();
    }
}

domID("CanvasInput").addEventListener("mousedown", selectObj);
domID("CanvasInput").addEventListener("mousedown", selectMultiObj);
domID("CanvasInput").addEventListener("mousemove", nearestObj);

function takeValueMouseDown(event) {
    if (event.buttons == 1) {
        DrawingGL.mouseDownPosBox = startPos;
        if (selected.length !== 0 && !event.ctrlKey) {
            DrawingGL.sceneSelectedPoint = [];
            DrawingGL.sceneSelectedLine = [];
            DrawingGL.sceneSelectedArea = [];
        }
    }
}
domID("CanvasInput").addEventListener("mousedown", takeValueMouseDown);
function boxSelect(event) {
    if (event.buttons == 1 && DrawingGL.rotate == false) {
        DrawingGL.sceneBox = [];
        var arrArea = [];
        arrArea = [DrawingGL.mouseDownPosBox[0], DrawingGL.mouseDownPosBox[1], DrawingGL.mouseDownPosBox[0], startPos[1], startPos[0], startPos[1], startPos[0], DrawingGL.mouseDownPosBox[1]];
        let topLeftPoint = [DrawingGL.mouseDownPosBox[0], DrawingGL.mouseDownPosBox[1]];
        let bottomRigthPoint = [startPos[0], startPos[1]];
        PaintIn.curSelectBox = [topLeftPoint, bottomRigthPoint];
        let bufferInfoArea = DrawingGL.CreateBufferInfo(arrArea, null);
        DrawingGL.sceneBox.push({ color: DrawingGL.colorSceneBox, bufferInfo: bufferInfoArea })
        DrawingGL.DrawMain();

    }
}
var selected = [];
domID("CanvasInput").addEventListener("mousemove", boxSelect);
domID("CanvasInput").addEventListener("mouseup", (event) => {
    DrawingGL.sceneBox = [];

    let topPoint = PaintIn.curSelectBox[0];
    let bottomPoint = PaintIn.curSelectBox[1];

    if (topPoint !== undefined && bottomPoint !== undefined && topPoint[0] !== bottomPoint[0] && topPoint[1] !== bottomPoint[1] && PaintIn.pen == "select") {
        {
            PaintIn.arrMultiCurObj = [];
            //create select box
            processingData.allObject.forEach((obj) => {
                if (obj.isInBox(topPoint, bottomPoint)) {
                    PaintIn.arrMultiCurObj.push(obj);
                }
            });

        }
        if (PaintIn.arrMultiCurObj.length !== 0) {
            let allTypes = [];
            PaintIn.arrMultiCurObj.forEach((obj) => {
                if (allTypes.indexOf(obj.className) === -1)
                    allTypes.push(obj.className);
            });
            let options = "";
            for (let type of allTypes) {
                options += `<option value = "${type}">${type}</option>`;
            }
            selected = [];
            for (let obj of PaintIn.arrMultiCurObj) {
                if (obj.className == "Point") {
                    selected.push(obj)
                }
            }
            renderMultiSelect("Point");
            domID("property").style.display = "block"
            document.getElementById("property").innerHTML = `
        <div class="property_label">
          <p>Properties</p>
          <div>
            <button class="property-icon" onclick="PaintIn.toggleProperty()" value="Off"></button>
          </div>
        </div>
        <div class=boderProperties>
          <div>
              <div style="border-left:0px">
                  <select id="selectTypeObj" onchange="updateSelect()
                  ">
                      ${options}
                  </select>
              </div>
              <div id = "sum">${selected.length}
              </div>
                  </div>
        </div>
        `;
        }
    }
    PaintIn.curSelectBox = [];
    if (drag == true) {
        DrawingGL.storageSelectPoint = { x: 10000000, y: 100000000 }
        DrawingGL.sceneSelectedPoint = [];
        DrawingGL.sceneSelectedLine = [];
        DrawingGL.sceneSelectedArea = [];
        PaintIn.arrMultiCurObj = [];
        select = null
        drag = false
        isChose = false
        PaintIn.renderProperty("off");
        domID("BDCondition").style.display = "none";
        domID("CanvasInput").removeEventListener("mousedown", mouseDownMove)
    }
});

function updateSelect() {
    selected = [];
    if (domID("selectTypeObj") !== null) {
        switch (domID("selectTypeObj").value) {
            case "Point":
                for (let obj of PaintIn.arrMultiCurObj) {
                    if (obj.className == "Point") {
                        selected.push(obj)
                    }
                }
                renderMultiSelect(domID("selectTypeObj").value)
                break;
            case "Line":
                for (let obj of PaintIn.arrMultiCurObj) {
                    if (obj.className == "Line") {
                        selected.push(obj)
                    }
                }
                renderMultiSelect(domID("selectTypeObj").value)
                break;
            case "Area":
                for (let obj of PaintIn.arrMultiCurObj) {
                    if (obj.className == "Area") {
                        selected.push(obj)
                    }
                }
                renderMultiSelect(domID("selectTypeObj").value)
                break;
        }
        domID("sum").innerHTML = selected.length
    }
}

function renderMultiSelect(type) {
    switch (type) {
        case "Point":
            DrawingGL.sceneSelectedPoint = [];
            DrawingGL.sceneSelectedLine = [];
            DrawingGL.sceneSelectedArea = [];
            for (let data of selected) {
                DrawingGL.sceneSelectedPoint.push({ x: data.point[0], y: data.point[1], color: DrawingGL.colorPickPoint })
            }
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
            DrawingGL.sceneSelectedPoint = [];
            DrawingGL.sceneSelectedLine = [];
            DrawingGL.sceneSelectedArea = [];
            for (let data of selected) {
                DrawingGL.storageSelectLine = [data.Point[0].point, data.Point[1].point].flat();
                var buffer = DrawingGL.CreateBufferInfo(DrawingGL.storageSelectLine);
                DrawingGL.sceneSelectedLine.push({ color: DrawingGL.colorPickLine, bufferInfo: buffer });
            }
            document.getElementById("BDCondition").style.width = "150px";
            document.getElementById("BDCondition").style.display = "flex";
            //display 2 button
            PaintIn.visibleButton("valueName");
            PaintIn.visibleButton("pressLoad");
            //hidden 2 button
            PaintIn.hiddenButton("pointLoad");
            PaintIn.hiddenButton("moment");
            break;
        case "Area":
            DrawingGL.sceneSelectedPoint = [];
            DrawingGL.sceneSelectedLine = [];
            DrawingGL.sceneSelectedArea = [];
            for (let data of selected) {
                var arrArea = [];
                arrArea.push(data.pointFlow);
                arrArea = arrArea.flat();
                let triangles = earClipping(arrArea);
                triangles = triangles.flat();
                triangles = triangles.flat();
                let bufferInfoArea = DrawingGL.CreateBufferInfo(triangles, null);
                DrawingGL.sceneSelectedArea.push({ color: DrawingGL.colorPickArea, bufferInfo: bufferInfoArea })
            }
            document.getElementById("BDCondition").style.width = "70px";
            document.getElementById("BDCondition").style.display = "flex";
            //display 1 button
            PaintIn.visibleButton("valueName");
            //hidden 3 button
            PaintIn.hiddenButton("pressLoad");
            PaintIn.hiddenButton("pointLoad");
            PaintIn.hiddenButton("moment");
            break;
    }
    DrawingGL.DrawMain();
}

function renderMultiSelectObj(type) {
    switch (type) {
        case "Point":
            DrawingGL.storageSelectPoint = { x: 10000000, y: 100000000 }
            DrawingGL.sceneSelectedPoint = [];
            DrawingGL.sceneSelectedLine = [];
            DrawingGL.sceneSelectedArea = [];
            for (let data of PaintIn.arrMultiCurObj) {
                DrawingGL.sceneSelectedPoint.push({ x: data.point[0], y: data.point[1], color: DrawingGL.colorPickPoint })
            }
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
            DrawingGL.storageSelectPoint = { x: 10000000, y: 100000000 }
            DrawingGL.sceneSelectedPoint = [];
            DrawingGL.sceneSelectedLine = [];
            DrawingGL.sceneSelectedArea = [];
            for (let data of PaintIn.arrMultiCurObj) {
                DrawingGL.storageSelectLine = [data.Point[0].point, data.Point[1].point].flat();
                var buffer = DrawingGL.CreateBufferInfo(DrawingGL.storageSelectLine);
                DrawingGL.sceneSelectedLine.push({ color: DrawingGL.colorPickLine, bufferInfo: buffer });
            }
            document.getElementById("BDCondition").style.width = "150px";
            document.getElementById("BDCondition").style.display = "flex";
            //display 2 button
            PaintIn.visibleButton("valueName");
            PaintIn.visibleButton("pressLoad");
            //hidden 2 button
            PaintIn.hiddenButton("pointLoad");
            PaintIn.hiddenButton("moment");
            break;
        case "Area":
            DrawingGL.storageSelectPoint = { x: 10000000, y: 100000000 }
            DrawingGL.sceneSelectedPoint = [];
            DrawingGL.sceneSelectedLine = [];
            DrawingGL.sceneSelectedArea = [];
            for (let data of PaintIn.arrMultiCurObj) {
                var arrArea = [];
                arrArea.push(data.pointFlow);
                arrArea = arrArea.flat();
                let triangles = earClipping(arrArea);
                triangles = triangles.flat();
                triangles = triangles.flat();
                let bufferInfoArea = DrawingGL.CreateBufferInfo(triangles, null);
                DrawingGL.sceneSelectedArea.push({ color: DrawingGL.colorPickArea, bufferInfo: bufferInfoArea })
            }
            document.getElementById("BDCondition").style.width = "70px";
            document.getElementById("BDCondition").style.display = "flex";
            //display 1 button
            PaintIn.visibleButton("valueName");
            //hidden 3 button
            PaintIn.hiddenButton("pressLoad");
            PaintIn.hiddenButton("pointLoad");
            PaintIn.hiddenButton("moment");
            break;
    }
    DrawingGL.DrawMain();
}

function addValueName() {
    PaintIn.canvas.style.cursor = "url(frontend/img/text_cursor.svg),auto"
    PaintIn.offButtonDraw(PaintIn.currentValueLine, "line");
    PaintIn.offButton(PaintIn.curValMoment, "moment");
    PaintIn.offButton(PaintIn.curValPointLoad, "pointLoad");
    PaintIn.offButton(PaintIn.curValPressLoad, "pressLoad");
    PaintIn.onOffButton(PaintIn.curValName, "valueName");
    if (PaintIn.curValName.value === "On") {
        PaintIn.renderCommand("valueOn");
        showAddZone("valueName");
    } else {
        PaintIn.renderCommand("Off");
        PaintIn.offButtonDraw(PaintIn.currentValueLine, "line");
        PaintIn.offButton(PaintIn.curValMoment, "moment");
        PaintIn.offButton(PaintIn.curValPointLoad, "pointLoad");
        PaintIn.offButton(PaintIn.curValPressLoad, "pressLoad");
        PaintIn.offButton(PaintIn.curValName, "valueName");
    }
}
var isAdd = false;

function addValForce() {
    PaintIn.canvas.style.cursor = "url(frontend/img/force_cursor.svg),auto"
    PaintIn.offButtonDraw(PaintIn.currentValueLine, "line");
    PaintIn.offButton(PaintIn.curValMoment, "moment");
    PaintIn.offButton(PaintIn.curValName, "valueName");
    PaintIn.offButton(PaintIn.curValPressLoad, "pressLoad");
    PaintIn.onOffButton(PaintIn.curValPointLoad, "pointLoad");
    if (PaintIn.curValPointLoad.value === "On") {
        PaintIn.renderCommand("valueOn");
        showAddZone("pointLoad");
    } else {
        PaintIn.renderCommand("Off");
        PaintIn.offButtonDraw(PaintIn.currentValueLine, "line");
        PaintIn.offButton(PaintIn.curValMoment, "moment");
        PaintIn.offButton(PaintIn.curValPointLoad, "pointLoad");
        PaintIn.offButton(PaintIn.curValPressLoad, "pressLoad");
        PaintIn.offButton(PaintIn.curValName, "valueName");
    }
}

function addValMoment() {
    PaintIn.canvas.style.cursor = "url(frontend/img/moment_cursor.svg),auto"
    PaintIn.offButtonDraw(PaintIn.currentValueLine, "line");
    PaintIn.offButton(PaintIn.curValName, "valueName");
    PaintIn.offButton(PaintIn.curValPointLoad, "pointLoad");
    PaintIn.offButton(PaintIn.curValPressLoad, "pressLoad");
    PaintIn.onOffButton(PaintIn.curValMoment, "moment");
    if (PaintIn.curValMoment.value === "On") {
        PaintIn.renderCommand("valueOn");
        showAddZone("moment");
    } else {
        PaintIn.renderCommand("Off");
        PaintIn.offButtonDraw(PaintIn.currentValueLine, "line");
        PaintIn.offButton(PaintIn.curValMoment, "moment");
        PaintIn.offButton(PaintIn.curValPointLoad, "pointLoad");
        PaintIn.offButton(PaintIn.curValPressLoad, "pressLoad");
        PaintIn.offButton(PaintIn.curValName, "valueName");
    }
}

function addValPressure() {
    PaintIn.canvas.style.cursor = "url(frontend/img/normal_press_cursor.svg),auto"
    PaintIn.offButtonDraw(PaintIn.currentValueLine, "line");
    PaintIn.offButton(PaintIn.curValMoment, "moment");
    PaintIn.offButton(PaintIn.curValPointLoad, "pointLoad");
    PaintIn.offButton(PaintIn.curValName, "valueName");
    PaintIn.onOffButton(PaintIn.curValPressLoad, "pressLoad");
    if (PaintIn.curValPressLoad.value === "On") {
        PaintIn.renderCommand("valueOn");
        showAddZone("pressLoad");
    } else {
        PaintIn.renderCommand("Off");
        PaintIn.offButtonDraw(PaintIn.currentValueLine, "line");
        PaintIn.offButton(PaintIn.curValMoment, "moment");
        PaintIn.offButton(PaintIn.curValPointLoad, "pointLoad");
        PaintIn.offButton(PaintIn.curValPressLoad, "pressLoad");
        PaintIn.offButton(PaintIn.curValName, "valueName");
    }
}

function showAddZone(type) {
    domID("AddZone").value = ""
    switch (type) {
        case "valueName":
            showZoneName();
            break;
        case "pointLoad":
            showZoneForce();
            break;
        case "moment":
            showZoneMoment();
            break;
        case "pressLoad":
            showZonePressure();
            break;
    }
}

function showZoneName() {
    if (select !== null) {
        var heightwidth = convertPositionGLtoHeightWeight(select);
        var input = domID("inputAdd")
        input.style.display = "block";
        domID("styleInput").style.display = "none";
        if (heightwidth.height <= DrawingGL.gl.canvas.clientHeight && heightwidth.width <= DrawingGL.gl.canvas.clientWidth) {
            input.style.left = heightwidth.width.toString() + "px";
            input.style.bottom = heightwidth.height.toString() + "px";
        } else {
            input.style.left = (DrawingGL.gl.canvas.clientWidth / 2).toString() + "px";
            input.style.bottom = (DrawingGL.gl.canvas.clientHeight).toString() + "px";
        }
    } else if (selected.length !== 0 || PaintIn.arrMultiCurObj.length !== 0) {
        var input = domID("inputAdd")
        input.style.display = "block";
        domID("styleInput").style.display = "none";
        input.style.left = (DrawingGL.gl.canvas.clientWidth / 2).toString() + "px";
        input.style.bottom = (DrawingGL.gl.canvas.clientHeight).toString() + "px";
    }
}

function showZoneForce() {
    if (select !== null) {
        var heightwidth = convertPositionGLtoHeightWeight(select);
        var input = domID("inputAdd")
        input.style.display = "block";
        domID("styleInput").style.display = "flex";
        domID("styleInput").innerHTML = "Fx,Fy";
        if (heightwidth.height <= DrawingGL.gl.canvas.clientHeight && heightwidth.width <= DrawingGL.gl.canvas.clientWidth) {
            input.style.left = heightwidth.width.toString() + "px";
            input.style.bottom = (heightwidth.height + domID("styleInput").clientHeight).toString() + "px";
        } else {
            input.style.left = (DrawingGL.gl.canvas.clientWidth / 2).toString() + "px";
            input.style.bottom = (DrawingGL.gl.canvas.clientHeight).toString() + "px";
        }
    } else if (selected.length !== 0 || PaintIn.arrMultiCurObj.length !== 0) {
        var input = domID("inputAdd")
        input.style.display = "block";
        domID("styleInput").style.display = "flex";
        domID("styleInput").innerHTML = "Fx,Fy";
        input.style.left = (DrawingGL.gl.canvas.clientWidth / 2).toString() + "px";
        input.style.bottom = (DrawingGL.gl.canvas.clientHeight).toString() + "px";
    }
}

function showZoneMoment() {
    if (select !== null) {
        var heightwidth = convertPositionGLtoHeightWeight(select);
        var input = domID("inputAdd")
        input.style.display = "block";
        domID("styleInput").style.display = "flex";
        domID("styleInput").innerHTML = "M = ...";
        if (heightwidth.height <= DrawingGL.gl.canvas.clientHeight && heightwidth.width <= DrawingGL.gl.canvas.clientWidth) {
            input.style.left = heightwidth.width.toString() + "px";
            input.style.bottom = (heightwidth.height + domID("styleInput").clientHeight).toString() + "px";
        } else {
            input.style.left = (DrawingGL.gl.canvas.clientWidth / 2).toString() + "px";
            input.style.bottom = (DrawingGL.gl.canvas.clientHeight).toString() + "px";
        }
    } else if (selected.length !== 0 || PaintIn.arrMultiCurObj.length !== 0) {
        var input = domID("inputAdd")
        input.style.display = "block";
        domID("styleInput").style.display = "flex";
        domID("styleInput").innerHTML = "M = ...";
        input.style.left = (DrawingGL.gl.canvas.clientWidth / 2).toString() + "px";
        input.style.bottom = (DrawingGL.gl.canvas.clientHeight).toString() + "px";
    }
}

function showZonePressure() {
    if (select !== null && select.className == "Line") {
        var heightwidth = convertPositionGLtoHeightWeight(select);
        var input = domID("inputAdd")
        input.style.display = "block";
        domID("styleInput").style.display = "flex";
        domID("styleInput").innerHTML = "F = ...";
        if (heightwidth.height <= DrawingGL.gl.canvas.clientHeight && heightwidth.width <= DrawingGL.gl.canvas.clientWidth) {
            input.style.left = heightwidth.width.toString() + "px";
            input.style.bottom = (heightwidth.height + domID("styleInput").clientHeight).toString() + "px";
        } else {
            input.style.left = (DrawingGL.gl.canvas.clientWidth / 2).toString() + "px";
            input.style.bottom = (DrawingGL.gl.canvas.clientHeight).toString() + "px";
        }
    }
    if (selected.length !== 0 || PaintIn.arrMultiCurObj.length !== 0) {
        var input = domID("inputAdd")
        input.style.display = "block";
        domID("styleInput").style.display = "flex";
        domID("styleInput").innerHTML = "F = ...";
        input.style.left = (DrawingGL.gl.canvas.clientWidth / 2).toString() + "px";
        input.style.bottom = (DrawingGL.gl.canvas.clientHeight).toString() + "px";
    }
}

function convertPositionGLtoHeightWeight(obj) {
    var heightwidth
    switch (obj.className) {
        case "Point":
            var originalPoint = m3.transformPoint(DrawingGL.viewProjectionMat, obj.point)
            heightwidth = convertToHeightWidth(originalPoint);
            break;
        case "Line":
            var originalPoint = m3.transformPoint(DrawingGL.viewProjectionMat, obj.bisectingPoint)
            heightwidth = convertToHeightWidth(originalPoint);
            break;
        case "Area":
            var originalPoint = m3.transformPoint(DrawingGL.viewProjectionMat, obj.center)
            heightwidth = convertToHeightWidth(originalPoint);
            break;
    }
    return heightwidth
}

function addValue(event) {
    if (event.keyCode === 13) {
        var value = domID("AddZone").value
        var data = [];
        if (select !== null) {
            data.push(select)
        } else if (selected.length !== null) {
            data.push(selected);
        } else if (PaintIn.arrMultiCurObj.length !== 0) {
            data.push(PaintIn.arrMultiCurObj);
        }
        data = data.flat();
        data = data.flat();
        if (domID("valueName").value == "On") {
            adđDataName(value, data);
        } else if (domID("pointLoad").value == "On") {
            adđDataForce(value, data);
        } else if (domID("moment").value == "On") {
            adđDataMoment(value, data);
        } else if (domID("pressLoad").value == "On") {
            adđDataPress(value, data);
        }
        DrawingGL.storageSelectPoint = { x: 10000000, y: 100000000 }
        DrawingGL.sceneSelectedPoint = [];
        DrawingGL.sceneSelectedLine = [];
        DrawingGL.sceneSelectedArea = [];
        PaintIn.arrMultiCurObj = [];
        PaintIn.renderProperty("off");
        domID("BDCondition").style.display = "none";
        PaintIn.canvas.style.cursor = "url(frontend/img/select_cursor.svg) 0 0,  default";
        PaintIn.renderCommand("Off");
        DrawingGL.DrawMain();
        PaintIn.offButtonDraw(PaintIn.currentValueLine, "line");
        PaintIn.offButton(PaintIn.curValMoment, "moment");
        PaintIn.offButton(PaintIn.curValPointLoad, "pointLoad");
        PaintIn.offButton(PaintIn.curValPressLoad, "pressLoad");
        PaintIn.offButton(PaintIn.curValName, "valueName");
        domID("inputAdd").style.display = "none";
        isAdd = false;
        renderName();
    }
}

function adđDataName(value, data) {
    switch (data[0].className) {
        case "Point":
            var index = [];
            for (let i = 0; i < processingData.allPoint.length; i++) {
                var count = 0;
                let point1 = processingData.allPoint[i];
                for (let j = 0; j < data.length; j++) {
                    let point2 = data[j]
                    if (point1.point[0] == point2.point[0] &&
                        point1.point[1] == point2.point[1]
                    ) {
                        count += 1;
                    }
                }
                if (count >= 1) {
                    index.push(i)
                }
            }
            index = [... new Set(index)];
            for (let i = 0; i < index.length; i++) {
                processingData.allPoint[index[i]].name = value
            }
            // index = [];
            // var index_1 = [];
            // for (let i = 0; i < storage_point.length; i++) {
            //     for (let k = 0; k < storage_point[i].length; k++) {
            //         var count = 0;
            //         let point1 = storage_point[i][k];
            //         for (let j = 0; j < data.length; j++) {
            //             let point2 = data[j]
            //             if (point1.point[0] == point2.point[0] &&
            //                 point1.point[1] == point2.point[1]
            //             ) {
            //                 count += 1;
            //             }
            //         }
            //         if (count >= 1) {
            //             index_1.push(k)
            //             index.push(i)
            //         }
            //     }
            // }
            // index = [... new Set(index)];
            // index_1 = [... new Set(index_1)];
            // for (let i = 0; i < index.length; i++) {
            //     for (let j = 0; j < index_1.length; j++) {
            //         storage_point[index[i]][index_1[j]].name = value
            //     }
            // }
            break;
        case "Line":
            var index = [];
            for (let i = 0; i < processingData.allLine.length; i++) {
                var count = 0;
                let line1 = processingData.allLine[i];
                for (let j = 0; j < data.length; j++) {
                    let line2 = data[j]
                    if (line1.Point[0].point[0] == line2.Point[0].point[0] &&
                        line1.Point[0].point[1] == line2.Point[0].point[1] &&
                        line1.Point[1].point[0] == line2.Point[1].point[0] &&
                        line1.Point[1].point[1] == line2.Point[1].point[1]) {
                        count += 1;
                    }
                }
                if (count >= 1) {
                    index.push(i)
                }
            }
            index = [... new Set(index)];
            for (let i = 0; i < index.length; i++) {
                processingData.allLine[index[i]].name = value
            }
            break;
        case "Area":
            var index = [];
            for (let i = 0; i < processingData.allArea.length; i++) {
                var count = 0;
                let area1 = processingData.allArea[i];
                for (let j = 0; j < data.length; j++) {
                    let area2 = data[j]
                    if (area1.pointFlow.length == area2.pointFlow.length) {
                        var count_1 = 0;
                        for (let z = 0; z < area1.pointFlow.length; z++) {
                            if (area1.pointFlow[z][0] == area2.pointFlow[z][0] &&
                                area1.pointFlow[z][1] == area2.pointFlow[z][1])
                                count_1 += 1;
                        }
                        if (count_1 == area1.pointFlow.length) {
                            count += 1;
                        }
                    }
                }
                if (count >= 1) {
                    index.push(i)
                }
            }

            index = [... new Set(index)];
            for (let i = 0; i < index.length; i++) {
                processingData.allArea[index[i]].name = value
            }
            break;
    }
}
function adđDataForce(value, data) {
    var index = [];
    for (let i = 0; i < processingData.allPoint.length; i++) {
        var count = 0;
        let point1 = processingData.allPoint[i];
        for (let j = 0; j < data.length; j++) {
            let point2 = data[j]
            if (point1.point[0] == point2.point[0] &&
                point1.point[1] == point2.point[1]
            ) {
                count += 1;
            }
        }
        if (count >= 1) {
            index.push(i)
        }
    }
    index = [... new Set(index)];
    for (let i = 0; i < index.length; i++) {
        let obj = processingData.allPoint[index[i]]
        if (obj.pointLoads === null) {
            obj.pointLoads = [];
        }
        //
        let force_x;
        let force_y;
        if (value.includes(",") === true) {
            force_x = Number(value.slice(0, value.indexOf(",")));
            force_y = Number(
                value.slice(
                    value.indexOf(",") + 1,
                    value.length
                )
            );
        } else {
            force_x = Number(value);
            force_y = 0;
        }
        forceObj = {
            type: "force",
            parameters: { force_x: force_x, force_y: force_y },
        };
        obj.pointLoads.push(forceObj);
    }

}
function adđDataMoment(value, data) {
    var index = [];
    for (let i = 0; i < processingData.allPoint.length; i++) {
        var count = 0;
        let point1 = processingData.allPoint[i];
        for (let j = 0; j < data.length; j++) {
            let point2 = data[j]
            if (point1.point[0] == point2.point[0] &&
                point1.point[1] == point2.point[1]
            ) {
                count += 1;
            }
        }
        if (count >= 1) {
            index.push(i)
        }
    }
    index = [... new Set(index)];
    for (let i = 0; i < index.length; i++) {
        let obj = processingData.allPoint[index[i]];
        if (obj.pointLoads === null) {
            obj.pointLoads = [];
        }
        //
        let moment = Number(value);
        momentObj = { type: "moment", parameters: { value: moment } };
        obj.pointLoads.push(momentObj);
    }
}
function adđDataPress(value, data) {
    var index = [];
    for (let i = 0; i < processingData.allLine.length; i++) {
        var count = 0;
        let line1 = processingData.allLine[i];
        for (let j = 0; j < data.length; j++) {
            let line2 = data[j]
            if (line1.Point[0].point[0] == line2.Point[0].point[0] &&
                line1.Point[0].point[1] == line2.Point[0].point[1] &&
                line1.Point[1].point[0] == line2.Point[1].point[0] &&
                line1.Point[1].point[1] == line2.Point[1].point[1]) {
                count += 1;
            }
        }
        if (count >= 1) {
            index.push(i)
        }
    }
    index = [... new Set(index)];
    for (let i = 0; i < index.length; i++) {
        let obj = processingData.allLine[index[i]]
        //first check
        if (obj.lineLoads === null) {
            obj.lineLoads = [];
        }
        //
        let node_0;
        let node_1;
        if (value.includes(",") === true) {
            node_0 = Number(value.slice(0, value.indexOf(",")));
            node_1 = Number(
                value.slice(
                    value.indexOf(",") + 1,
                    value.length
                )
            );
        } else {
            node_0 = Number(value);
            node_1 = node_0;
        }
        let pressureObj = {
            type: "normal_pressure",
            parameters: { node_0: node_0, node_1: node_1 },
        };
        obj.lineLoads.push(pressureObj);
    }
}

function renderName() {
    var zone = domID("CanvasInput")
    zone.innerHTML = ``
    for (let point of processingData.allPoint) {
        if (point.name !== "" && point.name !== undefined) {
            var heightwidth = convertPositionGLtoHeightWeight(point);
            if (heightwidth.height <= domID("CanvasInput").clientHeight - 15 && heightwidth.width <= domID("CanvasInput").clientWidth - 15 &&
                heightwidth.height > -5 && heightwidth.width > -5) {
                zone.innerHTML += `
                <p style="position: absolute ;bottom : ${heightwidth.height}px;left : ${heightwidth.width}px;color : green">${point.name}</p>
            `
            }
        }
    }

    for (let line of processingData.allLine) {
        if (line.name !== "" && line.name !== undefined) {
            var heightwidth = convertPositionGLtoHeightWeight(line);
            var height = heightwidth.height;
            var width = heightwidth.width;
            // console.log(heightwidth);
            if (heightwidth.height <= domID("CanvasInput").clientHeight - 15 && heightwidth.width <= domID("CanvasInput").clientWidth - 15 &&
                heightwidth.height > -5 && heightwidth.width > -5) {
                let alpha1 = (PaintIn.getAngleLineAndOx(line) * 180) / Math.PI;

                if (alpha1 > 90 && alpha1 <= 180) {
                    let l = line.Point[0];
                    line.Point[0] = line.Point[1];
                    line.Point[1] = l;
                } else {
                    width = width - 15;
                    height = height + 5;

                }
                let dx = line.Point[1].x - line.Point[0].x;
                let dy = line.Point[1].y - line.Point[0].y;
                let alpha = 2 * Math.PI - Math.atan2(dy, dx); //radia
                zone.innerHTML += `
                <p style="position: absolute ;display: flex;justify-content: center;bottom : ${height}px;left : ${width}px;color : red">${line.name}</p>
            `
            }
        }
    }
    for (let area of processingData.allArea) {
        if (area.name !== "" && area.name !== undefined && area.name !== null) {
            var heightwidth = convertPositionGLtoHeightWeight(area);
            var height = heightwidth.height;
            var width = heightwidth.width;
            if (heightwidth.height <= domID("CanvasInput").clientHeight - 15 && heightwidth.width <= domID("CanvasInput").clientWidth - 15 &&
                heightwidth.height > -5 && heightwidth.width > -5) {
                zone.innerHTML += `
                <p style="position: absolute ;display: flex;justify-content: center;bottom : ${height}px;left : ${width}px;color : blue">${area.name}</p>
            `
            }
        }
    }
}

function renderForce() {

}

function renderMoment() {

}

function renderPressure() {

}

// function moveObj(obj,value) {
//     switch (obj.className) {
//         case "Point":
//             movePoint(obj,value)
//             break;
//         case "Line":
//             moveLine(obj,value)
//             break;
//     }
// }

// function movePoint(obj,value) {
//     for (let point of processingData.allPoint) {
//         if (point.x == obj.x && point.y == obj.y) {
//             point.x = value.x
//             point.y = value.y
//             point.point
//         }
//     }
// }

// function moveLine(obj) {

// }


function mouseDownMove(event) {
    if (event.buttons == 1 && PaintIn.pen == "select" && select !== null) {
        if (isChose == true) {
            domID("CanvasInput").addEventListener("mousemove", move)
        }
    } else {
        domID("CanvasInput").removeEventListener("mousemove", move)
    }
}

function move(event) {
    if (event.buttons === 1 && select !== null) {
        drag = true;
        for (let lines of storage) {
            for (let line1 of lines) {
                for (let line2 of processingData.allLine) {
                    if (
                        JSON.stringify(line1.Point[0].point) === JSON.stringify(line2.Point[0].point) &&
                        JSON.stringify(line1.Point[1].point) === JSON.stringify(line2.Point[1].point)
                    ) {
                        line1 = line2

                    }
                }
            }
        }
        processingData.prototype.moveObject(select);
        DrawingGL.scenePoint = [];
        DrawingGL.sceneLine = [];
        DrawingGL.sceneArea = [];
        DrawingGL.sceneBox = [];
        DrawingGL.sceneSelectedArea = [];
        DrawingGL.sceneSelectedLine = [];
        DrawingGL.storageSelectPoint = { x: 10000000, y: 100000000 };
        DrawingGL.selectArea = [];
        DrawingGL.selectLine = [];
        DrawingGL.sceneArea = [];
        DrawingGL.arrMouseDownPosition = [];
        DrawingGL.arrLineY = [];
        DrawingGL.arrLineX = [];
        DrawingGL.handleArea();
        DrawingGL.sceneLineMove = [];
        DrawingGL.arrPoint = [];
        DrawingGL.arrLine = [];
        DrawingGL.handleDataStorage();
        DrawingGL.scenePoint = [];
        DrawingGL.sceneLine = [];
        PaintIn.renderProperty(select.className, select);
        bufferInfoPoint = DrawingGL.CreateBufferInfo(DrawingGL.arrPointStorage, null);
        bufferInfoLine = DrawingGL.CreateBufferInfo(DrawingGL.arrLineStorage, null);
        DrawingGL.scenePoint.push({ color: [1, 0, 0, 1], bufferInfo: bufferInfoPoint });
        DrawingGL.sceneLine.push({ color: DrawingGL.colorDefault, bufferInfo: bufferInfoLine });
        DrawingGL.DrawMain();
        domID("CanvasInput").innerHTML = ``
        switch (select.className) {
            case "Point":
                var move = [];
                for (let line of processingData.allLine) {
                    if (
                        JSON.stringify(line.Point[0]) === JSON.stringify(select) ||
                        JSON.stringify(line.Point[1]) === JSON.stringify(select)
                    ) {
                        move.push(line)
                    }
                }
                update = checkBox(storage, move);
                var unique = [update[0]];
                for (let line of update) {
                    var count = 0;
                    for (let lineCheck of unique) {
                        if (JSON.stringify(lineCheck) === JSON.stringify(line)) {
                            count += 1;
                        }
                    }
                    if (count < 1) {
                        unique.push(line)
                    }
                }
                update = unique
                // console.log(update);
                if (update.length > 1) {
                    PaintIn.renderCommand("updateArea");
                } else {
                    PaintIn.renderCommand("Off")
                }
                break;
            case "Line":
                // console.log(select);
                update = checkBox(storage, [select])
                // console.log(all_line);
                var unique = [update[0]];
                for (let line of update) {
                    var count = 0;
                    for (let lineCheck of unique) {
                        if (JSON.stringify(lineCheck) === JSON.stringify(line)) {
                            count += 1;
                        }
                    }
                    if (count < 1) {
                        unique.push(line)
                    }
                }
                update = unique
                if (update.length > 1) {
                    PaintIn.renderCommand("updateArea");
                } else {
                    PaintIn.renderCommand("Off")
                }
            default:
                break;
        }
        // var all_line = checkBox(storage, select)
    }
}

// var index_storage = [];
// var index;
var detect = false;
var update = [];