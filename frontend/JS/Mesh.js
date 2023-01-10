var jsmat, FEsoln, QC, baseCoord, FEtri, FEcoord, scale;
class Mesh {
  constructor() {
    this.nodesColor = [];
  }

  addValFillColor() {
    PaintIn.ctx.fillStyle = "white";
    PaintIn.ctx.fillRect(0, 0, PaintIn.canvas.width, PaintIn.canvas.height);
    if (Mesh.curValFillColor.value === "Off") {
      Mesh.curValFillColor.value === "On";
      document.getElementById("fillColor").classList.add("active");
      Mesh.curValFillColor.value = "On";
      this.fillElements();
    } else {
      Mesh.curValFillColor.value = "Off";
      document.getElementById("fillColor").classList.remove("active");
      this.drawMesh();
    }
  }

  createDataMesh(inputData) {
    Mesh.inputData = inputData;
    if (Mesh.inputData["QC"].length !== 0) {
      jsmat = Mesh.inputData["jsmat"];
      FEsoln = Mesh.inputData["FEsoln"];
      QC = Mesh.inputData["QC"];
      baseCoord = jsmat["node_coords"][3];
      baseCoord = [200, 300];
      FEtri = Mesh.inputData["FEtri"];
      FEcoord = Mesh.inputData["FEcoord"];
      scale = 400;
      let arrNodeColor = [];
      let arrElem = [];
      const FEcoordNode = JSON.parse(JSON.stringify(FEcoord));
      const FEcoordLine = JSON.parse(JSON.stringify(FEcoord));
      let indexValueColor = [];
      let colors = colormap({
        colormap: "jet",
        nshades: 100,
        format: "hex",
        alpha: 2,
      });

      let delta = math.abs(math.min(FEsoln));
      delta = math.ceil(delta, 1);
      let rotMatrix = [
        [math.cos(math.PI / 2), -math.sin(math.PI / 2)],
        [math.sin(math.PI / 2), math.cos(math.PI / 2)],
      ];
      //print node
      for (let i = 0; i <= FEcoordNode.length - 1; i++) {
        //scale
        FEcoordNode[i][0] *= scale;
        FEcoordNode[i][1] *= scale;
        //move system
        FEcoordNode[i][0] -= 100;
        FEcoordNode[i][1] -= 100;
        //rot
        // console.log(FEcoord[i])
        FEcoordNode[i] = math.multiply(FEcoordNode[i], rotMatrix);
        FEcoordNode[i] = FEcoordNode[i].flat();
        // console.log(FEcoord[i])
        // return
        // //move system
        FEcoordNode[i][0] += baseCoord[0] + 100;
        FEcoordNode[i][1] += baseCoord[1] + 100;
        let colorIndex = math.round((FEsoln[i] + delta) * 100);
        indexValueColor.push(colorIndex);
        let point = processingData.prototype.createPoint(
          [FEcoordNode[i][0]],
          [FEcoordNode[i][1]],
          Array(1).fill(null),
          Array(1).fill(null)
        );
        // let point = new Point()
        Mesh.nodes.push(point[0]);
      }

      //color node
      for (let i = 0; i < Mesh.nodes.length; i++) {
        Mesh.nodes[i].soln = FEsoln[i];
        arrNodeColor.push(colors[indexValueColor[i]]);
      }
      this.nodesColor = arrNodeColor;

      //edge && each eleme constain 6 edges
      let point1;
      let point2;
      for (let surface of FEtri) {
        arrElem = [];
        let indexOfNode0 = surface[0];
        let nodeCoord0 = [...FEcoordLine[indexOfNode0 - 1]];
        //scale
        nodeCoord0[0] *= scale;
        nodeCoord0[1] *= scale;
        //move system
        nodeCoord0[0] -= 100;
        nodeCoord0[1] -= 100;
        //rot
        nodeCoord0 = math.multiply(nodeCoord0, rotMatrix);
        nodeCoord0 = nodeCoord0.flat();
        // //move system
        nodeCoord0[0] += baseCoord[0] + 100;
        nodeCoord0[1] += baseCoord[1] + 100;

        point1 = processingData.prototype.createPoint(
          [nodeCoord0[0]],
          [nodeCoord0[1]],
          Array(1).fill(null),
          Array(1).fill(null)
        );

        let sortNodeIndex = [5, 1, 3, 2, 4];
        for (let i of sortNodeIndex) {
          let indexOfNextNode = surface[i];
          let nextNodeCoord = [...FEcoord[indexOfNextNode - 1]];
          //scale
          nextNodeCoord[0] *= scale;
          nextNodeCoord[1] *= scale;
          //move system
          nextNodeCoord[0] -= 100;
          nextNodeCoord[1] -= 100;
          //rot
          nextNodeCoord = math.multiply(nextNodeCoord, rotMatrix);
          nextNodeCoord = nextNodeCoord.flat();
          //move system
          nextNodeCoord[0] += baseCoord[0] + 100;
          nextNodeCoord[1] += baseCoord[1] + 100;

          point2 = processingData.prototype.createPoint(
            [nextNodeCoord[0]],
            [nextNodeCoord[1]],
            Array(1).fill(null),
            Array(1).fill(null)
          );
          let edge1 = new Line(point1[0], point2[0], null, "black", 0.5);
          Mesh.edges.push(edge1);
          point1 = point2;
          arrElem.push(edge1);
        }

        point2 = processingData.prototype.createPoint(
          [nodeCoord0[0]],
          [nodeCoord0[1]],
          Array(1).fill(null),
          Array(1).fill(null)
        );
        let edge2 = new Line(point2[0], point1[0], null, "black", 0.5);
        Mesh.edges.push(edge2);

        arrElem.push(edge2);
        let elem = new Area(arrElem, null);
        Mesh.elements.push(elem);
      }
    }
    else {
      jsmat = Mesh.inputData["jsmat"][0];
      FEsoln = Mesh.inputData["FEsoln"][0];
      QC = Mesh.inputData["QC"];
      baseCoord = [200, 300];
      FEtri = Mesh.inputData["FEtri"][0];
      FEcoord = Mesh.inputData["FEcoord"][0];
      let arrElem = [];
      const FEcoordNode = JSON.parse(JSON.stringify(FEcoord));
      const FEcoordLine = JSON.parse(JSON.stringify(FEcoord));

      for (let i = 0; i <= FEcoordNode.length - 1; i++) {
        let point = processingData.prototype.createPoint([FEcoordNode[i][0]], [FEcoordNode[i][1]], Array(1).fill(null),
          Array(1).fill(null));
        Mesh.nodes.push(point[0]);
      }

      let point1;
      let point2;
      for (let surface of FEtri) {
        arrElem = [];
        let indexOfNode0 = surface[0];
        let nodeCoord0 = [...FEcoordLine[indexOfNode0 - 1]];

        point1 = processingData.prototype.createPoint([nodeCoord0[0]], [nodeCoord0[1]], Array(1).fill(null),
          Array(1).fill(null));

        let sortNodeIndex = [1, 2];
        for (let i of sortNodeIndex) {
          let indexOfNextNode = surface[i];
          let nextNodeCoord = [...FEcoord[indexOfNextNode - 1]];

          point2 = processingData.prototype.createPoint([nextNodeCoord[0]], [nextNodeCoord[1]], Array(1).fill(null),
            Array(1).fill(null));
          let edge1 = new Line(point1[0], point2[0], null, "black", 0.5);
          Mesh.edges.push(edge1);
          point1 = point2;
          arrElem.push(edge1);
        }

        point2 = processingData.prototype.createPoint([nodeCoord0[0]], [nodeCoord0[1]], Array(1).fill(null),
          Array(1).fill(null));
        let edge2 = new Line(point2[0], point1[0], null, "black", 0.5);
        Mesh.edges.push(edge2);

        arrElem.push(edge2);
        let elem = new Area(arrElem, null);
        Mesh.elements.push(elem);
      }
    }
    this.drawMesh();
    return;
  }

