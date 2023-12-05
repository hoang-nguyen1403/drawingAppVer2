class processingDataChart {
    constructor(data) {
        this.data = JSON.parse(data);
        this.t = this.data.t;
        this.tavg = this.data.tavg;
        this.tsurf = this.data.tsurf;
        this.tcent = this.data.tcent;

        this.line_tavg = [];
        this.line_tavg_coord = [];
        this.line_tavg_find = [];
        this.line_tsurf = [];
        this.line_tsurf_coord = [];
        this.line_tsurf_find = [];
        this.line_tcent = [];
        this.line_tcent_coord = [];
        this.line_tcent_find = [];
        this.all_line = [];
        this.all_line_find = [];
        this.type = "Chart";
        this.layout;
        this.dataChart;
    }
    clearData() {
        Chart.scene = [];
        Chart.node = [];
        Chart.arrLine = [];
        Chart.arrLineAll = [];
        this.line_tavg = [];
        this.line_tavg_coord = [];
        this.line_tavg_find = [];
        this.line_tsurf = [];
        this.line_tsurf_coord = [];
        this.line_tsurf_find = [];
        this.line_tcent = [];
        this.line_tcent_coord = [];
        this.line_tcent_find = [];
        this.all_line = [];
        this.all_line_find = [];
        // Chart.drawMain();
    }
    handleData() {
        this.clearData();
        Chart.max_y = math.max([math.max(this.tavg), math.max(this.tcent), math.max(this.tsurf)]);
        Chart.max_x = math.max(this.t);

        for (let i = 0; i < this.tavg.length; i++) {
            this.line_tavg.push(this.t[i] * Chart.gl.canvas.width / Chart.max_x, this.tavg[i] * Chart.gl.canvas.height / Chart.max_y)
            this.line_tavg.push(this.t[i + 1] * Chart.gl.canvas.width / Chart.max_x, this.tavg[i + 1] * Chart.gl.canvas.height / Chart.max_y)
            this.line_tavg_coord.push([this.t[i] * Chart.gl.canvas.width / Chart.max_x, this.tavg[i] * Chart.gl.canvas.height / Chart.max_y])
            this.line_tavg_find.push({ coord: [this.t[i] * Chart.gl.canvas.width / Chart.max_x, this.tavg[i] * Chart.gl.canvas.height / Chart.max_y] })
        }
        for (let i = 0; i < this.tsurf.length; i++) {
            this.line_tsurf.push(this.t[i] * Chart.gl.canvas.width / Chart.max_x, this.tsurf[i] * Chart.gl.canvas.height / Chart.max_y)
            this.line_tsurf.push(this.t[i + 1] * Chart.gl.canvas.width / Chart.max_x, this.tsurf[i + 1] * Chart.gl.canvas.height / Chart.max_y)
            this.line_tsurf_coord.push([this.t[i] * Chart.gl.canvas.width / Chart.max_x, this.tsurf[i] * Chart.gl.canvas.height / Chart.max_y])
            this.line_tsurf_find.push({ coord: [this.t[i] * Chart.gl.canvas.width / Chart.max_x, this.tsurf[i] * Chart.gl.canvas.height / Chart.max_y] })
        }
        for (let i = 0; i < this.tcent.length; i++) {
            this.line_tcent.push(this.t[i] * Chart.gl.canvas.width / Chart.max_x, this.tcent[i] * Chart.gl.canvas.height / Chart.max_y)
            this.line_tcent.push(this.t[i + 1] * Chart.gl.canvas.width / Chart.max_x, this.tcent[i + 1] * Chart.gl.canvas.height / Chart.max_y)
            this.line_tcent_coord.push([this.t[i] * Chart.gl.canvas.width / Chart.max_x, this.tcent[i] * Chart.gl.canvas.height / Chart.max_y])
            this.line_tcent_find.push({ coord: [this.t[i] * Chart.gl.canvas.width / Chart.max_x, this.tcent[i] * Chart.gl.canvas.height / Chart.max_y] })
        }
        Chart.arrLine.push(this.line_tavg, this.line_tsurf, this.line_tcent);
        this.all_line.push(this.line_tavg_coord, this.line_tsurf_coord, this.line_tcent_coord);
        Chart.arrLineAll.push(this.line_tavg_coord, this.line_tsurf_coord, this.line_tcent_coord);
        this.all_line_find.push(this.line_tavg_find, this.line_tsurf_find, this.line_tcent_find);
        this.all_line = this.all_line.flat();
        this.all_line_find = this.all_line_find.flat();
        Chart.arrLineAll = Chart.arrLineAll.flat();
        for (let j = 0; j < this.all_line.length; j++) {
            const id = j + 1;
            Chart.id.push(((id >> 0) & 0xFF) / 0xFF,
                ((id >> 8) & 0xFF) / 0xFF,
                ((id >> 16) & 0xFF) / 0xFF,
                ((id >> 24) & 0xFF) / 0xFF,)
        }
        for (let i = 0; i < this.line_tavg_coord.length * 4; i++) {
            Chart.id_1.push(Chart.id[i]);
        }
        for (let i = this.line_tavg_coord.length * 4; i < (this.line_tavg_coord.length + this.line_tsurf_coord.length) * 4; i++) {
            Chart.id_2.push(Chart.id[i]);
        }
        for (let i = (this.line_tavg_coord.length + this.line_tsurf_coord.length) * 4; i < this.all_line.length * 4; i++) {
            Chart.id_3.push(Chart.id[i]);
        }
        this.all_line = this.all_line.flat();
        this.line_tavg_coord = this.line_tavg_coord.flat();
        this.line_tsurf_coord = this.line_tsurf_coord.flat();
        this.line_tcent_coord = this.line_tcent_coord.flat();
        var bufferInfo = twgl.createBufferInfoFromArrays(Chart.gl, {
            a_position: {
                numComponents: 2,
                data: this.line_tavg_coord
            },
            a_color: Chart.id_1
        })
        Chart.node.push(bufferInfo);
    }
    createFilter() {
        document.getElementById("filter_chart").style.display = "block";
        for (let value in this.data) {
            if (value !== "t" && value !== "err") {
                document.getElementById("filter_chart").innerHTML += `
              <option value=${value}>${value}</option>
            `
            }
        }
        document.getElementById("filter_chart").innerHTML += `
              <option value=${"All"}>${"All"}</option>
            `
        document.getElementById("Title_chart").innerHTML = `Temperature of polygon domain (Bi= ${domID("ValueParameter").value})`;
        domID("Title_chart").style.left = (domID("axes").clientWidth / 2 - domID("Title_chart").clientWidth / 2).toString() + 'px';
    }
    loadDefaultChart() {
        var buffer = twgl.createBufferInfoFromArrays(Chart.gl, {
            a_position: {
                numComponents: 2,
                data: Chart.arrLine[0]
            }
        });
        Chart.scene.push({ color: [1, 0, 0, 1], bufferInfo: buffer });
    }
    loadDataAfterHandle() {
        Chart.scene = [];
        Chart.node = [];
        Chart.nearPointGL_storage = [{ x: 10000000, y: 10000000 }, 0];
        switch (domID("filter_chart").value) {
            case "tavg":
                Chart.legend.style.display = "none";
                var buffer = twgl.createBufferInfoFromArrays(Chart.gl, {
                    a_position: {
                        numComponents: 2,
                        data: Chart.arrLine[0]
                    }
                });
                Chart.scene.push({ color: [1, 0, 0, 1], bufferInfo: buffer });
                var bufferInfo = twgl.createBufferInfoFromArrays(Chart.gl, {
                    a_position: {
                        numComponents: 2,
                        data: drawChart.line_tavg_coord
                    },
                    a_color: Chart.id_1
                })
                Chart.node.push(bufferInfo);
                Chart.drawMain();
                break;
            case "tsurf":
                Chart.legend.style.display = "none";
                var buffer = twgl.createBufferInfoFromArrays(Chart.gl, {
                    a_position: {
                        numComponents: 2,
                        data: Chart.arrLine[1]
                    }
                });
                Chart.scene.push({ color: [0, 1, 0, 1], bufferInfo: buffer });
                var bufferInfo = twgl.createBufferInfoFromArrays(Chart.gl, {
                    a_position: {
                        numComponents: 2,
                        data: drawChart.line_tsurf_coord
                    },
                    a_color: Chart.id_2
                })
                Chart.node.push(bufferInfo);
                Chart.drawMain();
                break;
            case "tcent":
                Chart.legend.style.display = "none";
                var buffer = twgl.createBufferInfoFromArrays(Chart.gl, {
                    a_position: {
                        numComponents: 2,
                        data: Chart.arrLine[2]
                    }
                });
                Chart.scene.push({ color: [0, 0, 1, 1], bufferInfo: buffer });
                var bufferInfo = twgl.createBufferInfoFromArrays(Chart.gl, {
                    a_position: {
                        numComponents: 2,
                        data: drawChart.line_tcent_coord
                    },
                    a_color: Chart.id_3
                })
                Chart.node.push(bufferInfo);
                Chart.drawMain();
                break;
            case "All":
                Chart.legend.style.display = "block";
                for (let i = 0; i < Chart.arrLine.length; i++) {
                    var buffer = twgl.createBufferInfoFromArrays(Chart.gl, {
                        a_position: {
                            numComponents: 2,
                            data: Chart.arrLine[i]
                        }
                    });
                    switch (i) {
                        case 0:
                            Chart.scene.push({ color: [1, 0, 0, 1], bufferInfo: buffer });
                            break;
                        case 1:
                            Chart.scene.push({ color: [0, 1, 0, 1], bufferInfo: buffer });
                            break;
                        case 2:
                            Chart.scene.push({ color: [0, 0, 1, 1], bufferInfo: buffer });
                            break;
                    }
                }
                var bufferInfo = twgl.createBufferInfoFromArrays(Chart.gl, {
                    a_position: {
                        numComponents: 2,
                        data: drawChart.all_line
                    },
                    a_color: Chart.id
                })
                Chart.node.push(bufferInfo);
                Chart.drawMain();
                Chart.drawLegend();
                break;
        }
    }
    processingData() {
        // ChartOn();
        this.handleData();
        this.createFilter();
        this.loadDefaultChart();
        Chart.drawMain();
    }
}

