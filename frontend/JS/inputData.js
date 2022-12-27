var nameID;

function inputName(x, y, obj) {
  nameID = new CanvasInput({
    canvas: document.getElementById("myCanvas"),
    x: x,
    y: y,
    fontSize: 18,
    fontFamily: "Arial",
    fontColor: "#212121",
    fontWeight: "bold",
    width: 45,
    height: 25,
    padding: 0,
    borderColor: "#000",
    borderRadius: 3,

    onsubmit: function () {
      PaintIn.drawText(obj, this.value());
      obj.name = this.value();
      if(obj.className === "Area"){
        obj.coordNaming = [PaintIn.mouseDownPos.x,PaintIn.mouseDownPos.y];
      }
      this.destroy();
      nameID = undefined;
      PaintIn.renderObject(processingData.allObject);
      PaintIn.isCancled = false;
    },
  });
  nameID.focus();
}

var nameIDs;

function inputNames(x, y) {
  nameIDs = new CanvasInput({
    canvas: document.getElementById("myCanvas"),
    x: x,
    y: y,
    fontSize: 18,
    fontFamily: "Arial",
    fontColor: "#212121",
    fontWeight: "bold",
    width: 25,
    height: 25,
    padding: 0,
    borderColor: "#000",
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
}

var valueLoad;
function inputForce(x, y, obj, loadKey) {
  valueLoad = new CanvasInput({
    canvas: document.getElementById("myCanvas"),
    x: x,
    y: y,
    fontSize: 13,
    fontFamily: "Arial",
    fontColor: "#212121",
    fontWeight: "bold",
    width: 50,
    height: 25,
    padding: 0,
    borderColor: "#000",
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
        if (this.value().includes(",") === true) {
          force_x = Number(this.value().slice(0, this.value().indexOf(",")));
          force_y = Number(
            this.value().slice(
              this.value().indexOf(",") + 1,
              this.value().length
            )
          );
        } else {
          force_x = Number(this.value());
          force_y = 0;
        }
        forceObj = {
          type: loadKey,
          parameters: { force_x: force_x, force_y: force_y },
        };
        obj.pointLoads.push(forceObj);
      } else if (loadKey === "normal_pressure") {
        //first check
        if (obj.lineLoads === null) {
          obj.lineLoads = [];
        }
        //
        let node_0;
        let node_1;
        if (this.value().includes(",") === true) {
          node_0 = Number(this.value().slice(0, this.value().indexOf(",")));
          node_1 = Number(
            this.value().slice(
              this.value().indexOf(",") + 1,
              this.value().length
            )
          );
        } else {
          node_0 = Number(this.value());
          node_1 = node_0;
        }
        let pressureObj = {
          type: loadKey,
          parameters: { node_0: node_0, node_1: node_1 },
        };
        obj.lineLoads.push(pressureObj);
      } else if (loadKey === "axial_pressure") {
        //first check
        if (obj.lineLoads === null) {
          obj.lineLoads = [];
        }
        //
        let value = Number(this.value());
        let axialPressureObj = { type: loadKey, parameters: { value: value } };
        obj.lineLoads.push(axialPressureObj);
      }
      this.destroy();
      valueLoad = undefined;
      PaintIn.renderObject(processingData.allObject);
      PaintIn.isCancled = false;
    },
  });
  valueLoad.focus();
}

