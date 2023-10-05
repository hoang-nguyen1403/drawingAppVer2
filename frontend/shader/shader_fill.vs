attribute vec2 a_position;
uniform mat3 u_matrix;
attribute vec4 color;
varying vec4 vColor;
void main() {
  gl_PointSize = 0.0;
  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
  vColor = color;
}