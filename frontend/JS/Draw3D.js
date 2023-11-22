class solutionMode3D {
    constructor() {
        this.canvas = document.querySelector("#mode");
        this.gl = this.canvas.getContext("webgl");
        this.canvas.width = document.getElementById("wrap_canvas_div").clientWidth;
        this.canvas.height = document.getElementById("wrap_canvas_div").clientHeight;

        this.vertex = this.loadVSFG("../frontend/shader/shader_3D.vs");
        this.fragment = this.loadVSFG("../frontend/shader/shader_3D.fs");
        this.vertex_black = this.loadVSFG('../frontend/shader/shader_black_3D.vs');
        this.fragment_black = this.loadVSFG('../frontend/shader/shader_black_3D.fs');
        this.vertex_point = this.loadVSFG('../frontend/shader/shader_point.vs');
        this.fragment_point = this.loadVSFG('../frontend/shader/shader_point.fs');
        this.vertex_pick_node = this.loadVSFG('../frontend/shader/shader_pick_node3D.vs');
        this.fragment_pick_node = this.loadVSFG('../frontend/shader/shader_pick_node3D.fs');
        this.program = twgl.createProgramInfo(this.gl, [this.vertex, this.fragment]);
        this.program_point = twgl.createProgramInfo(this.gl, [this.vertex_point, this.fragment_point]);
        this.programInfo_edges = twgl.createProgramInfo(this.gl, [this.vertex_black, this.fragment_black]);
        this.program_pick_node = twgl.createProgramInfo(this.gl, [this.vertex_pick_node, this.fragment_pick_node]);
        // Declare the geometry sphere imformation from library twgl
        this.sphereVerts = twgl.primitives.createSphereVertices(1, 24, 12);

        // Create the buffer info from array for the sphere geometry
        this.sphereBufferInfo = twgl.createBufferInfoFromArrays(this.gl, {
            a_position: this.sphereVerts.position,
            indices: this.sphereVerts.indices,
        });
        this.camera = {
            rotation_X: 0, // degrees
            rotation_Y: 0, // degrees
            rotation_Z: 0, // degrees
            Deep: 40000,
            Zoom: 1,
            translation_x: 0,
            translation_y: 0,
            translation_z: 0,
        }
        this.ui = {
            dragging: false,
            mouse: {
                lastX: -1,
                lastY: -1,
            },
        };

        this.mouse = {
            prevMouseX: 0,
            prevMouseY: 0
        };
        this.mouseX = -1;
        this.mouseY = -1;
        this.point_x = [];
        this.point_y = [];
        this.target = [0, 0, 0];
        this.up = [0, 1, 0];
        this.rotation_Z;
        this.viewProjectionMat;
        this.viewProjectionMat_colorbar;
        this.startInvViewProjMat;
        this.startCamera;
        this.startPos;
        this.startClipPos;
        this.startMousePos;
        this.lastPos;
        this.takeValueRange = [];
        this.nodeCoord = [];
        this.colorNode = [];
        this.lineBase = [];
        this.lineMeshExtrude = [];
        this.takePoint = [];
        this.takePoint_Extrude = [];
        this.sceneFill = [];
        this.sceneMesh = [];
        this.pointStorage = [];
        this.nearestPointGL3D = [];
        this.valueFilter = [];
        this.node = [];
        this.u_id = [];
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
    }
    loadVSFG(path) {
        var request = new XMLHttpRequest();
        request.open('GET', path, false);
        request.overrideMimeType('text\/plain; charset=x-user-defined');
        request.send();
        return ((request.status === 0) || (request.status === 200)) ? request.responseText : null;
    }
    degToRad(deg) {
        return deg * Math.PI / 180;
    }
    updateViewProjection() {
        const zoomScale = 1 / this.camera.Zoom;
        let projection = m4_fix.projection(this.gl.canvas.clientWidth, this.gl.canvas.clientHeight, this.camera.Deep);
        projection = m4_fix.translate(projection, this.camera.translation_x, this.camera.translation_y, this.camera.translation_z);
        projection = m4_fix.xRotate(projection, this.degToRad(this.camera.rotation_X));
        projection = m4_fix.yRotate(projection, this.degToRad(this.camera.rotation_Y));
        projection = m4_fix.zRotate(projection, this.degToRad(this.camera.rotation_Z));
        projection = m4_fix.scale(projection, zoomScale, zoomScale, zoomScale);
        this.viewProjectionMat = projection;
    }
    drawMesh() {
        this.gl.useProgram(this.programInfo_edges.program);
        for (let i = 0; i < this.sceneMesh.length; i++) {
            const bufferInfo = this.sceneMesh[i];
            twgl.setBuffersAndAttributes(this.gl, this.programInfo_edges, bufferInfo);
            twgl.setUniforms(this.programInfo_edges, {
                u_matrix: this.viewProjectionMat,
                u_color: [0, 0, 0, 1],
            })
            twgl.drawBufferInfo(this.gl, bufferInfo, this.gl.LINES);
        }
    }
    drawFill() {
        this.gl.useProgram(this.program.program);
        for (let i = 0; i < this.sceneFill.length; i++) {
            const bufferInfo = this.sceneFill[i];
            twgl.setBuffersAndAttributes(this.gl, this.program, bufferInfo);
            twgl.setUniforms(this.program, {
                u_matrix: this.viewProjectionMat,
            })
            twgl.drawBufferInfo(this.gl, bufferInfo);
        }
    }
    drawCheckPoint(thing) {
        this.gl.useProgram(this.programInfo_edges.program);
        const { x, y, z, bufferInfo } = thing;
        twgl.setBuffersAndAttributes(this.gl, this.programInfo_edges, bufferInfo);
        let mat = m4.identity();
        mat = m4_fix.translate(mat, x, y, z);
        mat = m4_fix.scale(mat, 5 * this.camera.Zoom, 5 * this.camera.Zoom, 5 * this.camera.Zoom);
        twgl.setUniforms(this.programInfo_edges, {
            u_matrix: m4_fix.multiply(this.viewProjectionMat, mat),
            u_color: [1, 0, 0, 1],
        })
        twgl.drawBufferInfo(this.gl, bufferInfo);
    }
    drawPointProperty(thing) {
        this.gl.useProgram(this.programInfo_edges.program);
        const { x, y, z, color, bufferInfo } = thing;
        twgl.setBuffersAndAttributes(this.gl, this.programInfo_edges, bufferInfo);
        let mat = m4.identity();
        mat = m4_fix.translate(mat, x, y, z);
        mat = m4_fix.scale(mat, 5 * this.camera.Zoom, 5 * this.camera.Zoom, 5 * this.camera.Zoom);
        twgl.setUniforms(this.programInfo_edges, {
            u_matrix: m4_fix.multiply(this.viewProjectionMat, mat),
            u_color: color,
        })
        twgl.drawBufferInfo(this.gl, bufferInfo);
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
            twgl.setBuffersAndAttributes(this.gl, this.program_pick_node, bufferInfo);
            twgl.setUniforms(this.program_pick_node, {
                u_matrix: this.viewProjectionMat,
            })
            twgl.drawBufferInfo(this.gl, bufferInfo, this.gl.POINTS);
        }
    }
    drawMain() {
        twgl.resizeCanvasToDisplaySize(this.gl.canvas)
        // set up screen draw
        this.drawFrameBuffer();
        this.setFramebufferAttachmentSizes(this.gl.canvas.width, this.gl.canvas.height);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fb);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.updateViewProjection();
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Invisible in canvas
        this.drawPointInvisible();
        // Pick node invisible in canvas
        let id = takeIDPoint3DInvisible(event);
        // Visible in canvas
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        if (document.getElementById("fillColor").value === "On") {
            if (oldPickNdx3D >= 0) {
                oldPickNdx3D = -1;
            }
            if (id > 0) {
                this.nearestPointGL3D = [];
                const pickNdx = id - 1;
                oldPickNdx3D = pickNdx;
                const object = this.takeValueRange[pickNdx]
                this.drawCheckPoint({
                    x: object.coord[0],
                    y: object.coord[1],
                    z: object.coord[2],
                    bufferInfo: this.sphereBufferInfo
                });
                this.nearestPointGL3D.push(object)
            } else this.nearestPointGL3D = [];
            this.canvas.addEventListener('pointermove', (e) => {
                this.canvas.style.cursor = "pointer";
            })
            this.canvas.addEventListener("mousedown", showproperties3D);
            this.drawFill();
            this.drawMesh();
            // this.drawPoint();
        } else if (document.getElementById("fillColor").value === "Off") {
            this.canvas.addEventListener('pointermove', (e) => {
                this.canvas.style.cursor = "url(frontend/img/select_cursor.svg) 0 0, default";
            })
            document.getElementById("property").style.display = "none";
            this.canvas.removeEventListener("mousedown", showproperties3D);
            this.drawFill();
        }
        this.drawPointProperty({
            x: this.pointStorage.x,
            y: this.pointStorage.y,
            z: this.pointStorage.z,
            color: DrawGL.color,
            bufferInfo: this.sphereBufferInfo,
        });
    }
}

const DrawGL3D = new solutionMode3D();