class Draw3D {
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
        const zoomScale = 1 / DrawGL3D.camera.Zoom;
        let projection = m4_fix.projection(this.gl.canvas.clientWidth, this.gl.canvas.clientHeight, DrawGL3D.camera.Deep);
        projection = m4_fix.translate(projection, DrawGL3D.camera.translation_x, DrawGL3D.camera.translation_y, DrawGL3D.camera.translation_z);
        projection = m4_fix.xRotate(projection, this.degToRad(DrawGL3D.camera.rotation_X));
        projection = m4_fix.yRotate(projection, this.degToRad(DrawGL3D.camera.rotation_Y));
        projection = m4_fix.zRotate(projection, this.degToRad(DrawGL3D.camera.rotation_Z));
        projection = m4_fix.scale(projection, zoomScale, zoomScale, zoomScale);
        DrawGL3D.viewProjectionMat = projection;
    }
    drawMesh() {
        this.gl.useProgram(this.programInfo_edges.program);
        for (let i = 0; i < DrawGL3D.sceneMesh.length; i++) {
            const bufferInfo = DrawGL3D.sceneMesh[i];
            twgl.setBuffersAndAttributes(this.gl, this.programInfo_edges, bufferInfo);
            twgl.setUniforms(this.programInfo_edges, {
                u_matrix: DrawGL3D.viewProjectionMat,
                u_color: [0, 0, 0, 1],
            })
            twgl.drawBufferInfo(this.gl, bufferInfo, this.gl.LINES);
        }
    }
    drawFill() {
        this.gl.useProgram(this.program.program);
        for (let i = 0; i < DrawGL3D.sceneFill.length; i++) {
            const bufferInfo = DrawGL3D.sceneFill[i];
            twgl.setBuffersAndAttributes(this.gl, this.program, bufferInfo);
            twgl.setUniforms(this.program, {
                u_matrix: DrawGL3D.viewProjectionMat,
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
        mat = m4_fix.scale(mat, 5 * DrawGL3D.camera.Zoom, 5 * DrawGL3D.camera.Zoom, 5 * DrawGL3D.camera.Zoom);
        twgl.setUniforms(this.programInfo_edges, {
            u_matrix: m4_fix.multiply(DrawGL3D.viewProjectionMat, mat),
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
        mat = m4_fix.scale(mat, 5 * DrawGL3D.camera.Zoom, 5 * DrawGL3D.camera.Zoom, 5 * DrawGL3D.camera.Zoom);
        twgl.setUniforms(this.programInfo_edges, {
            u_matrix: m4_fix.multiply(DrawGL3D.viewProjectionMat, mat),
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
        for (let i = 0; i < DrawGL3D.node.length; i++) {
            const bufferInfo = DrawGL3D.node[i];
            twgl.setBuffersAndAttributes(this.gl, this.program_pick_node, bufferInfo);
            twgl.setUniforms(this.program_pick_node, {
                u_matrix: DrawGL3D.viewProjectionMat,
            })
            twgl.drawBufferInfo(this.gl, bufferInfo, this.gl.POINTS);
        }
    }
    drawMain() {

        // set up screen draw
        this.drawFrameBuffer();
        this.setFramebufferAttachmentSizes(this.gl.canvas.width, this.gl.canvas.height);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fb);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.enable(this.gl.DEPTH_TEST);
        DrawGL3D.gl.depthFunc(DrawGL3D.gl.LEQUAL);
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
                DrawGL3D.nearestPointGL3D = [];
                const pickNdx = id - 1;
                oldPickNdx3D = pickNdx;
                const object = DrawGL3D.takeValueRange[pickNdx]
                this.drawCheckPoint({
                    x: object.coord[0],
                    y: object.coord[1],
                    z: object.coord[2],
                    bufferInfo: this.sphereBufferInfo
                });
                DrawGL3D.nearestPointGL3D.push(object)
            } else DrawGL3D.nearestPointGL3D = [];
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
        DrawGL3D.drawPointProperty({
            x: DrawGL3D.pointStorage.x,
            y: DrawGL3D.pointStorage.y,
            z: DrawGL3D.pointStorage.z,
            color: DrawGL.color,
            bufferInfo: DrawGL3D.sphereBufferInfo,
        });
    }
}

const DrawGL3D = new Draw3D();