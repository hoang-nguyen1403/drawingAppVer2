//----------RECORD data------------//
class processingData {
    constructor() {
    };
    //Add
    addObject(newObject, saveArr) {
        //except point
        // if (saveArr.length !== 0) {
        //     for (let obj of saveArr) {
        //         console.log(obj)
        //         console.log(newObject)
        //         if (JSON.stringify(obj) !== JSON.stringify(newObject)) {
        //             saveArr.push(newObject);
        //             // return true
        //         } else {
        //             // return false
        //         }
        //     }
        // } else {
        //     saveArr.push(newObject);
        // }
        let sameObj = saveArr.find((value) => (JSON.stringify(value) === JSON.stringify(newObject))) // chuyen ve string de so sanh element trong array
        if (sameObj === undefined) {
            saveArr.push(newObject); //neu khong co phan tu tuong tu thi add phan tu do
        }
        return sameObj // neu co phan tu tuong tu thi chi lay 1 phan tu

    };

    //----Create Object
    //Point
    createPoint(arrPointX, arrPointY, nameList, pointLoadsList) { //tao point tu list toa do X va Y
        let AllPointObj = [];
        for (let index = 0; index <= arrPointX.length - 1; index++) {
            let point = [arrPointX[index], arrPointY[index]];
            let pointName = nameList[index];
            let pointLoads = pointLoadsList[index];
            let PointObj = new Point(point, pointName, pointLoads);
            AllPointObj.push(PointObj);
        };
        return AllPointObj;
    };
    //Line
    createLine(PointList, nameList, colorList, widthList, lineLoadsList) {
        let AllLineObj = [];
        for (let index = 0; index <= PointList.length - 2; index++) {
            let Point1 = PointList[index];
            let Point2 = PointList[index + 1];
            let lineName = nameList[index];
            let lineColor = colorList[index];
            let lineWidth = widthList[index];
            let lineLoads = lineLoadsList[index];
            let LineObj = new Line(Point1, Point2, lineName, lineColor, lineWidth, lineLoads);
            AllLineObj.push(LineObj);
        };
        //Save in allline
        // processingData.prototype.addObject(ObjLine,processingData.allLine);
        return AllLineObj;
    }

    inputRawData(Type, Arr1, Arr2, listPointName, listLineName, colorList, widthList, arrForcePoint, arrForceLine) {
        //Arr1: arrPointX, Arr2: arrPointY
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
        switch (Type) {
            case "line":
                {
                    // create Point
                    let AllPointObj = this.createPoint(Arr1, Arr2, listPointName, arrForcePoint);
                    // create line
                    let AllLineObj = this.createLine(AllPointObj, listLineName, colorList, widthList, arrForceLine);
                    //save line
                    for (let line of AllLineObj) {
                        processingData.prototype.addObject(line, processingData.allLine);
                    };
                };
                this.updateStorage();
                break;
            case "rect":
                {
                    let Arr1_ = [Arr1[0], Arr1[1], Arr1[1], Arr1[0], Arr1[0]];
                    let Arr2_ = [Arr2[0], Arr2[0], Arr2[1], Arr2[1], Arr2[0]];
                    // create Point
                    let AllPointObj = this.createPoint(Arr1_, Arr2_, listPointName, arrForcePoint);
                    // create line
                    let AllLineObj = this.createLine(AllPointObj, listLineName, colorList, widthList, arrForceLine);
                    // //save area
                    for (let line of AllLineObj) {
                        processingData.prototype.addObject(line, processingData.allLine);
                    };
                    // processingData.prototype.addObject(area, processingData.allArea);
                    this.updateStorage();
                    break;
                }
        };
    }

    intersectionCheck(Line1, Line2) {
        var x1 = Line1.Point[0].x;
        var y1 = Line1.Point[0].y;
        var x2 = Line1.Point[1].x;
        var y2 = Line1.Point[1].y;

        var x3 = Line2.Point[0].x;
        var y3 = Line2.Point[0].y;
        var x4 = Line2.Point[1].x;
        var y4 = Line2.Point[1].y;

        var A = [[x2 - x1, -(x4 - x3)], [y2 - y1, -(y4 - y3)]];
        var B = [(x3 - x1), (y3 - y1)];
        try {
            var T = math.lusolve(A, B);
        } catch (err) {
            //singular matrix
            return {
                Coord: [Point1x, Point1y],
                Exist: false
            }
        };
        if ((math.round(T[0][0], 10) <= 1 && math.round(T[0][0], 10) >= 0) &&
            (math.round(T[1][0], 10) >= 0 && math.round(T[1][0], 10) <= 1)) {
            var Point1x = x1 + (x2 - x1) * T[0][0];
            var Point1y = y1 + (y2 - y1) * T[0][0];
            return {
                Coord: [math.round(Point1x, 8), math.round(Point1y, 8)],
                Exist: true
            }
        } else {
            return {
                Coord: [Point1x, Point1y],
                Exist: false
            };
        }
    }