var valueLoads;
function inputForces(x, y, loadKey) {
  valueLoads = new CanvasInput({
    canvas: document.getElementById("myCanvas"),
    x: x,
    y: y,
    fontSize: 13,
    fontFamily: "Arial",
    fontColor: "#212121",
    fontWeight: "bold",
    width: 50,
    height: 25,
    padding: 0,
    borderColor: "#000",
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
          if (this.value().includes(",") === true) {
            force_x = Number(this.value().slice(0, this.value().indexOf(",")));
            force_y = Number(
              this.value().slice(
                this.value().indexOf(",") + 1,
                this.value().length
              )
            );
          } else {
            force_x = Number(this.value());
            force_y = 0;
          }
          forceObj = {
            type: loadKey,
            parameters: { force_x: force_x, force_y: force_y },
          };
          obj.pointLoads.push(forceObj);
        } else if (loadKey === "normal_pressure") {
          //first check
          if (obj.lineLoads === null) {
            obj.lineLoads = [];
          }
          //
          let node_0;
          let node_1;
          if (this.value().includes(",") === true) {
            node_0 = Number(this.value().slice(0, this.value().indexOf(",")));
            node_1 = Number(
              this.value().slice(
                this.value().indexOf(",") + 1,
                this.value().length
              )
            );
          } else {
            node_0 = Number(this.value());
            node_1 = node_0;
          }
          let pressureObj = {
            type: loadKey,
            parameters: { node_0: node_0, node_1: node_1 },
          };
          obj.lineLoads.push(pressureObj);
        } else if (loadKey === "axial_pressure") {
          //first check
          if (obj.lineLoads === null) {
            obj.lineLoads = [];
          }
          //
          let value = Number(this.value());
          let axialPressureObj = {
            type: loadKey,
            parameters: { value: value },
          };
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
}

var valueMoment;
function inputMoment(x, y, obj, loadKey) {
  valueMoment = new CanvasInput({
    canvas: document.getElementById("myCanvas"),
    x: x,
    y: y,
    fontSize: 13,
    fontFamily: "Arial",
    fontColor: "#212121",
    fontWeight: "bold",
    width: 50,
    height: 25,
    padding: 0,
    borderColor: "#000",
    borderRadius: 3,

    onsubmit: function () {
      if (loadKey === "moment") {
        //first check
        if (obj.pointLoads === null) {
          obj.pointLoads = [];
        }
        //
        let moment = Number(this.value());
        momentObj = { type: loadKey, parameters: { value: moment } };
        obj.pointLoads.push(momentObj);
      }
      this.destroy();
      valueMoment = undefined;
      PaintIn.renderObject(processingData.allObject);
      PaintIn.isCancled = false;
    },
  });
  valueMoment.focus();
}

var valueMoments;
function inputMoments(x, y, loadKey) {
  valueMoments = new CanvasInput({
    canvas: document.getElementById("myCanvas"),
    x: x,
    y: y,
    fontSize: 13,
    fontFamily: "Arial",
    fontColor: "#212121",
    fontWeight: "bold",
    width: 50,
    height: 25,
    padding: 0,
    borderColor: "#000",
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
          momentObj = { type: loadKey, parameters: { value: moment } };
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
}

var lengthLine;
function inputLenght(x, y) {
  lengthLine = new CanvasInput({
    canvas: document.getElementById("myCanvas"),
    x: x,
    y: y,
    fontSize: 18,
    fontFamily: "Arial",
    fontColor: "#212121",
    fontWeight: "bold",
    width: 60,
    height: 25,
    padding: 0,
    borderColor: "#000",
    borderRadius: 3,

    onsubmit: function () {
      PaintIn.mouseMoveStatus = true;
      let firstPoint = [PaintIn.mouseDownPos.x, PaintIn.mouseDownPos.y];
      let currentMouseMove = [
        PaintIn.currentMouseMovePos.x,
        PaintIn.currentMouseMovePos.y,
      ];
      let vectU = math.subtract(currentMouseMove, firstPoint);
      let vectU_ = math.divide(vectU, math.norm(vectU));
      let length = Number(this.value());
      let nextPoint = math.add(firstPoint, math.multiply(vectU_, length));
      let spaceKey = new KeyboardEvent("keydown", { keyCode: 32 });
      processingData.prototype.inputRawData(
        "line",
        [firstPoint[0], nextPoint[0]],
        [firstPoint[1], nextPoint[1]]
      );
      PaintIn.keyDown(spaceKey);
      // let nextPoint = getPoint(firstPoint, currentMouseMove, length);
      //simulate mousedown event to next point
      PaintIn.simulateMouseEvent("mousemove", nextPoint);
      PaintIn.simulateMouseEvent("mousedown", nextPoint);
      PaintIn.simulateMouseEvent("mouseup", nextPoint);
      this.destroy();
      lengthLine = undefined;
      console.log(nextPoint);
    },
  });
  lengthLine.focus();
}
//input by area comments
function inputComments() {
  let typeValue = JSON.stringify(
    PaintIn.valueComment.value.slice(
      PaintIn.valueComment.value.indexOf(",") + 1,
      PaintIn.valueComment.value.indexOf(",") + 2
    )
  );
  let objName = JSON.stringify(
    PaintIn.valueComment.value.slice(0, PaintIn.valueComment.value.indexOf(","))
  );
  const indexComma = [];
  for (let i = 0; i < PaintIn.valueComment.value.length; i++) {
    if (PaintIn.valueComment.value[i] === ",") {
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

        if (typeValue === JSON.stringify("f")) {
          let force_x;
          let force_y;

          force_x = Number(
            PaintIn.valueComment.value.slice(indexComma[1] + 1, indexComma[2])
          );
          force_y = Number(
            PaintIn.valueComment.value.slice(
              indexComma[2] + 1,
              PaintIn.valueComment.value.length
            )
          );

          let forceObj = {
            type: "force",
            parameters: { force_x: force_x, force_y: force_y },
          };
          obj.pointLoads.push(forceObj);
        } else if (typeValue === JSON.stringify("m")) {
          let moment = Number(
            PaintIn.valueComment.value.slice(
              indexComma[1] + 1,
              PaintIn.valueComment.value.length
            )
          );
          let momentObj = { type: "moment", parameters: { value: moment } };
          obj.pointLoads.push(momentObj);
        }
      } else if (obj.className === "Line") {
        //first check
        if (obj.lineLoads === null) {
          obj.lineLoads = [];
        }
        //
        if (typeValue === JSON.stringify("f")) {
          let node_0;
          let node_1;

          node_0 = Number(
            PaintIn.valueComment.value.slice(indexComma[1] + 1, indexComma[2])
          );
          node_1 = Number(
            PaintIn.valueComment.value.slice(
              indexComma[2] + 1,
              PaintIn.valueComment.value.length
            )
          );

          let pressureObj = {
            type: "normal_pressure",
            parameters: { node_0: node_0, node_1: node_1 },
          };
          obj.lineLoads.push(pressureObj);
        }
      }
    }
  }
  PaintIn.renderObject(processingData.allObject);
}

function inputComments() {
  if (PaintIn.valueComment.value.includes(",")) {
    let old_comma_index = 0;
    let inputValue = [];
    for (let i = 0; i < PaintIn.valueComment.value.length; i++) {
      if (PaintIn.valueComment.value[i] === ",") {
        inputValue.push(
          JSON.stringify(PaintIn.valueComment.value.slice(old_comma_index, i))
        );
        old_comma_index = i + 1;
      }
    }
    inputValue.push(
      JSON.stringify(
        PaintIn.valueComment.value.slice(
          old_comma_index,
          PaintIn.valueComment.value.length
        )
      )
    );
    console.log(inputValue);

    switch (inputValue[0]) {
      case "p":
        console.log("point");
        break;
      case "l":
        console.log("line");
        break;
      default:
        console.log(inputValue[0]);
    }
  }
}
// function getPoint(start, cur, l) {
//     let a = cur[0] - start[0];
//     let b = cur[1] - start[1];
//     let t = Math.sqrt(l * l / (a * a + b * b));
//     return [start[0] + a * t, start[1] + b * t];
// }

// var areaName;
// function inputAreaName(x, y, obj) {
//   areaName = new CanvasInput({
//     canvas: document.getElementById("myCanvas"),
//     x: x,
//     y: y,
//     fontSize: 18,
//     fontFamily: "Arial",
//     fontColor: "#212121",
//     fontWeight: "bold",
//     width: 25,
//     height: 25,
//     padding: 0,
//     borderColor: "#000",
//     borderRadius: 3,

//     onsubmit: function () {
//       PaintIn.drawText(obj, this.value());
//       obj.name = this.value();
//       this.destroy();
//       areaName = undefined;
//       PaintIn.renderObject(processingData.allObject);
//       PaintIn.isCancled = false;
//     },
//   });
//   areaName.focus();
// }