var drawChart;



// /*
//  * @author https://twitter.com/blurspline / https://github.com/zz85
//  * See post @ http://www.lab4games.net/zz85/blog/2014/11/15/resizing-moving-snapping-windows-with-js-css/
//  */

// "use strict";

// // Minimum resizable area
// var minWidth = 250;
// var minHeight = 82.3;

// // Thresholds
// var FULLSCREEN_MARGINS = -10;
// var MARGINS = 4;

// // End of what's configurable.
// var clicked = null;
// var onRightEdge, onBottomEdge, onLeftEdge, onTopEdge;

// var rightScreenEdge, bottomScreenEdge;

// var preSnapped;

// var b, x, y;

// var redraw = false;

// var pane = document.getElementById('tab-comments');
// pane.style.left = document.getElementById("wrap_canvas_div").clientWidth + 9 - pane.clientWidth + 'px';
// var width = document.getElementById("wrap_canvas_div").clientWidth + 9 - pane.clientWidth;
// const width1 = document.getElementById("wrap_canvas_div").clientWidth + 9 - pane.clientWidth;
// var ghostpane = document.getElementById('tab-comments');
// // ghostpane.style.left = document.getElementById("wrap_canvas_div").clientWidth + 12 - pane.clientWidth + 'px'
// // pane.style.maxWidth = document.getElementById("wrap_canvas_div").clientWidth + 'px';