    areaDetect(Line_List) {
        // PaintIn.onOffButton(PaintIn.currentValueDetectArea, "areaDetect");
        this.isCancled = false;
        let allLine = [...Line_List]; //contain old line
        let totalLine = [...Line_List]; //all Line
        processingData.allLine = [];
        processingData.allArea = [];

        let AreaResult = [];
        let PointFlowResult = [];
        let arrEndLineX = [];
        let arrEndLineY = [];
        let arrEndLineName = [];
        let arrEndLinePointName = [];
        let arrEndLineColor = [];
        let arrEndLineWidth = [];
        let arrEndLinePointForce = [];
        let arrEndLineForce = [];
        let arrNewLine = [];
        let lineSeparate = []; //line have intersection
        let rawLine = []; //line not have intersection

        for (let line of processingData.newObjects) {
            if (line.className === "Line") {
                arrNewLine.push(line);
                totalLine.push(line);
            }
        }
        for (let i = 0; i <= arrNewLine.length - 1; i++) {
            let arrIntersPoint = [];
            for (let ii = 0; ii <= allLine.length - 1; ii++) {
                if (ii === i) {
                    continue;
                } else {
                    let IntersPoint = this.intersectionCheck(arrNewLine[i], allLine[ii]);
                    if (IntersPoint.Exist && JSON.stringify(arrIntersPoint).indexOf(IntersPoint.Coord) === -1) {
                        arrIntersPoint.push(IntersPoint.Coord);
                        lineSeparate.push(arrNewLine[i], allLine[ii]);
                        // console.log("IntersPoint");
                    }
                    else {
                        processingData.prototype.addObject(allLine[ii], rawLine);
                    }
                }
            }
            for (let ii = 0; ii <= arrNewLine.length - 1; ii++) {
                if (ii === i) {
                    continue;
                } else {
                    let IntersPoint = this.intersectionCheck(arrNewLine[i], arrNewLine[ii]);
                    if (IntersPoint.Exist && JSON.stringify(arrIntersPoint).indexOf(IntersPoint.Coord) === -1) {
                        arrIntersPoint.push(IntersPoint.Coord);
                        lineSeparate.push(arrNewLine[i], arrNewLine[ii]);
                        // console.log("IntersPoint");
                    }
                    else {
                        processingData.prototype.addObject(arrNewLine[ii], rawLine);
                    }
                }
            }
        }

        let arrSubLineX = [];
        let arrSubLineY = [];
        let EndLine1X = [];
        let EndLine1Y = [];
        let EndLine2X = [];
        let EndLine2Y = [];

        //when dont have IntersPoint
        if (arrIntersPoint.length === 0) {
            for (let i = 0; i < arrNewLine.length; i++) {
                processingData.allLine.push(arrNewLine[i]);
            }

            for (let i = 0; i < allLine.length; i++) {
                processingData.allLine.push(allLine[i]);
            }
        }
        else {
            for (let i = 0; i < lineSeparate.length; i++) {
                //sort by distance from endpoint
                let endPoint1 = lineSeparate[i].Point[0].point;
                let endPoint2 = lineSeparate[i].Point[1].point;
                arrIntersPoint.sort(function (value1, value2) {
                    var distance1 = math.norm(math.subtract(value1, endPoint1));
                    var distance2 = math.norm(math.subtract(value2, endPoint1));
                    return distance1 - distance2
                })
                //keep end line
                if (JSON.stringify(endPoint1) !== JSON.stringify(arrIntersPoint[0])) {
                    EndLine1X.push(endPoint1[0], arrIntersPoint[0][0]);
                    EndLine1Y.push(endPoint1[1], arrIntersPoint[0][1]);
                    arrEndLineX.push(EndLine1X);
                    arrEndLineY.push(EndLine1Y);
                    arrEndLineName.push([lineSeparate[i].name]);
                    arrEndLinePointName.push([lineSeparate[i].Point[0].name, undefined]);
                    arrEndLineColor.push([lineSeparate[i].color]);
                    arrEndLineWidth.push([lineSeparate[i].width]);
                    arrEndLinePointForce.push([lineSeparate[i].Point[0].pointLoads, undefined]);
                    arrEndLineForce.push([lineSeparate[i].lineLoads])

                }
                if (JSON.stringify(endPoint2) !== JSON.stringify(arrIntersPoint.at(- 1))) {
                    EndLine2X.push(arrIntersPoint.at(-1)[0], endPoint2[0]);
                    EndLine2Y.push(arrIntersPoint.at(-1)[1], endPoint2[1]);
                    arrEndLineX.push(EndLine2X);
                    arrEndLineY.push(EndLine2Y);
                    arrEndLineName.push([lineSeparate[i].name]);
                    arrEndLinePointName.push([undefined, lineSeparate[i].Point[1].name]);
                    arrEndLineColor.push([lineSeparate[i].color]);
                    arrEndLineWidth.push([lineSeparate[i].width]);
                    arrEndLinePointForce.push([undefined, lineSeparate[i].Point[0].pointLoads]);
                    arrEndLineForce.push([lineSeparate[i].lineLoads])
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
                    //new line from internpoint
                    processingData.prototype.inputRawData("line", arrSubLineX, arrSubLineY, undefined,
                        Array(arrSubLineX.length).fill(totalLine[i].name), Array(arrSubLineX.length).fill(totalLine[i].color),
                        Array(arrSubLineX.length).fill(totalLine[i].width), undefined, Array(arrSubLineX.length).fill([i].lineLoads));

                    //old line not have interpoint
                    // processingData.prototype.inputRawData("line", arrSubLineX, arrSubLineY, undefined,
                    //     Array(arrSubLineX.length).fill(totalLine[i].name), Array(arrSubLineX.length).fill(totalLine[i].color),
                    //     Array(arrSubLineX.length).fill(totalLine[i].width), undefined, Array(arrSubLineX.length).fill([i].lineLoads));
                }
            }
        }


        //-----------------//
        let segmentLine = [...processingData.allLine];
        // save end line
        for (let i = 0; i <= arrEndLineX.length - 1; i++) {
            processingData.prototype.inputRawData("line", arrEndLineX[i], arrEndLineY[i], arrEndLinePointName[i],
                arrEndLineName[i], arrEndLineColor[i], arrEndLineWidth[i], arrEndLinePointForce[i], arrEndLineForce[i]);
        }
        let exceptIndex = [];
        for (let index1 = 0; index1 <= segmentLine.length - 1; index1++) {
            if (exceptIndex.indexOf(index1) !== -1) {
                continue;
            }
            let arrLineFlow = [];
            let arrPointFlow = [];
            arrLineFlow.push(segmentLine[index1]);
            arrPointFlow.push(segmentLine[index1].Point[0].point);
            arrPointFlow.push(segmentLine[index1].Point[1].point);
            let orientation = "";
            while (true) {
                let arrNextLine = [];
                let arrNextPoint = [];
                let point1OfLine1 = arrLineFlow.at(-1).Point[0].point;
                let point2OfLine1 = arrLineFlow.at(-1).Point[1].point;
                for (let index2 = 0; index2 <= segmentLine.length - 1; index2++) {
                    if (index2 === index1) continue;
                    let point1OfNext = segmentLine[index2].Point[0].point;
                    let point2OfNext = segmentLine[index2].Point[1].point;

                    if (JSON.stringify(point2OfLine1) === JSON.stringify(point1OfNext) &&
                        JSON.stringify(point1OfLine1) !== JSON.stringify(point2OfNext)) {
                        arrNextPoint.push(point2OfNext);
                        arrNextLine.push(segmentLine[index2]);
                    } else if (JSON.stringify(point2OfLine1) === JSON.stringify(point2OfNext) &&
                        JSON.stringify(point1OfLine1) !== JSON.stringify(point1OfNext)) {
                        //swap
                        let swap = segmentLine[index2].Point[0];
                        segmentLine[index2].Point[0] = segmentLine[index2].Point[1];
                        segmentLine[index2].Point[1] = swap;

                        arrNextLine.push(segmentLine[index2]);
                        arrNextPoint.push(segmentLine[index2].Point[1].point);
                    }
                }
                if (arrNextLine.length === 0) break;
                arrNextLine.sort(function (a, b) {
                    let pointa = a.Point[1].point
                    let pointb = b.Point[1].point

                    let OA = math.subtract(point1OfLine1, point2OfLine1);
                    let OB = math.subtract(pointa, point2OfLine1);
                    let OC = math.subtract(pointb, point2OfLine1);

                    let degree1 = math.atan2(OA[1], OA[0]) - math.atan2(OB[1], OB[0]);
                    let degree2 = math.atan2(OA[1], OA[0]) - math.atan2(OC[1], OC[0]);

                    if (degree1 < 0) degree1 += 2 * math.PI;
                    if (degree2 < 0) degree2 += 2 * math.PI;
                    return degree2 - degree1
                });

                let AO = math.subtract(point2OfLine1, point1OfLine1);
                let OB = math.subtract(arrNextLine[0].Point[1].point, point2OfLine1);
                if (arrLineFlow.length === 1) {
                    //set orientation
                    if (math.round(math.cross([AO[0], AO[1], 0], [OB[0], OB[1], 0])[2], 3) >= 0) {
                        orientation = "CW";
                    } else orientation = "CCW"
                }
                if (orientation === "CW") {
                    arrLineFlow.push(arrNextLine.at(-1));
                    arrPointFlow.push(arrNextLine.at(-1).Point[1].point);
                } else if (orientation === "CCW") {
                    arrLineFlow.push(arrNextLine[0]);
                    arrPointFlow.push(arrNextLine[0].Point[1].point);
                }
                if (JSON.stringify(arrPointFlow.at(-1)) ===
                    JSON.stringify(arrLineFlow[0].Point[0].point)) {
                    //get resutl
                    // console.log("getResult")
                    AreaResult.push(arrLineFlow);
                    PointFlowResult.push(arrPointFlow);
                    //delete 
                    for (let line of arrLineFlow) {
                        exceptIndex.push(segmentLine.indexOf(line));
                    }
                    break;
                }
            }
        }

        //create area object       
        for (let i = 0; i <= AreaResult.length - 1; i++) {
            let areaObj = new Area(AreaResult[i], undefined);
            processingData.prototype.addObject(areaObj, processingData.allArea);
        }
        this.updateStorage();
        PaintIn.renderObject(processingData.allObject);
        return AreaResult
    }

    setObjName(obj) {
    }

