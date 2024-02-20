var storage_line = [];
var storage_point = [];
var storage_area = [];
var new_line = [];
var new_point = [];
var new_area = [];
function storageData(
  Arr1,
  Arr2,
  listPointName,
  listLineName,
  colorList,
  widthList,
  arrForcePoint,
  arrForceLine) {
  var Line = [];
  if (Arr1.length !== 0) {
    if (listPointName === undefined) {
      listPointName = Array(Arr1.length).fill(undefined);
    }
    if (listLineName === undefined) {
      listLineName = Array(Arr1.length - 1).fill(undefined);
    }
    if (colorList === undefined) {
      colorList = Array(Arr1.length - 1).fill(undefined);
    }
    if (widthList === undefined) {
      widthList = Array(Arr1.length - 1).fill(undefined);
    }
    if (arrForcePoint === undefined) {
      arrForcePoint = Array(Arr1.length - 1).fill(undefined);
    }
    if (arrForceLine === undefined) {
      arrForceLine = Array(Arr1.length - 1).fill(undefined);
    }
    let AllPointObj = processingData.prototype.createPoint(
      Arr1,
      Arr2,
      listPointName,
      arrForcePoint
    );
    //save point
    // for (let point of AllPointObj) {
    //   processingData.prototype.addObject(point, processingData.allPoint);
    // }
    // create line
    let AllLineObj = processingData.prototype.createLine(
      AllPointObj,
      listLineName,
      colorList,
      widthList,
      arrForceLine
    );
    for (let line of AllLineObj) {
      processingData.prototype.addObject(line, Line);
    }
  }
  // processingData.allArea = [];
  // processingData.allLine = [];
  // processingData.allPoint = [];
  // processingData.allObject = [];
  return Line;
}

function checkBox(storage, lastdraw) {
  var lastDraw_coord = [];
  var storage_coord = [];
  for (let i = 0; i < storage.length; i++) {
    let index = []
    for (let line of storage[i]) {
      index.push([[line.Point[0].x, line.Point[0].y], [line.Point[1].x, line.Point[1].y]])
    }
    storage_coord.push(index)
  }
  for (let line of lastdraw) {
    lastDraw_coord.push([[line.Point[0].x, line.Point[0].y], [line.Point[1].x, line.Point[1].y]])
  }
  var linesame = [];
  var index = [];
  for (let i = 0; i < storage_coord.length; i++) {
    for (let line of storage_coord[i]) {
      // let index = [];
      for (let lastline of lastDraw_coord) {
        if (
          (line[0][0] == lastline[0][0] && line[0][1] == lastline[0][1]) ||
          (line[0][0] == lastline[1][0] && line[0][1] == lastline[1][1]) ||
          (line[1][0] == lastline[0][0] && line[1][1] == lastline[1][0]) ||
          (line[1][0] == lastline[1][0] && line[1][1] == lastline[1][1])
        ) {
          linesame.push([line, lastline])
          index.push(i)
        }
      }
    }
  }
  index = [... new Set(index)];
  var index_intersect = []
  var checkLine = [];
  for (let i = 0; i < index.length; i++) {
    checkLine.push(storage[index[i]])
  }
  checkLine = checkLine.flat();
  for (let i = 0; i < storage.length; i++) {
    for (let line1 of storage[i]) {
      for (let line2 of checkLine) {
        if (processingData.prototype.intersectionCheck(line1, line2).Exist) {
          index_intersect.push(i)
        }
      }
    }
  }
  index_intersect = [... new Set(index_intersect)];
  checkLine = [];
  if (index_intersect.length !== 0) {
    for (let i = 0; i < index_intersect.length; i++) {
      checkLine.push(storage[index_intersect[i]])
    }
    checkLine = checkLine.flat();
  } else {
    for (let i = 0; i < index.length; i++) {
      checkLine.push(storage[index[i]])
    }
    checkLine = checkLine.flat();
  }
  return checkLine
}

