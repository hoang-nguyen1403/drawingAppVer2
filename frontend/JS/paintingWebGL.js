'use strict';

/* global document, window, twgl, m3 */

const canvas = document.querySelector('#canvasGL');
canvas.width = document.getElementById("wrap_canvas_div").clientWidth;
canvas.height = document.getElementById("wrap_canvas_div").clientHeight;
const canvas1 = document.querySelector('#canvas_colorbar');
canvas1.width = 50;
canvas1.height = 400;
canvas1.style.left = "1404px";
canvas1.style.top = "126px";
canvas1.style.position = "absolute";
const gl = canvas.getContext('webgl');
const g_l= canvas1.getContext('webgl');

const vs = `
attribute vec2 a_position;
uniform mat3 u_matrix;
attribute vec4 color;
varying vec4 vColor;
void main() {
  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
  vColor = color;
}
`;

const fs = `
precision mediump float;
varying vec4 vColor;
void main() {
  gl_FragColor = vColor;
}
`;


const vs1 = `
attribute vec2 a_position;
uniform mat3 u_matrix;
void main() {
  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
}
`;

const fs1 = `
precision mediump float;
uniform vec4 u_color;
void main() {
  gl_FragColor = u_color;
}
`;

 // compiles shaders, links program, looks up locations
const programInfo = twgl.createProgramInfo(gl, [vs, fs]);
const programInfo2 = twgl.createProgramInfo(g_l,[vs1, fs1]);
const sphereVerts = twgl.primitives.createSphereVertices(1, 24, 12);
const camera = {
  x: 0,
  y: 0,
  rotation: 0,
  zoom: 1,
};
var viewProjectionMat;
var startInvViewProjMat;
var startCamera;
var startPos;
var startClipPos;
var startMousePos;
var rotate;
var sphereBufferInfo = twgl.createBufferInfoFromArrays(gl, {
  a_position: sphereVerts.position,
  indices: sphereVerts.indices,
});


class Draw{
  constructor(){
  }
  makeCameraMatrix() {
    const zoomScale = 1 / camera.zoom;
    let cameraMat = m3.identity();
    cameraMat = m3.translate(cameraMat, camera.x, camera.y);
    cameraMat = m3.rotate(cameraMat, camera.rotation);
    cameraMat = m3.scale(cameraMat, zoomScale, zoomScale);
    return cameraMat;
  }
  updateViewProjection() {
    // same as ortho(0, width, height, 0, -1, 1)
    const projectionMat = m3.projection(gl.canvas.width, gl.canvas.height);
    const cameraMat = this.makeCameraMatrix();
    let viewMat = m3.inverse(cameraMat);
    viewProjectionMat = m3.multiply(projectionMat, viewMat);
  }
  updateViewProjection1() {
    // same as ortho(0, width, height, 0, -1, 1)
    const projectionMat = m3.projection(g_l.canvas.width, g_l.canvas.height);
    const cameraMat = this.makeCameraMatrix();
    let viewMat = m3.inverse(cameraMat);
    viewProjectionMat = m3.multiply(projectionMat, viewMat);
  }
  drawThing(thing) {
    const {x, y, rotation, scale, color, bufferInfo} = thing;
    
    // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
  
    let mat = m3.identity();
    mat = m3.translate(mat, x, y);
    mat = m3.rotate(mat, rotation);
    mat = m3.scale(mat, scale, scale);
    gl.getParameter(gl.LINE_WIDTH);
    gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE);
    // calls gl.uniformXXX
    twgl.setUniforms(programInfo, {
      u_matrix: m3.multiply(viewProjectionMat, mat),
      u_color: color,
    });
  