    InterPolationFunction(arrX, arrY) {
        let allFunc = [];
        let sizeMatrix = arrX.length;
        let A = math.zeros(sizeMatrix, sizeMatrix);
        let B = math.zeros(sizeMatrix, 1);
        //calc h
        let h = [];
        for (let i = 0; i <= arrX.length - 2; i++) {
            h.push(arrX[i + 1] - arrX[i]);
        }
        ////create A matrix
        A.subset(math.index(0, 0), 1);
        A.subset(math.index(sizeMatrix - 1, sizeMatrix - 1), 1);
        //start at row 1
        for (let row = 1; row <= sizeMatrix - 2; row++) {
            A.subset(math.index(row, row - 1), h[row - 1]);
            A.subset(math.index(row, row), 2 * (h[row - 1] + h[row]));
            A.subset(math.index(row, row + 1), h[row]);
        }
        ////create B matrix
        B.subset(math.index(0, 0), 0);
        B.subset(math.index(sizeMatrix - 1, 0), 0);
        for (let row = 1; row <= sizeMatrix - 2; row++) {
            B.subset(math.index(row, 0), 3 * ((arrY[row + 1] - arrY[row]) / h[row] - (arrY[row] - arrY[row - 1]) / h[row - 1]));
        };
        //solve C
        let c = math.lusolve(A, B); //is matrix
        //get all function 
        for (let i = 0; i <= arrX.length - 2; i++) {
            let a = arrY[i];
            let b = (arrY[i + 1] - arrY[i]) / h[i] - h[i] * (c.subset(math.index(i + 1, 0)) + 2 * c.subset(math.index(i, 0))) / 3;
            let d = (c.subset(math.index(i + 1, 0)) - c.subset(math.index(i, 0))) / (3 * h[i]);
            allFunc.push([a, b, c.subset(math.index(i, 0)), d])
        }
        //get all point in each range
        let arrXOutPut = [];
        let arrYOutPut = [];
        for (let i = 0; i <= allFunc.length - 1; i++) {
            //create range
            let xRange = math.range(arrX[i], arrX[i + 1], (arrX[i + 1] - arrX[i]) / 10);
            let yRange = [];
            for (let x of xRange._data) {
                let y = allFunc[i][0] + allFunc[i][1] * (x - arrX[i]) + allFunc[i][2] * ((x - arrX[i]) ** 2) +
                    allFunc[i][3] * ((x - arrX[i]) ** 3);
                yRange.push(y);
            }
            arrYOutPut.push(...yRange);
            arrXOutPut.push(...xRange._data);
        }
        //
        return [arrXOutPut, arrYOutPut]
    }
    saveObj(dataSaved) {
        let data = JSON.stringify(processingData.allObject);
        let num_nodes;
        let num_segments;
        let nodes = [];
        let node_names = [];
        let segments = [];
        let segment_names = [];
        let surfaces = [];
        let surface_names = [];
        let nodal_loads = [];
        let segment_loads = [];
        num_nodes = processingData.allPoint.length;
        num_segments = processingData.allLine.length;
        for (let point of processingData.allPoint) {
            nodes.push(point.point);
            node_names.push(point.name);
            nodal_loads.push(point.pointLoads);
        }
        for (let line of processingData.allLine) {
            let index1 = nodes.findIndex((value) => JSON.stringify(value) === JSON.stringify(line.Point[0].point));
            let index2 = nodes.findIndex((value) => JSON.stringify(value) === JSON.stringify(line.Point[1].point));
            let segment = [index1, index2];
            segments.push(segment)
            segment_names.push(line.name)
            segment_loads.push(line.lineLoads);
        }
        for (let area of processingData.allArea) {
            let surface = [];
            for (let i = 0; i <= area.pointFlow.length - 1; i++) {
                let point = area.pointFlow[i];

                let index = nodes.findIndex((value) => JSON.stringify(value) === JSON.stringify(point));
                surface.push(index);
            }
            surfaces.push(surface);
            surface_names.push(area.name)
        }
        let jsonObject = {
            "num_nodes": num_nodes,
            "num_segments": num_segments,
            "node_coords": nodes,
            "node_names": node_names,
            "segments": segments,
            "segment_names": segment_names,
            "surfaces": surfaces,
            "surface_names": surface_names,
            "nodal_loads": nodal_loads,
            "segment_loads": segment_loads,
            "text_data": dataLogFile,
        }
        dataSaved = JSON.stringify(jsonObject)
        return dataSaved;
        //save to file
        // var fs = require('fs');
        // fs.writeFile('user.json', jsonData, (err) => {
        //     if (err) {
        //         throw err;
        //     }
        //     console.log("JSON data is saved.");
        // });
        // var blob = new Blob([jsonData], { type: "text/plain;charset=utf-8" });
        // saveAs(blob, "data.json");
    }

    saveAsData() {
        let dataSaved;
        let jsonData = processingData.prototype.saveObj(dataSaved);
        let blob = new Blob([jsonData], { type: "text/plain;charset=utf-8" });
        saveAs(blob, "data.json");
    }

    updateStorage() {
        processingData.allPoint = [];
        processingData.allObject = [];
        for (let area of processingData.allArea) {
            processingData.allObject.push(area);
            for (let line of area.Line) {
                let sameObj = this.addObject(line, processingData.allLine);
                //link to 1 point
                if (sameObj !== undefined) {
                    area.Line[area.Line.indexOf(line)] = sameObj;
                }
            }
        }
        for (let line of processingData.allLine) {
            processingData.allObject.push(line);
            let point1 = line.Point[0];
            let point2 = line.Point[1];
            let sameObj1 = this.addObject(point1, processingData.allPoint);
            let sameObj2 = this.addObject(point2, processingData.allPoint);
            //link to 1 point
            if (sameObj1 !== undefined) {
                line.Point[0] = sameObj1;
            }
            if (sameObj2 !== undefined) {
                line.Point[1] = sameObj2;
            }
        }
        for (let point of processingData.allPoint) {
            processingData.allObject.push(point);
        }

        //sort [Area, Line, Point]
        processingData.allObject.sort((a, b) => {
            let a_ = 0;
            let b_ = 0;
            switch (a.className) {
                case "Point":
                    a_ = 3;
                    break;
                case "Line":
                    a_ = 2;
                    break;
                case "Area":
                    a_ = 1;
                    break;
            }
            switch (b.className) {
                case "Point":
                    b_ = 3;
                    break;
                case "Line":
                    b_ = 2;
                    break;
                case "Area":
                    b_ = 1;
                    break;
            }
            return b_ - a_
        })
    }

    separateData() {
        this.updateStorage();
        //seperate data
        if (processingData.newObjects.length === 0) {
            processingData.newObjects = [...processingData.allObject];
        }
        else {
            for (let obj1 of processingData.allObject) {
                for (let obj2 of processingData.newObjects) {
                    if (JSON.stringify(obj1) === JSON.stringify(obj2)) {
                        processingData.oldObjects.push(obj1);
                    }
                }
            }
            processingData.newObjects = [...processingData.allObject];
            for (let i = 0; i < processingData.oldObjects.length; i++) {
                for (let ii = 0; ii < processingData.newObjects.length; ii++) {
                    if (JSON.stringify(processingData.oldObjects[i]) === JSON.stringify(processingData.newObjects[ii])) {
                        processingData.newObjects.splice(ii, 1);
                    }
                }
            }
        }
    }