// // Mouse events
// pane.addEventListener('mousedown', onMouseDown);
// document.addEventListener('mousemove', onMove);
// document.addEventListener('mouseup', onUp);


// function onTouchDown(e) {
//     onDown(e.touches[0]);
//     e.preventDefault();
// }

// function onTouchMove(e) {
//     onMove(e.touches[0]);
// }

// function onTouchEnd(e) {
//     if (e.touches.length == 0) onUp(e.changedTouches[0]);
// }

// function onMouseDown(e) {
//     onDown(e);
//     e.preventDefault();
// }

// function onDown(e) {
//     calc(e);

//     var isResizing = onRightEdge || onBottomEdge || onTopEdge || onLeftEdge;

//     clicked = {
//         x: x,
//         y: y,
//         cx: e.clientX,
//         cy: e.clientY,
//         w: b.width,
//         h: b.height,
//         isResizing: isResizing,
//         isMoving: !isResizing,
//         onTopEdge: onTopEdge,
//         onLeftEdge: onLeftEdge,
//         onRightEdge: onRightEdge,
//         onBottomEdge: onBottomEdge
//     };
// }

// function canMove() {
//     return x > 0 && x < b.width && y > 0 && y < b.height
//         && y < 30;
// }

// function calc(e) {
//     b = pane.getBoundingClientRect();
//     x = e.clientX - b.left;
//     y = e.clientY - b.top;

