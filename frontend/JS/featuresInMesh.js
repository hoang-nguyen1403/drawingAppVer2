class FeatureMesh{
    constructor(){

    }

    selectObj(event) {
        let selectedObj = processingData.allObject.find(obj => obj.isIn([this.currentMouseDownPos.x, this.currentMouseDownPos.y]));
        if (selectedObj === undefined) {
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