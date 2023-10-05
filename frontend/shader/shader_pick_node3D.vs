attribute vec4 a_position;

uniform mat4 u_matrix;
attribute vec4 a_color;
varying vec4 vColor;

void main() {
  // Multiply the position by the matrices
  gl_Position = u_matrix * a_position;
  gl_PointSize = 5.0;
  vColor = a_color;
}