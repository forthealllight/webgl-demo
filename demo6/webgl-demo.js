window.onload = function () {
  "use strict";

  var m = ThreeDMath;
  
  function main() {
    var cubeVertices = [
      -1, -1, -1,
       1, -1, -1,
       1,  1, -1,
      -1,  1, -1,
      -1, -1,  1,
       1, -1,  1,
       1,  1,  1,
      -1,  1,  1,
    ];
    var indices = [
      0, 1,
      1, 2,
      2, 3,
      3, 0,
      4, 5,
      5, 6,
      6, 7,
      7, 4,
      0, 4,
      1, 5,
      2, 6,
      3, 7,
    ];
  
    var canvas = document.getElementById("c");
    var gl = canvas.getContext("webgl");
    if (!gl) {
      alert("no webgl");
      return;
    }
  
    var program = webglUtils.createProgramFromScripts(
        gl, ["2d-vertex-shader", "2d-fragment-shader"]);
    gl.useProgram(program);
  
    var positionLoc = gl.getAttribLocation(program, "a_position");
    var worldViewProjectionLoc =
        gl.getUniformLocation(program, "u_worldViewProjection");
  
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(cubeVertices),
        gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
  
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.STATIC_DRAW);
  
    function render(clock) {
    
      clock *= 0.001;
  
      webglUtils.resizeCanvasToDisplaySize(gl.canvas, window.devicePixelRatio);
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  
      gl.clear(gl.COLOR_BUFFER_BIT);
  
      var fieldOfView = Math.PI * 0.25;
      var aspect = canvas.clientWidth / canvas.clientHeight;
      var projection = m.perspective(fieldOfView, aspect, 0.0001, 500);
      var radius = 5;
      var eye = [
          Math.sin(clock) * radius,
          1,
          Math.cos(clock) * radius,
      ];
      var target = [0, 0, 0];
      var up = [0, 1, 0];
      var view = m.lookAt(eye, target, up);
  
      var worldViewProjection = m.multiplyMatrix(view, projection);
      gl.uniformMatrix4fv(worldViewProjectionLoc, false, worldViewProjection);
      
      gl.drawElements(gl.LINES, indices.length, gl.UNSIGNED_SHORT, 0);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }
  main();
  
}


