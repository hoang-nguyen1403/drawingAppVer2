class Drawing {

    // The general method for drawing a quad.
    static drawQuad(canvas, gl, vertices, RGBA) {
        var indices = [3,2,1,3,1,0];

        // Binds the vertex buffer, adds the data, and then unbinds the vertex buffer.
        var vertexBuffer = gl.createBuffer();
    	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    	gl.bindBuffer(gl.ARRAY_BUFFER, null);

        // Binds the index buffer, adds the data, and then unbinds the vertex buffer.
        var indexBuffer = gl.createBuffer();
    	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        // Sets up the vertex code.
        var vertexCode =
    		'attribute vec3 coordinates;' +
    		'void main(void){' +
    			'gl_Position = vec4(coordinates,1.0);'+
    		'}';

        // Passes the vertex shader code to be compiled.
        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    	gl.shaderSource(vertexShader, vertexCode);
    	gl.compileShader(vertexShader);

        // Sets up the fragment code.
        var fragmentCode =
            'void main(void){' +
                'gl_FragColor = vec4(' +
                RGBA[0].toString() + ',' +
                RGBA[1].toString() + ',' +
                RGBA[2].toString() + ',' +
                RGBA[3].toString() +
                ');' +
            '}';

        // Pases the fragment shader code to be compiled. Hense the open pipeline.
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentCode);
        gl.compileShader(fragmentShader);

        // Sets up the shader program and links the vertex and fragment shader.
        var shaderProgram = gl.createProgram();
    	gl.attachShader(shaderProgram, vertexShader);
    	gl.attachShader(shaderProgram, fragmentShader);
    	gl.linkProgram(shaderProgram);
    	gl.useProgram(shaderProgram);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

        var coord = gl.getAttribLocation(shaderProgram, "coordinates");
    	gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(coord);
        // Sets up the viewport based on the canvas width and height.
        gl.viewport(0,0, canvas.width, canvas.height);

        // Once everything has been set up the elements can be drawn to the screen.
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    }

    static drawLine(canvas, gl, vertices, RGBA) {

    	// Initialize the buffer object.
    	var vertexBuffer = gl.createBuffer();

    	// Bind the buffer to the ARRAY_BUFFER.
    	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    	// Add vertex data to the ARRAY_BUFFER
    	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    	// Unbind the ARRAY_BUFFER
    	gl.bindBuffer(gl.ARRAY_BUFFER, null);


    	/*
    	A Shader is a program that lives in the GPU.
    	*/

    	/*
    	Vertex Shader deals with transforming vertices from the affine space
    	to the projective space (screen).
    	*/
    	var vertCode =
                'attribute vec3 coordinates;' +
                'void main(void) {' +
                   ' gl_Position = vec4(coordinates, 1.0);' +
                '}';
    	var vertShader = gl.createShader(gl.VERTEX_SHADER);
    	gl.shaderSource(vertShader, vertCode);
    	gl.compileShader(vertShader);

    	/*
    	Fragment Shader deals with coloring the space between vertices starting
    	with the edges.
    	*/

        var fragCode =
            'void main(void){' +
                'gl_FragColor = vec4(' +
                RGBA[0].toString() + ',' +
                RGBA[1].toString() + ',' +
                RGBA[2].toString() + ',' +
                RGBA[3].toString() +
                ');' +
            '}';

    	var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    	gl.shaderSource(fragShader, fragCode);
    	gl.compileShader(fragShader);


    	/*
    	Creates a GPU program to link vertexShader and fragmentShader.
    	*/
    	var shaderProgram = gl.createProgram();
    	gl.attachShader(shaderProgram, vertShader);
    	gl.attachShader(shaderProgram, fragShader);
    	gl.linkProgram(shaderProgram);
    	gl.useProgram(shaderProgram);

    	// Binds the vertex buffer to use the freed buffer.
    	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    	// Gets the attribute location (line in the program) in which the program holds.
    	var coord = gl.getAttribLocation(shaderProgram, "coordinates");
    	gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);

    	gl.enableVertexAttribArray(coord);

    	// Projection Coordinates
    	gl.viewport(0,0,canvas.width,canvas.height);

    	gl.drawArrays(gl.LINES, 0, 2);
    }
}