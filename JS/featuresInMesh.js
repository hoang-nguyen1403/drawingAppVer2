class FeatureMesh{
    constructor(){

    }

    selectObj(event) {
        // if (this.pen !== 'select') {
        //     return
        // }
        //boundingbox select
        // let topPoint = this.curSelectBox[0];
        // let bottomPoint = this.curSelectBox[1];
        // if (this.mouseDownPos.x !== this.lastMouseUpPos.x && this.mouseDownPos.y !== this.lastMouseUpPos.y) {
        //     //reset arrCurObj
        //     this.arrCurObj = [];
        //     this.arrMultiCurObj = [];
        //     //create select box
        //     if (bottomPoint[0] > topPoint[0] && bottomPoint[1] > topPoint[1]) {
        //         switch (this.multiSelectType) {
        //             case "Point":
        //                 {
        //                     processingData.allPoint.forEach((obj) => {
        //                         if (obj.isInBox(topPoint, bottomPoint)) {
        //                             this.arrMultiCurObj.push(obj);
        //                         }
        //                     });
        //                     break;
        //                 }
        //             case "Line":
        //                 {
        //                     processingData.allLine.forEach((obj) => {
        //                         if (obj.isInBox(topPoint, bottomPoint)) {
        //                             this.arrMultiCurObj.push(obj);
        //                         }
        //                     });
        //                     break;
        //                 }
        //             case "Area":
        //                 {
        //                     processingData.allArea.forEach((obj) => {
        //                         if (obj.isInBox(topPoint, bottomPoint)) {
        //                             this.arrMultiCurObj.push(obj);
        //                         }
        //                     });
        //                     break;
        //                 }
        //         }
        //     } else {
        //         switch (this.multiSelectType) {
        //             case "Point":
        //                 {
        //                     processingData.allPoint.forEach((obj) => {
        //                         if (obj.isTouchBox(topPoint, bottomPoint)) {
        //                             this.arrMultiCurObj.push(obj);
        //                         }
        //                     });
        //                     break;
        //                 }
        //             case "Line":
        //                 {
        //                     processingData.allLine.forEach((obj) => {
        //                         if (obj.isTouchBox(topPoint, bottomPoint)) {
        //                             this.arrMultiCurObj.push(obj);
        //                         }
        //                     });
        //                     break;
        //                 }
        //             case "Area":
        //                 {
        //                     processingData.allArea.forEach((obj) => {
        //                         if (obj.isTouchBox(topPoint, bottomPoint)) {
        //                             this.arrMultiCurObj.push(obj);
        //                         }
        //                     });
        //                     break;
        //                 }
        //         }
        //     }
        //     //set defaul obj type
        //     this.multiSelectType = this.multiSelectTypeDefault;
        //     // } else {
        //     //     //reset arrMultiCurObj
        //     //     this.arrMultiCurObj = [];
        //     //     this.arrCurObj = [];
        //     //     //find obj
        //     //     processingData.allObject.reverse();
        //     //     let selectedObj = processingData.allObject.find((pointObj) => pointObj.isInBox(topLeftPoint, bottomRigthPoint));
        //     //     if (selectedObj !== undefined) {
        //     //         this.arrCurObj[0] = selectedObj;
        //     //     }
        //     //     processingData.allObject.reverse();
        //     // }
        //     //clear select box 
        //     // this.curSelectBox = [];
        //     //update screen
        //     this.renderObject(processingData.allObject);
        //     return
        // }
        //click select
        //delete last selectbox
        // this.curSelectBox = [];
        // if (this.curValName.value === "Off" && this.curValPointLoad.value === "Off" && this.curValPressLoad.value === "Off" && this.curValMoment.value === "Off" && this.curValSelect === "On") {
        //     this.isCancled = false;
        //     if (event.ctrlKey) {
        //         //transfer data
        //         if (this.arrCurObj[0] !== undefined) this.arrMultiCurObj.push(this.arrCurObj[0]);
        //         //turn off single mode
        //         this.arrCurObj = [];
        //         //trace obj
        //         let selectedObj = processingData.allObject.find(obj => obj.isIn([this.currentMouseDownPos.x, this.currentMouseDownPos.y]));
        //         if (selectedObj === undefined) {
        //             this.renderObject(processingData.allObject);
        //             return
        //         }
        //         if (this.arrMultiCurObj.indexOf(selectedObj) !== -1) {
        //             this.renderObject(processingData.allObject);
        //             this.arrMultiCurObj.splice(this.arrMultiCurObj.indexOf(selectedObj), 1);
        //         } else {//add
        //             this.renderObject(processingData.allObject);
        //             if (this.arrMultiCurObj[0] !== undefined) {
        //                 if (selectedObj.className === this.arrMultiCurObj[0].className) {
        //                     this.arrMultiCurObj.push(selectedObj);
        //                 }
        //             }
        //             else {
        //                 this.arrMultiCurObj.push(selectedObj);
        //             }
        //         }
        //     } else {
        //         //normal last multicurrent obj
        //         this.renderObject(processingData.allObject);
        //         //turn off multi mode
        //         this.arrMultiCurObj = [];
        //         //trace obj
        //         let selectedObj = processingData.allObject.find(obj => obj.isIn([this.currentMouseDownPos.x, this.currentMouseDownPos.y]));
        //         if (selectedObj === undefined) {
        //             document.getElementById('BDCondition').style.display = 'none';
        //             this.arrCurObj = [];
        //             this.renderObject(processingData.allObject);
        //         } else if (JSON.stringify(this.arrCurObj[0]) === JSON.stringify(selectedObj)) {
        //             document.getElementById('BDCondition').style.display = 'none';
        //             this.arrCurObj = [];
        //         } else {
        //             this.arrCurObj[0] = selectedObj;
        //         }
        //     }
        // }

        //trace obj
        let selectedObj = processingData.allObject.find(obj => obj.isIn([this.currentMouseDownPos.x, this.currentMouseDownPos.y]));
        if (selectedObj === undefined) {
            document.getElementById('BDCondition').style.display = 'none';
            this.arrCurObj = [];
            this.renderObject(processingData.allObject);
        } else if (JSON.stringify(this.arrCurObj[0]) === JSON.stringify(selectedObj)) {
            document.getElementById('BDCondition').style.display = 'none';
            this.arrCurObj = [];
        } else {
            this.arrCurObj[0] = selectedObj;
        }

        this.renderObject(processingData.allObject);
    }
}