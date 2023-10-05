precision mediump float;

// Passed in from the vertex shader.
uniform vec4 u_color;

void main() {
  gl_FragColor = u_color;
}