    // calls gl.drawArrays or gl.drawElements
    twgl.drawBufferInfo(gl, bufferInfo, gl.LINES);
    
  }
  drawPoint(){
    gl.clear(gl.COLOR_BUFFER_BIT);
  
    this.updateViewProjection();
      
    gl.useProgram(programInfo.program);

    Draw.scene.forEach(this.drawThing);

    for (let i =0; i<Draw.point_x.length;i++){
      this.drawThing({
        x: Draw.point_x[i],
        y: Draw.point_y[i],
        rotation: 0,
        scale: 2,
        color: [0, 0, 0, 1],
        bufferInfo: sphereBufferInfo,
      });
    }
  }
  colorBar(){
    // gl.clear(gl.COLOR_BUFFER_BIT);
  
    this.updateViewProjection1();
      
    g_l.useProgram(programInfo2.program);
    for (let i = 0 ;i<Draw.scene_color.length;i++){
      const {x, y, rotation, scale,color, bufferInfo} = Draw.scene_color[i];
      // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
      twgl.setBuffersAndAttributes(g_l, programInfo2, bufferInfo);
      let mat = m3.identity();
      mat = m3.translate(mat, x, y);
      mat = m3.rotate(mat, rotation);
      mat = m3.scale(mat, scale, scale);
      g_l.getParameter(g_l.LINE_WIDTH);
      g_l.getParameter(g_l.ALIASED_LINE_WIDTH_RANGE);
      // calls gl.uniformXXX
      twgl.setUniforms(programInfo2, {
        u_matrix: m3.multiply(viewProjectionMat, mat),
        u_color: color,
      });

      // calls gl.drawArrays or gl.drawElements
      twgl.drawBufferInfo(g_l, bufferInfo);
    }
  }
  draw() {
    
    // gl.clear(gl.COLOR_BUFFER_BIT);
  
    this.updateViewProjection();
      
    gl.useProgram(programInfo.program);
  
    if (document.getElementById("fillColor").value==="Off"){
      for (let i = 0 ;i<Draw.scene.length;i++){
          const {x, y, rotation, scale, bufferInfo} = Draw.scene[i];
          // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
          twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
          var color_default = [0,0,0,1];
          let mat = m3.identity();
          mat = m3.translate(mat, x, y);
          mat = m3.rotate(mat, rotation);
          mat = m3.scale(mat, scale, scale);
          gl.getParameter(gl.LINE_WIDTH);
          gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE);
          // calls gl.uniformXXX
          twgl.setUniforms(programInfo, {
            u_matrix: m3.multiply(viewProjectionMat, mat),
            u_color:color_default,
          });

          // calls gl.drawArrays or gl.drawElements
          twgl.drawBufferInfo(gl, bufferInfo,gl.LINES);
      }
    } else if(document.getElementById("fillColor").value==="On") {
      for (let i = 0 ;i<Draw.scene_fill.length;i++){
          const {x, y, rotation, scale, bufferInfo} = Draw.scene_fill[i];
          // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
          twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
          let mat = m3.identity();
          mat = m3.translate(mat, x, y);
          mat = m3.rotate(mat, rotation);
          mat = m3.scale(mat, scale, scale);
          gl.getParameter(gl.LINE_WIDTH);
          gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE);
          // calls gl.uniformXXX
          twgl.setUniforms(programInfo, {
            u_matrix: m3.multiply(viewProjectionMat, mat),
          });
        
          // calls gl.drawArrays or gl.drawElements
          twgl.drawBufferInfo(gl, bufferInfo);
      }
    }
    if (rotate) {
      this.drawThing({
        x: startPos[0],
        y: startPos[1],
        rotation: 0,
        scale: 5,
        color: [0, 0, 0, 1],
        bufferInfo: sphereBufferInfo,
      });
    }
  }
}
Draw.lineVertex = [];
Draw.point_x=[];
Draw.point_y=[];
Draw.segment_mesh=[];
Draw.segment_fill=[];
Draw.scene=[];
Draw.scene_fill=[];
Draw.scene_color=[];
Draw.takePoint = [];
Draw.fillcolor = [];
Draw.colorvec4 =[];
Draw.colorbar_size = [];
Draw.colorbar_indices = [];

function getClipSpaceMousePosition(e) {
  // get canvas relative css position
  const rect = canvas.getBoundingClientRect();
  const cssX = e.clientX - rect.left;
  const cssY = e.clientY - rect.top;
  
  // get normalized 0 to 1 position across and down canvas
  const normalizedX = cssX / canvas.clientWidth;
  const normalizedY = cssY / canvas.clientHeight;

  // convert to clip space
  const clipX = normalizedX *  2 - 1;
  const clipY = normalizedY * -2 + 1;
  
  return [clipX, clipY];
}

function moveCamera(e) {
  const pos = m3.transformPoint(
      startInvViewProjMat,
      getClipSpaceMousePosition(e));
  
  camera.x = startCamera.x + startPos[0] - pos[0];
  camera.y = startCamera.y + startPos[1] - pos[1];
  Draw.prototype.draw();
}

function rotateCamera(e) {
  const delta = (e.clientX - startMousePos[0]) / 100;

  // compute a matrix to pivot around the camera space startPos
  let camMat = m3.identity();
  camMat = m3.translate(camMat, startPos[0], startPos[1]);
  camMat = m3.rotate(camMat, delta);
  camMat = m3.translate(camMat, -startPos[0], -startPos[1]);
  
  // multply in the original camera matrix
  Object.assign(camera, startCamera);
  camMat = m3.multiply(camMat, Draw.prototype.makeCameraMatrix());

  // now we can set the rotation and get the needed
  // camera position from the matrix
  camera.rotation = startCamera.rotation + delta;  
  camera.x = camMat[6];
  camera.y = camMat[7];

  Draw.prototype.draw();
}

function handleMouseMove(e) {
  if (rotate) {
    rotateCamera(e);
  } if (e.buttons==4){
    moveCamera(e);
}
}

function handleMouseUp(e) {
  rotate = false;
  Draw.prototype.draw();
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('mouseup', handleMouseUp);
  
}

canvas.addEventListener('mousedown', (e) => {
  e.preventDefault();
  
  window.addEventListener('mouseup', handleMouseUp);
  window.addEventListener('mousemove', handleMouseMove);
  if (e.buttons == 1){
    rotate = e.shiftKey;
  }
  startInvViewProjMat = m3.inverse(viewProjectionMat);
  startCamera = Object.assign({}, camera);
  startClipPos = getClipSpaceMousePosition(e);
  startPos = m3.transformPoint(
      startInvViewProjMat,
      startClipPos);
  startMousePos = [e.clientX, e.clientY];
  Draw.prototype.draw();
});


canvas.addEventListener('wheel', (e) => {
 
  e.preventDefault();  
  const [clipX, clipY] = getClipSpaceMousePosition(e);
  
  // position before zooming
  const [preZoomX, preZoomY] = m3.transformPoint(
      m3.inverse(viewProjectionMat), 
      [clipX, clipY]);
    
  // multiply the wheel movement by the current zoom level
  // so we zoom less when zoomed in and more when zoomed out
  const newZoom = camera.zoom * Math.pow(2, e.deltaY * -0.001);
  camera.zoom = Math.max(0.02, Math.min(100, newZoom));
  
  Draw.prototype.updateViewProjection();
  
  // position after zooming
  const [postZoomX, postZoomY] = m3.transformPoint(
      m3.inverse(viewProjectionMat), 
      [clipX, clipY]);

  // camera needs to be moved the difference of before and after
  camera.x += preZoomX - postZoomX;
  camera.y += preZoomY - postZoomY;  
  
  Draw.prototype.draw();
});