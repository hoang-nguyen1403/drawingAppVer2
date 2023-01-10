class Paint {
  constructor() {
    this.canvas = document.getElementById("myCanvas");
    this.ctx = this.canvas.getContext("2d");

    this.canvas.width = document.getElementById("wrap_canvas_div").clientWidth;
    this.canvas.height =
      document.getElementById("wrap_canvas_div").clientHeight;

    this.toolbar = document.getElementById("tool_left");
    this.currentValueGrid = document.getElementById("grid");

    this.currentValueBrush = document.getElementById("brush");
    this.currentValueLine = document.getElementById("line");
    this.currentValueCircle = document.getElementById("circle");
    this.currentValueRect = document.getElementById("rect");
    this.currentValueSpl = document.getElementById("spl");
    this.curValSelect = "On";

    this.curValName = document.getElementById("valueName");

    this.curValPointLoad = document.getElementById("pointLoad");
    this.curValPressLoad = document.getElementById("pressLoad");
    // this.curValAxialForce = document.getElementById('axialForce');
    this.curValMoment = document.getElementById("moment");
    this.curValDeleteForce = document.getElementById("deleteForce");

    // //namigArea mode
    // this.curValNamingArea = document.getElementById("areaNaming");

    //addMode
    this.curValDrawing = document.getElementById("modeDrawing");
    //set defaul mode is drawing
    document.getElementById("modeDrawing").classList.add("active");

    //tab
    this.tabStatus = document.getElementById("tab-icon");
    this.valueComment = document.getElementById("textBox");

    //attLine
    this.currentColor = "black";
    this.currentWidth = 5;
    this.deltaGrid = 40;
    this.pen = "select";
    this.mouseMoveStatus = true;
    this.multiSelectTypeDefault = "Point";
    this.multiSelectType = this.multiSelectTypeDefault;
    this.minGrid = 5;
    this.maxGrid = 100;

    this.isCancled = false;
    this.currentMouseDownPos = {
      x: 0,
      y: 0,
    };

    this.currentMouseMovePos = {
      x: 0,
      y: 0,
    };
    this.lastMouseUpPos = {
      x: 0,
      y: 0,
    };
    this.curSelectBox = [];
    this.isPainting = false;
    this.listenEvent();

    this.image = null; //can go back
    this.choiceEvent();
    this.mouseDownPos = {
      x: 0,
      y: 0,
    };
    this.arrMouseDownPosition = [];
    this.arrLineColor = [];
    this.arrLineWidth = [];
    this.arrLineX = [];
    this.arrLineY = [];
    this.arrCircleX = [];
    this.arrCircleY = [];
    this.arrRectX = [];
    this.arrRectY = [];
    this.arrGrid = [];
    this.arrMove = []; // mouseMovePos
    this.arrSPL = [];
    this.arrSPLX = [];
    this.arrSPLY = [];

    this.getNodePos();
    this.arrRecordNode = [];
    //hidden div
    document.getElementById("BDCondition").style.display = "none";

    this.drawBackground();
    //----//
    this.arrCurObj = [];
    this.arrMultiCurObj = [];
    //addValue
    this.arrCurValueObj = [];
    // this.hasInput = false;
    this.curPoint = [];
    this.currentCursor = "url(frontend/img/select_cursor.svg) 0 0,  default";
    this.canvas.style.cursor = this.currentCursor;
    this.controlCanvas();
  }

  changeMode() {
    if (this.curValDrawing.value === "Off") {
      // mode drawing
      this.renderObject(processingData.allObject);
      this.curValDrawing.value = "On";
      document.getElementById("modeDrawing").classList.add("active");

      Mesh.curValFillColor.value = "Off";
      document.getElementById("fillColor").style.display = "none";

      this.mouseMoveStatus = true;
      this.pen = "select";
      this.curValSelect = "On";
    } else {
      //mode soln
      this.currentCursor = "url(frontend/img/select_cursor.svg) 0 0,  default";
      this.canvas.style.cursor = this.currentCursor;

      this.ctx.fillStyle = "white";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.curValDrawing.value = "Off";
      document.getElementById("modeDrawing").classList.remove("active");

      Mesh.curValFillColor.value = "Off";
      document.getElementById("fillColor").classList.remove("active");

      this.mouseMoveStatus = false;
      this.pen = undefined;
      this.curValSelect = "Off";

      //display soln
      if (Mesh.inputData !== undefined) {
        document.getElementById("command").style.display = "none";
        Mesh.prototype.drawMesh();
      } else {
        this.renderCommand("soln");
      }
    }
  }

  controlCanvas() {
    if ((this.curValDrawing.value = "Off")) {
      this.offButtonDraw(this.currentValueLine, "line");
    }
  }
  undo() {
    if (this.image !== null) {
      this.ctx.drawImage(
        this.image,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
    }
  }

  drawBackground() {
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  onOffButtonDraw(currentActive, nameID) {
    if (currentActive.value === "Off") {
      currentActive.value = "On";
      this.pen = nameID;
      this.curValSelect = "Off";
      this.mouseMoveStatus = true;
      document.getElementById(nameID).classList.add("active");
    } else {
      currentActive.value = "Off";
      this.pen = "select";
      this.curValSelect = "On";
      document.getElementById(nameID).classList.remove("active");
      //change cursor
      this.currentCursor = "url(frontend/img/select_cursor.svg) 0 0,  default";
      this.canvas.style.cursor = this.currentCursor;
    }
    // this.renderObject(processingData.allObject);
  }

  onButtonDraw(currentActive, nameID) {
    if (currentActive.value === "Off") {
      currentActive.value = "On";
      this.pen = nameID;
      this.curValSelect = "Off";
      this.mouseMoveStatus = true;
      document.getElementById(nameID).classList.add("active");
    }
  }

  offButtonDraw(currentActive, nameID) {
    if (currentActive.value === "On") {
      currentActive.value = "Off";
      this.pen = "select";
      this.curValSelect = "On";
      document.getElementById(nameID).classList.remove("active");
    }
    // this.renderObject(processingData.allObject);
  }

  onOffButton(currentActive, nameID) {
    if (currentActive.value === "Off") {
      currentActive.value = "On";
      //thuc hien chuc nang
      this.pen = undefined;
      this.curValSelect = "Off";
      this.mouseMoveStatus = true;
      document.getElementById(nameID).classList.add("active");
    } else {
      currentActive.value = "Off";
      document.getElementById(nameID).classList.remove("active");
      //change cursor
      this.currentCursor = "url(frontend/img/select_cursor.svg) 0 0,  default";
      this.canvas.style.cursor = this.currentCursor;
      this.curValSelect = "On";
      this.pen = "select";
    }
    // this.renderObject(processingData.allObject);
  }
  offButton(currentActive, nameID) {
    if (currentActive.value === "On") {
      currentActive.value = "Off";
      this.curValSelect = "On";
      this.pen = "select";
      document.getElementById(nameID).classList.remove("active");
    }
    // this.renderObject(processingData.allObject);
  }

  hiddenButton(nameID) {
    document.getElementById(nameID).style.display = "none";
  }

  visibleButton(nameID) {
    document.getElementById(nameID).style.display = "block";
  }

  keyDown(event) {
    //SPACE
    if (event.keyCode === 32) {
      //reset data
      this.arrLineX = [];
      this.arrLineY = [];
      this.arrCurObj = [];
      this.arrMultiCurObj = [];
      //
      this.isCancled = false;
      // processingData.prototype.separateData();
      if (this.pen === "line") {
        this.undo();
        processingData.prototype.areaDetect(processingData.allLine);
        this.addNode();
      }
    }
    //ESC
    if (event.keyCode === 27) {
      // processingData.prototype.separateData();
      if (this.pen === "line") {
        processingData.prototype.areaDetect(processingData.allLine);
      }
      this.isCancled = false;
      this.pen = "select";

      // if (this.currentValueSelect.value === "On") {
      //     this.pen = "select";
      // }
      // else {
      //     this.pen = '';
      // }
      // this.arr = [];
      this.arrLineX = [];
      this.arrLineY = [];
      this.arrCircleX = [];
      this.arrCircleY = [];
      this.arrRectX = [];
      this.arrRectY = [];
      this.arrMouseDownPosition = [];
      this.arrSPL = [];

      //destroy box input
      if (this.curValName.value === "On") {
        try {
          if (this.arrMultiCurObj[0] !== undefined) {
            nameIDs.destroy();
            nameIDs = undefined;
          } else {
            nameID.destroy();
            nameID = undefined;
          }
        } catch (error) {
          this.renderObject(processingData.allObject);
        }
      }

      if (
        this.curValPointLoad.value === "On" ||
        this.curValPressLoad.value === "On" ||
        this.curValMoment.value === "On"
      ) {
        try {
          if (this.arrMultiCurObj[0] !== undefined) {
            if (valueLoads !== undefined) {
              valueLoads.destroy();
              valueLoads = undefined;
            }
            if (valueMoments !== undefined) {
              valueMoments.destroy();
              valueMoments = undefined;
            }
          } else {
            if (valueLoad !== undefined) {
              valueLoad.destroy();
              valueLoad = undefined;
            }
            if (valueMoment !== undefined) {
              valueMoment.destroy();
              valueMoment = undefined;
            }
          }
        } catch (error) {
          this.renderObject(processingData.allObject);
        }
      }
      //delete after destroy input box to compare conditions
      this.arrMultiCurObj = [];
      this.arrCurObj = [];

      // add node to arrGrid
      this.addNode();
      // this.offButtonDraw(this.currentValueBrush, "brush");
      this.offButtonDraw(this.currentValueLine, "line");
      // this.offButtonDraw(this.currentValueRect, "rect");
      // this.offButtonDraw(this.currentValueCircle, "circle");
      // this.offButtonDraw(this.currentValueSpl, "spl");
      this.offButton(this.curValName, "valueName");
      this.offButton(this.curValPointLoad, "pointLoad");
      this.offButton(this.curValPressLoad, "pressLoad");
      // this.offButton(this.curValAxialForce, "axialForce");
      this.offButton(this.curValMoment, "moment");

      // document.getElementById("BDCondition").style.display = "none";

      //change cursor
      this.currentCursor = "url(frontend/img/select_cursor.svg) 0 0,  default";
      this.canvas.style.cursor = this.currentCursor;
      this.renderProperty("off", "");
      this.renderObject(processingData.allObject);
      //delete last selectBox
      this.curSelectBox = [];
    }

    //KEYUP
    if (event.keyCode === 38) {
      if (
        this.currentValueGrid.value == "On" &&
        this.deltaGrid <= this.maxGrid
      ) {
        this.deltaGrid += this.deltaGrid / 2;

        this.renderObject(processingData.allLine);

        this.arrGrid = [];
        this.getNodePos();
        this.arrRecordNode = this.removeDuplicates(this.arrRecordNode);
        this.arrGrid = this.concatArr(this.arrGrid, this.arrRecordNode);
        this.ctx.strokeStyle = "grey";
        this.drawGrid();
      }
      else if (dataLogFile.length > 1) {
        console.log('up')
        console.log(dataLogFileIndex)
        if (dataLogFileIndex === 0) {
          dataLogFileIndex += 1;
          document.getElementById("textBox").value = dataLogFile.at(dataLogFileIndex);

        }
        else if (dataLogFileIndex === dataLogFile.length - 1) {
          document.getElementById("textBox").value = dataLogFile.at(dataLogFileIndex);
        }
        else {
          dataLogFileIndex += 1;
          document.getElementById("textBox").value = dataLogFile.at(dataLogFileIndex);

        }

      }

      else if (dataLogFile.length === 1) {
        document.getElementById("textBox").value = dataLogFile.at(0);
      }
    }
    //KEYDOWN
    if (event.keyCode === 40) {
      if (
        this.currentValueGrid.value == "On" &&
        this.deltaGrid >= this.minGrid * 2
      ) {
        this.deltaGrid -= this.deltaGrid / 2;
        this.renderObject(processingData.allLine);

        this.arrGrid = [];
        this.getNodePos();
        this.arrRecordNode = this.removeDuplicates(this.arrRecordNode);
        this.arrGrid = this.concatArr(this.arrGrid, this.arrRecordNode);

        this.ctx.strokeStyle = "grey";
        this.drawGrid();
      }
      else if (dataLogFile.length > 1) {
        console.log('down')
        if (dataLogFileIndex === 0) {
          document.getElementById("textBox").value = dataLogFile.at(dataLogFileIndex);
        }
        else if (dataLogFileIndex === dataLogFile.length - 1) {
          document.getElementById("textBox").value = dataLogFile.at(dataLogFileIndex);
          dataLogFileIndex -= 1;
        }
        else {
          document.getElementById("textBox").value = dataLogFile.at(dataLogFileIndex);
          dataLogFileIndex -= 1;
        }

      }
      else if (dataLogFile.length === 1) {
        document.getElementById("textBox").value = dataLogFile.at(0);
      }
    }

    //DELETE
    if (event.keyCode === 46) {
      this.deleteCurObj();
    }
    //ENTER
    if (event.keyCode === 13) {
      if (this.valueComment.value !== "") {
        dataLogFile.push(this.valueComment.value);
        this.valueComment.value = "";
      }
      PaintIn.renderCommand("textCommands");
    }

    //F2 input length Line
    if (event.keyCode === 113 && lengthLine === undefined) {
      let currentLine;
      let startLine = this.mouseDownPos;
      let xC = (startLine.x + this.currentMouseMovePos.x) / 2;
      let yC = (startLine.y + this.currentMouseMovePos.y) / 2;
      inputLenght(xC, yC, currentLine);
      this.mouseMoveStatus = false;
    }

    //shortcut for draw line
    // press l
    if (event.keyCode === 76 && this.pen === "select") {
      //change cursor
      this.currentCursor = "url(frontend/img/pen_cursor.svg) 0 32, default";
      this.canvas.style.cursor = this.currentCursor;
      let spaceKey = new KeyboardEvent("keydown", { keyCode: 32 });
      this.keyDown(spaceKey);
      this.onButtonDraw(this.currentValueLine, "line");
      this.renderObject(processingData.allObject);
    }
  }

  concatArr(arr1, arr2) {
    return arr1.concat(arr2);
  }

  // chooseBrush() {
  //     this.offButtonDraw(this.currentValueLine, "line");
  //     this.offButtonDraw(this.currentValueSelect, "select");
  //     // this.offButtonDraw(this.currentValueSpl, "spl");
  //     // this.offButtonDraw(this.currentValueCircle, "circle");
  //     // this.offButtonDraw(this.currentValueRect, "rect");

  //     this.offButton(this.curValName, "valueName");
  //     this.offButton(this.curValPointLoad, "pointLoad");
  //     this.offButton(this.curValPressLoad, "pressLoad");
  //     // this.onOffButtonDraw(this.currentValueBrush, "brush");
  // }

  chooseLine() {
    //change cursor
    this.currentCursor = "url(frontend/img/pen_cursor.svg) 0 32, default";
    this.canvas.style.cursor = this.currentCursor;

    let spaceKey = new KeyboardEvent("keydown", { keyCode: 32 });
    this.keyDown(spaceKey);
    this.renderObject(processingData.allObject);

    // this.offButtonDraw(this.currentValueBrush, "brush");
    // this.offButtonDraw(this.currentValueSelect, "select");
    // this.offButtonDraw(this.currentValueSpl, "spl");
    // this.offButtonDraw(this.currentValueCircle, "circle");
    // this.offButtonDraw(this.currentValueRect, "rect");

    this.offButton(this.curValName, "valueName");
    this.offButton(this.curValPointLoad, "pointLoad");
    this.offButton(this.curValPressLoad, "pressLoad");
    // this.offButton(this.curValAxialForce, "axialForce");
    this.onOffButtonDraw(this.currentValueLine, "line");
    if (this.currentValueLine.value === "On") {
      this.renderCommand("line");
    } else {
      this.renderObject(processingData.allObject);
    }
  }

  // chooseCircle() {
  //     this.offButtonDraw(this.currentValueBrush, "brush");
  //     this.offButtonDraw(this.currentValueSelect, "select");
  //     this.offButtonDraw(this.currentValueSpl, "spl");
  //     this.offButtonDraw(this.currentValueLine, "line");
  //     this.offButtonDraw(this.currentValueRect, "rect");

  //     this.offButton(this.curValNamePoint, "valueNamePoint");
  //     this.offButton(this.curValNameLine, "valueNameLine");
  //     this.offButton(this.curValNameArea, "valueNameArea");
  //     this.offButton(this.curValPointLoad, "pointLoad");
  //     this.offButton(this.curValPressLoad, "pressLoad");

  //     this.onOffButtonDraw(this.currentValueCircle, "circle");
  // }

  // chooseRect() {
  //     this.offButtonDraw(this.currentValueBrush, "brush");
  //     this.offButtonDraw(this.currentValueSelect, "select");
  //     this.offButtonDraw(this.currentValueSpl, "spl");
  //     this.offButtonDraw(this.currentValueLine, "line");
  //     this.offButtonDraw(this.currentValueCircle, "circle");

  //     this.offButton(this.curValNamePoint, "valueNamePoint");
  //     this.offButton(this.curValNameLine, "valueNameLine");
  //     this.offButton(this.curValNameArea, "valueNameArea");
  //     this.offButton(this.curValPointLoad, "pointLoad");
  //     this.offButton(this.curValPressLoad, "pressLoad");

  //     this.onOffButtonDraw(this.currentValueRect, "rect");
  // }

  // chooseSpl() {
  //     this.offButtonDraw(this.currentValueBrush, "brush");
  //     this.offButtonDraw(this.currentValueSelect, "select");
  //     this.offButtonDraw(this.currentValueRect, "rect");
  //     this.offButtonDraw(this.currentValueLine, "line");
  //     this.offButtonDraw(this.currentValueCircle, "circle");

  //     this.offButton(this.curValNamePoint, "valueNamePoint");
  //     this.offButton(this.curValNameLine, "valueNameLine");
  //     this.offButton(this.curValNameArea, "valueNameArea");
  //     this.offButton(this.curValPointLoad, "pointLoad");
  //     this.offButton(this.curValPressLoad, "pressLoad");
  //     this.onOffButtonDraw(this.currentValueSpl, "spl");
  // }

  selectObj(event) {
    if (this.pen !== "select") {
      return;
    }
    //boundingbox select
    let topPoint = this.curSelectBox[0];
    let bottomPoint = this.curSelectBox[1];
    if (
      this.mouseDownPos.x !== this.lastMouseUpPos.x &&
      this.mouseDownPos.y !== this.lastMouseUpPos.y
    ) {
      //reset arrCurObj
      this.arrCurObj = [];
      this.arrMultiCurObj = [];
      //create select box
      if (bottomPoint[0] > topPoint[0] && bottomPoint[1] > topPoint[1]) {
        switch (this.multiSelectType) {
          case "Point": {
            processingData.allPoint.forEach((obj) => {
              if (obj.isInBox(topPoint, bottomPoint)) {
                this.arrMultiCurObj.push(obj);
              }
            });
            break;
          }
          case "Line": {
            processingData.allLine.forEach((obj) => {
              if (obj.isInBox(topPoint, bottomPoint)) {
                this.arrMultiCurObj.push(obj);
              }
            });
            break;
          }
          case "Area": {
            processingData.allArea.forEach((obj) => {
              if (obj.isInBox(topPoint, bottomPoint)) {
                this.arrMultiCurObj.push(obj);
              }
            });
            break;
          }
        }
      } else {
        switch (this.multiSelectType) {
          case "Point": {
            processingData.allPoint.forEach((obj) => {
              if (obj.isTouchBox(topPoint, bottomPoint)) {
                this.arrMultiCurObj.push(obj);
              }
            });
            break;
          }
          case "Line": {
            processingData.allLine.forEach((obj) => {
              if (obj.isTouchBox(topPoint, bottomPoint)) {
                this.arrMultiCurObj.push(obj);
              }
            });
            break;
          }
          case "Area": {
            processingData.allArea.forEach((obj) => {
              if (obj.isTouchBox(topPoint, bottomPoint)) {
                this.arrMultiCurObj.push(obj);
              }
            });
            break;
          }
        }
      }
      //set defaul obj type
      this.multiSelectType = this.multiSelectTypeDefault;
      // } else {
      //     //reset arrMultiCurObj
      //     this.arrMultiCurObj = [];
      //     this.arrCurObj = [];
      //     //find obj
      //     processingData.allObject.reverse();
      //     let selectedObj = processingData.allObject.find((pointObj) => pointObj.isInBox(topLeftPoint, bottomRigthPoint));
      //     if (selectedObj !== undefined) {
      //         this.arrCurObj[0] = selectedObj;
      //     }
      //     processingData.allObject.reverse();
      // }
      //clear select box
      // this.curSelectBox = [];
      //update screen
      this.renderObject(processingData.allObject);
      return;
    }
    //click select
    //delete last selectbox
    this.curSelectBox = [];
    if (
      this.curValName.value === "Off" &&
      this.curValPointLoad.value === "Off" &&
      this.curValPressLoad.value === "Off" &&
      this.curValMoment.value === "Off" &&
      this.curValSelect === "On"
    ) {
      this.isCancled = false;
      if (event.ctrlKey) {
        //transfer data
        if (this.arrCurObj[0] !== undefined)
          this.arrMultiCurObj.push(this.arrCurObj[0]);
        //turn off single mode
        this.arrCurObj = [];
        //trace obj
        let selectedObj = processingData.allObject.find((obj) =>
          obj.isIn([this.currentMouseDownPos.x, this.currentMouseDownPos.y])
        );
        if (selectedObj === undefined) {
          this.renderObject(processingData.allObject);
          return;
        }
        if (this.arrMultiCurObj.indexOf(selectedObj) !== -1) {
          this.renderObject(processingData.allObject);
          this.arrMultiCurObj.splice(
            this.arrMultiCurObj.indexOf(selectedObj),
            1
          );
        } else {
          //add
          this.renderObject(processingData.allObject);
          if (this.arrMultiCurObj[0] !== undefined) {
            if (selectedObj.className === this.arrMultiCurObj[0].className) {
              this.arrMultiCurObj.push(selectedObj);
            }
          } else {
            this.arrMultiCurObj.push(selectedObj);
          }
        }
      } else {
        //normal last multicurrent obj
        this.renderObject(processingData.allObject);
        //turn off multi mode
        this.arrMultiCurObj = [];
        //trace obj
        let selectedObj = processingData.allObject.find((obj) =>
          obj.isIn([this.currentMouseDownPos.x, this.currentMouseDownPos.y])
        );
        if (selectedObj === undefined) {
          document.getElementById("BDCondition").style.display = "none";
          this.arrCurObj = [];
          this.renderObject(processingData.allObject);
        } else if (
          JSON.stringify(this.arrCurObj[0]) === JSON.stringify(selectedObj)
        ) {
          document.getElementById("BDCondition").style.display = "none";
          this.arrCurObj = [];
        } else {
          this.arrCurObj[0] = selectedObj;
        }
      }
    }
    this.renderObject(processingData.allObject);
  }

  addCommand(text, x, y) {
    PaintIn.ctx.font = "13px Arial";
    PaintIn.ctx.fillStyle = "red";
    PaintIn.ctx.fillText(text, x, y);
  }

  addValueName() {
    //change cursor
    this.currentCursor = "url(frontend/img/text_cursor.svg), default";
    this.canvas.style.cursor = this.currentCursor;

    this.renderObject(processingData.allObject);

    // if (this.currentValueSelect.value === "On") {
    // this.offButtonDraw(this.currentValueBrush, "brush");
    // this.offButtonDraw(this.currentValueSpl, "spl");
    // this.offButtonDraw(this.currentValueRect, "rect");
    this.offButtonDraw(this.currentValueLine, "line");
    // this.offButtonDraw(this.currentValueCircle, "circle");
    this.offButton(this.curValMoment, "moment");
    this.offButton(this.curValPointLoad, "pointLoad");
    this.offButton(this.curValPressLoad, "pressLoad");
    // this.offButton(this.curValAxialForce, "axialForce");

    this.onOffButton(this.curValName, "valueName");

    if (this.curValName.value === "On") {
      this.renderCommand("valueOn");
      addName();
    } else {
      nameID = undefined;
      nameIDs = undefined;
    }
  }

  addValPointLoad() {
    //change cursor
    this.currentCursor = "url(frontend/img/force_cursor.svg) 0 0, default";
    this.canvas.style.cursor = this.currentCursor;

    this.renderObject(processingData.allObject);

    // this.offButtonDraw(this.currentValueBrush, "brush");
    // this.offButtonDraw(this.currentValueSpl, "spl");
    // this.offButtonDraw(this.currentValueRect, "rect");
    this.offButtonDraw(this.currentValueLine, "line");
    // this.offButtonDraw(this.currentValueCircle, "circle");
    // this.offButton(this.currentValueSelect, "select")
    this.offButton(this.curValName, "valueName");
    this.offButton(this.curValPressLoad, "pressLoad");
    // this.offButton(this.curValAxialForce, "axialForce");
    this.offButton(this.curValMoment, "moment");

    this.onOffButton(this.curValPointLoad, "pointLoad");
    if (this.curValPointLoad.value === "On") {
      this.renderCommand("valueOn");
      addForce();
      valueMoment = undefined;
      valueMoments = undefined;
    } else {
      valueLoad = undefined;
      valueLoads = undefined;
    }
  }

  addValPressLoad() {
    //change cursor
    this.currentCursor =
      "url(frontend/img/normal_press_cursor.svg) 0 0, default";
    this.canvas.style.cursor = this.currentCursor;

    this.renderObject(processingData.allObject);

    // this.offButtonDraw(this.currentValueBrush, "brush");
    // this.offButtonDraw(this.currentValueSpl, "spl");
    // this.offButtonDraw(this.currentValueRect, "rect");
    this.offButtonDraw(this.currentValueLine, "line");
    // this.offButtonDraw(this.currentValueCircle, "circle");
    // this.offButton(this.currentValueSelect, "select")
    this.offButton(this.curValName, "valueName");
    this.offButton(this.curValPointLoad, "pointLoad");
    // this.offButton(this.curValAxialForce, "axialForce");
    this.offButton(this.curValMoment, "moment");

    this.onOffButton(this.curValPressLoad, "pressLoad");
    if (this.curValPressLoad.value === "On") {
      this.renderCommand("valueOn");
      addForce();
    } else {
      valueLoad = undefined;
      valueLoads = undefined;
    }
  }

  // addValAxialForce() {
  //     this.pen = undefined;
  //     // this.offButtonDraw(this.currentValueBrush, "brush");
  //     // this.offButtonDraw(this.currentValueSpl, "spl");
  //     // this.offButtonDraw(this.currentValueRect, "rect");
  //     this.offButtonDraw(this.currentValueLine, "line");
  //     // this.offButtonDraw(this.currentValueCircle, "circle");
  //     // this.offButton(this.currentValueSelect, "select")
  //     this.offButton(this.curValName, "valueName");
  //     this.offButton(this.curValPointLoad, "pointLoad");
  //     this.offButton(this.curValMoment, "moment");
  //     this.offButton(this.curValPressLoad, "pressLoad");

  //     this.onOffButton(this.curValAxialForce, "axialForce");

  //     this.renderObject(processingData.allObject);
  // }

  addValMoment() {
    //change cursor
    this.currentCursor = "url(frontend/img/moment_cursor.svg), default";
    this.canvas.style.cursor = this.currentCursor;

    this.renderObject(processingData.allObject);

    // this.offButtonDraw(this.currentValueBrush, "brush");
    // this.offButtonDraw(this.currentValueSpl, "spl");
    // this.offButtonDraw(this.currentValueRect, "rect");
    this.offButtonDraw(this.currentValueLine, "line");
    // this.offButtonDraw(this.currentValueCircle, "circle");
    // this.offButton(this.currentValueSelect, "select")
    this.offButton(this.curValName, "valueName");
    this.offButton(this.curValPointLoad, "pointLoad");
    this.offButton(this.curValPressLoad, "pressLoad");
    // this.offButton(this.curValAxialForce, "axialForce");

    this.onOffButton(this.curValMoment, "moment");
    if (this.curValMoment.value === "On") {
      this.renderCommand("valueOn");
      addForce();
      valueLoad = undefined;
      valueLoads = undefined;
    } else {
      valueMoment = undefined;
      valueMoments = undefined;
    }
  }

  addValDeleteForce(event) {
    // this.offButtonDraw(this.currentValueBrush, "brush");
    // this.offButtonDraw(this.currentValueSpl, "spl");
    // this.offButtonDraw(this.currentValueRect, "rect");
    this.offButtonDraw(this.currentValueLine, "line");
    // this.offButtonDraw(this.currentValueCircle, "circle");
    // this.offButton(this.currentValueSelect, "select")
    this.offButton(this.curValName, "valueName");
    this.offButton(this.curValPointLoad, "pointLoad");
    this.offButton(this.curValPressLoad, "pressLoad");
    // this.offButton(this.curValAxialForce, "axialForce");
    this.offButton(this.curValMoment, "moment");

    this.onOffButton(this.curValDeleteForce, "deleteForce");
    this.renderObject(processingData.allObject);
  }

  clearAll() {
    this.isCancled = false;
    this.offButtonDraw(this.currentValueLine, "line");
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    // this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // vo hieu hoa this.undo()
    this.pen = "select";
    this.currentCursor = "url(frontend/img/select_cursor.svg) 0 0,  default";
    this.canvas.style.cursor = this.currentCursor;
    this.arrMouseDownPosition = [];
    // this.arr = [];
    this.curSelectBox = [];
    this.arrLineX = [];
    this.arrLineY = [];
    this.arrCircleX = [];
    this.arrCircleY = [];
    this.arrRectX = [];
    this.arrRectY = [];
    this.arrLineColor = [];
    this.arrLineWidth = [];

    if (this.currentValueGrid.value == "On") {
      this.ctx.strokeStyle = "grey";
      this.drawGrid();
    }
    //---// clear saved data
    processingData.allLine = [];
    processingData.allPoint = [];
    processingData.allArea = [];
    processingData.allObject = [];
    this.arrCurObj = [];
    this.arrMultiCurObj = [];
    this.renderProperty("off", "");
    this.renderObject(processingData.allObject);
    PaintIn.clearCommands("textCommands");
  }

  clearCommands() {
    dataLogFile = [];
    dataLogFileIndex = 0;
    PaintIn.renderCommand("textCommands");
  }

  choiceEvent() {
    this.toolbar.addEventListener("change", (e) => {
      if (e.target.id === "line_color") {
        this.currentColor = e.target.value;
      }

      if (e.target.id === "line_size") {
        this.currentWidth = e.target.value;
      }

      if (e.target.id === "sizeGrid") {
        if (this.currentValueGrid.value == "On") {
          this.deltaGrid = e.target.value;
          this.ctx.fillStyle = "white";
          this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

          // function update object saved
          //redraw object
          this.renderObject(processingData.allLine);

          this.ctx.strokeStyle = "grey";
          this.drawGrid();
        }
        // console.log(this.currentValueGrid.value)
      }
    });
  }

  buttonGrid() {
    this.arrGrid = [];
    this.getNodePos();

    this.arrGrid = this.concatArr(this.arrGrid, this.arrRecordNode);
    // console.log(this.arrGrid.length)

    if (this.currentValueGrid.value == "Off") {
      this.currentValueGrid.value = "On";
      this.ctx.strokeStyle = "grey";
      this.drawGrid();
    } else {
      this.currentValueGrid.value = "Off";
      // this.ctx.strokeStyle = 'white';
      this.ctx.fillStyle = "white";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    // console.log(this.currentValueGrid.value)
    this.renderObject(processingData.allObject);
  }

  listenEvent() {
    this.canvas.addEventListener("mousedown", (event) => this.mouseDown(event));
    this.canvas.addEventListener("mouseup", (event) => this.mouseUp(event));
    this.canvas.addEventListener("mousemove", (event) => this.mouseMove(event));
    document.addEventListener("keydown", (event) => this.keyDown(event));
    this.canvas.addEventListener("click", (event) => this.selectObj(event));
    // this.canvas.addEventListener('click', (event) => this.deleteForce(event));
    //up file event
    document.getElementById("openFile").addEventListener("change", function () {
      var fr = new FileReader();
      fr.onload = function () {
        let inputData = JSON.parse(fr.result);
        if (inputData["jsmat"] !== undefined) {
          processingData.prototype.createMeshData(inputData);
        } else {
          PaintIn.clearAll();
          processingData.prototype.createData(inputData);
          //update screen
          PaintIn.renderObject(processingData.allObject);
        }
      };
      fr.readAsText(this.files[0]);
    });

    //input img
    let form = document.getElementById("inputImg");
    form.addEventListener("change", function (event) {
      event.preventDefault();
      const formData = new FormData(form[0]);
      formData.append("file", $("#inputImg")[0].files[0]);
      let promise = axios({
        method: "POST",
        url: "https://vysecondapp.herokuapp.com/v1/picture/",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      promise.then((result) => {
        processingData.prototype.createData(result.data);
        //update screen
        PaintIn.renderObject(processingData.allObject);
      });

      promise.catch(function (err) {
        console.log("err", err);
      });
    });

    //make canvas responsive
    onresize = (event) => {
      PaintIn.canvas.width =
        document.getElementById("wrap_canvas_div").clientWidth;
      PaintIn.canvas.height =
        document.getElementById("wrap_canvas_div").clientHeight;
      PaintIn.renderObject(processingData.allObject);
    };
  }

  // getAPI() {
  //   let listData = processingData.prototype.saveObj();
  //   let promise = axios({
  //     method: "POST",

  //     url: 'https://vyfirstapp.herokuapp.com/v1/article/',
  //     data: listData,
  //   });

  //   // var promise = axios({
  //   //     url: 'http://localhost:8000/v1/article',
  //   //     method: "GET",
  //   // });

  //   promise.then((result) => {
  //     console.log(result.data);
  //     Mesh.prototype.openFileSoln(result.data);
  //   });

  //   promise.catch(function (err) {
  //     console.log("err", err);
  //   });
  // }

  //   getAPI() {
  //     // request
  //     let listData = processingData.prototype.saveObj();
  //     console.log(listData); // data type: dictionary
  //     let params = { "rhs": [listData], "nargout": 1, "outputFormat": { "mode": "small", "nanType": "object" } };

  //     let promise = axios({
  //         method: "POST",
  //         url: 'http://localhost:9910/BondTools/firstAPI',
  //         data: params,
  //     });

  //     promise.then((result) => {
  //         // console.log(result.data);
  //         let receiveData = result.data['lhs'][0]; //MATLAB response body is {"lhs":[receiveData]}
  //         console.log(receiveData);
  //         Mesh.prototype.openFileSoln(receiveData); //draw Messh
  //     });

  //     promise.catch(function (err) {
  //         console.log("err", err);
  //     });
  // }

  getAPI() {
    // request
    let listData = processingData.prototype.saveObj();
    let params = {
      rhs: [listData],
      nargout: 1,
      outputFormat: { mode: "small", nanType: "object" },
    };

    let promise = axios({
      method: "POST",
      url: "http://localhost:9910/BondTools/firstAPI",
      data: params,
    });

    promise.then((result) => {
      let receiveData = result.data["lhs"][0];
      Mesh.prototype.openFileSoln(receiveData);
      if (receiveData !== undefined) {
        dataLogFile.push(JSON.stringify(receiveData));
        PaintIn.renderCommand("textCommands");
      }
    });

    promise.catch(function (err) {
      console.log("err", err);
      dataLogFile.push(JSON.stringify(err));
      PaintIn.renderCommand("textCommands");
    });
  }

  mps_PALc(pname, params) {
    //bodyData: data will send to server
    //params: list data - JSON form
    // params = {"num_nodes":6,"num_segments":6,"node_coords":[[280,200],[280,340],[460,340],[460,420],[580,420],[580,120]],"node_names":[null,null,null,null,null,null],"segments":[[0,1],[1,2],[2,3],[3,4],[4,5],[0,5]],"segment_names":[null,"SeA","SeB",null,null,"SeC"],"surfaces":[],"surface_names":[],"nodal_loads":[null,null,null,null,null,null],"segment_loads":[null,null,null,null,null,null],"text-data":["","",""]}
    let bodyData = {
      rhs: [pname, params], //rhs: reading - used when send data
      nargout: 1,
      outputFormat: { mode: "small", nanType: "object" },
    };

    let promise = axios({
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      // url: "http://localhost:5902/matfun/mps_PAL",
      url: "http://localhost:9910/bondTools/firstAPI",
      data: bodyData,
    });

    promise.then((result) => {
      let receiveData = result.data["lhs"][0];
      Mesh.prototype.openFileSoln(receiveData);
      if (receiveData !== undefined) {
        dataLogFile.push(JSON.stringify(receiveData));
        PaintIn.renderCommand("textCommands");
      }
    });

    promise.catch(function (err) {
      console.log("err", err);
      dataLogFile.push(JSON.stringify(err));
      PaintIn.renderCommand("textCommands");
    });
  }

  getMousePosition(event) {
    let rect = this.canvas.getBoundingClientRect();
    if (
      this.pen === "brush" ||
      this.pen === "line" ||
      this.pen === "circle" ||
      this.pen === "rect" ||
      this.pen === "spl" ||
      this.curValSelect === "On" ||
      this.curValName.value === "On" ||
      this.curValPointLoad.value === "On" ||
      this.curValPressLoad.value === "On" ||
      this.curValMoment.value === "On" ||
      this.curValDrawing.value === "On"
    ) {
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    }
  }

  changeOrigin(event) {
    let offSetX = 0;
    let offSetY = this.canvas.height;
    var pos = this.getMousePosition(event);
    return {
      x: pos.x - offSetX,
      y: -(pos.y - offSetY),
    };
  }

  mouseDown(event) {
    this.isPainting = true;
    this.image = new Image();
    this.image.src = this.canvas.toDataURL("image/png ", 1.0);
    // var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    this.mouseDownPos = this.getMousePosition(event); //start
    this.arrMouseDownPosition.push(this.mouseDownPos);
    this.currentMouseDownPos = this.getMousePosition(event);

    if (
      this.currentValueGrid.value == "On" &&
      this.arrGrid.length != 0 &&
      this.currentMouseDownPos != undefined
    ) {
      // console.log(this.arrGrid.length)
      //choose the nearest mouseDown

      if (this.pen === "line") {
        let nearPoint = processingData.prototype.getNearest(
          this.arrGrid,
          this.currentMouseDownPos
        );
        this.mouseDownPos = nearPoint[0];
        this.arrLineX.push(getNearest(this.arrGrid, this.mouseDownPos)[0][0].x);
        this.arrLineY.push(getNearest(this.arrGrid, this.mouseDownPos)[0][0].y);
        // this.arrLineColor.push(getNearest(this.arrGrid, this.mouseDownPos)[0][0]);
        // this.arrLineWidth.push(getNearest(this.arrGrid, this.mouseDownPos)[0][0]);
        // console.log('arrLine', this.arrLineX)
      }
      // if (this.pen === 'circle') {
      //     this.arrCircleX.push(getNearest(this.arrGrid, this.mouseDownPos)[0][0].x);
      //     this.arrCircleY.push(getNearest(this.arrGrid, this.mouseDownPos)[0][0].y);
      //     for (let i = 1; i < this.arr.length; i += 2) {
      //         this.mouseDownPos = this.arr[i + 1];
      //     }
      //     // console.log('arrCircle', this.arrCircleX)
      // };

      // if (this.pen === 'rect') {
      //     this.arrRectX.push(getNearest(this.arrGrid, this.mouseDownPos)[0][0].x);
      //     this.arrRectY.push(getNearest(this.arrGrid, this.mouseDownPos)[0][0].y);
      //     for (let i = 1; i < this.arr.length; i += 2) {
      //         this.mouseDownPos = this.arr[i + 1];
      //     }
      //     this.arrRectColor = this.arrRect;
      //     // console.log('arrRect', this.arrRectX)
      // };

      // if (this.pen === 'spl') {
      //     this.arrSPLX.push(this.mouseDownPos.x);
      //     this.arrSPLY.push(this.mouseDownPos.y);
      //     this.drawSPLine();
      // };
    } else {
      let arrPoints = [];
      processingData.allPoint.forEach((value) =>
        arrPoints.push({ x: value.x, y: value.y })
      );
      let nearPoint = processingData.prototype.getNearest(
        arrPoints,
        this.mouseDownPos,
        10
      );
      if (this.pen === "line") {
        if (nearPoint !== undefined) {
          this.mouseDownPos = nearPoint[0];
        }
        this.arrLineX.push(this.mouseDownPos.x);
        this.arrLineY.push(this.mouseDownPos.y);
        this.arrLineColor.push(this.currentColor);
        this.arrLineWidth.push(this.lineWidth);
        // console.log('arrLine', this.arrLineX)
      }

      // if (this.pen === 'circle') {
      //     this.arrCircleX.push(this.mouseDownPos.x);
      //     this.arrCircleY.push(this.mouseDownPos.y);
      //     for (let i = 1; i < this.arrMouseDownPosition.length; i += 2) {
      //         this.mouseDownPos = this.arrMouseDownPosition[i + 1];
      //     }
      //     // console.log('arrCircle', this.arrCircleX)

      // };

      // if (this.pen === 'rect') {
      //     this.arrRectX.push(this.mouseDownPos.x);
      //     this.arrRectY.push(this.mouseDownPos.y);
      //     for (let i = 1; i < this.arrMouseDownPosition.length; i += 2) {
      //         this.mouseDownPos = this.arrMouseDownPosition[i + 1];
      //     }
      // }

      // if (this.pen === 'spl') {
      //     this.arrSPLX.push(this.mouseDownPos.x);
      //     this.arrSPLY.push(this.mouseDownPos.y);
      // }
    }

    //get data (need optimize)
    // Line
    if (this.arrLineX.length >= 2) {
      processingData.prototype.inputRawData(
        this.pen,
        this.arrLineX,
        this.arrLineY
      );
    }
    // Rect
    // console.log(this.arrRectX);
    if (this.arrRectX.length % 2 === 0 && this.arrRectX.length !== 0) {
      var lastTwoPointX = [
        this.arrRectX[this.arrRectX.length - 2],
        this.arrRectX[this.arrRectX.length - 1],
      ];
      var lastTwoPointY = [
        this.arrRectY[this.arrRectY.length - 2],
        this.arrRectY[this.arrRectY.length - 1],
      ];
      processingData.prototype.inputRawData(
        this.pen,
        lastTwoPointX,
        lastTwoPointY
      );
      //reset
      this.arrRectX = [];
      this.arrRectY = [];
    }
    //----------------------------//
    // if (this.pen === 'circle' || this.pen === 'rect'|| this.pen === 'spl') {
    //     this.undo();
    // }

    // //END Linh config---------------------------------------------------
    //---------------------------------------------------

    // -----------------------------------------
    //        //get data (need optimize)
    //        // Line
    //        if (this.arrLineX.length >= 2) {
    //            processingData.prototype.inputRawData(this.pen, this.arrLineX, this.arrLineY);
    //        };
    //        // Rect
    //        // console.log(this.arrRectX);
    //        if (this.arrRectX.length % 2 === 0 && this.arrRectX.length !== 0) {
    //            var lastTwoPointX = [this.arrRectX[this.arrRectX.length - 2],
    //            this.arrRectX[this.arrRectX.length - 1]];
    //            var lastTwoPointY = [this.arrRectY[this.arrRectY.length - 2],
    //            this.arrRectY[this.arrRectY.length - 1]];
    //            processingData.prototype.inputRawData(this.pen, lastTwoPointX, lastTwoPointY);
    //        }
    //----------------------------//

    //find inters point => add to grid
    // let lineList = [...processingData.allLine];
    // for (let i = 0; i < lineList.length - 1; i++) {
    //     var IntersPoint = processingData.prototype.intersectionCheck(lineList[i], lineList[lineList.length - 1]);
    //     if (IntersPoint.Exist) {
    //         // console.log("IntersPoint");
    //         //create Point
    //         let newPoint = new Point(IntersPoint.Coord);
    //         //add
    //         processingData.prototype.addObject(newPoint, processingData.allPoint);
    //     }
    // };
  }

  mouseUp(event) {
    this.lastMouseUpPos = this.getMousePosition(event);
    this.isPainting = false;
    this.isCancled = true;
  }

  mouseMove(event) {
    if (!this.mouseMoveStatus) {
      return;
    }
    // this.image = new Image;
    // this.image.src = this.canvas.toDataURL("frontend/image/bmp ", 1.0);
    let mouseMovePos = this.getMousePosition(event);
    this.currentMouseMovePos = this.getMousePosition(event);
    let mouseMoveCoordination = this.changeOrigin(event);
    // this.renderObject(processingData.allObject);

    //
    // document.getElementById("display_coord").innerHTML = '[' + this.currentMouseMovePos.x + ' ; ' + this.currentMouseMovePos.y + ']';
    document.getElementById("display_coord").innerHTML =
      "[" + mouseMoveCoordination.x + " ; " + mouseMoveCoordination.y + "]";
    //
    if (
      this.currentValueGrid.value == "On" &&
      this.arrGrid.length != 0 &&
      this.currentMouseDownPos != undefined
    ) {
      let nearPoint = processingData.prototype.getNearest(
        this.arrGrid,
        this.currentMouseDownPos
      );
      this.currentMouseDownPos = nearPoint[0];
    } else {
      let arrPoints = [];
      processingData.allPoint.forEach((value) =>
        arrPoints.push({ x: value.x, y: value.y })
      );

      let nearPoint = processingData.prototype.getNearest(
        arrPoints,
        this.currentMouseDownPos,
        10
      );
      if (nearPoint !== undefined) {
        this.currentMouseDownPos = nearPoint[0];
      } else {
        this.currentMouseDownPos = mouseMovePos;
      }
    }
    // } else if (this.currentValueGrid.value == "Off" && this.currentMouseDownPos != undefined && processingData.allPoint.length !== 0) {
    //     let arrAllPoint = [];
    //     processingData.allPoint.forEach((value) => arrAllPoint.push({ x: value.x, y: value.y }));

    //     let nearPoint = getNearest(arrAllPoint, this.currentMouseDownPos, 10)
    //     console.log(nearPoint)

    // }

    // not link position of start and end point
    // if (this.isPainting) {
    //   // brush
    //   // if (this.pen === 'brush') {
    //   //     this.drawBrush(
    //   //         this.currentMouseDownPos,
    //   //         this.currentMouseMovePos
    //   //     );
    //   // };
    // }

    //line link start and end node
    if (this.pen === "line") {
      if (!this.isCancled) {
        return;
      }
      this.undo();
      this.drawLine(this.mouseDownPos, this.currentMouseDownPos);
    }

    // if (this.pen === 'rect') {
    //     if (!this.isCancled) {
    //         return
    //     };
    //     this.undo();
    //     this.drawRect
    //         (
    //             this.mouseDownPos,
    //             this.currentMouseDownPos
    //         );

    // };
    // if (this.pen === 'circle') {
    //     if (!this.isCancled) {
    //         return
    //     };
    //     this.undo();
    //     this.drawCicle
    //         (
    //             this.mouseDownPos,
    //             this.currentMouseDownPos
    //         );
    // };

    // if (this.pen === 'spl') {
    //     if (!this.isCancled) {
    //         return
    //     };
    //     this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // vo hieu hoa this.undo()
    //     let arrXs = [...this.arrSPLX]
    //     arrXs.push(this.currentMouseDownPos.x)
    //     let arrYs = [...this.arrSPLY]
    //     arrYs.push(this.currentMouseDownPos.y)
    //     console.log("X", arrXs)
    //     console.log("Y", arrYs)
    //     this.drawSPLine(arrXs, arrYs);
    // }

    // if (this.pen === 'select') {
    // //trace area
    // //need optimize
    // for (let area of processingData.allArea) {
    //     if (area.areaTouch([this.currentMouseMovePos.x,this.currentMouseMovePos.y])) {
    //         this.renderProperty("area",area);
    //         this.fillArea(area,"#b6d8e7");
    //         return;
    //     } else {
    //         this.fillArea(area);
    //         this.renderProperty("off",area);
    //     };
    // };

    // }

    // drag
    // if (this.isPainting && this.arrCurObj.length !== 0 &&
    //     this.curValPointLoad.value === "Off" &&
    //     this.curValPressLoad.value === "Off" &&
    //     this.curValMoment.value === "Off" &&
    //     this.curValName.value === "Off" ) {
    //     processingData.prototype.moveObject(this.arrCurObj[0], [this.currentMouseDownPos.x, this.currentMouseDownPos.y])
    // }

    // //change mouse (test)
    // let lineButton = document.getElementById("line").value;
    // let valueName = document.getElementById("valueName").value;
    // let pointLoad = document.getElementById("pointLoad").value;
    // let pressLoad = document.getElementById("pressLoad").value;
    // let moment = document.getElementById("moment").value;

    // if (lineButton === "On") {
    //     this.canvas.style.cursor = "url(frontend/img/pen_cursor.png) 0 32, default";
    // } else if (valueName === "On") {
    //     this.canvas.style.cursor = "url(frontend/img/edit_text.png) 0 32, default";
    // } else if (pointLoad === "On") {
    //     this.canvas.style.cursor = "url(frontend/img/pen_cursor.png) 0 32, default";
    // } else if (pressLoad === "On") {
    //     this.canvas.style.cursor = "url(frontend/img/pen_cursor.png) 0 32, default";
    // } else if (moment === "On") {
    //     this.canvas.style.cursor = "url(frontend/img/pen_cursor.png) 0 32, default";
    // } else {
    //     this.canvas.style.cursor = "default";
    // }
    //bounding box
    if (
      this.isPainting &&
      (this.pen === undefined || this.pen === "select") &&
      this.curValSelect === "On"
    ) {
      //draw bounding box
      this.undo();
      this.ctx.beginPath();
      this.ctx.fillStyle = "rgb(0 234 255 / 26%)";
      let topLeftPoint = [this.mouseDownPos.x, this.mouseDownPos.y];
      let bottomRigthPoint = [mouseMovePos.x, mouseMovePos.y];
      //save select box size
      this.curSelectBox = [topLeftPoint, bottomRigthPoint];
      this.ctx.fillRect(
        topLeftPoint[0],
        topLeftPoint[1],
        bottomRigthPoint[0] - topLeftPoint[0],
        bottomRigthPoint[1] - topLeftPoint[1]
      );
    }
    this.currentMouseDownPos = mouseMovePos;
  }

  renderCommand(mode) {
    switch (mode) {
      case "line":
        document.getElementById("command").style.display = "flex";
        document.getElementById("command").innerHTML = `
                  <p> Press ESC to exit draw! <br>
                      Press SPACE to break line! 
                  </p>
              </div>
                  `;
        break;
      case "valueOn":
        document.getElementById("command").style.display = "flex";
        document.getElementById("command").innerHTML = `
                  <p> Press ESC to exit!
                  </p>
              </div>
                  `;
        break;
      case "Off":
        document.getElementById("command").style.display = "none";
        break;
      case "soln":
        document.getElementById("command").style.display = "flex";
        document.getElementById("command").innerHTML = `
                  <p> Please open file solution!
                  </p>
              </div>
                  `;
        break;
      case "textCommands":
        //render Text commands
        dataLogFileIndex = dataLogFile.length - 1;
        let strings = "";
        let reverseData = [...dataLogFile].reverse();
        for (let i in reverseData) {
          strings += reverseData[i] + "<br>";
        }
        // console.log(strings)
        document.getElementById("valueInputed").innerHTML = `
      
      <p style="background-color: #ffffff; 
      height: 100%;
      overflow: scroll;
      border: 1px solid #0784d1;"> ${strings}</p>
      `;
    }
  }

  // deleteForce(event){

  // }

  getAngleLineAndOx(line) {
    //d1: Ox
    //d2: line
    //alpha: radian , (0,180)
    let u1 = { x: 1, y: 0 };
    let u2 = {
      x: line.Point[1].x - line.Point[0].x,
      y: line.Point[1].y - line.Point[0].y,
    };
    return Math.acos(
      (u1.x * u2.x + u1.y * u2.y) /
      (Math.sqrt(Math.pow(u1.x, 2) + Math.pow(u1.y, 2)) *
        Math.sqrt(Math.pow(u2.x, 2) + Math.pow(u2.y, 2)))
    );
  }

  drawText(Obj, text) {
    this.ctx.save();
    this.ctx.font = "13px Arial";

    // this.ctx.textAlign = "center";
    try {
      //Line
      this.ctx.fillStyle = "red";
      let alpha1 = (this.getAngleLineAndOx(Obj) * 180) / Math.PI;

      if (alpha1 > 90 && alpha1 <= 180) {
        let l = Obj.Point[0];
        Obj.Point[0] = Obj.Point[1];
        Obj.Point[1] = l;
      }

      let dx = Obj.Point[1].x - Obj.Point[0].x;
      let dy = Obj.Point[1].y - Obj.Point[0].y;
      let alpha = Math.atan2(dy, dx); //radians

      //move the center of canvas to  (line.Point[0].x + line.Point[1].x) / 2, (line.Point[0].y + line.Point[1].y) / 2
      this.ctx.translate(
        (Obj.Point[0].x + Obj.Point[1].x) / 2,
        (Obj.Point[0].y + Obj.Point[1].y) / 2
      );
      //rotate text
      this.ctx.rotate(alpha);
      //after move, hold the position
      this.ctx.fillText(text, 0, -10);
      this.ctx.restore();
      // console.log(alpha * 180 / Math.PI)
    } catch (error) {
      try {
        //Area
        this.ctx.fillStyle = "blue";
        // let xC = Obj.center[0];
        // let yC = Obj.center[1];
        let xC = Obj.coordNaming[0];
        let yC = Obj.coordNaming[1];
        this.ctx.fillText(text, xC, yC);
      } catch (error) {
        // Point
        this.ctx.fillStyle = "green";
        let alpha = Math.PI / 4;
        let xC = Obj.x - 5 * (1 + Math.cos(alpha));
        let yC = Obj.y - 5 * (1 + Math.cos(alpha));
        this.ctx.fillText(text, xC, yC);
      }
      this.ctx.restore();
    }
  }

  getPointOffset(point1, point2, offsetPoint) {
    //co offsetPoint de vecto chi phuong u = const
    let a = point1.x - point2.x;
    let b = point1.y - point2.y;

    let u = { x: a, y: b };
    let t = Math.sqrt((10 * 10) / (a * a + b * b));
    return { x: offsetPoint.x - u.y * t, y: offsetPoint.y + u.x * t };
  }

  //point 2 of force vecto
  get2ndPointPress(point1, point2, pointAddForce, obj) {
    let u;
    let a, b;
    for (let i = 0; i < obj.lineLoads.length; i++) {
      if (obj.lineLoads[i].type === "normal_pressure") {
        a = point1.x - point2.x;
        b = point1.y - point2.y;
        u = { x: a, y: b }; //perpendicular

        let t = Math.sqrt((50 * 50) / (a * a + b * b));
        return { x: pointAddForce.x - u.y * t, y: pointAddForce.y + u.x * t };
      }
    }
  }

  get2ndPointAxial(point1, point2, pointAddForce, obj) {
    let u;
    let a = point1.x - point2.x;
    let b = point1.y - point2.y;

    for (let i = 0; i < obj.lineLoads.length; i++) {
      if (obj.lineLoads[i].type === "axial_pressure") {
        a = point1.x - point2.x;
        b = point1.y - point2.y;
        u = { x: -b, y: a }; //parallel

        let t = Math.sqrt((50 * 50) / (a * a + b * b));
        return { x: pointAddForce.x - u.y * t, y: pointAddForce.y + u.x * t };
      }
    }
  }

  getPointInLinePress(point1, point2, lenghtLine, obj) {
    //neu co luc doc, point 1 => use get point2 offet = 5
    let listPointPress = [];
    let a = point2.x - point1.x;
    let b = point2.y - point1.y;
    let u = { x: a, y: b };
    //set distance of 2 point
    let distance = lenghtLine;
    if (lenghtLine >= 50) {
      while (distance > 50) {
        distance /= 2;
      }
    } else {
      distance = lenghtLine / 2;
    }
    let delta = lenghtLine / distance;

    //isParallel Ox or Oy => point 2 follow u
    let maxT = Math.abs((point2.x - point1.x) / a);
    //Oy
    if (maxT !== 1) {
      maxT = Math.abs((point2.y - point1.y) / b);
    }
    //get list Point in line with distance set
    let t = [];
    for (let i = 0; i < maxT; i += maxT / delta) {
      t.push(i);
    }

    for (let i = 0; i < obj.lineLoads.length; i++) {
      //draw press
      if (obj.lineLoads[i].type === "normal_pressure") {
        t.push(maxT);
        for (let j in t) {
          let arr = { x: point1.x + u.x * t[j], y: point1.y + u.y * t[j] };
          listPointPress.push(arr);
        }
        return listPointPress;
      }
    }
  }

  getPointInLineAxial(point1, point2, lenghtLine, obj) {
    //neu co luc doc, point 1 => use get point2 offet = 5
    let listPointAxial = [];
    let a = point2.x - point1.x;
    let b = point2.y - point1.y;
    let u = { x: a, y: b };
    //set distance of 2 point
    let distance = lenghtLine;
    if (lenghtLine >= 50) {
      while (distance > 50) {
        distance /= 2;
      }
    } else {
      distance = lenghtLine / 2;
    }
    let delta = lenghtLine / distance;

    //isParallel Ox or Oy => point 2 follow u
    let maxT = Math.abs((point2.x - point1.x) / a);
    //Oy
    if (maxT !== 1) {
      maxT = Math.abs((point2.y - point1.y) / b);
    }
    //get list Point in line with distance set
    let t = [];
    for (let i = 0; i < maxT; i += maxT / delta) {
      t.push(i);
    }

    for (let i = 0; i < obj.lineLoads.length; i++) {
      //draw axial
      if (obj.lineLoads[i].type === "axial_pressure") {
        for (let j in t) {
          let arr = { x: point1.x + u.x * t[j], y: point1.y + u.y * t[j] };
          listPointAxial.push(arr);
        }
        return listPointAxial;
      }
    }
  }

  drawPoint(point, color = "red", colorStroke = "back", R = 3) {
    this.ctx.beginPath();
    this.ctx.arc(point.x, point.y, R, 0, 2 * Math.PI);
    this.ctx.fillStyle = color;
    this.ctx.fill();
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = colorStroke;
    this.ctx.stroke();
  }

  drawBrush(start, end) {
    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = this.currentWidth;
    this.ctx.lineCap = "round";
    this.ctx.beginPath();
    this.ctx.moveTo(start.x, start.y);
    this.ctx.lineTo(end.x, end.y);
    this.ctx.stroke();
    this.ctx.closePath();
  }

  drawLine(start, end, color = this.currentColor, width = this.currentWidth) {
    if (start != undefined) {
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = width;
      this.ctx.lineCap = "round";
      this.ctx.beginPath();
      this.ctx.moveTo(start.x, start.y);
      this.ctx.lineTo(end.x, end.y);
      this.ctx.stroke();
      this.ctx.closePath();
    }
  }

  drawRect(start, end, color = this.currentColor, width = this.currentWidth) {
    if (start != undefined) {
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = width;
      this.ctx.beginPath();
      this.ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
      this.ctx.stroke();
      this.ctx.closePath();
    }
  }

  drawCicle(start, end, width = this.currentWidth) {
    if (start != undefined) {
      this.ctx.strokeStyle = this.currentColor;
      this.ctx.lineWidth = width;
      this.ctx.beginPath();
      let r = Math.sqrt((start.x - end.x) ** 2 + (start.y - end.y) ** 2);
      this.ctx.arc(start.x, start.y, r, 0, 2 * Math.PI);
      this.ctx.stroke();
    }
  }

  gradient(a, b) {
    return (b.y - a.y) / (b.x - a.x);
  }

  drawSPLine(
    arrXs,
    arrYs,
    color = this.currentColor,
    width = this.currentWidth
  ) {
    console.log(arrXs, arrYs);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    let [arrX, arrY] = processingData.prototype.InterPolationFunction(
      arrXs,
      arrYs
    );
    this.ctx.beginPath();
    this.ctx.moveTo(arrX[0], arrY[0]);
    for (let i = 1; i <= arrX.length - 1; i++) {
      this.ctx.lineTo(arrX[i], arrY[i]);
    }
    this.ctx.stroke();
  }

  drawForce(fromx, fromy, tox, toy, color, lineWidth) {
    let headlen = 10; // length of head in pixels
    let dx = tox - fromx;
    let dy = toy - fromy;
    let angle = Math.atan2(dy, dx);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.beginPath();
    //vecto n
    this.ctx.moveTo(fromx, fromy);
    this.ctx.lineTo(tox, toy);
    // arrow
    this.ctx.lineTo(
      tox - headlen * Math.cos(angle - Math.PI / 6),
      toy - headlen * Math.sin(angle - Math.PI / 6)
    );
    this.ctx.moveTo(tox, toy);
    this.ctx.lineTo(
      tox - headlen * Math.cos(angle + Math.PI / 6),
      toy - headlen * Math.sin(angle + Math.PI / 6)
    );
    this.ctx.closePath();
    this.ctx.stroke();
  }

  drawForceInPoint(Obj, x, y, color = "#063970", lineWidth = 2) {
    //alpha = input;
    //get vecto u of Line
    let endPointX;
    let endPointY;

    //Fx
    if (Obj.force_x > 0.000001) {
      endPointX = { x: x + 50, y: y }; //parallel Ox u = {x:1, y:0}
      this.drawForce(x, y, endPointX.x, endPointX.y, color, lineWidth);
    } else if (Obj.force_x < -0.000001) {
      endPointX = { x: x - 50, y: y }; //parallel Ox u = {x:1, y:0}
      this.drawForce(x, y, endPointX.x, endPointX.y, color, lineWidth);
    }
    //Fy
    if (Obj.force_y > 0.000001) {
      endPointY = { x: x, y: y - 50 }; // parallel Oy u = {x:0, y:-1}
      this.drawForce(x, y, endPointY.x, endPointY.y, color, lineWidth);
    } else if (Obj.force_y < -0.000001) {
      endPointY = { x: x, y: y + 50 }; // parallel Oy u = {x:0, y:1}
      this.drawForce(x, y, endPointY.x, endPointY.y, color, lineWidth);
    }
  }

  drawMoment(Obj, x, y, color = "green", lineWidth = 2) {
    this.ctx.beginPath();
    let r = 20,
      sAngle = Math.PI,
      eAngle = 0;

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.arc(x, y, r, sAngle, eAngle);

    let headlen = 10; // length of head in pixels
    let u1, u2, fromx, fromy, tox, toy;

    if (Obj.value > 0.00001) {
      fromx = x - r;
      fromy = y - 5;
      tox = x - r;
      toy = y;
      u1 = 6;
      u2 = 4;
    } else {
      fromx = x + r;
      fromy = y - 5;
      tox = x + r;
      toy = y;
      u1 = 4;
      u2 = 6;
    }

    let dx = tox - fromx,
      dy = toy - fromy,
      angle = Math.atan2(dy, dx);

    this.ctx.moveTo(tox, toy);
    this.ctx.lineTo(
      tox - headlen * Math.cos(angle - Math.PI / u1),
      toy - headlen * Math.sin(angle - Math.PI / u1)
    );
    this.ctx.moveTo(tox, toy);
    this.ctx.lineTo(
      tox - headlen * Math.cos(angle + Math.PI / u2),
      toy - headlen * Math.sin(angle + Math.PI / u2)
    );
    this.ctx.stroke();
  }

  drawPressure(Obj, value, lineWidth = 2) {
    if (value !== undefined && value !== 0) {
      if (value > 0.00001) {
        let startPoint = this.getPointInLinePress(
          Obj.Point[0],
          Obj.Point[1],
          Obj.length,
          Obj
        ); //array
        for (let i = 0; i < startPoint.length; i++) {
          let endPoint = this.get2ndPointPress(
            Obj.Point[0],
            Obj.Point[1],
            startPoint[i],
            Obj
          );
          this.drawForce(
            startPoint[i].x,
            startPoint[i].y,
            endPoint.x,
            endPoint.y,
            "red",
            lineWidth
          );
        }
      } else {
        let endPoint = this.getPointInLinePress(
          Obj.Point[0],
          Obj.Point[1],
          Obj.length,
          Obj
        ); //array
        for (let i = 0; i < endPoint.length; i++) {
          let startPoint = this.get2ndPointPress(
            Obj.Point[0],
            Obj.Point[1],
            endPoint[i],
            Obj
          );
          this.drawForce(
            startPoint.x,
            startPoint.y,
            endPoint[i].x,
            endPoint[i].y,
            "red",
            lineWidth
          );
        }
      }
    }
  }

  drawAxialPressure(Obj, value, lineWidth = 2) {
    if (value !== undefined && value !== 0) {
      let pointOffsetStart = this.getPointOffset(
        Obj.Point[0],
        Obj.Point[1],
        Obj.Point[0]
      );
      let pointOffsetEnd = this.getPointOffset(
        Obj.Point[0],
        Obj.Point[1],
        Obj.Point[1]
      );
      if (value > 0.00001) {
        let start = this.getPointInLineAxial(
          pointOffsetStart,
          pointOffsetEnd,
          Obj.length,
          Obj
        ); //array
        for (let i = 0; i < start.length; i++) {
          let endPoint = this.get2ndPointAxial(
            Obj.Point[0],
            Obj.Point[1],
            start[i],
            Obj
          );
          this.drawForce(
            start[i].x,
            start[i].y,
            endPoint.x,
            endPoint.y,
            "blue",
            lineWidth
          );
        }
      } else {
        let endPoint = this.getPointInLineAxial(
          pointOffsetStart,
          pointOffsetEnd,
          Obj.length,
          Obj
        ); //array
        for (let i = 0; i < endPoint.length; i++) {
          let start = this.get2ndPointAxial(
            Obj.Point[0],
            Obj.Point[1],
            endPoint[i],
            Obj
          );
          this.drawForce(
            start.x,
            start.y,
            endPoint[i].x,
            endPoint[i].y,
            "blue",
            lineWidth
          );
        }
      }
    }
  }

  addNode() {
    let arrAllPoint = [];
    processingData.allPoint.forEach((value) =>
      arrAllPoint.push({ x: value.x, y: value.y })
    );
    this.arrRecordNode = arrAllPoint;
    // console.log(this.arrGrid.length)
    // console.log(this.arrRecordNode)
  }

  removeDuplicates(chars) {
    let uniqueChars = [];
    chars.forEach((c) => {
      if (!uniqueChars.includes(c)) {
        uniqueChars.push(c);
      }
    });
    return uniqueChars;
  }

  getNodePos() {
    var delta = Number(this.deltaGrid);
    // var arrGrid = [];
    for (var i = 0; i <= this.canvas.width; i += delta / 2) {
      for (var j = 0; j <= this.canvas.height; j += delta / 2) {
        var arr = { x: i, y: j };
        this.arrGrid.push(arr);
      }
    }
  }

  drawGrid() {
    var delta = Number(this.deltaGrid);
    this.ctx.beginPath();
    for (var i = 0; i <= this.canvas.width; i += delta / 2) {
      this.ctx.moveTo(i, 0);
      this.ctx.lineTo(i, this.canvas.height);
    }
    for (var j = 0; j <= this.canvas.height; j += delta / 2) {
      this.ctx.moveTo(0, j);
      this.ctx.lineTo(this.canvas.width, j);
    }
    // this.ctx.strokeStyle = 'grey';
    this.ctx.lineWidth = 0.2;
    this.ctx.stroke();
    this.ctx.closePath();
  }

  displayGridVal() {
    var deltaGrid = document.getElementById("sizeGrid");
    deltaGrid.oninput = function () {
      output.innerHTML = this.value;
    };
    var output = document.getElementById("demo");
    if (this.currentValueGrid.value == "On") {
      output.innerHTML = deltaGrid.value;
    } else {
      output.innerHTML = "";
    }
  }

  //------------------//
  renderObject(arrObj) {
    //clear screen before render
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    //
    if (this.currentValueGrid.value === "On") {
      this.ctx.strokeStyle = "grey";
      this.drawGrid();
    }
    for (let i = arrObj.length - 1; i >= 0; i--) {
      if (arrObj[i] instanceof Area) {
        this.fillArea(arrObj[i]);
        if (arrObj[i].name !== undefined && arrObj[i].name !== null) {
          this.drawText(arrObj[i], arrObj[i].name);
        }
      } else if (arrObj[i] instanceof Line) {
        this.drawLine(
          arrObj[i].Point[0],
          arrObj[i].Point[1],
          arrObj[i].color,
          arrObj[i].width
        );
        if (arrObj[i].name !== undefined && arrObj[i].name !== null) {
          this.drawText(arrObj[i], arrObj[i].name);
        }

        if (arrObj[i].lineLoads !== null) {
          for (let j = 0; j < arrObj[i].lineLoads.length; j++) {
            //draw press
            if (arrObj[i].lineLoads[j].type === "normal_pressure") {
              this.drawPressure(
                arrObj[i],
                arrObj[i].lineLoads[j].parameters.node_0
              );
            }
            //draw axial
            if (arrObj[i].lineLoads[j].type === "axial_pressure") {
              this.drawAxialPressure(
                arrObj[i],
                arrObj[i].lineLoads[j].parameters.value
              );
            }
          }
        }
      } else if (arrObj[i] instanceof Point) {
        this.drawPoint(arrObj[i]);
        if (arrObj[i].name !== undefined && arrObj[i].name !== null) {
          this.drawText(arrObj[i], arrObj[i].name);
        }

        if (arrObj[i].pointLoads !== null) {
          for (let j = 0; j < arrObj[i].pointLoads.length; j++) {
            if (arrObj[i].pointLoads[j].type === "force") {
              this.drawForceInPoint(
                arrObj[i].pointLoads[j].parameters,
                arrObj[i].x,
                arrObj[i].y
              );
            }
            if (arrObj[i].pointLoads[j].type === "moment") {
              this.drawMoment(
                arrObj[i].pointLoads[j].parameters,
                arrObj[i].x,
                arrObj[i].y
              );
            }
          }
        }
      }
    }

    if (
      this.curValName.value === "On" ||
      this.curValPointLoad.value === "On" ||
      this.curValMoment.value === "On" ||
      this.curValPressLoad.value === "On"
    ) {
      this.renderCommand("valueOn");
    } else {
      this.renderCommand("Off");
    }

    // render properties and button
    if (this.arrMultiCurObj[0] !== undefined) {
      document.getElementById("BDCondition").style.display = "flex";
      this.renderProperty("multi", this.arrMultiCurObj);
      for (let i = 0; i < this.arrMultiCurObj.length; i++) {
        let selectedObj;
        selectedObj = this.arrMultiCurObj[i];
        switch (selectedObj.className) {
          case "Point":
            this.drawPoint(selectedObj, "green");
            document.getElementById("BDCondition").style.width = "200px";
            //display 3 button
            this.visibleButton("valueName");
            this.visibleButton("pointLoad");
            this.visibleButton("moment");
            //hidden 1 button
            this.hiddenButton("pressLoad");
            break;
          case "Line":
            this.drawLine(
              selectedObj.Point[0],
              selectedObj.Point[1],
              "#0000ff",
              selectedObj.width
            );
            document.getElementById("BDCondition").style.width = "150px";
            //display 2 button
            this.visibleButton("valueName");
            this.visibleButton("pressLoad");
            //hidden 2 button
            this.hiddenButton("pointLoad");
            this.hiddenButton("moment");
            break;
          case "Area":
            this.fillArea(selectedObj, "#b6d8e7");
            document.getElementById("BDCondition").style.width = "70px";
            //display 1 button
            this.visibleButton("valueName");
            //hidden 3 button
            this.hiddenButton("pressLoad");
            this.hiddenButton("pointLoad");
            this.hiddenButton("moment");
            break;
        }
      }
    } else {
      document.getElementById("BDCondition").style.display = "none";
      this.renderProperty("off", this.arrMultiCurObj);
    }

    if (this.arrCurObj[0] !== undefined) {
      let selectedObj;
      selectedObj = this.arrCurObj[0];
      switch (selectedObj.className) {
        case "Point":
          document.getElementById("BDCondition").style.display = "flex";
          document.getElementById("BDCondition").style.width = "200px";
          this.drawPoint(selectedObj, "green");
          this.renderProperty("point", selectedObj);
          //display 3 button
          this.visibleButton("valueName");
          this.visibleButton("pointLoad");
          this.visibleButton("moment");
          //hidden 1 button
          this.hiddenButton("pressLoad");
          break;
        case "Line":
          document.getElementById("BDCondition").style.width = "150px";
          document.getElementById("BDCondition").style.display = "flex";
          this.drawLine(
            selectedObj.Point[0],
            selectedObj.Point[1],
            "#0000ff",
            selectedObj.width
          );
          this.renderProperty("line", selectedObj);
          //display 2 button
          this.visibleButton("valueName");
          this.visibleButton("pressLoad");
          //hidden 2 button
          this.hiddenButton("pointLoad");
          this.hiddenButton("moment");
          break;
        case "Area":
          document.getElementById("BDCondition").style.width = "70px";
          document.getElementById("BDCondition").style.display = "flex";
          this.fillArea(selectedObj, "#b6d8e7");
          this.renderProperty("area", selectedObj);
          //display 1 button
          this.visibleButton("valueName");
          //hidden 3 button
          this.hiddenButton("pressLoad");
          this.hiddenButton("pointLoad");
          this.hiddenButton("moment");
          break;
      }
    }

    if (this.pen === "line") {
      this.renderCommand("line");
    } else {
      this.renderCommand("Off");
    }
  }
  deleteCurObj() {
    this.isCancled = false;
    for (let Obj of this.arrCurObj) {
      if (Obj.className === "Point") {
        processingData.allPoint.splice(processingData.allPoint.indexOf(Obj), 1); //delete in allPoint
      } else if (Obj.className === "Line") {
        processingData.allLine.splice(processingData.allLine.indexOf(Obj), 1); //delete in allLine
      } else if (Obj.className === "Area") {
        processingData.allArea.splice(processingData.allArea.indexOf(Obj), 1); //delete in allArea
      }
    }
    this.arrCurObj = [];
    for (let Obj of this.arrMultiCurObj) {
      if (Obj.className === "Point") {
        processingData.allPoint.splice(processingData.allPoint.indexOf(Obj), 1); //delete in allPoint
      } else if (Obj.className === "Line") {
        processingData.allLine.splice(processingData.allLine.indexOf(Obj), 1); //delete in allLine
      } else if (Obj.className === "Area") {
        processingData.allArea.splice(processingData.allArea.indexOf(Obj), 1); //delete in allArea
      }
    }
    this.arrMultiCurObj = [];
    //update storage
    processingData.prototype.updateStorage();
    //update screen
    this.renderObject(processingData.allObject);
    this.renderProperty("off", "");
  }

  renderProperty(mode, Obj) {
    document.getElementById("property").style.display = "flex";
    switch (mode) {
      case "point": {
        //classify load
        let forces = [];
        let moments = [];
        if (Obj.pointLoads !== null) {
          for (let load of Obj.pointLoads) {
            if (load["type"] === "force") {
              forces.push(load);
            } else moments.push(load);
          }
        }
        //first value
        let firstForceValue = null;
        let firstMomentValue = null;
        //create list force
        let selectForces = "";
        for (let force of forces) {
          let x = force.parameters.force_x;
          let y = force.parameters.force_y;
          selectForces += `<option value=${Obj.pointLoads.indexOf(
            force
          )}>${x},${y}</option>`;
          //get first value
          if (forces.indexOf(force) === 0) firstForceValue = `${x},${y}`;
        }
        //create list force
        let selectMoments = "";
        for (let moment of moments) {
          let value = moment.parameters["value"];
          selectMoments += `<option value=${Obj.pointLoads.indexOf(
            moment
          )}>${value}</option>`;
          //get first value
          if (moments.indexOf(moment) === 0) firstMomentValue = `${value}`;
        }
        //
        document.getElementById("property").innerHTML = `
                  <p id="property_label">Properties</p>
                  <div>
                      <p>x</p>
                      <div>${math.round(Obj.x, 2)}</div>
                  </div>
                  <div>
                      <p>y</p>
                      <div>${math.round(Obj.y, 2)}</div>
                  </div>
                  <div>
                      <p>Name</p>
                      <div>${Obj.name}</div>
                  </div>
                  <div>
                      <p>Force</p>
                      <div>
                          <div class="select-editable">
                              <select  class="select-editable" id="forcesDropdown" onchange="this.nextElementSibling.value=this.options[this.selectedIndex].text">
                                  ${selectForces}
                              </select>
                              <input type="text" name="format" value="${firstForceValue}" onchange="PaintIn.changeLoad(this.previousElementSibling.value, this.value, 'force')"/>
                          </div>
                          <button class="delLoadButton" onclick="PaintIn.delLoad('forcesDropdown')"
                          </button>
                      </div>
                  </div>
                  <div>
                      <p>Moment</p>
                      <div>
                          <div class="select-editable">
                              <select class="select-editable" id="momentsDropdown" onchange="this.nextElementSibling.value=this.options[this.selectedIndex].text">
                                  ${selectMoments}
                              </select>
                              <input type="text" name="format" value="${firstMomentValue}" onchange="PaintIn.changeLoad(this.previousElementSibling.value, this.value, 'moment')"/>
                          </div>
                          <button class="delLoadButton" onclick="PaintIn.delLoad('momentsDropdown')">
                          </button>
                      </div>
                  </div>
                  `;
        break;
      }
      case "line": {
        //create list force
        let selectNormalPress = "";
        let firstValue = null;
        if (Obj.lineLoads !== null) {
          for (let normalPress of Obj.lineLoads) {
            let node0 = normalPress.parameters.node_0;
            let node1 = normalPress.parameters.node_1;
            selectNormalPress += `<option value=${Obj.lineLoads.indexOf(
              normalPress
            )}>${node0},${node1}</option>`;
            //get first value
            if (Obj.lineLoads.indexOf(normalPress) === 0) {
              firstValue = `${node0},${node1}`;
            }
          }
        }

        document.getElementById("property").innerHTML = `
                  <p id="property_label">Properties</p>
                  <div>
                      <p>Point 1</p>
                      <div>[${math.round(Obj.Point[0].x, 2)},${math.round(
          Obj.Point[0].y,
          2
        )}]</div>
                  </div>
                  <div>
                      <p>Point 2</p>
                      <div>[${math.round(Obj.Point[1].x, 2)},${math.round(
          Obj.Point[1].y,
          2
        )}]</div>
                  </div>
                  <div>
                      <p>Length</p>
                      <div>${math.round(Obj.length, 2)}</div>
                  </div>
                  <div>
                      <p>Line</p>
                      <div>1</div>
                  </div>
                  <div>
                      <p>Name</p>
                      <div>${Obj.name}</div>
                  </div>
                  <div>
                      <p>Normal Press</p>
                      <div>
                          <div class="select-editable">
                              <select id="normalPressesDropdown" onchange="this.nextElementSibling.value=this.options[this.selectedIndex].text">
                                  ${selectNormalPress}
                              </select>
                              <input type="text" name="format" value="${firstValue}" onchange="PaintIn.changeLoad(this.previousElementSibling.value, this.value, 'normalPress')"/>
                          </div>
                          <button class="delLoadButton" onclick="PaintIn.delLoad('normalPressesDropdown')">
                          </button>
                      </div>
                  </div>
                  `;
        break;
      }
      case "off": {
        document.getElementById("property").style.display = "none";
        document.getElementById("property").innerHTML = `
                  <p id="property_label"></p>
                  `;
        break;
      }
      case "multi": {
        let allObjInBox = [];
        if (this.curSelectBox.length !== 0) {
          processingData.allObject.forEach((obj) => {
            if (obj.isInBox(this.curSelectBox[0], this.curSelectBox[1])) {
              allObjInBox.push(obj);
            }
          });
        } else {
          allObjInBox = this.arrMultiCurObj;
        }
        let allTypes = [];
        allObjInBox.forEach((obj) => {
          if (allTypes.indexOf(obj.className) === -1)
            allTypes.push(obj.className);
        });
        let options = "";
        for (let type of allTypes) {
          options += `<option value = "${type}">${type}</option>`;
        }
        document.getElementById("property").innerHTML = `
                  <p id="property_label">Properties</p>
                  <div>
                      <div style="border-left:0px">
                          <select id="selectTypeObj" onchange="((e) =>
                              {   
                                  PaintIn.multiSelectType = this.value;
                                  window.event.ctrlKey = true;
                                  PaintIn.selectObj(window.event);
                              })()
                          ">
                              ${options}
                          </select>
                      </div>
                      <div>${Obj.length}
                      </div>
                  </div>
                  `;
        //set first value of selectTag is current className
        let selectTypeObj = document.getElementById("selectTypeObj");
        selectTypeObj.selectedIndex = allTypes.indexOf(
          this.arrMultiCurObj[0].className
        );
        break;
      }
      case "area": {
        document.getElementById("property").innerHTML = `
                  <p id="property_label">Properties</p>
                  <div>
                      <p>Area
                      </p>
                      <div>${math.round(Obj.area, 2)}
                      </div>
                  </div>
                  <div>
                      <p>Center
                      </p>
                      <div>[${math.round(Obj.center, 2)}]
                      </div>
                  </div>
                  <div>
                      <p>Perimeter
                      </p>
                      <div>${math.round(Obj.perimeter, 2)}
                      </div>
                  </div>
                  <div>
                      <p>Sides
                      </p>
                      <div>${Obj.Line.length}
                      </div>
                  </div>
                  <div>
                      <p>Name</p>
                      <div>${Obj.name}
                  </div>
                  `;
        break;
      }
    }
  }
  delLoad(tagId) {
    let obj = this.arrCurObj[0];
    let selectTag = document.getElementById(tagId);
    let selectedLoad = selectTag[selectTag.selectedIndex];
    if (selectedLoad !== undefined) {
      if (obj.className === "Point") {
        obj.pointLoads.splice(selectedLoad.value, 1);
      } else if (obj.className === "Line") {
        obj.lineLoads.splice(selectedLoad.value, 1);
      }
    }
    this.renderObject(processingData.allObject);
  }
  changeLoad(loadIndex, newValue, type) {
    switch (type) {
      case "force": {
        if (!newValue.includes(",")) return;
        let force_x = Number(newValue.slice(0, newValue.indexOf(",")));
        let force_y = Number(
          newValue.slice(newValue.indexOf(",") + 1, newValue.length)
        );
        //check fail input
        if (isNaN(force_x) || isNaN(force_y)) return;
        //set new value
        this.arrCurObj[0].pointLoads[loadIndex].parameters.force_x = force_x;
        this.arrCurObj[0].pointLoads[loadIndex].parameters.force_y = force_y;
        break;
      }
      case "moment": {
        let value = Number(newValue);
        //check fail input
        if (isNaN(value)) return;
        this.arrCurObj[0].pointLoads[loadIndex].parameters.value = value;
        break;
      }
      case "normalPress": {
        let node_0 = Number(newValue.slice(0, newValue.indexOf(",")));
        let node_1 = Number(
          newValue.slice(newValue.indexOf(",") + 1, newValue.length)
        );
        //check fail input
        if (isNaN(node_0) || isNaN(node_1)) return;
        //set new value
        this.arrCurObj[0].lineLoads[loadIndex].parameters.node_0 = node_0;
        this.arrCurObj[0].lineLoads[loadIndex].parameters.node_1 = node_1;
        break;
      }
    }
    this.renderObject(processingData.allObject);
  }
  //--------------------------------

  fillArea(AreaObj, fillColor = "rgb(0 115 255 / 10%)") {
    //vector n
    let allVectn = [];
    let pointFlowEx = [...AreaObj.pointFlow];
    pointFlowEx[pointFlowEx.length] = pointFlowEx[0];
    for (let i = 0; i <= pointFlowEx.length - 2; i++) {
      let vectu = math.subtract(pointFlowEx[i + 1], pointFlowEx[i]);
      vectu = math.divide(vectu, math.norm(vectu));
      //
      let vectn = [-vectu[1], vectu[0]];
      //
      let point1 = math.add(pointFlowEx[i], math.multiply(vectn, 10e-5));
      let point2 = math.add(pointFlowEx[i + 1], math.multiply(vectn, 10e-5));
      let center = math.add(
        point1,
        math.divide(math.subtract(point2, point1), 2)
      );
      if (AreaObj.isIn(center)) {
        allVectn.push(vectn);
      } else {
        vectn = [vectu[1], -vectu[0]];
        allVectn.push(vectn);
      }
    }
    //offset line
    let newLines = [];
    for (let i = 0; i <= pointFlowEx.length - 2; i++) {
      let point1 = math.add(
        pointFlowEx[i],
        math.multiply(allVectn[i], this.currentWidth / 2)
      );
      let point2 = math.add(
        pointFlowEx[i + 1],
        math.multiply(allVectn[i], this.currentWidth / 2)
      );

      let vectu = math.subtract(point2, point1);
      vectu = math.divide(vectu, math.norm(vectu));

      point1 = math.add(point1, math.multiply(vectu, -10e4));
      point2 = math.add(point2, math.multiply(vectu, 10e4));
      let undefineArr = Array(2).fill(undefined);
      let allPoint = processingData.prototype.createPoint(
        [point1[0], point2[0]],
        [point1[1], point2[1]],
        undefineArr,
        undefineArr
      );
      let newLine = processingData.prototype.createLine(
        allPoint,
        undefineArr,
        undefineArr,
        undefineArr,
        undefineArr
      );
      newLines.push(...newLine);
    }
    //find new intersection point
    let newIntersPoints = [];
    for (let i = 0; i <= newLines.length - 1; i++) {
      if (i === newLines.length - 1) {
        let IntersPoint = processingData.prototype.intersectionCheck(
          newLines[i],
          newLines[0]
        );
        newIntersPoints.push(IntersPoint.Coord);
      } else {
        let IntersPoint = processingData.prototype.intersectionCheck(
          newLines[i],
          newLines[i + 1]
        );
        if (IntersPoint.Exist) {
          newIntersPoints.push(IntersPoint.Coord);
        }
      }
    }
    //create path
    this.ctx.beginPath();
    this.ctx.moveTo(newIntersPoints[0][0], newIntersPoints[0][1]);
    for (let i = 1; i <= newIntersPoints.length - 1; i++) {
      this.ctx.lineTo(newIntersPoints[i][0], newIntersPoints[i][1]);
    }
    this.ctx.fillStyle = fillColor;
    this.ctx.fill();
  }
  setCursor(style = "default") {
    //set mouse cursor
    this.canvas.style.cursor = style;
  }
  drawBC(obj, key) {
    if (obj.className === "Point") {
      switch (key) {
        case "fix": {
          //draw triangle
          let firstPoint = obj.point;
          let sideLength = 20;
          this.ctx.beginPath();
          this.ctx.moveTo(firstPoint[0], firstPoint[1]);
          this.ctx.lineTo(
            firstPoint[0] + sideLength / 2,
            firstPoint[1] - (sideLength * math.sqrt(3)) / 2
          );
          this.ctx.lineTo(
            firstPoint[0] - sideLength / 2,
            firstPoint[1] - (sideLength * math.sqrt(3)) / 2
          );
          this.ctx.fillStyle = "black";
          this.ctx.fill();
          break;
        }
        case "khop ban le": {
          //draw small circle
          let R = 5;
          let center = [obj.x, obj.y - R];
          this.ctx.beginPath();
          this.ctx.arc(center[0], center[1], R, 0, 2 * math.PI);
          this.ctx.fillStyle = "black";
          this.ctx.fill();
          //draw triangle
          let firstPoint = center;
          let sideLength = 20;
          this.ctx.moveTo(firstPoint[0], firstPoint[1]);
          this.ctx.lineTo(
            firstPoint[0] + sideLength / 2,
            firstPoFnt[1] - (sideLength * math.sqrt(3)) / 2
          );
          this.ctx.lineTo(
            firstPoint[0] - sideLength / 2,
            firstPoint[1] - (sideLength * math.sqrt(3)) / 2
          );
          this.ctx.fill();
          break;
        }
        case "khop ban le di dong ngang": {
          //draw triangle
          let sideLength = 20;
          let h = (sideLength * math.sqrt(3)) / 2;
          let firstPoint = obj.point;
          this.ctx.beginPath();
          this.ctx.moveTo(firstPoint[0], firstPoint[1]);
          this.ctx.lineTo(firstPoint[0] + sideLength / 2, firstPoint[1] - h);
          this.ctx.lineTo(firstPoint[0] - sideLength / 2, firstPoint[1] - h);
          this.ctx.closePath();
          this.ctx.fillStyle = "black";
          this.ctx.fill();
          //draw two small circle
          let R = 3;
          let center1 = [
            firstPoint[0] + (1 / 4) * sideLength,
            firstPoint[1] - h - R,
          ];
          let center2 = [
            firstPoint[0] - (1 / 4) * sideLength,
            firstPoint[1] - h - R,
          ];
          this.ctx.beginPath();
          this.ctx.arc(center1[0], center1[1], R, 0, 2 * math.PI);
          this.ctx.closePath();
          this.ctx.arc(center2[0], center2[1], R, 0, 2 * math.PI);
          this.ctx.closePath();
          this.ctx.fillStyle = "black";
          this.ctx.fill();
          break;
        }
        case "khop ban le di dong doc": {
          //draw triangle
          let sideLength = 20;
          let h = (sideLength * math.sqrt(3)) / 2;
          let firstPoint = obj.point;
          this.ctx.beginPath();
          this.ctx.moveTo(firstPoint[0], firstPoint[1]);
          this.ctx.lineTo(firstPoint[0] - h, firstPoint[1] + sideLength / 2);
          this.ctx.lineTo(firstPoint[0] - h, firstPoint[1] - sideLength / 2);
          this.ctx.closePath();
          this.ctx.fillStyle = "black";
          this.ctx.fill();
          //draw two small circle
          let R = 3;
          let center1 = [
            firstPoint[0] - h - R,
            firstPoint[1] + (1 / 4) * sideLength,
          ];
          let center2 = [
            firstPoint[0] - h - R,
            firstPoint[1] - (1 / 4) * sideLength,
          ];
          this.ctx.beginPath();
          this.ctx.arc(center1[0], center1[1], R, 0, 2 * math.PI);
          this.ctx.closePath();
          this.ctx.arc(center2[0], center2[1], R, 0, 2 * math.PI);
          this.ctx.closePath();
          this.ctx.fillStyle = "black";
          this.ctx.fill();
          break;
        }
      }
    } else if (obj.className === "Line") {
      switch (key) {
        case "fix": {
          //draw triangle
          let subPoints = obj.getPointInLine(5);
          for (let point of subPoints) {
            let firstPoint = point;
            let sideLength = 20;
            this.ctx.beginPath();
            this.ctx.moveTo(firstPoint[0], firstPoint[1]);
            this.ctx.lineTo(
              firstPoint[0] + sideLength / 2,
              firstPoint[1] - (sideLength * math.sqrt(3)) / 2
            );
            this.ctx.lineTo(
              firstPoint[0] - sideLength / 2,
              firstPoint[1] - (sideLength * math.sqrt(3)) / 2
            );
            this.ctx.fillStyle = "black";
            this.ctx.fill();
          }
          break;
        }
        case "khop ban le di dong ngang": {
          let subPoints = obj.getPointInLine(5);
          for (let point of subPoints) {
            //draw triangle
            let sideLength = 20;
            let h = (sideLength * math.sqrt(3)) / 2;
            let firstPoint = point;
            this.ctx.beginPath();
            this.ctx.moveTo(firstPoint[0], firstPoint[1]);
            this.ctx.lineTo(firstPoint[0] + sideLength / 2, firstPoint[1] - h);
            this.ctx.lineTo(firstPoint[0] - sideLength / 2, firstPoint[1] - h);
            this.ctx.closePath();
            this.ctx.fillStyle = "black";
            this.ctx.fill();
            //draw two small circle
            let R = 3;
            let center1 = [
              firstPoint[0] + (1 / 4) * sideLength,
              firstPoint[1] - h - R,
            ];
            let center2 = [
              firstPoint[0] - (1 / 4) * sideLength,
              firstPoint[1] - h - R,
            ];
            this.ctx.beginPath();
            this.ctx.arc(center1[0], center1[1], R, 0, 2 * math.PI);
            this.ctx.closePath();
            this.ctx.arc(center2[0], center2[1], R, 0, 2 * math.PI);
            this.ctx.closePath();
            this.ctx.fillStyle = "black";
            this.ctx.fill();
          }
          break;
        }
        case "khop ban le di dong doc": {
          let subPoints = obj.getPointInLine(5);
          for (let point of subPoints) {
            //draw triangle
            let sideLength = 20;
            let h = (sideLength * math.sqrt(3)) / 2;
            let firstPoint = point;
            this.ctx.beginPath();
            this.ctx.moveTo(firstPoint[0], firstPoint[1]);
            this.ctx.lineTo(firstPoint[0] - h, firstPoint[1] + sideLength / 2);
            this.ctx.lineTo(firstPoint[0] - h, firstPoint[1] - sideLength / 2);
            this.ctx.closePath();
            this.ctx.fillStyle = "black";
            this.ctx.fill();
            //draw two small circle
            let R = 3;
            let center1 = [
              firstPoint[0] - h - R,
              firstPoint[1] + (1 / 4) * sideLength,
            ];
            let center2 = [
              firstPoint[0] - h - R,
              firstPoint[1] - (1 / 4) * sideLength,
            ];
            this.ctx.beginPath();
            this.ctx.arc(center1[0], center1[1], R, 0, 2 * math.PI);
            this.ctx.closePath();
            this.ctx.arc(center2[0], center2[1], R, 0, 2 * math.PI);
            this.ctx.closePath();
            this.ctx.fillStyle = "black";
            this.ctx.fill();
          }
          break;
        }
      }
    }
  }
  simulateMouseEvent(type, pos) {
    let rect = this.canvas.getBoundingClientRect();
    let newEvent = new MouseEvent(type, {
      clientX: pos[0] + rect.left,
      clientY: pos[1] + rect.top,
    });
    // console.log(newEvent)
    this.canvas.dispatchEvent(newEvent);
  }

  //--------------------------------------------------------------------//
  //tab-comments
  toggleTab() {
    if (this.tabStatus.value === "On") {
      this.tabStatus.value = "Off";
      this.hiddenButton("tab-comments");
    } else {
      this.tabStatus.value = "On";
      this.visibleButton("tab-comments");
    }
  }

  getValueInTextBox() {
    if (window.event.keyCode == 13) {
      inputComments();
    }
  }

  // saveLogFile() {
  //   let blob = new Blob([dataLogFile],
  //     { type: "text/plain;charset=utf-8" });
  //   saveAs(blob, "logFile.txt");
  // }
}

//get height of tool_top
var toolTop = document.getElementById("tool_top");
var toolTopHeight = toolTop.getBoundingClientRect().bottom;

function getPosElement(idElem) {
  let elem = document.getElementById(idElem);
  let left = elem.getBoundingClientRect().left;
  let top = elem.getBoundingClientRect().top;
  let right = elem.getBoundingClientRect().right;
  let bottom = elem.getBoundingClientRect().bottom;
  //- padding
  let xC = left - (right - left) / 2;
  let yC = top + (bottom - top) / 2 - toolTopHeight + 30;
  return [xC, yC];
}

const PaintIn = new Paint();
PaintIn.curValDrawing.value = "On";
var dataLogFile = [];
let dataLogFileIndex = 0;
// const commands = ["line"];