//     onTopEdge = y < MARGINS;
//     onLeftEdge = x < MARGINS;
//     onRightEdge = x >= b.width - MARGINS;
//     onBottomEdge = y >= b.height - MARGINS;

//     rightScreenEdge = window.innerWidth - MARGINS;
//     bottomScreenEdge = window.innerHeight - MARGINS;
// }

// var e;

// pane.addEventListener("resize", function (e) {
//     Chart.textCanvas.width = document.getElementById("ghostpane").clientWidth;
//     Chart.textCanvas.height = document.getElementById("wrap_canvas_div").clientHeight;
//     Chart.canvas.width = document.getElementById("ghostpane").clientWidth - 70;
//     Chart.canvas.height = document.getElementById("wrap_canvas_div").clientHeight - 75;
//     Chart.drawMain();
//     console.log(1);
// })

// function onMove(ee) {
//     calc(ee);
//     e = ee;

//     redraw = true;

// }

// function animate() {

//     requestAnimationFrame(animate);

//     if (!redraw) return;

//     redraw = false;

//     if (clicked && clicked.isResizing) {

//         if (clicked.onRightEdge) pane.style.width = Math.max(x, minWidth) + 'px';
//         if (clicked.onBottomEdge) pane.style.height = Math.max(y, minHeight) + '%';

//         if (clicked.onLeftEdge) {
//             var currentWidth = Math.max(clicked.cx - e.clientX + clicked.w, minWidth);
//             if (currentWidth > minWidth) {
//                 if (currentWidth > document.getElementById("wrap_canvas_div").clientWidth) {
//                     pane.style.width = document.getElementById("wrap_canvas_div").clientWidth + 'px';
//                 } else if (currentWidth < 251) {
//                     pane.style.width = 250 + 'px';
//                 } else {
//                     pane.style.width = currentWidth + 'px';
//                 }
//                 if (e.clientX < 10) {
//                     pane.style.left = 10 + 'px';
//                 } else if (e.clientX > width) {
//                     pane.style.left = width1 + 'px';
//                 } else {
//                     pane.style.left = e.clientX + 'px';
//                 }
//             }
//             Chart.textCanvas.width = document.getElementById("ghostpane").clientWidth;
//             Chart.textCanvas.height = document.getElementById("wrap_canvas_div").clientHeight;
//             Chart.canvas.width = document.getElementById("ghostpane").clientWidth - 70;
//             Chart.canvas.height = document.getElementById("wrap_canvas_div").clientHeight - 75;
//             drawChart.handleData();
//             drawChart.loadDefaultChart();
//             Chart.drawMain();
//         }

//         if (clicked.onTopEdge) {
//             var currentHeight = Math.max(clicked.cy - e.clientY + clicked.h, minHeight);
//             if (currentHeight > minHeight) {
//                 pane.style.height = currentHeight + 'px';
//                 pane.style.top = e.clientY + 'px';
//             }
//         }

//         return;
//     }

//     // style cursor
//     if (onRightEdge && onBottomEdge || onLeftEdge && onTopEdge) {
//         pane.style.cursor = 'nwse-resize';
//     } else if (onRightEdge && onTopEdge || onBottomEdge && onLeftEdge) {
//         pane.style.cursor = 'nesw-resize';
//     } else if (onRightEdge || onLeftEdge) {
//         pane.style.cursor = 'ew-resize';
//     } else if (onBottomEdge || onTopEdge) {
//         pane.style.cursor = 'ns-resize';
//     } else {
//         pane.style.cursor = 'default';
//     }
// }

// animate();

// function onUp(e) {
//     calc(e);

//     clicked = null;

// }

// function switchMode() {
//     switch (document.getElementById("switch").value) {
//         case "Chart":
//             ChartOn();
//             drawChart.handleData();
//             drawChart.createFilter();
//             drawChart.loadDefaultChart();
//             Chart.drawMain();
//             break;
//         case "Tab-comments":
//             ChangeModeDrawing();
//             break;
//     }
// }