    createData(inputData) {
        //delete old data
        PaintIn.clearAll();
        //create point
        let nodeX = math.subset(inputData["node_coords"], math.index(math.range(0, inputData["node_coords"].length), 0));
        let nodeY = math.subset(inputData["node_coords"], math.index(math.range(0, inputData["node_coords"].length), 1));
        nodeX = nodeX.flat();
        nodeY = nodeY.flat();
        let listloadPoints = inputData["nodal_loads"];
        let allPoint = this.createPoint(nodeX, nodeY, inputData["node_names"], listloadPoints);

        //create line
        let allLine = [];
        for (let i = 0; i <= inputData["segments"].length - 1; i++) {
            let point1 = allPoint[inputData["segments"][i][0]];
            let point2 = allPoint[inputData["segments"][i][1]];
            let lineName = inputData["segment_names"][i];
            let lineWidth = PaintIn.currentWidth;
            let lineColor = PaintIn.currentColor;
            let lineLoads = inputData["segment_loads"][i];
            let line = new Line(point1, point2, lineName, lineColor, lineWidth, lineLoads);
            allLine.push(line)
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
                let indexOfline = inputData["segments"].findIndex(value =>
                (
                    JSON.stringify(value) === JSON.stringify(lineOfArea) ||
                    JSON.stringify(value) === JSON.stringify(lineOfArea_)
                ));

                allLineOfArea.push(allLine[indexOfline])
            }
            //create area
            let area = new Area(allLineOfArea, inputData["surface_names"][i]);
            allArea.push(area);
        }
        //add data
        processingData.allLine = allLine;
        processingData.allArea = allArea;
        //update storage
        this.updateStorage()
        //update screen
        PaintIn.renderObject(processingData.allObject);
    }
    createMeshData(inputData) {
        let jsmat = inputData["jsmat"];
        let FEtri = inputData["FEtri"];
        let FEcoord = inputData["FEcoord"];
        let FEsoln = inputData["FEsoln"];
        let QC = inputData["QC"];
        let baseCoord = jsmat["node_coords"][3];
        baseCoord = [200, 300];
        let scale = 400;
        let rotMatrix = [
            [math.cos(math.PI / 2), -math.sin(math.PI / 2)],
            [math.sin(math.PI / 2), math.cos(math.PI / 2)]
        ]
        let maxValue = math.max(FEsoln);
        let minValue = math.min(FEsoln);
        let delta = math.abs(minValue);
        delta = math.ceil(delta, 1);
        let nshades = math.ceil((maxValue + delta) * 100);
        let colors = colormap({
            colormap: 'jet',
            nshades: nshades,
            format: 'rgba',
            alpha: 1
        })
        //fill element
        for (let surface of FEtri) {
            let coordXs = [];
            let coordYs = [];
            let nodeColors = [];
            for (let i = 0; i < surface.length - 3; i++) {
                let nodeIndex = surface[i];
                let nodeCoord = [...FEcoord[nodeIndex - 1]];
                //scale
                nodeCoord[0] *= scale;
                nodeCoord[1] *= scale;
                //move system
                nodeCoord[0] -= (100);
                nodeCoord[1] -= (100);
                //rot
                nodeCoord = math.multiply(nodeCoord, rotMatrix);
                nodeCoord = nodeCoord.flat()
                //move system
                nodeCoord[0] += baseCoord[0] + 100;
                nodeCoord[1] += baseCoord[1] + 100;
                coordXs.push(nodeCoord[0]);
                coordYs.push(nodeCoord[1]);
                //color
                let colorIndex = math.round((FEsoln[nodeIndex - 1] + delta) * nshades);
                let color = colors[colorIndex]
                nodeColors.push(color)
            }
            this.polygonFill(coordXs, coordYs, nodeColors);
        }
        //create color bar 
        //size
        let xMin = 200;
        let xMax = 600;
        let yMin = 100;
        let yMax = 500;
        let xCBSpace = 70;

        let n = 10;
        let base = [xMax + xCBSpace, yMin];
        let width = 50;
        let height = yMax - base[1];
        let dy = height / n;
        let rangeY = math.range(base[1], yMax, dy);
        let barcolors = colormap({
            colormap: 'jet',
            nshades: 10,
            format: 'hex',
            alpha: 1
        });
        barcolors.reverse();
        //
        let dValue = (maxValue - minValue) / (n - 1);
        let value = math.range(minValue, maxValue + dValue, dValue);
        value._data.reverse()
        for (let i = 0; i <= rangeY._data.length - 1; i++) {
            //fill block
            PaintIn.ctx.fillStyle = barcolors[i];
            PaintIn.ctx.fillRect(base[0], rangeY._data[i], width, dy);
            //render value of block
            let xTextSpace = 15;
            let xPos = (base[0] + width) + xTextSpace;
            let yPos = rangeY._data[i] + dy / 2;
            PaintIn.ctx.strokeText(math.round(value._data[i], 2), xPos, yPos);
        }
        //draw box
        PaintIn.ctx.rect(base[0], base[1], width, yMax - base[1]);
        PaintIn.ctx.lineWidth = 2;
        PaintIn.ctx.stroke();
        return
        //
        for (let surface of FEtri) {
            // if (FEtri.indexOf(surface) === 100) {
            //     this.updateStorage();
            //     PaintIn.renderObject(processingData.allObject);
            // return
            // } 

            PaintIn.ctx.beginPath();
            let indexOfNode0 = surface[0];

            let nodeCoord0 = [...FEcoord[indexOfNode0 - 1]];
            //scale
            nodeCoord0[0] *= scale;
            nodeCoord0[1] *= scale;
            //move system
            nodeCoord0[0] -= (100);
            nodeCoord0[1] -= (100);
            //rot
            nodeCoord0 = math.multiply(nodeCoord0, rotMatrix);
            nodeCoord0 = nodeCoord0.flat()
            // //move system
            nodeCoord0[0] += baseCoord[0] + 100;
            nodeCoord0[1] += baseCoord[1] + 100;

            PaintIn.ctx.moveTo(nodeCoord0[0], nodeCoord0[1]);
            let sortNodeIndex = [5, 1, 3, 2, 4];
            for (let i of sortNodeIndex) {
                let indexOfNextNode = surface[i];
                let nextNodeCoord = [...FEcoord[indexOfNextNode - 1]];
                //scale
                nextNodeCoord[0] *= scale;
                nextNodeCoord[1] *= scale;
                //move system
                nextNodeCoord[0] -= (100);
                nextNodeCoord[1] -= (100);
                //rot
                nextNodeCoord = math.multiply(nextNodeCoord, rotMatrix);
                nextNodeCoord = nextNodeCoord.flat()
                //move system
                nextNodeCoord[0] += baseCoord[0] + 100;
                nextNodeCoord[1] += baseCoord[1] + 100;

                PaintIn.ctx.lineTo(nextNodeCoord[0], nextNodeCoord[1]);
            }
            PaintIn.ctx.closePath();
            PaintIn.ctx.lineWidth = 0.5;
            PaintIn.ctx.stroke();

            // let node0 = math.add(math.multiply(FEcoord[surface[0] - 1], scale), baseCoord);
            // let node1 = math.add(math.multiply(FEcoord[surface[1] - 1], scale), baseCoord);
            // let node2 = math.add(math.multiply(FEcoord[surface[2] - 1], scale), baseCoord);
            // let node3 = math.add(math.multiply(FEcoord[surface[3] - 1], scale), baseCoord);
            // let node4 = math.add(math.multiply(FEcoord[surface[4] - 1], scale), baseCoord);
            // let node5 = math.add(math.multiply(FEcoord[surface[5] - 1], scale), baseCoord);

            // let nodeObjs = processingData.prototype.createPoint(
            //     [node0[0], node1[0], node2[0], node3[0], node4[0], node5[0]],
            //     [node0[1], node1[1], node2[1], node3[1], node4[1], node5[1]],
            //     Array(6).fill(null),
            //     Array(6).fill(null)
            // );
            // //add point
            // processingData.allPoint.push(node0)
            // processingData.allPoint.push(node1)
            // processingData.allPoint.push(node2)
            // processingData.allPoint.push(node3)
            // processingData.allPoint.push(node4)
            // processingData.allPoint.push(node5)
            // processingData.allObject.push(node0)
            // processingData.allObject.push(node1)
            // processingData.allObject.push(node2)
            // processingData.allObject.push(node3)
            // processingData.allObject.push(node4)
            // processingData.allObject.push(node5)
            // // 0 5 1 3 2 4
            // let lineObj1 = new Line(nodeObjs[0], nodeObjs[5], null, "black", 1);
            // let lineObj2 = new Line(nodeObjs[5], nodeObjs[1], null, "black", 1);
            // let lineObj3 = new Line(nodeObjs[1], nodeObjs[3], null, "black", 1);
            // let lineObj4 = new Line(nodeObjs[3], nodeObjs[2], null, "black", 1);
            // let lineObj5 = new Line(nodeObjs[2], nodeObjs[4], null, "black", 1);
            // let lineObj6 = new Line(nodeObjs[4], nodeObjs[0], null, "black", 1);
            // processingData.allLine.push(lineObj1)
            // processingData.allLine.push(lineObj2)
            // processingData.allLine.push(lineObj3)
            // processingData.allLine.push(lineObj4)
            // processingData.allLine.push(lineObj5)
            // processingData.allLine.push(lineObj6)
            // processingData.allObject.push(lineObj1)
            // processingData.allObject.push(lineObj2)
            // processingData.allObject.push(lineObj3)
            // processingData.allObject.push(lineObj4)
            // processingData.allObject.push(lineObj5)
            // processingData.allObject.push(lineObj6)

            // this.addObject(lineObj1, processingData.allLine);
            // this.addObject(lineObj2, processingData.allLine);
            // this.addObject(lineObj3, processingData.allLine);
            // this.addObject(lineObj4, processingData.allLine);
            // this.addObject(lineObj5, processingData.allLine);
            // this.addObject(lineObj6, processingData.allLine);

            // let area = new Area([lineObj1, lineObj2, lineObj3, lineObj4, lineObj5, lineObj6], null);
            // processingData.allArea.push(area)
            // processingData.allObject.push(area)
        }



        //print node
        for (let i = 0; i <= FEcoord.length - 1; i++) {
            //scale
            FEcoord[i][0] *= scale;
            FEcoord[i][1] *= scale;
            //move system
            FEcoord[i][0] -= (100);
            FEcoord[i][1] -= (100);
            //rot
            // console.log(FEcoord[i])
            FEcoord[i] = math.multiply(FEcoord[i], rotMatrix);
            FEcoord[i] = FEcoord[i].flat()
            // console.log(FEcoord[i])
            // //move system
            FEcoord[i][0] += baseCoord[0] + 100;
            FEcoord[i][1] += baseCoord[1] + 100;
            PaintIn.ctx.beginPath();
            PaintIn.ctx.arc(FEcoord[i][0], FEcoord[i][1], 1.5, 0, 2 * math.PI);
            let colorIndex = math.round((FEsoln[i] + delta) * 100);
            PaintIn.ctx.strokeStyle = colors[colorIndex]
            PaintIn.ctx.stroke();
        }
        // // this.updateStorage();
        // // PaintIn.renderObject(processingData.allObject);

        return
    }
    polygonFill(coordXs, coordYs, colors) {
        let xMin = math.min(coordXs);
        let xMax = math.max(coordXs);
        let yMin = math.min(coordYs);
        let yMax = math.max(coordYs);
        //edge
        let edges = [];
        for (let i = 0; i <= coordXs.length - 1; i++) {
            let point1;
            let point2;
            if (i === coordXs.length - 1) {
                point1 = [coordXs[i], coordYs[i]];
                point2 = [coordXs[0], coordYs[0]];
            } else {
                point1 = [coordXs[i], coordYs[i]];
                point2 = [coordXs[i + 1], coordYs[i + 1]];
            }
            let edge = [point1, point2];
            edges.push(edge);
        }
        //dx, dy (pixel)
        let dx = 0.3;
        let dy = 0.3;
        //create range point
        let xRange = math.range(xMin, xMax + dx, dx);
        let yRange = math.range(yMin, yMax + dy, dy);
        for (let x of xRange._data) {
            for (let y of yRange._data) {
                //inside-check
                let count = 0;
                for (let edge of edges) {
                    let x1 = edge[0][0];
                    let y1 = edge[0][1];
                    let x2 = edge[1][0];
                    let y2 = edge[1][1];
                    if (
                        y < y1 != y < y2 &&
                        x < (x2 - x1) * (y - y1) / (y2 - y1) + x1
                    ) {
                        count += 1;
                    }
                }
                //if inside
                if (count % 2 !== 0) {
                    //switch to barycentric coordinates
                    // let A = [coordXs, coordYs, [1, 1, 1]]; // module take many times
                    // let C = [x, y, 1];
                    // let B = math.lusolve(A, C).flat();
                    let B = [];
                    B[0] = ((coordYs[1] - coordYs[2]) * (x - coordXs[2]) + (coordXs[2] - coordXs[1]) * (y - coordYs[2])) /
                        ((coordYs[1] - coordYs[2]) * (coordXs[0] - coordXs[2]) + (coordXs[2] - coordXs[1]) * (coordYs[0] - coordYs[2]));
                    B[1] = ((coordYs[2] - coordYs[0]) * (x - coordXs[2]) + (coordXs[0] - coordXs[2]) * (y - coordYs[2])) /
                        ((coordYs[1] - coordYs[2]) * (coordXs[0] - coordXs[2]) + (coordXs[2] - coordXs[1]) * (coordYs[0] - coordYs[2]));
                    B[2] = 1 - B[0] - B[1];
                    //interpolate color
                    // let color = math.add((math.multiply(B[0], colors[0])), (math.multiply(B[1], colors[1])), (math.multiply(B[2], colors[2]))); // this take more times
                    let color = [0, 0, 0];
                    color[0] = Math.round(B[0] * colors[0][0] + B[1] * colors[1][0] + B[2] * colors[2][0]);
                    color[1] = Math.round(B[0] * colors[0][1] + B[1] * colors[1][1] + B[2] * colors[2][1]);
                    color[2] = Math.round(B[0] * colors[0][2] + B[1] * colors[1][2] + B[2] * colors[2][2]);

                    // return
                    PaintIn.ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
                    PaintIn.ctx.fillRect(x, y, dx, dy);
                }
            }
        }
    }
    drawMesh(inputData) {
        let jsmat = inputData["jsmat"];
        let FEtri = inputData["FEtri"];
        let FEcoord = inputData["FEcoord"];
        let baseCoord = jsmat["node_coords"][3];
        let scale = 200; //max lenght in object

        //     for (let surface of FEtri) {
        //         let node0 = math.add(math.multiply(FEcoord[surface[0] - 1], scale), baseCoord);
        //         let node1 = math.add(math.multiply(FEcoord[surface[1] - 1], scale), baseCoord);
        //         let node2 = math.add(math.multiply(FEcoord[surface[2] - 1], scale), baseCoord);
        //         let node3 = math.add(math.multiply(FEcoord[surface[3] - 1], scale), baseCoord);
        //         let node4 = math.add(math.multiply(FEcoord[surface[4] - 1], scale), baseCoord);
        //         let node5 = math.add(math.multiply(FEcoord[surface[5] - 1], scale), baseCoord);
        //         let nodeObjs = processingData.prototype.createPoint(
        //             [node0[0], node1[0], node2[0], node3[0], node4[0], node5[0]],
        //             [node0[1], node1[1], node2[1], node3[1], node4[1], node5[1]],
        //             Array(6).fill(null),
        //             Array(6).fill(null)
        //         );

        //         node0 = processingData.prototype.createPoint([node0[0]], [node0[1]], Array(1).fill(null),
        //             Array(1).fill(null));
        //         node1 = processingData.prototype.createPoint([node1[0]], [node1[1]], Array(1).fill(null),
        //             Array(1).fill(null));
        //         node2 = processingData.prototype.createPoint([node2[0]], [node2[1]], Array(1).fill(null),
        //             Array(1).fill(null));
        //         node3 = processingData.prototype.createPoint([node3[0]], [node3[1]], Array(1).fill(null),
        //             Array(1).fill(null));
        //         node4 = processingData.prototype.createPoint([node4[0]], [node4[1]], Array(1).fill(null),
        //             Array(1).fill(null));
        //         node5 = processingData.prototype.createPoint([node5[0]], [node5[1]], Array(1).fill(null),
        //             Array(1).fill(null));

        //         arrPointSolu.push(node0[0], node1[0], node2[0], node3[0], node4[0], node5[0]);

        //         // 0 5 1 3 2 4
        //         let lineObj1 = new Line(nodeObjs[0], nodeObjs[5], null, "black", 1);
        //         let lineObj2 = new Line(nodeObjs[5], nodeObjs[1], null, "black", 1);
        //         let lineObj3 = new Line(nodeObjs[1], nodeObjs[3], null, "black", 1);
        //         let lineObj4 = new Line(nodeObjs[3], nodeObjs[2], null, "black", 1);
        //         let lineObj5 = new Line(nodeObjs[2], nodeObjs[4], null, "black", 1);
        //         let lineObj6 = new Line(nodeObjs[4], nodeObjs[0], null, "black", 1);

        //         arrLineSolu.push(lineObj1, lineObj2, lineObj3, lineObj4, lineObj5, lineObj6);
        //     }

        //     processingData.allLine = [];
        //     processingData.allPoint = [];

        //     processingData.allLine = arrLineSolu;
        //     for (let line of processingData.allLine) {
        //         processingData.allObject.push(line);
        //     }

        //     processingData.allPoint = arrPointSolu;
        //     for (let point of processingData.allPoint) {
        //         processingData.allObject.push(point);
        //     }

        //     PaintIn.renderObject(processingData.allObject);
        //     return
        // }
        // getNearest(listPoints, currentPoint, maxDistance) {
        //     let distance = function (a, b) {
        //         return math.norm([a[0] - b[0], a[1] - b[1]]);
        //     }
        //     let tree = new kdTree(listPoints, distance, [0, 1]);
        //     return tree.nearest(currentPoint, 1, maxDistance)[0];
    };
    getNearest(listPoints, currentPoint, maxDistance) {
        let distance = function (a, b) {
            return math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
        }
        let tree = new kdTree(listPoints, distance, ["x", "y"]);
        return tree.nearest(currentPoint, 1, maxDistance)[0];
    };
    moveObject(obj, newLocation) {
        switch (obj.className) {
            case "Point":
                {
                    obj.point = newLocation;
                    obj.x = newLocation[0];
                    obj.y = newLocation[1];
                    processingData.allLine.forEach(line => line.getLength());
                    processingData.allArea.forEach(area => {
                        area.getPointFlow();
                        area.getArea();
                        area.getCenter();
                        area.getPerimeter()
                    })
                }
                break;
            case "Line":
                {
                    //move point
                    let point1 = obj.Point[0].point;
                    let point2 = obj.Point[1].point;
                    let centerPoint = math.divide(math.add(point1, point2), 2);
                    let translateVect = math.subtract(newLocation, centerPoint);
                    let newPoint1 = math.add(point1, translateVect);
                    let newPoint2 = math.add(point2, translateVect);
                    //create new point obj
                    let newPointObj1 = new Point(newPoint1, obj.Point[0].name);
                    let newPointObj2 = new Point(newPoint2, obj.Point[1].name);
                    //change old point
                    obj.Point[0] = newPointObj1;
                    obj.Point[1] = newPointObj2;
                    break;
                }
            // case "Area":
            //     {
            //         let centerPoint = obj.center;
            //         let translateVect = math.subtract(newLocation, centerPoint);
            //         // move line
            //         for (let line of obj.Line) {
            //             //move point
            //             let point1 = line.Point[0].point;
            //             let point2 = line.Point[1].point;
            //             let newPoint1 = math.add(point1, translateVect);
            //             let newPoint2 = math.add(point2, translateVect);
            //             //create new point obj
            //             let newPointObj1 = new Point(newPoint1, line.Point[0].name);
            //             let newPointObj2 = new Point(newPoint2, line.Point[1].name);
            //             //change old point
            //             let newLineObj = new Line(newPointObj1, newPointObj2, line.name, line.lineColor, line.lineWidth);
            //             //delete old line
            //             processingData.allLine.splice(processingData.allLine.indexOf(line), 1);
            //             //
            //             obj.Line[obj.Line.indexOf(line)] = newLineObj;
            //         }
            //         //move center point
            //         obj.center = newLocation;
            //         //move PointFlow
            //         for (let i = 0; i <= obj.pointFlow.length - 1; i++) {
            //             obj.pointFlow[i] = math.add(obj.pointFlow[i], translateVect);
            //         }
            //         break;
            //     }
        }
        this.updateStorage()
        //refresh screen
        PaintIn.renderObject(processingData.allObject);
    }

    //input by area comments
    inputComments() {
        let typeValue = JSON.stringify(PaintIn.valueComment.value.slice(PaintIn.valueComment.value.indexOf(',') + 1, PaintIn.valueComment.value.indexOf(',') + 2));
        let objName = JSON.stringify(PaintIn.valueComment.value.slice(0, PaintIn.valueComment.value.indexOf(',')));
        const indexComma = [];
        for (let i = 0; i < PaintIn.valueComment.value.length; i++) {
            if ((PaintIn.valueComment.value)[i] === ',') {
                indexComma.push(i);
            }
        }

        for (let obj of processingData.allObject) {
            if (JSON.stringify(obj.name) === objName) {
                if (obj.className === "Point") {
                    // first check
                    if (obj.pointLoads === null) {
                        obj.pointLoads = [];
                    }

                    if (typeValue === JSON.stringify('f')) {
                        let force_x;
                        let force_y;

                        force_x = Number((PaintIn.valueComment.value).slice(indexComma[1] + 1, indexComma[2]));
                        force_y = Number((PaintIn.valueComment.value).slice(indexComma[2] + 1, PaintIn.valueComment.value.length));

                        let forceObj = { "type": "force", "parameters": { "force_x": force_x, "force_y": force_y } };
                        obj.pointLoads.push(forceObj);
                    }
                    else if (typeValue === JSON.stringify('m')) {
                        let moment = Number((PaintIn.valueComment.value).slice(indexComma[1] + 1, PaintIn.valueComment.value.length));
                        let momentObj = { "type": "moment", "parameters": { "value": moment } };
                        obj.pointLoads.push(momentObj);
                    }
                }
                else if (obj.className === "Line") {
                    //first check
                    if (obj.lineLoads === null) {
                        obj.lineLoads = [];
                    }
                    //
                    if (typeValue === JSON.stringify('f')) {
                        let node_0;
                        let node_1;

                        node_0 = Number((PaintIn.valueComment.value).slice(indexComma[1] + 1, indexComma[2]));
                        node_1 = Number((PaintIn.valueComment.value).slice(indexComma[2] + 1, PaintIn.valueComment.value.length));

                        let pressureObj = { "type": "normal_pressure", "parameters": { "node_0": node_0, "node_1": node_1 } };
                        obj.lineLoads.push(pressureObj);
                    }
                }
            }
        }
        PaintIn.renderObject(processingData.allObject);
    };
};
// Point class
class Point {
    constructor(Arr, pointName, pointLoads = null, soln = null) {
        this.point = Arr;
        this.x = Arr[0];
        this.y = Arr[1];
        this.className = "Point";
        this.name = pointName;
        this.force = [];
        this.moment = [];
        this.pointLoads = pointLoads;
        this.soln = soln;
    };
    //Method
    isIn(mouse) {
        return (((mouse[0] - this.x) ** 2 + (mouse[1] - this.y) ** 2) < 3 ** 2) ? true : false
    }
    isInBox(topLeftPoint, bottomRigthPoint) {
        let point = this.point;
        if (topLeftPoint[0] < point[0] && topLeftPoint[1] < point[1] &&
            point[0] < bottomRigthPoint[0] && point[1] < bottomRigthPoint[1]) {
            return true;
        } else return false;
    }
    isTouchBox(topRightPoint, bottomLeftPoint) {
        let point = this.point;
        if (topRightPoint[0] > point[0] && topRightPoint[1] < point[1] &&
            point[0] > bottomLeftPoint[0] && point[1] < bottomLeftPoint[1]) {
            return true;
        } else return false;
    }
};