function detectArea(Line_List) {
  if (detect) {
    var uniqueLine = [];
    for (let lines of Line_List) {
      if (uniqueLine.length == 0) {
        uniqueLine.push(lines);
      } else {
        var count = 0
        for (let line1 of uniqueLine) {
          if (JSON.stringify(lines) == JSON.stringify(line1)) {
            count += 1;
          }
        }
        if (count < 1) {
          uniqueLine.push(lines)
        }
      }
    }
    let Line_List_copy = [...uniqueLine]
    Line_List = Line_List_copy
    processingData.allLine = [];
    processingData.allArea = [];
    let arrEndLineX = [];
    let arrEndLineY = [];
    let arrEndLineName = [];
    let arrEndLinePointName = [];
    let arrEndLineColor = [];
    let arrEndLineWidth = [];
    let arrEndLinePointForce = [];
    let arrEndLineForce = [];
    for (let i = 0; i <= Line_List_copy.length - 1; i++) {
      let arrIntersPoint = [];
      let arrSubLineX = [];
      let arrSubLineY = [];
      let EndLine1X = [];
      let EndLine1Y = [];
      let EndLine2X = [];
      let EndLine2Y = [];
      for (let ii = 0; ii <= Line_List_copy.length - 1; ii++) {
        if (ii === i) {
          continue;
        } else {
          var IntersPoint = processingData.prototype.intersectionCheck(
            Line_List_copy[i],
            Line_List_copy[ii]
          );
          if (
            IntersPoint.Exist &&
            JSON.stringify(arrIntersPoint).indexOf(IntersPoint.Coord) === -1
          ) {
            arrIntersPoint.push(IntersPoint.Coord);
          }
        }
      }

      //when dont have IntersPoint
      if (arrIntersPoint.length === 0) {
        processingData.allLine.push(Line_List_copy[i]);
        continue;
      }
      //sort by distance from endpoint
      let endPoint1 = Line_List_copy[i].Point[0].point;
      let endPoint2 = Line_List_copy[i].Point[1].point;
      arrIntersPoint.sort(function (value1, value2) {
        var distance1 = math.norm(math.subtract(value1, endPoint1));
        var distance2 = math.norm(math.subtract(value2, endPoint1));
        return distance1 - distance2;
      });
      //keep end line
      if (JSON.stringify(endPoint1) !== JSON.stringify(arrIntersPoint[0])) {
        EndLine1X.push(endPoint1[0], arrIntersPoint[0][0]);
        EndLine1Y.push(endPoint1[1], arrIntersPoint[0][1]);
        arrEndLineX.push(EndLine1X);
        arrEndLineY.push(EndLine1Y);
        arrEndLineName.push([Line_List_copy[i].name]);
        arrEndLinePointName.push([Line_List_copy[i].Point[0].name, undefined]);
        arrEndLineColor.push([Line_List_copy[i].color]);
        arrEndLineWidth.push([Line_List_copy[i].width]);
        arrEndLinePointForce.push([
          Line_List_copy[i].Point[0].pointLoads,
          undefined,
        ]);
        arrEndLineForce.push([Line_List_copy[i].lineLoads]);
      }
      if (JSON.stringify(endPoint2) !== JSON.stringify(arrIntersPoint.at(-1))) {
        EndLine2X.push(arrIntersPoint.at(-1)[0], endPoint2[0]);
        EndLine2Y.push(arrIntersPoint.at(-1)[1], endPoint2[1]);
        arrEndLineX.push(EndLine2X);
        arrEndLineY.push(EndLine2Y);
        arrEndLineName.push([Line_List_copy[i].name]);
        arrEndLinePointName.push([undefined, Line_List_copy[i].Point[1].name]);
        arrEndLineColor.push([Line_List_copy[i].color]);
        arrEndLineWidth.push([Line_List_copy[i].width]);
        arrEndLinePointForce.push([
          undefined,
          Line_List_copy[i].Point[0].pointLoads,
        ]);
        arrEndLineForce.push([Line_List_copy[i].lineLoads]);
      }
      //
      if (arrIntersPoint.length >= 2) {
        //create line bw inters point
        for (let index = 0; index <= arrIntersPoint.length - 1; index++) {
          //
          arrSubLineX.push(arrIntersPoint[index][0]);
          arrSubLineY.push(arrIntersPoint[index][1]);
          //
        }
        processingData.prototype.inputRawData(
          "line",
          arrSubLineX,
          arrSubLineY,
          undefined,
          Array(arrSubLineX.length).fill(Line_List_copy[i].name),
          Array(arrSubLineX.length).fill(Line_List_copy[i].color),
          Array(arrSubLineX.length).fill(Line_List_copy[i].width),
          undefined,
          Array(arrSubLineX.length).fill(Line_List_copy[i].lineLoads)
        );
      }
    }
    //-----------------//
    // save end line
    for (let i = 0; i <= arrEndLineX.length - 1; i++) {
      processingData.prototype.inputRawData(
        "line",
        arrEndLineX[i],
        arrEndLineY[i],
        arrEndLinePointName[i],
        arrEndLineName[i],
        arrEndLineColor[i],
        arrEndLineWidth[i],
        arrEndLinePointForce[i],
        arrEndLineForce[i]
      );
    }
    //
    // receive data
    console.log(processingData.allLine);
    console.log(processingData.allPoint);
    console.log(processingData.allArea);
    let listData = processingData.prototype.saveObj();
    let nodes = [];
    let surfaces = [];
    let surface_names = [];
    let surface_coords = [];
    // for (let point of processingData.allPoint) {
    //   nodes.push(point.point);
    // }
    // for (let area of oldArea) {
    //   let surface = [];
    //   for (let i = 0; i <= area.pointFlow.length - 1; i++) {
    //     let point = area.pointFlow[i];
    //     let index = nodes.findIndex(
    //       (value) => JSON.stringify(value) === JSON.stringify(point)
    //     );
    //     surface.push(index);
    //   }
    //   surfaces.push(surface);
    //   surface_names.push(area.name);
    //   surface_coords.push(area.coordNaming);
    // }


    let jsonData = JSON.parse(listData);
    jsonData.surfaces = surfaces;
    jsonData.surface_coords = surface_coords;
    jsonData.surface_names = surface_names;
    let dataRequest
    dataRequest = JSON.stringify(jsonData);
    console.log(dataRequest);
    // if (storage.length == 0){
    // } else {

    // }
    // tt = jsonData;
    // var new1  = JSON.parse(dataRequest);
    // var points = new1.node_coords;
    // var lines = [];
    // for (let i =0;i<new1.segments.length;i++){
    //   lines.push([points[new1.segments[i][0]],points[new1.segments[i][1]]])
    // }
    // var closedContours = detectClosedContours(lines)
    // console.log(new1);
    // console.log(closedContours);
    let promise = axios({
      method: "POST",
      // url: "https://vysecondapp.herokuapp.com/v1/detectArea/",
      // url: "http://127.0.0.1:8000/v1/detectArea/",

      url: "http://13.212.51.164:8000/v1/detectArea/",
      // url: "http://4.194.96.65:8000/v1/detectArea/",
      data: dataRequest,
    });

    promise.then((result) => {
      console.log(result.data);
      if (detect) {
        createData(result.data)
      }
      // processingData.prototype.createData(result.data);
      // PaintIn.renderObject(processingData.allObject);
      // DrawingGL.sceneArea = [];
      // // for (let i = 0; i < processingData.allArea.length; i++) {
      // //   DrawingGL.arrArea = [];
      // //   DrawingGL.arrArea.push(processingData.allArea[i].pointFlow);
      // //   DrawingGL.arrArea = DrawingGL.arrArea.flat();
      // //   var triangles = earClipping(DrawingGL.arrArea);
      // //   triangles = triangles.flat();
      // //   triangles = triangles.flat();
      // //   let bufferInfoArea = DrawingGL.CreateBufferInfo(triangles, null);
      // //   DrawingGL.sceneArea.push({ color: DrawingGL.colorDefaultArea, bufferInfo: bufferInfoArea });
      // // }
      // DrawingGL.arrMouseDownPosition = [];
      // DrawingGL.arrLineY = [];
      // DrawingGL.arrLineX = [];
      // DrawingGL.handleArea();
      // DrawingGL.DrawMain();
    });

    promise.catch(function (err) {
      console.log("err", err);
    });
  }
}

