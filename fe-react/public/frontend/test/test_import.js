// const { Vector2 } = require("../libs/three");

var rawPoints = [[
    334.22641509,
    273.9245283
],
[
    273,
    331
],
[
    353.68920455,
    255.78125
],
[
    450,
    166
],
[
    634,
    306
],
[
    607.27435169,
    352.86141074
],
[
    589.52449683,
    383.98444391
],
[
    561,
    434
],
[
    491.56077117,
    384.98407376
],
[
    255,
    218
],
[
    686,
    383
],
[
    294,
    387
], 
[
    334.22641509,
    273.9245283
],
[
    273,
    331
],
[
    353.68920455,
    255.78125
],
[
    450,
    166
],
[
    634,
    306
],
[
    607.27435169,
    352.86141074
],
[
    589.52449683,
    383.98444391
],
[
    561,
    434
],
[
    491.56077117,
    384.98407376
],
[
    255,
    218
],
[
    686,
    383
],
[
    294,
    387
]];
let point2 = new THREE.Vector3();
let point2s = [];

var convexHull = new ConvexHull();

for (let i = 0; i < rawPoints.length; i++) {
    point2.x = rawPoints[i][0];
    point2.y = rawPoints[i][1];
    point2s.push(point2);
}

convexHull.setFromPoints(point2s);

// var assigned = new VertexList();
// var faces = [];
// var newFace2s = [];
// var vertices = points;

// var convexGeo = new THREE.ConvexGeometry(points);












