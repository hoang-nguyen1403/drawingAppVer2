precision mediump float;

// Passed in from the vertex shader.
varying vec4 v_color;

void main() {
  // Convert the point index to an RGB color
  
// float r = mod(v_color, 256.0) / 255.0;
// float g = mod(v_color / 256.0, 256.0) / 255.0;
// float b = mod(v_color / (256.0 * 256.0), 256.0) / 255.0;
  gl_FragColor = v_color;
}