function saveData() {

  let data = JSON.stringify(processingData.allObject);
  let num_nodes;
  let num_segments;
  let nodes = [];
  let node_names = [];
  let segments = [];
  let segment_names = [];
  let surfaces = [];
  let surface_names = [];
  let surface_coords = [];
  let nodal_loads = [];
  let segment_loads = [];
  num_nodes = processingData.allPoint.length;
  num_segments = processingData.allLine.length;
  // //change coordinate Oxy origin
  // let rotMatrix = [
  //   [math.cos(math.PI / 2), -math.sin(math.PI / 2)],
  //   [math.sin(math.PI / 2), math.cos(math.PI / 2)]
  // ]
  // let allPoint = [...processingData.allPoint];
  // for (let i = 0; i <= allPoint.length - 1; i++) {
  //   let nodeCoord = [allPoint[i].x,allPoint[i].y];
  //   //rot
  //   nodeCoord = math.multiply(nodeCoord, rotMatrix);
  //   nodeCoord = nodeCoord.flat()
  //   allPoint[i].x = nodeCoord[0];
  //   allPoint[i].x = nodeCoord[1];
  // }

  // let allLine = [...processingData.allLine];
  // for (let i = 0; i <= allLine.length - 1; i++) {
  //   let startcoordX = allLine[i].Point[0].x
  //   let startcoordY = allLine[i].Point[0].y
  //   let endcoordX = allLine[i].Point[1].x
  //   let endcoordY = allLine[i].Point[1].y
  //   let startNode = [startcoordX,startcoordY];
  //   let endNode = [endcoordX,endcoordY];
  //   //rot
  //   startNode = math.multiply(startNode, rotMatrix);
  //   startNode = startNode.flat()
  //   endNode = math.multiply(endNode, rotMatrix);
  //   endNode = endNode.flat()

  //   allLine[i].Point[0].x = startNode[0];
  //   allLine[i].Point[0].y = startNode[1];
  //   allLine[i].Point[1].x = endNode[0];
  //   allLine[i].Point[1].x = endNode[1];
  // }
  for (let point of processingData.allPoint) {
    nodes.push(point.point);
    //      node_names.push(point.name);
    if (point.name != null) {
      node_names.push(point.name);
    } else {
      node_names.push("");
    }
    //      if(point.pointLoads != null) {
    //        nodal_loads.push(point.pointLoads);
    //      } else {
    //        nodal_loads.push([{
    //          type: "force",
    //          parameters: { force_x: 0, force_y: 0 },
    //        }]);
    //      }
    if (point.pointLoads != null) {
      nodal_loads.push(point.pointLoads);
    } else {
      nodal_loads.push([]);
    }

  }
  for (let line of processingData.allLine) {
    let index1 = nodes.findIndex(
      (value) => JSON.stringify(value) === JSON.stringify(line.Point[0].point)
    );
    let index2 = nodes.findIndex(
      (value) => JSON.stringify(value) === JSON.stringify(line.Point[1].point)
    );
    let segment = [index1, index2];
    segments.push(segment);
    //      segment_names.push(line.name);
    if (line.name != null) {
      segment_names.push(line.name);
    } else {
      segment_names.push("");
    }
    //      segment_loads.push(line.lineLoads);
    if (line.lineLoads != null) {
      segment_loads.push(line.lineLoads);
    } else {
      segment_loads.push([]);
    }

  }
  for (let area of processingData.allArea) {
    let surface = [];
    for (let i = 0; i <= area.pointFlow.length - 1; i++) {
      let point = area.pointFlow[i];

      let index = nodes.findIndex(
        (value) => JSON.stringify(value) === JSON.stringify(point)
      );
      surface.push(index);
    }
    surfaces.push(surface);
    //      surface_names.push(area.name);
    //      surface_coords.push(area.coordNaming);
    if (area.name != null) {
      surface_names.push(area.name);
    } else {
      surface_names.push("");
    }
    if (area.coordNaming != null) {
      surface_coords.push(area.coordNaming);
    } else {
      surface_coords.push([]);
    }
  }

  PaintIn.saveCommentText()

  let jsonObject = {
    num_nodes: num_nodes,
    num_segments: num_segments,
    node_coords: nodes,
    node_names: node_names,
    segments: segments,
    segment_names: segment_names,
    surfaces: surfaces,
    surface_names: surface_names,
    surface_coords: surface_coords,
    nodal_loads: nodal_loads,
    segment_loads: segment_loads,
    text_data: dataLogFile,
  };


  dataSaved = JSON.stringify(jsonObject);
  return dataSaved;
}

