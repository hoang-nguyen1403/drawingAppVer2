attribute vec2 a_position;

uniform mat3 u_matrix;
attribute vec4 a_color;
varying vec4 vColor;

void main() {
  // Multiply the position by the matrices
  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
  gl_PointSize = 5.0;
  vColor = a_color;
}