// Line class
class Line {
    constructor(Point1, Point2, lineName, lineColor, lineWidth, lineLoads = null) {
        this.Point = [Point1, Point2];
        this.color = lineColor;
        this.width = lineWidth;
        this.className = "Line";
        this.name = lineName;
        this.force = [];
        this.lineLoads = lineLoads;
        //length
        this.length;
        this.getLength();
    }
    //calc length of line
    getLength() {
        this.length = math.norm(math.subtract(this.Point[0].point, this.Point[1].point));
    }
    //get Point in line
    getPointInLine(numPoint) {
        let numSeg = numPoint - 1;
        let point1 = this.Point[0].point;
        let point2 = this.Point[1].point;
        let dp = math.divide(math.subtract(point2, point1), numSeg);
        let subPoints = []
        for (let i = 0; i < numPoint; i++) {
            let subPoint = math.add(point1, math.multiply(i, dp));
            subPoints.push(subPoint);
        }
        return subPoints
    }
    //inside-check
    isIn(Mouse) {
        let A_to_mouse = math.norm(math.subtract(this.Point[0].point, Mouse));
        let mouse_to_B = math.norm(math.subtract(Mouse, this.Point[1].point));
        return (A_to_mouse + mouse_to_B - this.length <= 0.1) ? true : false
    }
    isInBox(topLeftPoint, bottomRigthPoint) {
        for (let pointObj of this.Point) {
            let point = pointObj.point;
            if (topLeftPoint[0] < point[0] && topLeftPoint[1] < point[1] &&
                point[0] < bottomRigthPoint[0] && point[1] < bottomRigthPoint[1]) {
            } else {
                return false;
            }
        }
        return true;
    }
    isTouchBox(topRightPoint, bottomLeftPoint) {
        return false;
    }
};
//Area
class Area {
    constructor(LineList, AreaName) {
        this.className = "Area";
        this.Line = LineList;
        this.name = AreaName;
        //pointFlow
        this.pointFlow = [];
        this.getPointFlow();
        //perimeter
        this.perimeter;
        this.getPerimeter();
        //area
        this.area;
        this.getArea();
        //center
        this.center = [];
        this.getCenter();

    }
    //calc Perimeter
    getPerimeter() {
        let perimeter = 0;
        for (let line of this.Line) {
            perimeter += line.length;
        }
        this.perimeter = perimeter;
    }
    getCenter() {
        let arrX = math.subset(this.pointFlow, math.index(math.range(0, this.pointFlow.length), 0));
        let arrY = math.subset(this.pointFlow, math.index(math.range(0, this.pointFlow.length), 1));;
        let centerX = math.sum(arrX) / arrX.length;
        let centerY = math.sum(arrY) / arrY.length;
        this.center = [centerX, centerY];
    }
    getArea() {
        let S = 0;
        for (let i = 0; i <= this.Line.length - 1; i++) {
            let Point1 = this.Line[i].Point[0].point;
            let Point2 = this.Line[i].Point[1].point;
            //
            if (i === this.Line.length - 1) {
                if (JSON.stringify(this.Line[0].Point).indexOf(JSON.stringify(Point1)) !== -1) {
                    let swap = Point1;
                    Point1 = Point2;
                    Point2 = swap;
                }
            } else {
                if (JSON.stringify(this.Line[i + 1].Point).indexOf(JSON.stringify(Point1)) !== -1) {
                    let swap = Point1;
                    Point1 = Point2;
                    Point2 = swap;
                }
            }
            S += 1 / 2 * (Point1[0] * Point2[1] - Point1[1] * Point2[0]);
        }
        this.area = math.abs(S);
    }
    getPointFlow() {
        this.pointFlow = [];
        for (let i = 0; i <= this.Line.length - 1; i++) {
            let Point1 = this.Line[i].Point[0].point;
            let Point2 = this.Line[i].Point[1].point;
            //
            if (i === this.Line.length - 1) {
                if (JSON.stringify(this.Line[0].Point).indexOf(JSON.stringify(Point2)) === -1) {
                    let swap = Point1;
                    Point1 = Point2;
                    Point2 = swap;
                }
            } else {
                if (JSON.stringify(this.Line[i + 1].Point).indexOf(JSON.stringify(Point2)) === -1) {
                    let swap = Point1;
                    Point1 = Point2;
                    Point2 = swap;
                }
            }
            this.pointFlow.push(Point1)
        }
    }
    isIn([xMouse, yMouse]) {
        let count = 0;
        for (let Line of this.Line) {
            let x1 = Line.Point[0].x;
            let y1 = Line.Point[0].y;
            let x2 = Line.Point[1].x;
            let y2 = Line.Point[1].y;
            if (
                yMouse < y1 != yMouse < y2 &&
                xMouse < (x2 - x1) * (yMouse - y1) / (y2 - y1) + x1
            ) {
                count += 1;
            };
        };
        return count % 2 === 0 ? false : true
    }
    isInBox(topLeftPoint, bottomRigthPoint) {
        for (let point of this.pointFlow) {
            if (topLeftPoint[0] < point[0] && topLeftPoint[1] < point[1] &&
                point[0] < bottomRigthPoint[0] && point[1] < bottomRigthPoint[1]) {
            } else {
                return false;
            }
        }
        return true;
    }
    isTouchBox(topRightPoint, bottomLeftPoint) {
        return false
    }
};
// Curve class
class Curve {
    constructor(arrX, arrY, curveName, lineColor, lineWidth, force) {
        this.listX = arrX;
        this.listY = arrY;
        //
        this.length = [];
        this.color = lineColor;
        this.width = lineWidth;
        this.className = "Curve";
        this.name = curveName;
        this.force = force;
    }
    //Method
    isIn(Mouse) {
        let A_to_mouse = math.norm(math.subtract(this.Point[0].point, Mouse));
        let mouse_to_B = math.norm(math.subtract(Mouse, this.Point[1].point));
        return (A_to_mouse + mouse_to_B - this.length <= 0.1) ? true : false
    };

}
processingData.allObject = [];
processingData.allLine = [];
processingData.allPoint = [];
processingData.allArea = [];
processingData.allAreaCenter = [];
processingData.newObjects = [];
processingData.oldObjects = [];
//----------------------------//

