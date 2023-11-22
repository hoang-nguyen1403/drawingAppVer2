class Resize {
    constructor(name1, name2, name3) {
        this.name1 = domID(name1);
        this.name2 = domID(name2);
        this.name3 = domID(name3);

        this.clicked = null;
        this.onRightEdge;
        this.onBottomEdge;
        this.onLeftEdge;
        this.onTopEdge;
    }
    resizeDrawing() {

    }

    resizeChart() {

    }

    resizeTab() {

    }

    drawAfterResize() {
        // Resize Chart
        Chart.canvas.width = domID("Chart").clientWidth - domID("Chart").clientWidth * 0.15;
        Chart.canvas.height = domID("Chart").clientHeight - domID("Chart").clientHeight * 0.2;
        Chart.textCanvas.width = domID("Chart").clientWidth;
        Chart.textCanvas.height = domID("Chart").clientHeight;
        Chart.drawAxes();
        //draw Canvas 2D;
        PaintIn.canvas.width = domID("wrap_canvas_div").clientWidth;
        PaintIn.canvas.height = domID("wrap_canvas_div").clientHeight;
        PaintIn.renderObject(processingData.allObject);
        if (visualizeData !== undefined) {
            if (visualizeData.data.phi) {

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

                domID("Title_chart").style.left = (domID("axes").clientWidth / 2 - domID("Title_chart").clientWidth / 2).toString() + 'px';
                domID("Legend").style.left = (domID("Chart").clientWidth * 0.09 + domID("ChartGL").clientWidth - domID("Legend").clientWidth).toString() + "px";
                domID("property_chart").style.left = (domID("Chart").clientWidth * 0.09 + domID("ChartGL").clientWidth - domID("property_chart").clientWidth - domID("Legend").clientWidth).toString() + "px";
                drawChart.handleData();
                drawChart.loadDataAfterHandle();
                twgl.resizeCanvasToDisplaySize(Chart.gl.canvas);
                Chart.drawMain();
            }
        }
    }

}
const resize = new Resize("Drawing");

// // Minimum resizable area
// var minWidth = 250;
// var minHeight = 82.3;

// // Thresholds
// var FULLSCREEN_MARGINS = -10;
// var MARGINS = 0;

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