  openFileSoln(inputData) {
    Mesh.nodes = [];
    Mesh.edges = [];
    Mesh.elements = [];
    Mesh.objects = [];
    PaintIn.currentCursor = "url(frontend/img/select_cursor.svg) 0 0,  default";
    PaintIn.canvas.style.cursor = PaintIn.currentCursor;
    PaintIn.mouseMoveStatus = false;
    PaintIn.pen = undefined;
    PaintIn.curValSelect = "Off";
    PaintIn.ctx.fillStyle = "white";
    PaintIn.ctx.fillRect(0, 0, PaintIn.canvas.width, PaintIn.canvas.height);
    PaintIn.curValDrawing.value = "Off";
    document.getElementById("modeDrawing").classList.remove("active");
    document.getElementById("command").style.display = "none";
    this.createDataMesh(inputData);
  }

  drawMesh() {
    document.getElementById("fillColor").style.display = "block";
    if (Mesh.inputData["QC"].length !== 0) {
      for (let line of Mesh.edges) {
        PaintIn.drawLine(line.Point[0], line.Point[1], "black", 0.5);
      }
      for (let i = 0; i < Mesh.nodes.length; i++) {
        PaintIn.drawPoint(
          Mesh.nodes[i],
          this.nodesColor[i],
          this.nodesColor[i],
          1
        );
      }
      this.drawColorBar();
    }
    else {
      for (let line of Mesh.edges) {
        PaintIn.drawLine(line.Point[0], line.Point[1], 'black', 0.5);
      }
      for (let i = 0; i < Mesh.nodes.length; i++) {
        PaintIn.drawPoint(Mesh.nodes[i], 'black', 'black', 1);
      }
    }
    return;
  }