function createData(inputData) {
  //delete old data
  // PaintIn.clearAll();
  //create point
  let nodeX = math.subset(
    inputData["node_coords"],
    math.index(math.range(0, inputData["node_coords"].length), 0)
  );
  let nodeY = math.subset(
    inputData["node_coords"],
    math.index(math.range(0, inputData["node_coords"].length), 1)
  );
  nodeX = nodeX.flat();
  nodeY = nodeY.flat();
  let listloadPoints = inputData["nodal_loads"];
  let allPoint = processingData.prototype.createPoint(
    nodeX,
    nodeY,
    inputData["node_names"],
    listloadPoints
  );

  //create line
  let allLine = [];
  let AllSeg = [];
  // console.log("input data->>>>>>>>>>>>");
  // console.log(inputData["segments"]);
  for (let i = 0; i <= inputData["segments"].length - 1; i++) {
    let point1 = allPoint[inputData["segments"][i][0]];
    let point2 = allPoint[inputData["segments"][i][1]];
    let lineName = inputData["segment_names"][i];
    let lineWidth = PaintIn.currentWidth;
    let lineColor = PaintIn.currentColor;
    let lineLoads = inputData["segment_loads"][i]
    let line = new Line(
      point1,
      point2,
      lineName,
      lineColor,
      lineWidth,
      lineLoads
    );
    allLine.push(line);
    AllSeg.push(inputData["segments"][i]);
  }
  let allArea = [];
  for (let i = 0; i <= inputData["surfaces"].length - 1; i++) {
    let allLineOfArea = [];
    for (let ii = 0; ii <= inputData["surfaces"][i].length - 1; ii++) {
      let arrPoint = inputData["surfaces"][i];
      let indexPoint1 = arrPoint[ii];
      let indexPoint2;
      if (ii === inputData["surfaces"][i].length - 1) {
        indexPoint2 = arrPoint[0];
      } else {
        indexPoint2 = arrPoint[ii + 1];
      }
      let lineOfArea = [indexPoint1, indexPoint2];
      let lineOfArea_ = [indexPoint2, indexPoint1];
      let indexOfline = inputData["segments"].findIndex(
        (value) =>
          JSON.stringify(value) === JSON.stringify(lineOfArea) ||
          JSON.stringify(value) === JSON.stringify(lineOfArea_)
      );

      allLineOfArea.push(allLine[indexOfline]);
    }
    //create area
    let pointInArea = [];
    let rawArea = inputData["surfaces"][i];
    let coordName = inputData["surface_coords"][i]
    let sur_name = inputData["surface_names"][i]
    //      let coordName = inputData["surface_coords"][i] != null ? inputData["surface_coords"][i] : [];
    //      let sur_name = inputData["surface_names"][i] != null ? inputData["surface_names"][i] : "";
    for (let ii = 0; ii < rawArea.length; ii++) {
      pointInArea.push(allPoint[rawArea[ii]].point);
    }
    let area = new Area(
      allLineOfArea,
      sur_name,
      coordName
    );
    allArea.push(area);
  }
  // index_storage = []
  // for (let point of allPoint) {
  //   index = { ...point }
  //   index_storage.push(index);
  // }
  storage_point.push(allPoint);
  new_point = allPoint;
  storage_line.push(allLine);
  new_line = allLine;
  storage_area.push(allArea);
  new_area = allArea;
  // console.log(storage_point);
  // console.log(storage_line);
  // console.log(storage_area);
  handleDataStorage(storage_point, storage_line, storage_area, new_point, new_line, new_area)
}

