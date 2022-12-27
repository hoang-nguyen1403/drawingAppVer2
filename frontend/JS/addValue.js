function addNamePoint(Obj) {
    let pos = getPosElement("valueName");
    if (PaintIn.arrMultiCurObj[0] !== undefined) {
        inputNames(pos[0] + 15, pos[1]);
        return;
    } else {
        let xC = Obj.x;
        let yC = Obj.y;
        inputName(xC, yC, Obj);
        return;
    }
}

function addNameLine(Obj) {
    let pos = getPosElement("valueName");
    if (PaintIn.arrMultiCurObj[0] !== undefined) {
        inputNames(pos[0] + 15, pos[1]);
        return;
    } else {
        //choose position to display box input
        let xM1 = (Obj.Point[1].x - Obj.Point[0].x) / 2;
        let yM1 = (Obj.Point[1].y - Obj.Point[0].y) / 2;
        let xBox = 25 / 2;
        let yBox = 25 / 2;
        let xM2 = Obj.Point[0].x + xM1 - xBox;
        let yM2 = Obj.Point[0].y + yM1 - yBox;
        inputName(xM2, yM2, Obj);
        return;
    }
}

function addNameArea(Obj) {
    //    choose position to display box input
    if (PaintIn.arrMultiCurObj[0] !== undefined) {
        let pos = getPosElement("valueName");
        inputNames(pos[0] + 15, pos[1]);
        return;
    } else {
        // let xC = Obj.center[0];
        // let yC = Obj.center[1];
        let xC = PaintIn.mouseDownPos.x;
        let yC = PaintIn.mouseDownPos.y;
        inputName(xC, yC, Obj);
        return;
    }
}

function addName() {
    //check before input
    if (PaintIn.arrMultiCurObj[0] !== undefined) {
        if (valueLoads !== undefined && PaintIn.curValPressLoad.value === "Off") {
            valueLoads.destroy();
            valueLoads = undefined;
        }
        if (valueMoments !== undefined && PaintIn.curValMoment.value === "Off") {
            valueMoments.destroy();
            valueMoments = undefined;
        }
    }
    if (PaintIn.arrCurObj[0] !== undefined) {
        //name on=> press & moment off
        if (valueLoad !== undefined && PaintIn.curValPressLoad.value === "Off") {
            valueLoad.destroy();
            valueLoad = undefined;
        }
        if (valueMoment !== undefined && PaintIn.curValMoment.value === "Off") {
            valueMoment.destroy();
            valueMoment = undefined;
        }
    }
    //input
    if (
        (nameIDs === undefined || nameID === undefined) &&
        (PaintIn.pen === undefined || PaintIn.pen === "line")
    ) {
        let selectedObj;

        if (PaintIn.arrMultiCurObj[0] !== undefined) {
            for (let i = 0; i < PaintIn.arrMultiCurObj.length; i++) {
                selectedObj = PaintIn.arrMultiCurObj[i];
                switch (selectedObj.className) {
                    case "Point":
                        if (nameIDs === undefined) {
                            addNamePoint(selectedObj);
                        }
                        break;
                    case "Line":
                        if (nameIDs === undefined) {
                            addNameLine(selectedObj);
                        }
                        break;
                    case "Area":
                        if (nameIDs === undefined) {
                            addNameArea(selectedObj);
                        }
                        break;
                }
            }
        }

        if (PaintIn.arrCurObj[0] !== undefined) {
            selectedObj = PaintIn.arrCurObj[0];
            //render Prop
            switch (selectedObj.className) {
                case "Point":
                    if (nameID === undefined) {
                        addNamePoint(selectedObj);
                    }
                    break;
                case "Line":
                    if (nameID === undefined) {
                        addNameLine(selectedObj);
                    }
                    break;
                case "Area":
                    if (nameID === undefined) {
                        addNameArea(selectedObj);
                    }
                    break;
            }
        }

        if (selectedObj === undefined) {
            PaintIn.renderProperty("off", selectedObj);
            PaintIn.arrCurObj = [];
            return;
        }
    }
    return;
}