function getNearest(listPoints, currentPoint) {
    var distance = function (a, b) {
        return math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    }
    var tree = new kdTree(listPoints, distance, ["x", "y"]);
    return nearest = tree.nearest(currentPoint, 1);
};


var nameID;

function inputName(x, y, obj) {
    nameID = new CanvasInput({
        canvas: document.getElementById('myCanvas'),
        x: x,
        y: y,
        fontSize: 18,
        fontFamily: 'Arial',
        fontColor: '#212121',
        fontWeight: 'bold',
        width: 25,
        height: 25,
        padding: 0,
        borderColor: '#000',
        borderRadius: 3,

        onsubmit: function () {
            PaintIn.drawText(obj, this.value());
            obj.name = this.value();
            this.destroy();
            nameID = undefined;
            PaintIn.renderObject(processingData.allObject);
            PaintIn.isCancled = false;
        },
    });
    nameID.focus();
};

var nameIDs;

function inputNames(x, y) {
    nameIDs = new CanvasInput({
        canvas: document.getElementById('myCanvas'),
        x: x,
        y: y,
        fontSize: 18,
        fontFamily: 'Arial',
        fontColor: '#212121',
        fontWeight: 'bold',
        width: 25,
        height: 25,
        padding: 0,
        borderColor: '#000',
        borderRadius: 3,

        onsubmit: function () {
            let newName = this.value();
            for (let obj of PaintIn.arrMultiCurObj) {
                obj.name = newName;
            }
            this.destroy();
            nameIDs = undefined;
            PaintIn.renderObject(processingData.allObject);
            PaintIn.isCancled = false;
        },
    });
    nameIDs.focus();
};

