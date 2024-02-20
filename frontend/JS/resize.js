class Resize {
    constructor(name1, name2, name3) {
        this.name1 = domID(name1);
        this.name2 = domID(name2);
        this.name3 = domID(name3);

        this.clicked = null;
        this.onRightEdgeDraw;
        this.onBottomEdgeDraw;
        this.onLeftEdgeDraw;
        this.onTopEdgeDraw;
        this.onRightEdgeTab;
        this.onBottomEdgeTab;
        this.onLeftEdgeTab;
        this.onTopEdgeTab;
        this.height = domID("center").clientHeight;

        this.MARGINS = 10;
        this.e;
        this.b1;
        this.b3;
        this.x1;
        this.x3;
        this.y1;
        this.y3;
        this.redraw = false;
        this.isResizing;
        this.local;
        this.Draw;
        this.Chart;
        this.Tab;
        this.move;
    }
    calc(event) {
        this.b1 = this.name1.getBoundingClientRect();
        this.x1 = event.clientX - this.b1.left;
        this.y1 = event.clientY - this.b1.top;

        this.b3 = this.name3.getBoundingClientRect();
        this.x3 = event.clientX - this.b3.left;
        this.y3 = event.clientY - this.b3.top;


        this.onTopEdgeDraw = this.y1 < this.MARGINS;
        this.onLeftEdgeDraw = this.x1 < this.MARGINS;
        this.onRightEdgeDraw = this.x1 >= this.b1.width - 10;
        this.onBottomEdgeDraw = this.y1 >= this.b1.height - 10;

        this.onTopEdgeTab = this.y3 < this.MARGINS;
        this.onLeftEdgeTab = this.x3 < this.MARGINS;
        this.onRightEdgeTab = this.x3 >= this.b3.width - this.MARGINS;
        this.onBottomEdgeTab = this.y3 >= this.b3.height - this.MARGINS;
    }
    onDown(event, name) {
        this.calc(event, name)
        this.isResizing = this.onRightEdgeDraw || this.onBottomEdgeDraw || this.onTopEdgeDraw || this.onLeftEdgeDraw || this.onRightEdgeTab || this.onBottomEdgeTab || this.onTopEdgeTab || this.onLeftEdgeTab;
        if (name === this.name1) {
            this.clicked = {
                x: this.x1,
                y: this.y1,
                cx: event.clientX,
                cy: event.clientY,
                w: this.b1.width,
                h: this.b1.height,
                isResizing: this.isResizing,
                isMoving: !this.isResizing,
                onTopEdge: this.onTopEdgeDraw,
                onLeftEdge: this.onLeftEdgeDraw,
                onRightEdge: this.onRightEdgeDraw,
                onBottomEdge: this.onBottomEdgeDraw,
                name: name
            };
        } else {
            this.clicked = {
                x: this.x3,
                y: this.y3,
                cx: event.clientX,
                cy: event.clientY,
                w: this.b3.width,
                h: this.b3.height,
                isResizing: this.isResizing,
                isMoving: !this.isResizing,
                onTopEdge: this.onTopEdgeTab,
                onLeftEdge: this.onLeftEdgeTab,
                onRightEdge: this.onRightEdgeTab,
                onBottomEdge: this.onBottomEdgeTab,
                name: name
            };
        }
    }
    onMouseDown(event, name) {
        if (event.buttons === 1 && !event.shiftKey)
            this.onDown(event, name);
    }
    onMove(event) {
        this.calc(event);
        this.e = event;
        this.redraw = true;
    }
    onUp(event) {
        this.calc(event);
        this.clicked = null;

    }
    resizeAll() {
        requestAnimationFrame(() => this.resizeAll());

        if (!this.redraw) return;

        this.redraw = false;

        if (this.clicked && this.clicked.isResizing) {
            if (this.clicked.onBottomEdge === true && this.clicked.name === this.name1) {
                this.name1.style.height = this.y1 + 'px';
                this.name2.style.height = this.height - this.y1 + 'px';
                if (this.name2.clientHeight / this.height < 0.15) {
                    domID("chart-icon").value = "Off";
                    domID("Close-Open").style.height = "100%";
                    domID("ChartPlot").style.display = "none";
                    domID("Chart").style.height = "2%";
                    domID("Drawing").style.height = "98%";
                    domID("chart-icon").style.transform = "rotate(-90deg)";
                    domID("chart-icon").title = "Open";
                    this.local = null
                }
                if (domID("ChartPlot").style.display === "none" && this.local !== null) {
                    domID("chart-icon").value = "On";
                    domID("Close-Open").style.height = "10%";
                    domID("ChartPlot").style.display = "block";
                    domID("Chart").style.height = "50%";
                    domID("Drawing").style.height = "50%";
                    domID("chart-icon").style.transform = "rotate(90deg)";
                    domID("chart-icon").title = "Close";
                }
                this.local = 1;
                this.drawAfterResize();
            } else if ((this.clicked.onLeftEdge && this.clicked.name === this.name3)) {
                domID("center_div").style.width = window.innerWidth - 10 + 'px';
                domID("tool_top").style.width = window.innerWidth - 20 + 'px';
                domID("center").style.width = window.innerWidth - 20 + 'px';
                domID("Show").style.width = this.x1 + 'px';
                domClass("tab")[0].style.width = domID("center").clientWidth - this.x1 + 'px';
                if (domID("ghostpane").clientWidth / domID("center").clientWidth < 0.07) {
                    PaintIn.tabStatus.value = "Off";
                    domClass("tab")[0].style.width = "1%";
                    domID("tab-comments").style.display = "none";
                    domID("tab-icon").style.width = "100%";
                    domID("Show").style.width = "99%";
                    domID("tab-icon").style.transform = "rotate(180deg)";
                    domID("tab-icon").title = "Open";
                    this.local = null
                }
                if (domID("tab-comments").style.display === "none" && this.local !== null) {
                    PaintIn.tabStatus.value = "On";
                    domID("tab-comments").style.display = "flex";
                    domID("tab-icon").style.width = "10%";
                    domID("tab-icon").style.transform = "rotate(0deg)";
                    domID("tab-icon").title = "Close";
                }
                this.local = 1;
                this.drawAfterResize();
            } else {

            }
            return;
        }
        if (this.onBottomEdgeDraw) {
            domID("Close-Open").style.cursor = 'ns-resize';
        } else if (this.onLeftEdgeTab) {
            this.name3.style.cursor = 'ew-resize';
        } else {
            this.name1.style.cursor = 'default';
            this.name3.style.cursor = 'default';
            domID("Close-Open").style.cursor = 'default';
        }

    }
    moveDraw() {
        this.move = 1;
    }
    moveChart() {
        this.move = 2;
    }
    moveTab() {
        this.move = 3;
    }
    drawAfterResize() {
        // Resize Chart
        // Chart.canvas.width = domID("ChartPlot").clientWidth - domID("ChartPlot").clientWidth * 0.15;
        // Chart.canvas.height = domID("ChartPlot").clientHeight - domID("ChartPlot").clientHeight * 0.2;
        // Chart.textCanvas.width = domID("ChartPlot").clientWidth;
        // Chart.textCanvas.height = domID("ChartPlot").clientHeight;
        // Chart.drawAxes();
        //draw Canvas 2D;
        domID("center_div").style.width = window.innerWidth - 10 + 'px';
        domID("tool_top").style.width = window.innerWidth - 21 + 'px';
        domID("center").style.width = window.innerWidth - 19 + 'px';
        domID("center").style.height = window.innerHeight - 70 + "px";
        this.height = domID("center").clientHeight;
        if (!this.clicked) {
            this.name2.style.height = this.height - this.name1.clientHeight + 'px';
            this.name1.style.height = this.height - this.name2.clientHeight + 'px';
        }
        DrawingGL.canvas.width = domID("wrap_canvas_div").clientWidth;
        DrawingGL.canvas.height = domID("wrap_canvas_div").clientHeight;
        // PaintIn.renderObject(processingData.allObject);
        twgl.resizeCanvasToDisplaySize(DrawingGL.gl.canvas)
        DrawingGL.DrawMain();
        renderName();
        if (domID("valueName").value == "On" || domID("pointLoad").value == "On" || domID("moment").value == "On" || domID("pressLoad").value == "On") {
            if (select !== null) {
                var heightwidth = convertPositionGLtoHeightWeight(select);
                var input = domID("inputAdd")
                input.style.display = "block";
                domID("styleInput").style.display = "none";
                if (heightwidth.height <= DrawingGL.gl.canvas.clientHeight && heightwidth.width <= DrawingGL.gl.canvas.clientWidth) {
                    if (domID("styleInput").style.display === "none") {
                        input.style.left = heightwidth.width.toString() + "px";
                        input.style.bottom = heightwidth.height.toString() + "px";
                    } else {
                        input.style.left = heightwidth.width.toString() + "px";
                        input.style.bottom = (heightwidth.height + domID("styleInput").clientHeight).toString() + "px";
                    }
                } else {
                    input.style.left = (DrawingGL.gl.canvas.clientWidth / 2).toString() + "px";
                    input.style.bottom = (DrawingGL.gl.canvas.clientHeight).toString() + "px";
                }
            } else if (selected.length !== 0 || PaintIn.arrMultiCurObj.length !== 0) {
                domID("inputAdd").style.left = (DrawingGL.gl.canvas.clientWidth / 2).toString() + "px";
                domID("inputAdd").style.bottom = (DrawingGL.gl.canvas.clientHeight).toString() + "px";
            }
        }
        domID("Show").style.height = (this.height).toString() + 'px';
        if (visualizeData !== undefined) {
            if (visualizeData.data.phi) {
                // visualizeData.proccesingData();
                //draw Solution 2D
                DrawGL.drawMain();

                // draw Solution 3D
                DrawGL3D.drawMain();

                // colorBar

                // twgl.resizeCanvasToDisplaySize(DrawGL.gl_colorbar);

                // DrawGL.canvas_text.width = domID("text_colorbar").clientWidth;
                // DrawGL.canvas_text.height = domID("text_colorbar").clientHeight;
                // visualizeData.colorBar(visualizeData.data)
            } else {
                // draw Chart
                if (drawChart !== undefined) {
                    Plotly.newPlot("ChartPlot", drawChart.dataChart, drawChart.layout, { scrollZoom: true });
                }
                // domID("Title_chart").style.left = (domID("axes").clientWidth / 2 - domID("Title_chart").clientWidth / 2).toString() + 'px';
                // domID("Legend").style.left = (domID("ChartPlot").clientWidth * 0.09 + domID("ChartGL").clientWidth - domID("Legend").clientWidth).toString() + "px";
                // domID("property_chart").style.left = (domID("ChartPlot").clientWidth * 0.09 + domID("ChartGL").clientWidth - domID("property_chart").clientWidth - domID("Legend").clientWidth).toString() + "px";
                // drawChart.handleData();
                // drawChart.loadDataAfterHandle();
                // twgl.resizeCanvasToDisplaySize(Chart.gl.canvas);
                // Chart.drawMain();
            }
        }
    }

}
const resize = new Resize("Drawing", "Chart", "ghostpane");



resize.name1.addEventListener("mousedown", event => { resize.onMouseDown(event, resize.name1) });
resize.name3.addEventListener("mousedown", event => { resize.onMouseDown(event, resize.name3) });
document.addEventListener("mousemove", event => { resize.onMove(event) });
document.addEventListener("mouseup", event => { resize.onUp(event) });

resize.resizeAll();

const width = domID("center_div").clientWidth;

var test_1 = [];