  fillElements() {
    this.drawColorBar();
    const FEcoordElem = JSON.parse(JSON.stringify(FEcoord));
    let rotMatrix = [
      [math.cos(math.PI / 2), -math.sin(math.PI / 2)],
      [math.sin(math.PI / 2), math.cos(math.PI / 2)],
    ];
    let maxValue = math.max(FEsoln);
    let minValue = math.min(FEsoln);
    let delta = math.abs(minValue);
    delta = math.ceil(delta, 1);
    let nshades = math.ceil((maxValue + delta) * 100);
    let colors = colormap({
      colormap: "jet",
      nshades: nshades,
      format: "rgba",
      alpha: 1,
    });

    for (let surface of FEtri) {
      let coordXs = [];
      let coordYs = [];
      let nodeColors = [];
      for (let i = 0; i < surface.length - 3; i++) {
        let nodeIndex = surface[i];
        let nodeCoord = [...FEcoordElem[nodeIndex - 1]];
        //scale
        nodeCoord[0] *= scale;
        nodeCoord[1] *= scale;
        //move system
        nodeCoord[0] -= 100;
        nodeCoord[1] -= 100;
        //rot
        nodeCoord = math.multiply(nodeCoord, rotMatrix);
        nodeCoord = nodeCoord.flat();
        //move system
        nodeCoord[0] += baseCoord[0] + 100;
        nodeCoord[1] += baseCoord[1] + 100;
        coordXs.push(nodeCoord[0]);
        coordYs.push(nodeCoord[1]);
        //color
        let colorIndex = math.round((FEsoln[nodeIndex - 1] + delta) * nshades);
        let color = colors[colorIndex];
        nodeColors.push(color);
      }
      processingData.prototype.polygonFill(coordXs, coordYs, nodeColors);
    }
  }

  drawColorBar() {
    // draw elements

    let maxValue = math.max(FEsoln);
    let minValue = math.min(FEsoln);
    let delta = math.abs(minValue);
    delta = math.ceil(delta, 1);

    let xMin = 200;
    let xMax = 600;
    let yMin = 100;
    let yMax = 500;
    let xCBSpace = 70;

    let n = 20;
    let base = [xMax + xCBSpace, yMin];
    let width = 50;
    let height = yMax - base[1];
    let dy = height / n;
    let rangeY = math.range(base[1], yMax, dy);
    let barcolors = colormap({
      colormap: "jet",
      nshades: n,
      format: "hex",
      alpha: 1,
    });
    barcolors.reverse();
    //
    let dValue = (maxValue - minValue) / (n - 1);
    let value = math.range(minValue, maxValue + dValue, dValue);
    value._data.reverse();
    for (let i = 0; i <= rangeY._data.length - 1; i++) {
      //fill block
      PaintIn.ctx.fillStyle = barcolors[i];
      PaintIn.ctx.fillRect(base[0], rangeY._data[i], width, dy);
      //render value of block
      let xTextSpace = 15;
      let xPos = base[0] + width + xTextSpace;
      let yPos = rangeY._data[i] + dy / 2;
      PaintIn.ctx.strokeText(math.round(value._data[i], 2), xPos, yPos);
    }
    //draw box
    PaintIn.ctx.rect(base[0], base[1], width, yMax - base[1]);
    // PaintIn.ctx.lineWidth = 2;
    PaintIn.ctx.stroke();
  }
}

Mesh.nodes = [];
Mesh.edges = [];
Mesh.elements = [];
Mesh.objects = [];

Mesh.curValFillColor = document.getElementById("fillColor");
Mesh.inputData = undefined;