var valueLoad;
function inputForce(x, y, obj, loadKey) {
    valueLoad = new CanvasInput({
        canvas: document.getElementById('myCanvas'),
        x: x,
        y: y,
        fontSize: 13,
        fontFamily: 'Arial',
        fontColor: '#212121',
        fontWeight: 'bold',
        width: 50,
        height: 25,
        padding: 0,
        borderColor: '#000',
        borderRadius: 3,

        onsubmit: function () {
            if (loadKey === "force") {
                //first check
                if (obj.pointLoads === null) {
                    obj.pointLoads = [];
                }
                //
                let force_x;
                let force_y;
                if ((this.value()).includes(",") === true) {
                    force_x = Number((this.value()).slice(0, this.value().indexOf(',')));
                    force_y = Number((this.value()).slice(this.value().indexOf(',') + 1, (this.value()).length));
                }
                else {
                    force_x = Number(this.value());
                    force_y = 0;
                }
                forceObj = { "type": loadKey, "parameters": { "force_x": force_x, "force_y": force_y } };
                obj.pointLoads.push(forceObj);

            }
            // else if (loadKey === "moment") {
            //     //first check
            //     if (obj.pointLoads === null) {
            //         obj.pointLoads = [];
            //     }
            //     //
            //     let moment = Number(this.value());
            //     momentObj = { "type": loadKey, "parameters": { "value": moment } };
            //     obj.pointLoads.push(momentObj);

            // } 
            else if (loadKey === "normal_pressure") {
                //first check
                if (obj.lineLoads === null) {
                    obj.lineLoads = [];
                }
                //
                let node_0;
                let node_1;
                if ((this.value()).includes(",") === true) {
                    node_0 = Number((this.value()).slice(0, this.value().indexOf(',')));
                    node_1 = Number((this.value()).slice(this.value().indexOf(',') + 1, (this.value()).length));
                }
                else {
                    node_0 = Number(this.value());
                    node_1 = node_0;
                }
                let pressureObj = { "type": loadKey, "parameters": { "node_0": node_0, "node_1": node_1 } };
                obj.lineLoads.push(pressureObj);

            } else if (loadKey === "axial_pressure") {
                //first check
                if (obj.lineLoads === null) {
                    obj.lineLoads = [];
                }
                //
                let value = Number(this.value());
                let axialPressureObj = { "type": loadKey, "parameters": { "value": value } };
                obj.lineLoads.push(axialPressureObj);
            }
            this.destroy();
            valueLoad = undefined;
            PaintIn.renderObject(processingData.allObject);
            PaintIn.isCancled = false;

        },
    });
    valueLoad.focus();
};

