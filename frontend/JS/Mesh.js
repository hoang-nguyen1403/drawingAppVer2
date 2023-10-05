var jsmat, FEsoln = [], QC, baseCoord, FEtri, FEcoord, scale;

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
      DrawGL.drawMain();
      DrawGL3D.drawMain();
    } else {
      Mesh.curValFillColor.value = "Off";
      document.getElementById("fillColor").classList.remove("active");
      DrawGL.color = [1, 1, 1, 1];
      DrawGL3D.pointStorage = { x: 100000, y: 1000000, z: 1000000 };
      DrawGL.nearPointGL_storage = [{ x: 100000000, y: 10000000000 }, 0];
      DrawGL.color = [1, 1, 1, 1];
      DrawGL.drawMain();
      DrawGL3D.drawMain();
    }
  }

  createDataMesh(inputData) {
    Mesh.inputData = inputData;
    if (Mesh.inputData["QC"].length !== 0) {
      jsmat = Mesh.inputData["jsmat"];
      for (let value in inputData){
        if (value !== 'jsmat' && value !== 'FEtri' && value!== 'FEcoord' && value !== 'QC' && value !== 'text_data' ){
          FEsoln.push({name : value,data :inputData[value]});
          document.getElementById("filter").innerHTML += `
          <option value=${value}>${value}</option>
        `
        }
      }
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
      let maxValue = 0//math.max(FEsoln);
      let minValue = 0//math.min(FEsoln);
      let maxValue_coord = math.max(FEcoord);
      let minValue_coord = math.min(FEcoord);
      let delta = math.abs(minValue);
      delta = math.ceil(delta, 1);
      let nshades = math.ceil((maxValue + delta) * 100);
      let colors = colormap({
        colormap: "jet",
        nshades: nshades,
        format: "rgba",
        alpha: 1,
      });

      let rotMatrix = [
        [math.cos(math.PI / 2), -math.sin(math.PI / 2)],
        [math.sin(math.PI / 2), math.cos(math.PI / 2)],
      ];
      //print node
      if (maxValue_coord == 1 && minValue_coord == 0) {
        for (let i = 0; i <= FEcoordNode.length - 1; i++) {
          // scale
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
          // scale
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
            // //scale
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
      } else {
        for (let i = 0; i <= FEcoordNode.length - 1; i++) {
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
    // this.drawColorBar_GL();
    this.fillElementsGL(FEsoln[0].data);

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
        // //scale
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

  fillElementsGL(FeSoln_value) {
    this.drawColorBar_GL(FeSoln_value)
    const FEcoordElem = JSON.parse(JSON.stringify(FEcoord));
    let rotMatrix = [
      [math.cos(math.PI / 2), -math.sin(math.PI / 2)],
      [math.sin(math.PI / 2), math.cos(math.PI / 2)],
    ];
    let maxValue = math.max(FeSoln_value);
    let minValue = math.min(FeSoln_value);
    let maxValue_coord = math.max(FEcoord);
    let minValue_coord = math.min(FEcoord);
    let delta = math.abs(minValue);
    delta = math.ceil(delta, 1);
    let nshades = math.ceil((maxValue + delta) * 100);
    let colors = colormap({
      colormap: "jet",
      nshades: nshades,
      format: "rgba",
      alpha: 1,
    });
    let colors1 = colormap({
      colormap: "phase",
      nshades: nshades,
      format: "rgba",
      alpha: 1,
    });
    let colors2 = colormap({
      colormap: "cubehelix",
      nshades: nshades,
      format: "rgba",
      alpha: 1,
    });
    DrawGL.fillcolor = [];
    DrawGL.colorvec4 = [];
    DrawGL.point_x = [];
    DrawGL.point_y = [];
    DrawGL.scene_fill = [];
    DrawGL3D.sceneFill = [];
    DrawGL3D.colorNode = [];
    DrawGL3D.point_color = [];    
    DrawGL3D.point_color1 = [];    
    DrawGL3D.point_color_vec4 = [];  
    if (maxValue_coord == 1 && minValue_coord == 0) {
      for (let surface of FEtri) {
        let coordXs = [];
        let coordYs = [];
        let nodeColors = [];
        let nodeIndex = surface[0];
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
        DrawGL.point_x.push(nodeCoord[0]);
        DrawGL.point_y.push(nodeCoord[1]);
        //color
        let colorIndex = math.round((FeSoln_value[nodeIndex - 1] - minValue) / (maxValue - minValue) * (nshades - 1));
        let color = colors[colorIndex];
        nodeColors.push(color);
        DrawGL.fillcolor.push(color);
        let nodeIndex1 = surface[2];
        let nodeCoord1 = [...FEcoordElem[nodeIndex1 - 1]];
        //scale
        nodeCoord1[0] *= scale;
        nodeCoord1[1] *= scale;
        //move system
        nodeCoord1[0] -= 100;
        nodeCoord1[1] -= 100;
        //rot
        nodeCoord1 = math.multiply(nodeCoord1, rotMatrix);
        nodeCoord1 = nodeCoord1.flat();
        //move system
        nodeCoord1[0] += baseCoord[0] + 100;
        nodeCoord1[1] += baseCoord[1] + 100;
        coordXs.push(nodeCoord1[0]);
        coordYs.push(nodeCoord1[1]);
        DrawGL.point_x.push(nodeCoord1[0]);
        DrawGL.point_y.push(nodeCoord1[1]);
        //color
        let colorIndex1 = math.round((FeSoln_value[nodeIndex1 - 1] - minValue) / (maxValue - minValue) * (nshades - 1));
        let color1 = colors[colorIndex1];
        nodeColors.push(color1);
        DrawGL.fillcolor.push(color1);
        let nodeIndex2 = surface[1];
        let nodeCoord2 = [...FEcoordElem[nodeIndex2 - 1]];
        //scale
        nodeCoord2[0] *= scale;
        nodeCoord2[1] *= scale;
        //move system
        nodeCoord2[0] -= 100;
        nodeCoord2[1] -= 100;
        //rot
        nodeCoord2 = math.multiply(nodeCoord2, rotMatrix);
        nodeCoord2 = nodeCoord2.flat();
        //move system
        nodeCoord2[0] += baseCoord[0] + 100;
        nodeCoord2[1] += baseCoord[1] + 100;
        coordXs.push(nodeCoord2[0]);
        coordYs.push(nodeCoord2[1]);
        DrawGL.point_x.push(nodeCoord2[0]);
        DrawGL.point_y.push(nodeCoord2[1]);
        //color
        let colorIndex2 = math.round((FeSoln_value[nodeIndex2 - 1] - minValue) / (maxValue - minValue) * (nshades - 1));
        let color2 = colors[colorIndex2];
        nodeColors.push(color2);
        DrawGL.fillcolor.push(color2);
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
          DrawGL.point_x.push(nodeCoord[0]);
          DrawGL.point_y.push(nodeCoord[1]);
          //color
          let colorIndex = math.round((FeSoln_value[nodeIndex - 1] - minValue) / (maxValue - minValue) * (nshades - 1));
          let color = colors[colorIndex];
          nodeColors.push(color);
          DrawGL.fillcolor.push(color);
        }
        for (let i = 0; i < surface.length; i++) {
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
          DrawGL3D.point_x.push(nodeCoord[0]);
          DrawGL3D.point_y.push(nodeCoord[1]);
          //color
          let colorIndex = math.round((FeSoln_value[nodeIndex - 1] - minValue) / (maxValue - minValue) * (nshades - 1));
          let color = colors1[colorIndex];
          nodeColors.push(color);
          DrawGL3D.point_color.push(color);
        }
        for (let i = 0; i < surface.length; i++) {
          let nodeIndex = surface[i];
          //color
          let colorIndex = math.round((FeSoln_value[nodeIndex - 1] - minValue) / (maxValue - minValue) * (nshades - 1));
          let color1 = colors2[colorIndex];
          DrawGL3D.point_color.push(color1);
        }
      }
    } else {
      for (let surface of FEtri) {
        let coordXs = [];
        let coordYs = [];
        let nodeColors = [];
        let nodeIndex = surface[0];
        let nodeCoord = [...FEcoordElem[nodeIndex - 1]];
        coordXs.push(nodeCoord[0]);
        coordYs.push(nodeCoord[1]);
        DrawGL.point_x.push(nodeCoord[0]);
        DrawGL.point_y.push(nodeCoord[1]);
        //color
        let colorIndex = math.round((FeSoln_value[nodeIndex - 1] - minValue) / (maxValue - minValue) * (nshades - 1));
        let color = colors[colorIndex];
        nodeColors.push(color);
        DrawGL.fillcolor.push(color);
        let nodeIndex1 = surface[2];
        let nodeCoord1 = [...FEcoordElem[nodeIndex1 - 1]];
        coordXs.push(nodeCoord1[0]);
        coordYs.push(nodeCoord1[1]);
        DrawGL.point_x.push(nodeCoord1[0]);
        DrawGL.point_y.push(nodeCoord1[1]);
        //color
        let colorIndex1 = math.round((FeSoln_value[nodeIndex1 - 1] - minValue) / (maxValue - minValue) * (nshades - 1));
        let color1 = colors[colorIndex1];
        nodeColors.push(color1);
        DrawGL.fillcolor.push(color1);
        let nodeIndex2 = surface[1];
        let nodeCoord2 = [...FEcoordElem[nodeIndex2 - 1]];
        coordXs.push(nodeCoord2[0]);
        coordYs.push(nodeCoord2[1]);
        DrawGL.point_x.push(nodeCoord2[0]);
        DrawGL.point_y.push(nodeCoord2[1]);
        //color
        let colorIndex2 = math.round((FeSoln_value[nodeIndex2 - 1] - minValue) / (maxValue - minValue) * (nshades - 1));
        let color2 = colors[colorIndex2];
        nodeColors.push(color2);
        DrawGL.fillcolor.push(color2);
        for (let i = 0; i < surface.length - 3; i++) {
          let nodeIndex3 = surface[i];
          let nodeCoord3 = [...FEcoordElem[nodeIndex3 - 1]];
          coordXs.push(nodeCoord3[0]);
          coordYs.push(nodeCoord3[1]);
          DrawGL.point_x.push(nodeCoord3[0]);
          DrawGL.point_y.push(nodeCoord3[1]);
          //color
          let colorIndex3 = math.round((FeSoln_value[nodeIndex3 - 1] - minValue) / (maxValue - minValue) * (nshades - 1));
          let color3 = colors[colorIndex3];
          nodeColors.push(color3);
          DrawGL.fillcolor.push(color3);
        }
        for (let i = 0; i < surface.length; i++) {
          let nodeIndex = surface[i];
          let nodeCoord = [...FEcoordElem[nodeIndex - 1]];
          coordXs.push(nodeCoord[0]);
          coordYs.push(nodeCoord[1]);
          DrawGL3D.point_x.push(nodeCoord[0]);
          DrawGL3D.point_y.push(nodeCoord[1]);
          //color
          let colorIndex = math.round((FeSoln_value[nodeIndex - 1] - minValue) / (maxValue - minValue) * (nshades - 1));
          let color = colors1[colorIndex];
          nodeColors.push(color);
          DrawGL3D.point_color.push(color);
        }
        for (let i = 0; i < surface.length; i++) {
          let nodeIndex = surface[i];
          //color
          let colorIndex = math.round((FeSoln_value[nodeIndex - 1] - minValue) / (maxValue - minValue) * (nshades - 1));
          let color1 = colors2[colorIndex];
          DrawGL3D.point_color1.push(color1);
        }
      }
    }

    for (let element of DrawGL.fillcolor) {
      for (let i = 0; i < element.length - 1; i++) {
        let r = math.round(math.round(element[i] / 255 * 10, 1) / 10, 2)
        DrawGL.colorvec4.push(r);
      }
      DrawGL.colorvec4.push(element[3]);
    }

    var bufferInfo_fill = twgl.createBufferInfoFromArrays(DrawGL.gl, {
      a_position: {
        numComponents: 2,
        data: DrawGL.takePoint,
      },
      color: DrawGL.colorvec4,
    });
    DrawGL.scene_fill.push({
      x: 0, y: 0, rotation: 0, scale: 1, bufferInfo: bufferInfo_fill
    })
    for (let i = 0; i < 2; i++) {
      DrawGL3D.colorNode.push(DrawGL.colorvec4);
    }
    DrawGL3D.colorNode = DrawGL3D.colorNode.flat();
    var bufferInfo = twgl.createBufferInfoFromArrays(DrawGL3D.gl, {
      a_position:{
        numComponents : 3, 
        data :DrawGL3D.nodeCoord
      },
      a_color: DrawGL3D.colorNode,
    })
    DrawGL3D.sceneFill.push(bufferInfo);
  }

  drawColorBar() {
    // draw elements
    let maxValue = math.max(FEsoln);
    let minValue = math.min(FEsoln);
    let delta = math.abs(minValue);
    delta = math.ceil(delta, 1);

    let xMin = 1000;
    let xMax = 500;
    let yMin = 0;
    let yMax = 400;
    let xCBSpace = 0;

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
    let dValue = (maxValue - minValue) / (n - 1);
    let value = math.range(minValue, maxValue + dValue, dValue);
    value._data.reverse();;
    for (let i = 0; i <= rangeY._data.length - 1; i++) {
      //fill block
      PaintIn.ctx.fillStyle = barcolors[i];
      PaintIn.ctx.fillRect(base[0], rangeY._data[i], width, dy);
      //render value of block
      let xTextSpace = 15;
      let xPos = base[0] + width + xTextSpace;
      let yPos = rangeY._data[i] + dy / 2 + 2;
      PaintIn.ctx.strokeText(math.round(value._data[i], 2), xPos, yPos);

      //draw box
      PaintIn.ctx.rect(base[0], base[1], width, yMax - base[1]);
      PaintIn.ctx.stroke();
    }
  }


  drawColorBar_GL(FeSoln_value) {
    DrawGL.gl_colorbar.clear(DrawGL.gl_colorbar.COLOR_BUFFER_BIT)
    DrawGL.ctx_gl.clearRect(0, 0, 65, 400);
    let maxValue = math.max(FeSoln_value);
    let minValue = math.min(FeSoln_value);
    let delta = math.abs(minValue);
    delta = math.ceil(delta, 1);

    let xMax = 500;
    let yMin = 0;
    let yMax = 400;
    let xCBSpace = 0;

    let n = 20;
    let base = [xMax + xCBSpace, yMin];
    let width = 50;
    let height = yMax - base[1];
    let dy = height / n;
    let rangeY = math.range(base[1], yMax, dy);
    let barcolors_vec4 = colormap({
      colormap: "jet",
      nshades: n,
      format: "rgba",
      alpha: 1,
    });
    barcolors_vec4.reverse();
    let dValue = (maxValue - minValue) / (n - 1);
    let value = math.range(minValue, maxValue + dValue, dValue);
    value._data.reverse();
    DrawGL.colorbar_size = [];
    DrawGL.scene_color = [];
    for (let i = 0; i <= rangeY._data.length - 1; i++) {
      //fill block
      let vec4color = [];
      DrawGL.colorbar_indices = [];
      for (let j = 0; j < barcolors_vec4[i].length - 1; j++) {
        let r = math.round(math.round(barcolors_vec4[i][j] / 255 * 10, 1) / 10, 2)
        vec4color.push(r)
      }
      vec4color.push(barcolors_vec4[i][3]);
      DrawGL.colorbar_size.push(0);
      DrawGL.colorbar_size.push(rangeY._data[i]);
      DrawGL.colorbar_size.push(0 + width);
      DrawGL.colorbar_size.push(rangeY._data[i]);
      DrawGL.colorbar_size.push(0 + width);
      DrawGL.colorbar_size.push((rangeY._data[i] + dy));
      DrawGL.colorbar_size.push(0);
      DrawGL.colorbar_size.push((rangeY._data[i] + dy));
      DrawGL.colorbar_indices.push(4 * i);
      DrawGL.colorbar_indices.push(4 * i + 1);
      DrawGL.colorbar_indices.push(4 * i + 2);
      DrawGL.colorbar_indices.push(4 * i);
      DrawGL.colorbar_indices.push(4 * i + 2);
      DrawGL.colorbar_indices.push(4 * i + 3);
      let yPos = rangeY._data[i] + dy / 2 + 5;
      DrawGL.ctx_gl.font = "13px Arial";
      DrawGL.ctx_gl.fillText(value._data[i].toExponential(2), 3, yPos);

      var bufferInfo_fill = twgl.createBufferInfoFromArrays(DrawGL.gl_colorbar, {
        a_position: {
          numComponents: 2,
          data: DrawGL.colorbar_size,
        },
        indices: DrawGL.colorbar_indices,
      });
      DrawGL.scene_color.push({
        x: 0, y: 0, rotation: 0, scale: 1, color: vec4color, bufferInfo: bufferInfo_fill
      })
    }
    DrawGL.colorBar();
  }
}

Mesh.nodes = [];
Mesh.edges = [];
Mesh.elements = [];
Mesh.objects = [];

Mesh.curValFillColor = document.getElementById("fillColor");
Mesh.inputData = undefined;