function addForce() {
    //check and destroy before input
    if (PaintIn.arrMultiCurObj[0] !== undefined) {
        if (nameIDs !== undefined && PaintIn.curValName.value === "Off") {
            nameIDs.destroy();
            nameIDs = undefined;
        }
        if (valueMoments !== undefined && PaintIn.curValMoment.value === "Off") {
            valueMoments.destroy();
            valueMoments = undefined;
        }
        if (valueLoads !== undefined && PaintIn.curValPointLoad.value === "Off") {
            valueLoads.destroy();
            valueLoads = undefined;
        }
    }
    if (PaintIn.arrCurObj[0] !== undefined) {
        if (nameID !== undefined && PaintIn.curValName.value === "Off") {
            nameID.destroy();
            nameID = undefined;
        }
        if (valueMoment !== undefined && PaintIn.curValMoment.value === "Off") {
            valueMoment.destroy();
            valueMoment = undefined;
        }
        if (valueLoad !== undefined && PaintIn.curValPointLoad.value === "Off") {
            valueLoad.destroy();
            valueLoad = undefined;
        }
    }

    //input
    if (
        (valueLoads === undefined ||
            valueLoad === undefined ||
            valueMoments === undefined ||
            valueMoment === undefined) &&
        (PaintIn.pen === undefined || PaintIn.pen === "line")
    ) {
        let selectedObj;
        if (PaintIn.arrMultiCurObj[0] !== undefined) {
            //save value for selectedObj
            selectedObj = PaintIn.arrMultiCurObj[0];
            switch (selectedObj.className) {
                case "Point": {
                    if (PaintIn.curValPointLoad.value === "On") {
                        let pos = getPosElement("pointLoad");
                        if (valueLoads === undefined) {
                            PaintIn.addCommand("Fx, Fy", pos[0] + 15, pos[1] + 50);
                            inputForces(pos[0] + 5, pos[1], "force");
                        }
                    }
                    if (PaintIn.curValMoment.value === "On") {
                        let pos = getPosElement("moment");
                        if (valueMoments === undefined) {
                            PaintIn.addCommand("M = ...", pos[0] + 15, pos[1] + 50);
                            inputMoments(pos[0] + 5, pos[1], "moment");
                        }
                    }
                    break;
                }
                case "Line": {
                    if (valueLoads === undefined) {
                        let pos = getPosElement("pressLoad");
                        if (PaintIn.curValPressLoad.value === "On") {
                            PaintIn.addCommand("F = ...", pos[0] + 15, pos[1] + 50);
                            inputForces(pos[0] + 5, pos[1], "normal_pressure");
                        }
                        // else if (PaintIn.curValAxialForce.value === "On") {
                        //     inputForce(xM2, yM2, selectedObj, "axial_pressure");
                        // }
                    }
                    break;
                }
            }
            return;
        }
        if (PaintIn.arrCurObj[0] !== undefined) {
            selectedObj = PaintIn.arrCurObj[0];
            //render Prop
            switch (selectedObj.className) {
                case "Point":
                    if (PaintIn.curValPointLoad.value === "On") {
                        if (valueLoad === undefined) {
                            PaintIn.addCommand(
                                "Fx, Fy",
                                selectedObj.x + 10,
                                selectedObj.y - 10
                            );
                            inputForce(selectedObj.x, selectedObj.y, selectedObj, "force");
                            // inputValue(selectedObj.x, selectedObj.y, selectedObj);
                        }
                    }
                    if (PaintIn.curValMoment.value === "On") {
                        if (valueMoment === undefined) {
                            PaintIn.addCommand(
                                "M = ...",
                                selectedObj.x + 10,
                                selectedObj.y - 10
                            );
                            inputMoment(
                                selectedObj.x,
                                selectedObj.y,
                                selectedObj,
                                "moment"
                            );
                        }
                    }
                    break;
                case "Line":
                    if (valueLoad === undefined) {
                        let xM1 = (selectedObj.Point[1].x - selectedObj.Point[0].x) / 2;
                        let yM1 = (selectedObj.Point[1].y - selectedObj.Point[0].y) / 2;
                        let xBox = 25 / 2;
                        let yBox = 25 / 2;
                        let xM2 = selectedObj.Point[0].x + xM1 - xBox;
                        let yM2 = selectedObj.Point[0].y + yM1 - yBox;
                        if (PaintIn.curValPressLoad.value === "On") {
                            PaintIn.addCommand("F = ...", xM2 + 10, yM2 - 10);
                            inputForce(xM2, yM2, selectedObj, "normal_pressure");
                            // inputValue(xM2, yM2, selectedObj);
                        }
                        // else if (PaintIn.curValAxialForce.value === "On") {
                        //     inputForce(xM2, yM2, selectedObj, "axial_pressure");
                        // }
                    }
                    break;
            }
            return;
        }

        if (selectedObj === undefined) {
            PaintIn.renderProperty("off", selectedObj);
            PaintIn.arrCurObj = [];
            return;
        }
    }
}

// function addValueNameArea(Obj) {
//     //    choose position to display box input
//     if (PaintIn.arrMultiCurObj[0] !== undefined) {
//         let pos = getPosElement("valueName");
//         inputNames(pos[0] + 15, pos[1]);
//         return;
//     } else {
//         let xC = Obj.center[0];
//         let yC = Obj.center[1];
//         inputName(xC, yC, Obj);
//         return;
//     }
// }

// function addValueArea() {
//     //check before input
//     if (PaintIn.arrCurObj[0] !== undefined) {
//         //name on=> press & moment off
//         if(valueNameArea !== undefined&& PaintIn.curValNamingArea.value === "Off"){
//             valueNameArea.destroy();
//             valueNameArea = undefined;
//         }
//     }
//     //input
//     if (
//         (valueNameArea === undefined) &&
//         (PaintIn.pen === undefined || PaintIn.pen === "line")
//     ) {
//         let selectedObj;
//         if (PaintIn.arrCurObj[0] !== undefined) {
//             selectedObj = PaintIn.arrCurObj[0];
//             if(selectedObj.className === "Point" && valueNameArea === undefined){
//                 addNameArea(selectedObj);
//             }
//         }
//         if (selectedObj === undefined) {
//             PaintIn.renderProperty("off", selectedObj);
//             PaintIn.arrCurObj = [];
//             return;
//         }
//     }
//     return;
// }