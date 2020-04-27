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
    attribute vec2 a_TexCoord;
    varying vec2 v_TexCoord;
    void main() {
      gl_Position =  a_Position;
      v_TexCoord = a_TexCoord;
    }
  `;

  // Fragment shader program
  
  const fsSource = `
    #ifdef GL_ES
    precision mediump float;
    #endif
    uniform sampler2D u_Sampler;
    uniform sampler2D u_Sampler1;
    varying lowp vec4 vColor;
    varying lowp vec2 v_TexCoord;
    uniform vec4 u_color;
    uniform vec4 shadow_colour; 
    uniform float shadow_height; 
    uniform float bounces; 
    uniform float progress;
    const float PI = 3.14159265358;
    vec4 getToColor(vec2  uv){
      return texture2D(u_Sampler,uv);
    }
    vec4 getFromColor(vec2 uv){
      return texture2D(u_Sampler1,uv);
    }
    vec4 transition (vec2 uv) {
      float time = progress;
      float stime = sin(time * PI / 2.);
      float phase = time * PI * bounces;
      float y = (abs(cos(phase))) * (1.0 - stime);
      float d = uv.y - y;
      return mix(
        mix(
          getToColor(uv),
          shadow_colour,
          step(d, shadow_height) * (1. - mix(
            ((d / shadow_height) * shadow_colour.a) + (1.0 - shadow_colour.a),
            1.0,
            smoothstep(0.95, 1., progress) // fade-out the shadow at the end
          ))
        ),
        getFromColor(vec2(uv.x, uv.y + (1.0 - y))),
        step(d, 0.0)
      );
    }
    void main() {
      gl_FragColor = texture2D(u_Sampler,v_TexCoord) + texture2D(u_Sampler1,v_TexCoord); 
    }
  `;
  
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource)
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.useProgram(shaderProgram);


  //开始绘制
  let vertices = new Float32Array([-0.5,0.5,0.0,1.0,-0.5,-0.5,0.0,0.0,0.5,0.5,1.0,1.0,0.5,-0.5,1.0,0.0])
  let FSIZE = vertices.BYTES_PER_ELEMENT;
  //创建缓冲区
  let vertexBuffer = gl.createBuffer()
  //将缓冲区对象绑定到目标
  gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer)
  //向缓冲区对象写入数据
  gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW)
  let a_Position = gl.getAttribLocation(shaderProgram,'a_Position')
  let a_TexCoord = gl.getAttribLocation(shaderProgram,'a_TexCoord')
  //将缓冲区对象分配给a_Position
  gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,FSIZE * 4,0)
  gl.vertexAttribPointer(a_TexCoord,2,gl.FLOAT,false,FSIZE * 4,FSIZE * 2)
  //开启attribute变
  gl.enableVertexAttribArray(a_Position);
  gl.enableVertexAttribArray(a_TexCoord);

  
  //设置三角形的颜色
  let u_color = gl.getUniformLocation(shaderProgram,'u_color');
  gl.uniform4f(u_color,1.0,1.0,1.0,1.0)
  //获取u_Sampler的存储位置
  let u_Sampler = gl.getUniformLocation(shaderProgram,'u_Sampler')
  let u_Sampler1 = gl.getUniformLocation(shaderProgram,'u_Sampler1')
  let shadowColour = gl.getUniformLocation(shaderProgram,'shadow_colour')
  let shadowHeight = gl.getUniformLocation(shaderProgram,'shadow_height')
  let bounces = gl.getUniformLocation(shaderProgram,'bounces')
   // uniform float shadow_height; 
   // uniform float bounces; 
   // uniform  float progress;
   gl.uniform4f(shadowColour,0.,0.,0.,.6)
   gl.uniform1f(shadowHeight,0.075)
   gl.uniform1f(bounces,3.0)
  let image = new Image();
  let textures = []
  image.onload = function(){
     let textureRef  = createTexture(gl,gl.LINEAR,image);
     gl.activeTexture(gl.TEXTURE0);
     gl.bindTexture(gl.TEXTURE_2D,textureRef)
     textures.push(textureRef)    
  }
  image.src = './cubetexture.png'
  let image1 = new Image();
  image1.onload = function(){
    let textureRef1  = createTexture(gl,gl.LINEAR,image1);
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D,textureRef1)
    textures.push(textureRef1)
  }
  image1.src = './img.png'
  let i =  0.01;
  setInterval(()=>{
    
    if(textures.length === 2){
      if(i >= 1){
        i = 0.01
      }
      gl.uniform1i(u_Sampler, 0);  // texture unit 0
      gl.uniform1i(u_Sampler1, 1);  // texture unit 1
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textures[0]);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, textures[1]);
      let progress = gl.getUniformLocation(shaderProgram,'progress')
      gl.uniform1f(progress,i)
      i += 0.05
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
    }
  },100)
  

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
function createTexture (gl, filter, data, width, height) {
  let textureRef = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, textureRef);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);
  return textureRef;
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