var valueLoads;
function inputForces(x, y, loadKey) {
    valueLoads = new CanvasInput({
        canvas: document.getElementById('myCanvas'),
        x: x,
        y: y,
        fontSize: 13,
        fontFamily: 'Arial',
        fontColor: '#212121',
        fontWeight: 'bold',
        width: 50,
        height: 25,
        padding: 0,
        borderColor: '#000',
        borderRadius: 3,

        onsubmit: function () {
            for (let obj of PaintIn.arrMultiCurObj) {
                if (loadKey === "force") {
                    //first check
                    if (obj.pointLoads === null) {
                        obj.pointLoads = [];
                    }
                    //
                    let force_x;
                    let force_y;
                    if ((this.value()).includes(",") === true) {
                        force_x = Number((this.value()).slice(0, this.value().indexOf(',')));
                        force_y = Number((this.value()).slice(this.value().indexOf(',') + 1, (this.value()).length));
                    }
                    else {
                        force_x = Number(this.value());
                        force_y = 0;
                    }
                    forceObj = { "type": loadKey, "parameters": { "force_x": force_x, "force_y": force_y } };
                    obj.pointLoads.push(forceObj);

                }
                else if (loadKey === "normal_pressure") {
                    //first check
                    if (obj.lineLoads === null) {
                        obj.lineLoads = [];
                    }
                    //
                    let node_0;
                    let node_1;
                    if ((this.value()).includes(",") === true) {
                        node_0 = Number((this.value()).slice(0, this.value().indexOf(',')));
                        node_1 = Number((this.value()).slice(this.value().indexOf(',') + 1, (this.value()).length));
                    }
                    else {
                        node_0 = Number(this.value());
                        node_1 = node_0;
                    }
                    let pressureObj = { "type": loadKey, "parameters": { "node_0": node_0, "node_1": node_1 } };
                    obj.lineLoads.push(pressureObj);

                } else if (loadKey === "axial_pressure") {
                    //first check
                    if (obj.lineLoads === null) {
                        obj.lineLoads = [];
                    }
                    //
                    let value = Number(this.value());
                    let axialPressureObj = { "type": loadKey, "parameters": { "value": value } };
                    obj.lineLoads.push(axialPressureObj);
                }
            }
            this.destroy();
            valueLoads = undefined;
            PaintIn.renderObject(processingData.allObject);
            PaintIn.isCancled = false;
        },
    });
    valueLoads.focus();
};

var valueMoment;
function inputMoment(x, y, obj, loadKey) {
    valueMoment = new CanvasInput({
        canvas: document.getElementById('myCanvas'),
        x: x,
        y: y,
        fontSize: 13,
        fontFamily: 'Arial',
        fontColor: '#212121',
        fontWeight: 'bold',
        width: 50,
        height: 25,
        padding: 0,
        borderColor: '#000',
        borderRadius: 3,

        onsubmit: function () {
            if (loadKey === "moment") {
                //first check
                if (obj.pointLoads === null) {
                    obj.pointLoads = [];
                }
                //
                let moment = Number(this.value());
                momentObj = { "type": loadKey, "parameters": { "value": moment } };
                obj.pointLoads.push(momentObj);

            }
            this.destroy();
            valueMoment = undefined;
            PaintIn.renderObject(processingData.allObject);
            PaintIn.isCancled = false;

        },
    });
    valueMoment.focus();
};

var valueMoments;
function inputMoments(x, y, loadKey) {
    valueMoments = new CanvasInput({
        canvas: document.getElementById('myCanvas'),
        x: x,
        y: y,
        fontSize: 13,
        fontFamily: 'Arial',
        fontColor: '#212121',
        fontWeight: 'bold',
        width: 50,
        height: 25,
        padding: 0,
        borderColor: '#000',
        borderRadius: 3,

        onsubmit: function () {
            for (let obj of PaintIn.arrMultiCurObj) {
                if (loadKey === "moment") {
                    //first check
                    if (obj.pointLoads === null) {
                        obj.pointLoads = [];
                    }
                    //
                    let moment = Number(this.value());
                    momentObj = { "type": loadKey, "parameters": { "value": moment } };
                    obj.pointLoads.push(momentObj);
                }
            }
            this.destroy();
            valueMoments = undefined;
            PaintIn.renderObject(processingData.allObject);
            PaintIn.isCancled = false;
        },
    });
    valueMoments.focus();
};

var lengthLine;
function inputLenght(x, y) {
    lengthLine = new CanvasInput({
        canvas: document.getElementById('myCanvas'),
        x: x,
        y: y,
        fontSize: 18,
        fontFamily: 'Arial',
        fontColor: '#212121',
        fontWeight: 'bold',
        width: 60,
        height: 25,
        padding: 0,
        borderColor: '#000',
        borderRadius: 3,

        onsubmit: function () {
            PaintIn.mouseMoveStatus = true;
            let firstPoint = [PaintIn.mouseDownPos.x, PaintIn.mouseDownPos.y];
            let currentMouseMove = [PaintIn.currentMouseMovePos.x, PaintIn.currentMouseMovePos.y];
            let vectU = math.subtract(currentMouseMove, firstPoint);
            let vectU_ = math.divide(vectU, math.norm(vectU));
            let length = Number(this.value());
            let nextPoint = math.add(firstPoint, math.multiply(vectU_, length));
            let spaceKey = new KeyboardEvent("keydown", { keyCode: 32 });
            processingData.prototype.inputRawData("line", [firstPoint[0], nextPoint[0]], [firstPoint[1], nextPoint[1]]);
            PaintIn.keyDown(spaceKey);
            // let nextPoint = getPoint(firstPoint, currentMouseMove, length);
            //simulate mousedown event to next point
            PaintIn.simulateMouseEvent("mousemove", nextPoint);
            PaintIn.simulateMouseEvent("mousedown", nextPoint);
            PaintIn.simulateMouseEvent("mouseup", nextPoint);
            this.destroy();
            lengthLine = undefined;
            // PaintIn.renderObject(processingData.allObject);
            console.log(nextPoint)
        },
    });
    lengthLine.focus();
}

function getPoint(start, cur, l) {
    let a = cur[0] - start[0];
    let b = cur[1] - start[1];
    let t = Math.sqrt(l * l / (a * a + b * b));
    return [start[0] + a * t, start[1] + b * t];
}