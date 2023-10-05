class dataGL {
  constructor(receivedData) {
    this.data = JSON.parse(receivedData)
    this.tri = this.data["tri"]
    this.coord = this.data["coord"]
    this.u = []
    this.node = []
    this.element = []

    this.red_bits = DrawGL3D.gl.getParameter(DrawGL3D.gl.RED_BITS);
    this.green_bits = DrawGL3D.gl.getParameter(DrawGL3D.gl.GREEN_BITS);
    this.blue_bits = DrawGL3D.gl.getParameter(DrawGL3D.gl.BLUE_BITS);
    this.alpha_bits = DrawGL3D.gl.getParameter(DrawGL3D.gl.ALPHA_BITS);
    this.total_bits = this.alpha_bits + this.blue_bits + this.green_bits + this.alpha_bits;

    this.red_scale = Math.pow(2, this.red_bits);
    this.green_scale = Math.pow(2, this.green_bits);
    this.blue_scale = Math.pow(2, this.blue_bits);
    this.total_scale = Math.pow(2, this.total_bits);

    this.red_shift = Math.pow(2, this.green_bits + this.blue_bits + this.alpha_bits);
    this.green_shift = Math.pow(2, this.blue_bits + this.alpha_bits);
    this.blue_bits = Math.pow(2, this.alpha_bits);

    FEsoln = []
  }
  clearData() {
    Mesh.elements = [];
    Mesh.edges = [];
    Mesh.nodes = [];
    DrawGL.nearPointGL_storage = [{ x: 0, y: 0 }, 0];
    DrawGL3D.pointStorage = { x: 0, y: 0, z: 0 };
    DrawGL.color = [1, 1, 1, 1];
    DrawGL3D.ui = {
      dragging: false,
      mouse: {
        lastX: -1,
        lastY: -1,
      },
    };

    DrawGL3D.mouse = {
      prevMouseX: 0,
      prevMouseY: 0
    };
    DrawGL3D.mouseX = -1;
    DrawGL3D.mouseY = -1;
    DrawGL3D.point_x = [];
    DrawGL3D.point_y = [];
    DrawGL3D.target = [0, 0, 0];
    DrawGL3D.up = [0, 1, 0];
    DrawGL3D.takeValueRange = [];
    DrawGL3D.nodeCoord = [];
    DrawGL3D.colorNode = [];
    DrawGL3D.lineBase = [];
    DrawGL3D.lineMeshExtrude = [];
    DrawGL3D.takePoint = [];
    DrawGL3D.takePoint_Extrude = [];
    DrawGL3D.sceneFill = [];
    DrawGL3D.sceneMesh = [];
    DrawGL3D.valueFilter = [];
    DrawGL3D.node = [];
    DrawGL3D.u_id = [];
    DrawGL.camera = {
      x: 0,
      y: 0,
      rotation: 0,
      zoom: 1,
    }
    document.getElementById("fillColor").value = "Off";
    DrawGL.nearPointGL = [];
    DrawGL.lineVertex = [];
    DrawGL.point_x = [];
    DrawGL.point_y = [];
    DrawGL.segment_mesh = [];
    DrawGL.segment_fill = [];
    DrawGL.segment = [];
    DrawGL.takePoint = [];
    DrawGL.fillcolor = [];
    DrawGL.colorbar_size = [];
    DrawGL.colorbar_indices = [];
    DrawGL.pointcheck = [];
    DrawGL.takevalueRange = [];
    DrawGL.scene = [];
    DrawGL.scene_fill = [];
    DrawGL.scene_color = [];
    DrawGL.scene_load = [];
    DrawGL.colorvec4 = [];
    DrawGL.ctx_gl.clearRect(0, 0, 65, 400);
    DrawGL.drawMain();
    DrawGL3D.drawMain();
    DrawGL.gl_colorbar.clear(DrawGL.gl_colorbar.COLOR_BUFFER_BIT)
    document.getElementById("filter").innerHTML = ``;
    document.getElementById("filter").style.display = "none";
    document.getElementById("modeSolution_value").style.display = "none";
    document.getElementById("modeSolution_value").value = "2D";
    document.getElementById("property_solution").style.display = "none";
  }
  createElement() {
    document.getElementById("modeSolution_value").style.display = "block";
    document.getElementById("filter").style.display = "block";
    for (let value in this.data) {
      if (value !== 'phi' && value !== 'err' && value !== 'area' && value !== 'perimeter' && value !== 'p' && value !== 'tri' && value !== 'coord') {
        this.u.push({ name: value, data: this.data[value] });
        FEsoln.push({ name: value, data: this.data[value] });
        document.getElementById("filter").innerHTML += `
              <option value=${value}>${value}</option>
            `
      }
    }
    const FEcoordNode = JSON.parse(JSON.stringify(this.coord));
    for (let i = 0; i <= FEcoordNode.length - 1; i++) {
      let point = processingData.prototype.createPoint(
        [FEcoordNode[i][0]],
        [FEcoordNode[i][1]],
        Array(1).fill(null),
        Array(1).fill(null)
      );
      // let point = new Point()
      this.node.push(point[0]);
    }
    const FEcoordLine = JSON.parse(JSON.stringify(this.coord));
    let point1;
    let point2;
    let arrElem = [];
    // console.log(FEcoordLine);
    for (let surface of this.tri) {
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
        let nextNodeCoord = [...this.coord[indexOfNextNode - 1]];
        point2 = processingData.prototype.createPoint(
          [nextNodeCoord[0]],
          [nextNodeCoord[1]],
          Array(1).fill(null),
          Array(1).fill(null)
        );
        let edge1 = new Line(point1[0], point2[0], null, "black", 0.5);
        // Mesh.edges.push(edge1);
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
      // Mesh.edges.push(edge2);

      arrElem.push(edge2);
      let elem = new Area(arrElem, null);
      this.element.push(elem);
    }
  }
  proccesingData() {
    this.clearData();
    this.createElement();
    this.visualizeData();
    for (let i = 0; i < this.node.length; i++) {
      const id = i + 1;
      DrawGL3D.u_id.push(((id >> 0) & 0xFF) / 0xFF,
        ((id >> 8) & 0xFF) / 0xFF,
        ((id >> 16) & 0xFF) / 0xFF,
        ((id >> 24) & 0xFF) / 0xFF,)
    }
    for (let i = 0; i < this.node.length; i++) {
      DrawGL.takevalueRange.push(
        { coord: [this.node[i].x, this.node[i].y] }
      );
      DrawGL3D.takeValueRange.push(
        { coord: [this.node[i].x, this.node[i].y, 0] },
        // { coord: [this.node[i].x, this.node[i].y, 100] }
      );
    }
    var count = 0;
    for (let j = 0; j < DrawGL.takevalueRange.length; j++) {
      for (let i = 0; i < this.u.length; i++) {
        const value1 = this.u[i].name;
        DrawGL.takevalueRange[j] = { ...DrawGL.takevalueRange[j], [value1]: this.u[i].data[j] };
        DrawGL3D.takeValueRange[count] = { ...DrawGL3D.takeValueRange[count], [value1]: this.u[i].data[j] };
        // DrawGL3D.takeValueRange[count + 1] = { ...DrawGL3D.takeValueRange[count + 1], [value1]: this.u[i].data[j] };
      }
      count += 1;
    }

    // Max element for Uint16array is 10921 elements;
    var max_element = 10921;
    var count_element = this.element.length / max_element;
    if (count_element % 1 !== 0) {
      count_element = Math.round(count_element) + 1;
    }
    for (let i = 0; i < count_element; i++) {
      DrawGL.segment_mesh = [];
      DrawGL.lineVertex = [];
      DrawGL3D.lineBase = [];
      DrawGL3D.lineMeshExtrude = [];
      let count = 0;
      let test = this.element.length - max_element * i;
      let max = max_element * i;
      for (let z = max; z < this.element.length; z++) {
        DrawGL.lineVertex.push(this.element[z].pointFlow)
      }
      for (let j = 0; j <= test; j++) {
        if (count == max_element + 1) break;
        // put indices for lines
        DrawGL.segment_mesh.push(6 * j);
        DrawGL.segment_mesh.push(6 * j + 1);
        DrawGL.segment_mesh.push(6 * j + 1);
        DrawGL.segment_mesh.push(6 * j + 2);
        DrawGL.segment_mesh.push(6 * j + 2);
        DrawGL.segment_mesh.push(6 * j + 3);
        DrawGL.segment_mesh.push(6 * j + 3);
        DrawGL.segment_mesh.push(6 * j + 4);
        DrawGL.segment_mesh.push(6 * j + 4);
        DrawGL.segment_mesh.push(6 * j + 5);
        DrawGL.segment_mesh.push(6 * j + 5);
        DrawGL.segment_mesh.push(6 * j);
        count = count + 1;
      }
      DrawGL.lineVertex = DrawGL.lineVertex.flat();
      for (let k = 0; k < DrawGL.lineVertex.length; k++) {
        DrawGL.pointcheck.push(DrawGL.lineVertex[k])
      }
      var color = [];

      for (let l = 0; l < DrawGL.pointcheck.length; l++) {
        DrawGL3D.lineBase.push(DrawGL.pointcheck[l][0]);
        DrawGL3D.lineBase.push(DrawGL.pointcheck[l][1]);
        DrawGL3D.lineBase.push(0);
      }

      // for (let m = 0; m < DrawGL.pointcheck.length; m++) {
      //   DrawGL3D.lineMeshExtrude.push(DrawGL.pointcheck[m][0]);
      //   DrawGL3D.lineMeshExtrude.push(DrawGL.pointcheck[m][1]);
      //   DrawGL3D.lineMeshExtrude.push(100);
      // }
      DrawGL.lineVertex = DrawGL.lineVertex.flat();
      var bufferInfo_mesh = twgl.createBufferInfoFromArrays(DrawGL.gl, {
        a_position: {
          numComponents: 2,
          data: DrawGL.lineVertex,
        },
        indices: DrawGL.segment_mesh,
      });
      var bufferInfo_mesh_base = twgl.createBufferInfoFromArrays(DrawGL3D.gl, {
        a_position: DrawGL3D.lineBase,
        indices: DrawGL.segment_mesh,
      });
      // var bufferInfo_mesh_second = twgl.createBufferInfoFromArrays(DrawGL3D.gl, {
      //   a_position: DrawGL3D.lineMeshExtrude,
      //   indices: DrawGL.segment_mesh,
      // });
      DrawGL3D.sceneMesh.push(bufferInfo_mesh_base);
      // DrawGL3D.sceneMesh.push(bufferInfo_mesh_second);
      DrawGL.scene.push(
        {
          x: 0, y: 0, rotation: 0, scale: 1, bufferInfo: bufferInfo_mesh
        },
      )
    }

    var point_2D = []
    var point_3D = []
    for (let i = 0; i < DrawGL3D.takeValueRange.length; i++) {
      point_3D.push(DrawGL3D.takeValueRange[i].coord)
      point_2D.push(DrawGL.takevalueRange[i].coord)
    }
    point_3D = point_3D.flat();
    point_2D = point_2D.flat();
    var bufferNode = twgl.createBufferInfoFromArrays(DrawGL3D.gl, {
      a_position: point_3D,
      a_color: DrawGL3D.u_id
    })
    var bufferNode2D = twgl.createBufferInfoFromArrays(DrawGL.gl, {
      a_position: {
        numComponents: 2,
        data: point_2D
      },
      a_color: DrawGL3D.u_id
    })
    DrawGL3D.node.push(bufferNode)
    DrawGL.node.push(bufferNode2D)
    for (let i = 0; i < DrawGL.point_x.length; i++) {
      DrawGL.takePoint.push(DrawGL.point_x[i]);
      DrawGL.takePoint.push(DrawGL.point_y[i]);
    }
    for (let i = 0; i < 2; i++) {
      if (i % 2 == 0) {
        for (let i = 0; i < DrawGL.point_x.length; i++) {
          DrawGL3D.nodeCoord.push(DrawGL.point_x[i]);
          DrawGL3D.nodeCoord.push(DrawGL.point_y[i]);
          DrawGL3D.nodeCoord.push(0);
        }
      } else {
        // for (let i = 0; i < DrawGL.point_x.length; i++) {
        //   DrawGL3D.nodeCoord.push(DrawGL.point_x[i]);
        //   DrawGL3D.nodeCoord.push(DrawGL.point_y[i]);
        //   DrawGL3D.nodeCoord.push(100);
        // }
      }
    }
    for (let i = 0; i < 2; i++) {
      if (i % 2 == 0) {
        for (let i = 0; i < DrawGL3D.point_x.length; i++) {
          DrawGL3D.takePoint.push({ x: DrawGL3D.point_x[i], y: DrawGL3D.point_y[i], z: 0 });
        }
      } else {
        // for (let i = 0; i < DrawGL3D.point_x.length; i++) {
        //   DrawGL3D.takePoint_Extrude.push({ x: DrawGL3D.point_x[i], y: DrawGL3D.point_y[i], z: 100 });
        // }
      }
    }

    DrawGL3D.colorNode = DrawGL3D.colorNode.flat();
    var bufferInfo_fill = twgl.createBufferInfoFromArrays(DrawGL.gl, {
      a_position: {
        numComponents: 2,
        data: DrawGL.takePoint,
      },
      color: DrawGL.colorvec4,
    });

    DrawGL3D.camera = {
      rotation_X: 0, // degrees
      rotation_Y: 0, // degrees
      rotation_Z: 0, // degrees
      Deep: 400000,
      Zoom: 1,
      translation_x: 0,
      translation_y: 0,
      translation_z: math.max(math.abs(DrawGL.pointcheck)),
    }
    // render();
    var bufferInfo = twgl.createBufferInfoFromArrays(DrawGL3D.gl, {
      a_position: DrawGL3D.nodeCoord,
      a_color: DrawGL3D.colorNode,
    })
    DrawGL3D.sceneFill.push(bufferInfo);
    DrawGL3D.drawMain();
    ChangeModeGL3D();
    ChangeModeGL();
    DrawGL.scene_fill.push({
      x: 0, y: 0, rotation: 0, scale: 1, bufferInfo: bufferInfo_fill
    })
    DrawGL.drawMain();
  }
  visualizeData(data = this.u[0].data) {
    this.colorBar(data)
    const FEcoordElem = JSON.parse(JSON.stringify(this.coord));
    let rotMatrix = [
      [math.cos(math.PI / 2), -math.sin(math.PI / 2)],
      [math.sin(math.PI / 2), math.cos(math.PI / 2)],
    ];
    let maxValue = math.max(data);
    let minValue = math.min(data);
    let maxValue_coord = math.max(this.coord);
    let minValue_coord = math.min(this.coord);
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
      for (let surface of this.tri) {
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
        let colorIndex = math.round((data[nodeIndex - 1] - minValue) / (maxValue - minValue) * (nshades - 1));
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
        let colorIndex1 = math.round((data[nodeIndex1 - 1] - minValue) / (maxValue - minValue) * (nshades - 1));
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
        let colorIndex2 = math.round((data[nodeIndex2 - 1] - minValue) / (maxValue - minValue) * (nshades - 1));
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
          let colorIndex = math.round((data[nodeIndex - 1] - minValue) / (maxValue - minValue) * (nshades - 1));
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
          let colorIndex = math.round((data[nodeIndex - 1] - minValue) / (maxValue - minValue) * (nshades - 1));
          let color = colors1[colorIndex];
          nodeColors.push(color);
          DrawGL3D.point_color.push(color);
        }
        for (let i = 0; i < surface.length; i++) {
          let nodeIndex = surface[i];
          //color
          let colorIndex = math.round((data[nodeIndex - 1] - minValue) / (maxValue - minValue) * (nshades - 1));
          let color1 = colors2[colorIndex];
          DrawGL3D.point_color.push(color1);
        }
      }
    } else {
      for (let surface of this.tri) {
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
        let colorIndex = math.round((data[nodeIndex - 1] - minValue) / (maxValue - minValue) * (nshades - 1));
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
        let colorIndex1 = math.round((data[nodeIndex1 - 1] - minValue) / (maxValue - minValue) * (nshades - 1));
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
        let colorIndex2 = math.round((data[nodeIndex2 - 1] - minValue) / (maxValue - minValue) * (nshades - 1));
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
          let colorIndex3 = math.round((data[nodeIndex3 - 1] - minValue) / (maxValue - minValue) * (nshades - 1));
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
          let colorIndex = math.round((data[nodeIndex - 1] - minValue) / (maxValue - minValue) * (nshades - 1));
          let color = colors1[colorIndex];
          nodeColors.push(color);
          DrawGL3D.point_color.push(color);
        }
        for (let i = 0; i < surface.length; i++) {
          let nodeIndex = surface[i];
          //color
          let colorIndex = math.round((data[nodeIndex - 1] - minValue) / (maxValue - minValue) * (nshades - 1));
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
    for (let i = 0; i < 1; i++) {
      DrawGL3D.colorNode.push(DrawGL.colorvec4);
    }
    DrawGL3D.colorNode = DrawGL3D.colorNode.flat();
    var bufferInfo = twgl.createBufferInfoFromArrays(DrawGL3D.gl, {
      a_position: {
        numComponents: 3,
        data: DrawGL3D.nodeCoord
      },
      a_color: DrawGL3D.colorNode,
    })
    DrawGL3D.sceneFill.push(bufferInfo);
  }
  colorBar(data) {
    DrawGL.gl_colorbar.clear(DrawGL.gl_colorbar.COLOR_BUFFER_BIT)
    DrawGL.ctx_gl.clearRect(0, 0, 65, 400);
    let maxValue = math.max(data);
    let minValue = math.min(data);
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
  createID() {

  }
}
// var test

var visualizeData