function handleDataStorage(points, lines, areas, newpoints, newlines, newareas) {
  var index = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = 0; j < points[i].length; j++) {
      for (let newpoint of newpoints) {
        if (newpoint.point[0] == points[i][j].point[0] && newpoint.point[1] == points[i][j].point[1]) {
          index.push(i)
        }
      }
    }
  }
  index = [... new Set(index)];
  if (index.length > 1) {
    for (let i = 1; i < index.length; i++) {
      points.splice(index[i], 1)
    }
    points.splice(index[0], 1, newpoints);
  }
  index = [];
  for (let i = 0; i < lines.length; i++) {
    for (let j = 0; j < lines[i].length; j++) {
      for (let newline of newlines) {
        if (JSON.stringify(newline.Point) === JSON.stringify(lines[i][j]).Point) {
          index.push(i)
        } else if (
          (JSON.stringify(newline.Point[0]) === JSON.stringify(lines[i][j].Point[0])) ||
          (JSON.stringify(newline.Point[1]) === JSON.stringify(lines[i][j].Point[1])) ||
          (JSON.stringify(newline.Point[0]) === JSON.stringify(lines[i][j].Point[1])) ||
          (JSON.stringify(newline.Point[1]) === JSON.stringify(lines[i][j].Point[0]))
        ) {
          index.push(i)
        } else if (
          (JSON.stringify(newline.Point[0].point) === JSON.stringify(lines[i][j].Point[0].point)) ||
          (JSON.stringify(newline.Point[1].point) === JSON.stringify(lines[i][j].Point[1].point)) ||
          (JSON.stringify(newline.Point[0].point) === JSON.stringify(lines[i][j].Point[1].point)) ||
          (JSON.stringify(newline.Point[1].point) === JSON.stringify(lines[i][j].Point[0].point))
        ) {
          index.push(i)
        }
      }
    }
  }
  index = [... new Set(index)];
  if (index.length > 1) {
    for (let i = 1; i < index.length; i++) {
      lines.splice(index[i], 1)
    }
    lines.splice(index[0], 1, newlines);
  }
  index = [];
  for (let i = 0; i < areas.length; i++) {
    for (let j = 0; j < areas[i].length; j++) {
      for (let newarea of newareas) {
        if (JSON.stringify(newarea) === JSON.stringify(areas[i][j])) {
          index.push(i)
        } else {
          for (let point of newarea.pointFlow) {
            var count = 0;
            for (let pointcheck of areas[i][j].pointFlow) {
              if (JSON.stringify(point) == JSON.stringify(pointcheck)) {
                count += 1;
              }
            }
            if (count >= 1) {
              index.push(i)
            }
          }
        }
      }
    }
  }
  index = [... new Set(index)];
  if (index.length > 1) {
    for (let i = 1; i < index.length; i++) {
      areas.splice(index[i], 1)
    }
    areas.splice(index[0], 1, newareas);
  }
  processingData.allArea = areas.flat();
  processingData.allLine = lines.flat();
  processingData.allPoint = points.flat();
  processingData.prototype.updateStorage();
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
  bufferInfoPoint = DrawingGL.CreateBufferInfo(DrawingGL.arrPointStorage, null);
  bufferInfoLine = DrawingGL.CreateBufferInfo(DrawingGL.arrLineStorage, null);
  DrawingGL.scenePoint.push({ color: [1, 0, 0, 1], bufferInfo: bufferInfoPoint });
  DrawingGL.sceneLine.push({ color: DrawingGL.colorDefault, bufferInfo: bufferInfoLine });
  DrawingGL.DrawMain();
}

function handlePoint(line) {

}

function handleLine(lines) {

}