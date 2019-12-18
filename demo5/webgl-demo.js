main();

//
// Start here
//
function main() {
  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl');

  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program

  const vsSource = `
    attribute vec4 a_Position;
    uniform mat4 u_xformMatrix;
    void main() {
      gl_Position = u_xformMatrix * a_Position;
    }
  `;

  // Fragment shader program
  
  const fsSource = `
    #ifdef GL_ES
    precision mediump float;
    #endif
    varying lowp vec4 vColor;
    uniform vec4 u_color;
    void main() {
      gl_FragColor = u_color;
    }
  `;
  
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource)
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.useProgram(shaderProgram);
  //开始绘制
  let vertices = new Float32Array([0.0,0.5,-0.5,-0.5,0.5,-0.5])
  //创建缓冲区
  let vertexBuffer = gl.createBuffer()
  //将缓冲区对象绑定到目标
  gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer)
  //向缓冲区对象写入数据
  gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW)
  let a_Position = gl.getAttribLocation(shaderProgram,'a_Position')
  //将缓冲区对象分配给a_Position
  gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,0,0)
  //开启attribute变
  gl.enableVertexAttribArray(a_Position);
  //设置三角形的颜色
  let u_color = gl.getUniformLocation(shaderProgram,'u_color');
  let u_xformMatrix = gl.getUniformLocation(shaderProgram,'u_xformMatrix');
  let translateMatrix = mat4.create(1);
  gl.uniformMatrix4fv(u_xformMatrix,false,translateMatrix)
  gl.uniform4f(u_color,1.0,1.0,1.0,1.0)
  gl.drawArrays(gl.TRIANGLES,0,3)
  //将平移距离传输给定点着色器
  let Tx = 0.5,Ty=0.5,Tz=0.0;
  mat4.translate(translateMatrix,translateMatrix,[Tx,Ty,Tz])
  gl.uniformMatrix4fv(u_xformMatrix,false,translateMatrix)
  gl.uniform4f(u_color,0.5,0.5,0.5,1.0)
  gl.drawArrays(gl.TRIANGLES,0,3)
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

