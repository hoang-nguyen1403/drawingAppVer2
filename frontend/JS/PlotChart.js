class PlotChart {
    constructor() {
        this.canvas = document.querySelector('#ChartGL');
        this.canvas.width = document.getElementById("ChartPlot").clientWidth - document.getElementById("ChartPlot").clientWidth * 0.15;
        this.canvas.height = document.getElementById("ChartPlot").clientHeight - document.getElementById("ChartPlot").clientHeight * 0.2;
        this.gl = this.canvas.getContext('webgl');

        this.textCanvas = document.getElementById("axes");
        this.textCanvas.width = document.getElementById("ChartPlot").clientWidth;
        this.textCanvas.height = document.getElementById("ChartPlot").clientHeight;
        this.ctx = this.textCanvas.getContext("2d");

        this.legend = document.getElementById("Legend");
        this.ctx_legend = this.legend.getContext("2d");

        // Declare the card canvas2D - text value of color bar
        this.canvas_text = document.querySelector('#text_colorbar');
        this.canvas_text.width = 65;
        this.canvas_text.height = 400;
        this.ctx_gl = this.canvas_text.getContext('2d');

        // Declare the card canavasGL - color bar
        this.canvas_colorbar = document.querySelector('#canvas_colorbar');
        this.canvas_colorbar.width = 50;
        this.canvas_colorbar.height = 400;
        this.gl_colorbar = this.canvas_colorbar.getContext('webgl2');

        // Declare the vertex and fragment shader
        this.vertex_fill = this.loadVSFG('./frontend/shader/shader_fill.vs');
        this.fragment_fill = this.loadVSFG('./frontend/shader/shader_fill.fs');
        this.vertex_black = this.loadVSFG('./frontend/shader/shader_black.vs');
        this.fragment_black = this.loadVSFG('./frontend/shader/shader_black.fs');
        this.vertex_pick_node = this.loadVSFG('../frontend/shader/shader_pick_node2D.vs');
        this.fragment_pick_node = this.loadVSFG('../frontend/shader/shader_pick_node2D.fs');
        // Compiles shaders, links program
        this.programInfo = twgl.createProgramInfo(this.gl, [this.vertex_fill, this.fragment_fill]);
        this.programInfo_colorbar = twgl.createProgramInfo(this.gl_colorbar, [this.vertex_black, this.fragment_black]);
        this.programInfo_edges = twgl.createProgramInfo(this.gl, [this.vertex_black, this.fragment_black]);
        this.program_pick_node = twgl.createProgramInfo(this.gl, [this.vertex_pick_node, this.fragment_pick_node]);
        // Declare the geometry sphere imformation from library twgl
        this.sphereVerts = twgl.primitives.createSphereVertices(1, 24, 12);

        // Create the buffer info from array for the sphere geometry
        this.sphereBufferInfo = twgl.createBufferInfoFromArrays(this.gl, {
            a_position: this.sphereVerts.position,
            indices: this.sphereVerts.indices,
        });

        // Declare card filler to take the value to load the fillter model
        this.filter_value = document.getElementById("filter");

        // Create camera
        this.camera = {
            x: 0,
            y: 0,
            rotation: 0,
            zoom: 1,
        };

        // Declare scene view and set up mouse position
        this.viewProjectionMat = new Float32Array([0.0013840830652043223, 0, 0, 0, -0.05066209856420755, 0, -1, 1, 1]);
        this.viewProjectionMat_colorbar;
        this.startInvViewProjMat;
        this.startCamera;
        this.startPos = [0, 0];
        this.startClipPos;
        this.startMousePos;
        this.startInvViewProjMat_check;
        this.startCamera_check;
        this.startPos_check;
        this.startClipPos_check;
        this.startMousePos_check;

        // Declare nearpointGL to interesction check point near mouse
        this.nearPointGL;
        this.nearPointGL_storage = [{ x: 10000000, y: 10000000 }, 0];
        this.color = [1, 1, 1, 1];

        // Declare array to storage the data for drawing
        this.scene = [];
        this.arrLine = [];
        this.arrPoint = [];
        this.arrLineAll = [];
        this.node = []
        this.id;
        this.targetTexture;
        this.depthBuffer;
        this.fb;
        this.attachmentPoint;
        this.level;
        this.internalFormat;
        this.border;
        this.format;
        this.type;
        this.data;
        this.scene_axis;
        this.axis_data_max;
        this.axis_data_min;
        this.max_x = 0;
        this.max_y = 0;
        this.id = [];
        this.id_1 = [];
        this.id_2 = [];
        this.id_3 = [];
    }
    // Load vertex and fragment shader
    loadVSFG(path) {
        var request = new XMLHttpRequest();
        request.open('GET', path, false);
        request.overrideMimeType('text\/plain; charset=x-user-defined');
        request.send();
        return ((request.status === 0) || (request.status === 200)) ? request.responseText : null;
    }

    // processing data matrix when zoom, move and rotate
    makeCameraMatrix() {
        const zoomScale = 1 / this.camera.zoom;
        let cameraMat = m3.identity();
        cameraMat = m3.translate(cameraMat, this.camera.x, this.camera.y);
        cameraMat = m3.rotate(cameraMat, this.camera.rotation);
        cameraMat = m3.scale(cameraMat, zoomScale, zoomScale);
        return cameraMat;
    }

    // update view scene when zoom, move and rotate
    updateViewProjection() {
        // same as ortho(0, width, height, 0, -1, 1)
        const projectionMat = m3_fix.projection(this.gl.canvas.width, this.gl.canvas.height);
        const cameraMat = this.makeCameraMatrix();
        let viewMat = m3.inverse(cameraMat);
        this.viewProjectionMat = m3.multiply(projectionMat, viewMat);
    }
    DrawLine() {
        for (let i = 0; i < this.scene.length; i++) {
            const { x, y, rotation, scale, bufferInfo } = this.scene[i];
            // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
            twgl.setBuffersAndAttributes(this.gl, this.programInfo_edges, bufferInfo);
            var color_default = [0, 0, 0, 1];
            let mat = m3.identity();
            mat = m3.translate(mat, x, y);
            mat = m3.rotate(mat, rotation);
            mat = m3.scale(mat, scale, scale);
            this.gl.getParameter(this.gl.LINE_WIDTH);
            this.gl.getParameter(this.gl.ALIASED_LINE_WIDTH_RANGE);
            // calls gl.uniformXXX
            twgl.setUniforms(this.programInfo_edges, {
                u_matrix: m3.multiply(this.viewProjectionMat, mat),
                u_color: color_default,
            });

            // calls gl.drawArrays or gl.drawElements
            twgl.drawBufferInfo(this.gl, bufferInfo, this.gl.LINES);
        }
    }
    setFramebufferAttachmentSizes(width, height) {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.targetTexture);
        // define size and format of level 0
        this.level = 0;
        this.internalFormat = this.gl.RGBA;
        this.border = 0;
        this.format = this.gl.RGBA;
        this.type = this.gl.UNSIGNED_BYTE;
        this.data = null;
        this.gl.texImage2D(this.gl.TEXTURE_2D, this.level, this.internalFormat,
            width, height, this.border,
            this.format, this.type, this.data);

        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.depthBuffer);
        this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, width, height);
    }
    drawFrameBuffer() {
        this.targetTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.targetTexture);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

        // create a depth renderbuffer
        this.depthBuffer = this.gl.createRenderbuffer();
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.depthBuffer);
        // Create and bind the framebuffer
        this.fb = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fb);

        // attach the texture as the first color attachment
        this.attachmentPoint = this.gl.COLOR_ATTACHMENT0;
        this.level = 0;
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.attachmentPoint, this.gl.TEXTURE_2D, this.targetTexture, this.level);

        // make a depth buffer and the same size as the targetTexture
        this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.depthBuffer);

    }
    drawPointInvisible() {
        this.gl.useProgram(this.program_pick_node.program);
        for (let i = 0; i < this.node.length; i++) {
            const bufferInfo = this.node[i];
            // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
            twgl.setBuffersAndAttributes(this.gl, this.program_pick_node, bufferInfo);
            twgl.setUniforms(this.program_pick_node, {
                u_matrix: this.viewProjectionMat,
            })
            twgl.drawBufferInfo(this.gl, bufferInfo, this.gl.POINTS);
        }
    }
    drawCheckpoint(thing) {
        this.gl.useProgram(this.programInfo_edges.program);
        const { x, y, color, bufferInfo } = thing;
        twgl.setBuffersAndAttributes(this.gl, this.programInfo_edges, bufferInfo);
        let mat = m3.identity();
        mat = m3.translate(mat, x, y);
        mat = m3.rotate(mat, 0);
        mat = m3.scale(mat, 5 / this.camera.zoom, 5 / this.camera.zoom);
        this.gl.getParameter(this.gl.LINE_WIDTH);
        this.gl.getParameter(this.gl.ALIASED_LINE_WIDTH_RANGE);
        // calls gl.uniformXXX
        twgl.setUniforms(this.programInfo_edges, {
            u_matrix: m3.multiply(this.viewProjectionMat, mat),
            u_color: color,
        });
        // calls gl.drawArrays or gl.drawElements
        twgl.drawBufferInfo(this.gl, bufferInfo);
    }
    drawPoint() {
        for (let i = 0; i < this.scene.length; i++) {
            var { color, bufferInfo } = this.scene[i];
            // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
            twgl.setBuffersAndAttributes(this.gl, this.programInfo_edges, bufferInfo);
            twgl.setUniforms(this.programInfo_edges, {
                u_matrix: this.viewProjectionMat,
                u_color: color,
            })
            twgl.drawBufferInfo(this.gl, bufferInfo, this.gl.LINES);
        }
    }
    drawAxes() {
        var startInvViewProjMat = m3.inverse(this.viewProjectionMat);
        this.axis_data_max = m3.transformPoint(
            startInvViewProjMat,
            [1, 1]);
        this.axis_data_min = m3.transformPoint(
            startInvViewProjMat,
            [-1, -1]);
        let bufferInfo = twgl.createBufferInfoFromArrays(this.gl, {
            a_position: {
                numComponents: 2,
                data: [this.axis_data_max[0], 0, this.axis_data_min[0], 0, 0, this.axis_data_max[1], 0, this.axis_data_min[1]],
            },
            indices: [0, 1, 2, 3]
        });
        twgl.setBuffersAndAttributes(this.gl, this.programInfo_edges, bufferInfo);
        twgl.setUniforms(this.programInfo_edges, {
            u_matrix: this.viewProjectionMat,
            u_color: [0, 0, 0, 1],
        })
        twgl.drawBufferInfo(this.gl, bufferInfo, this.gl.LINES);
        this.ctx.save();
        const numTicks = 10;
        const tickIntervalX = (this.axis_data_max[0] / this.gl.canvas.width * this.max_x - this.axis_data_min[0] / this.gl.canvas.width * this.max_x) / numTicks;
        const tickIntervalY = (this.axis_data_max[1] / this.gl.canvas.height * this.max_y - this.axis_data_min[1] / this.gl.canvas.height * this.max_y) / numTicks;

        var vertices = [];
        for (let i = 1; i <= numTicks; i++) {
            var value_x;
            var value_y;
            if (tickIntervalX < 0.9 || tickIntervalY < 0.9) {
                value_x = math.round(this.axis_data_min[0] / this.gl.canvas.width * this.max_x + i * tickIntervalX, 5);
                value_y = math.round(this.axis_data_min[1] / this.gl.canvas.height * this.max_y + i * tickIntervalY, 5);
            } else if (tickIntervalX < 0.09 || tickIntervalY < 0.09) {
                value_x = math.round(this.axis_data_min[0] / this.gl.canvas.width * this.max_x + i * tickIntervalX, 5);
                value_y = math.round(this.axis_data_min[1] / this.gl.canvas.height * this.max_y + i * tickIntervalY, 5);

            } else if (tickIntervalX < 0.009 || tickIntervalY < 0.009) {
                value_x = math.round(this.axis_data_min[0] / this.gl.canvas.width * this.max_x + i * tickIntervalX, 5);
                value_y = math.round(this.axis_data_min[1] / this.gl.canvas.height * this.max_y + i * tickIntervalY, 5);

            } else if (tickIntervalX < 0.0009 || tickIntervalY < 0.0009) {
                value_x = math.round(this.axis_data_min[0] / this.gl.canvas.width * this.max_x + i * tickIntervalX, 5);
                value_y = math.round(this.axis_data_min[1] / this.gl.canvas.height * this.max_y + i * tickIntervalY, 5);

            } else {
                value_x = math.round(this.axis_data_min[0] / this.gl.canvas.width * this.max_x + i * tickIntervalX, 0);
                value_y = math.round(this.axis_data_min[1] / this.gl.canvas.height * this.max_y + i * tickIntervalY, 0);
            }
            vertices.push(value_x, value_y);
        }
        // Calculate the scale factors
        const scaleX = this.gl.canvas.width / (this.axis_data_max[0] - this.axis_data_min[0]);
        const scaleY = this.gl.canvas.height / (this.axis_data_max[1] - this.axis_data_min[1]);

        // Set the number of divisions for the x and y axes
        const xDivisions = 10;
        const yDivisions = 10;

        // Calculate the interval sizes
        const xInterval = (this.axis_data_max[0] - this.axis_data_min[0]) / xDivisions;
        const yInterval = (this.axis_data_max[1] - this.axis_data_min[1]) / yDivisions;

        let count_x = 0;
        let count_y = 1;
        this.ctx.strokeStyle = 'red';
        this.ctx.lineWidth = 2;
        for (let i = 1; i <= xDivisions; i++) {
            const x = i * xInterval * scaleX;
            this.ctx.font = "13px Arial"
            this.ctx.fillText(vertices[count_x], x + domID("ChartPlot").clientWidth * 0.09, this.textCanvas.height - 5);
            this.ctx.beginPath();
            this.ctx.moveTo(x + domID("ChartPlot").clientWidth * 0.09, 30 + this.gl.canvas.height);
            this.ctx.lineTo(x + domID("ChartPlot").clientWidth * 0.09, 35 + this.gl.canvas.height);
            this.ctx.stroke();
            count_x += 2;
        }
        for (let i = 1; i <= yDivisions; i++) {
            const y = this.textCanvas.height - i * yInterval * scaleY;
            this.ctx.font = "13px Arial"
            this.ctx.fillText(vertices[count_y], 0, y - domID("ChartPlot").clientHeight * 0.1);
            this.ctx.beginPath();
            this.ctx.moveTo(domID("ChartPlot").clientWidth * 0.09, y - domID("ChartPlot").clientHeight * 0.1);
            this.ctx.lineTo(domID("ChartPlot").clientWidth * 0.11, y - domID("ChartPlot").clientHeight * 0.1);
            this.ctx.stroke();
            count_y += 2;
        }
        this.ctx.restore();
    }
    drawLegend() {
        domID("Legend").style.left = (domID("ChartPlot").clientWidth * 0.09 + domID("ChartGL").clientWidth - domID("Legend").clientWidth).toString() + "px";
        domID("property_chart").style.left = (domID("ChartPlot").clientWidth * 0.09 + domID("ChartGL").clientWidth - domID("property_chart").clientWidth - domID("Legend").clientWidth).toString() + "px";
        // this.ctx_legend.save();
        this.ctx_legend.lineWidth = 2;
        this.ctx_legend.beginPath();
        this.ctx_legend.strokeStyle = 'red';
        this.ctx_legend.font = "20px Arial"
        this.ctx_legend.moveTo(10, this.legend.clientHeight / 3 - 25);
        this.ctx_legend.lineTo(this.legend.clientWidth / 3 + 5, this.legend.clientHeight / 3 - 25);
        this.ctx_legend.stroke();
        this.ctx_legend.fillText("Domain Average", this.legend.clientWidth / 3 + 35, this.legend.clientHeight / 3 - 20)
        this.ctx_legend.beginPath();
        this.ctx_legend.strokeStyle = '#45ff45';
        this.ctx_legend.moveTo(10, 2 * this.legend.clientHeight / 3 - 25);
        this.ctx_legend.lineTo(this.legend.clientWidth / 3 + 5, 2 * this.legend.clientHeight / 3 - 25);
        this.ctx_legend.stroke();
        this.ctx_legend.fillText("Surface Average", this.legend.clientWidth / 3 + 35, 2 * this.legend.clientHeight / 3 - 20)
        this.ctx_legend.beginPath();
        this.ctx_legend.strokeStyle = 'blue';
        this.ctx_legend.moveTo(10, 3 * this.legend.clientHeight / 3 - 25);
        this.ctx_legend.lineTo(this.legend.clientWidth / 3 + 5, 3 * this.legend.clientHeight / 3 - 25);
        this.ctx_legend.stroke();
        this.ctx_legend.fillText("Maximum", this.legend.clientWidth / 3 + 35, 3 * this.legend.clientHeight / 3 - 20)
        // this.ctx.restore();
    }
    drawMain() {
        // set up screen draw
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.drawFrameBuffer();
        this.setFramebufferAttachmentSizes(this.gl.canvas.width, this.gl.canvas.height);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fb);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.updateViewProjection();
        // Invisible in canvas
        this.drawPointInvisible();
        // Pick node invisible in canvas
        let id2D
        // if (clicked == null) {

        id2D = takeIDPoint2DInvisibleChart(event);
        // }
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        if (oldPickNdx2D >= 0) {
            oldPickNdx2D = -1;
        }
        if (id2D > 0) {
            this.nearPointGL = [];
            const pickNdx = id2D - 1;
            oldPickNdx2D = pickNdx;
            var object = drawChart.all_line_find[pickNdx]
            this.nearPointGL.push(object)
        } else this.nearPointGL = [];
        this.canvas.addEventListener('pointermove', (e) => {
            // canvas.style.cursor = "url(frontend/img/select_cursor.svg) 0 0, default";
            this.canvas.style.cursor = "pointer";
        })
        this.canvas.addEventListener('mousemove', checkSolutionChart)
        this.canvas.addEventListener('mousedown', showpropertiesChart);
        this.gl.useProgram(this.programInfo_edges.program);
        // this.gl.useProgram(this.programInfo_edges.program);
        // this.gl.useProgram(this.programInfo_edges.program);
        this.drawAxes();
        this.drawPoint();
        this.drawCheckpoint({
            x: this.nearPointGL_storage[0].x,
            y: this.nearPointGL_storage[0].y,
            color: this.color,
            bufferInfo: this.sphereBufferInfo,
        });
    }
}

const Chart = new PlotChart();
