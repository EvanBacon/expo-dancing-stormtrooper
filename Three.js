import * as THREE from 'three'; // 0.87.1
global.THREE = THREE;
export default THREE;

require('three/examples/js/controls/OrbitControls'); // 0.87.1
require('three/examples/js/loaders/ColladaLoader2');

if (!console.time) {
  console.time = () => {};
}
if (!console.timeEnd) {
  console.timeEnd = () => {};
}

console.ignoredYellowBox = ['THREE.WebGLRenderer', 'THREE.WebGLProgram'];
