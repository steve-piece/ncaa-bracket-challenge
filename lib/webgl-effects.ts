export function createWebGLParticles(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl")

  if (!gl) {
    console.error("WebGL not supported")
    return () => {}
  }

  // Set canvas size to match display size
  const resizeCanvas = () => {
    const displayWidth = canvas.clientWidth
    const displayHeight = canvas.clientHeight

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth
      canvas.height = displayHeight
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    }
  }

  resizeCanvas()
  window.addEventListener("resize", resizeCanvas)

  // Vertex shader program with point size variation
  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
    attribute float aPointSize;
    
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform float uTime;
    
    varying lowp vec4 vColor;
    
    void main(void) {
      // Add a slight wave motion based on time
      vec4 position = aVertexPosition;
      position.x += sin(uTime * 0.001 + position.y * 5.0) * 0.02;
      position.y += cos(uTime * 0.0015 + position.x * 5.0) * 0.02;
      
      gl_Position = uProjectionMatrix * uModelViewMatrix * position;
      gl_PointSize = aPointSize;
      vColor = aVertexColor;
    }
  `

  // Fragment shader program with glowing effect
  const fsSource = `
    varying lowp vec4 vColor;
    
    void main(void) {
      // Create a circular point with soft edges
      float distance = length(gl_PointCoord - vec2(0.5, 0.5));
      if (distance > 0.5) {
          discard;
      }
      
      // Add glow effect
      float glow = 1.0 - (distance * 2.0);
      glow = pow(glow, 1.5);
      
      gl_FragColor = vec4(vColor.rgb, vColor.a * glow);
    }
  `

  // Initialize a shader program
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource)

  if (!shaderProgram) {
    return () => {}
  }

  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
      vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor"),
      pointSize: gl.getAttribLocation(shaderProgram, "aPointSize"),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
      time: gl.getUniformLocation(shaderProgram, "uTime"),
    },
  }

  // Create particle buffers
  const particleCount = 150
  const buffers = initBuffers(gl, particleCount)

  // Animation variables
  const particles = Array(particleCount)
    .fill(0)
    .map(() => ({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      z: Math.random() * 2 - 1,
      vx: (Math.random() - 0.5) * 0.01,
      vy: (Math.random() - 0.5) * 0.01,
      vz: (Math.random() - 0.5) * 0.01,
      size: 2 + Math.random() * 4, // Varying point sizes
      r: 0.12 + Math.random() * 0.2, // Blue-ish base
      g: 0.5 + Math.random() * 0.5, // Cyan to teal range
      b: 0.8 + Math.random() * 0.2, // Bright blue to cyan
      a: 0.5 + Math.random() * 0.5,
    }))

  // Add some orange/secondary color particles
  for (let i = 0; i < particleCount / 5; i++) {
    const index = Math.floor(Math.random() * particleCount)
    particles[index].r = 0.8 + Math.random() * 0.2 // Orange-red
    particles[index].g = 0.3 + Math.random() * 0.3 // Medium orange
    particles[index].b = 0.0 + Math.random() * 0.1 // Low blue
  }

  let then = 0

  // Enable blending for the glow effect
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  // Draw the scene
  function render(now: number) {
    now *= 0.001 // convert to seconds
    const deltaTime = now - then
    then = now

    // Update particle positions
    updateParticles(deltaTime, now)

    // Clear the canvas
    gl.clearColor(0.0, 0.0, 0.0, 0.0)
    gl.clearDepth(1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    // Create the projection matrix
    const projectionMatrix = mat4.create()
    mat4.perspective(projectionMatrix, (45 * Math.PI) / 180, gl.canvas.width / gl.canvas.height, 0.1, 100.0)

    // Create the model view matrix
    const modelViewMatrix = mat4.create()
    mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -5.0])

    // Rotate the scene slowly
    mat4.rotateY(modelViewMatrix, modelViewMatrix, now * 0.1)
    mat4.rotateX(modelViewMatrix, modelViewMatrix, now * 0.05)

    // Update the position buffer
    const positions = new Float32Array(particles.flatMap((p) => [p.x, p.y, p.z]))
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    // Update the color buffer
    const colors = new Float32Array(particles.flatMap((p) => [p.r, p.g, p.b, p.a]))
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color)
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW)

    // Update the point size buffer
    const sizes = new Float32Array(particles.map((p) => p.size))
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.pointSize)
    gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW)

    // Draw the particles
    drawScene(gl, programInfo, buffers, projectionMatrix, modelViewMatrix, now)

    // Request the next frame
    requestAnimationFrame(render)
  }

  // Start the animation
  requestAnimationFrame(render)

  // Update particle positions
  function updateParticles(deltaTime: number, now: number) {
    particles.forEach((p, i) => {
      // Add some wave motion
      p.x += p.vx + Math.sin(now * 0.5 + i * 0.1) * 0.001
      p.y += p.vy + Math.cos(now * 0.5 + i * 0.1) * 0.001
      p.z += p.vz

      // Pulsate size slightly
      p.size = (2 + Math.random() * 4) * (0.8 + Math.sin(now * 2 + i) * 0.2)

      // Pulsate alpha slightly
      p.a = (0.5 + Math.random() * 0.5) * (0.8 + Math.sin(now + i) * 0.2)

      // Bounce off the edges
      if (Math.abs(p.x) > 1) p.vx *= -1
      if (Math.abs(p.y) > 1) p.vy *= -1
      if (Math.abs(p.z) > 1) p.vz *= -1
    })
  }

  // Return a cleanup function
  return () => {
    window.removeEventListener("resize", resizeCanvas)
  }
}

// Initialize shader program
function initShaderProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource)
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)

  if (!vertexShader || !fragmentShader) {
    return null
  }

  // Create the shader program
  const shaderProgram = gl.createProgram()
  if (!shaderProgram) {
    return null
  }

  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)

  // Check if creating the shader program succeeded
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error("Unable to initialize the shader program: " + gl.getProgramInfoLog(shaderProgram))
    return null
  }

  return shaderProgram
}

// Load a shader
function loadShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)

  if (!shader) {
    console.error("Unable to create shader")
    return null
  }

  // Send the source to the shader object
  gl.shaderSource(shader, source)

  // Compile the shader program
  gl.compileShader(shader)

  // Check if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }

  return shader
}

// Initialize buffers for particles
function initBuffers(gl: WebGLRenderingContext, particleCount: number) {
  // Create position buffer
  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  // Create color buffer
  const colorBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)

  // Create point size buffer
  const pointSizeBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, pointSizeBuffer)

  return {
    position: positionBuffer,
    color: colorBuffer,
    pointSize: pointSizeBuffer,
    count: particleCount,
  }
}

// Draw the scene
function drawScene(
  gl: WebGLRenderingContext,
  programInfo: any,
  buffers: any,
  projectionMatrix: Float32Array,
  modelViewMatrix: Float32Array,
  now: number,
) {
  // Tell WebGL to use our program when drawing
  gl.useProgram(programInfo.program)

  // Set the shader uniforms
  gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix)
  gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix)
  gl.uniform1f(programInfo.uniformLocations.time, now * 1000)

  // Tell WebGL how to pull out the positions from the position buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
  gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition)

  // Tell WebGL how to pull out the colors from the color buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color)
  gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor)

  // Tell WebGL how to pull out the point sizes from the point size buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.pointSize)
  gl.vertexAttribPointer(programInfo.attribLocations.pointSize, 1, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(programInfo.attribLocations.pointSize)

  // Draw the particles
  gl.drawArrays(gl.POINTS, 0, buffers.count)
}

// Simple matrix library for WebGL
const mat4 = {
  create: () => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),

  perspective: (out: Float32Array, fovy: number, aspect: number, near: number, far: number) => {
    const f = 1.0 / Math.tan(fovy / 2)

    out[0] = f / aspect
    out[1] = 0
    out[2] = 0
    out[3] = 0
    out[4] = 0
    out[5] = f
    out[6] = 0
    out[7] = 0
    out[8] = 0
    out[9] = 0
    out[10] = (far + near) / (near - far)
    out[11] = -1
    out[12] = 0
    out[13] = 0
    out[14] = (2 * far * near) / (near - far)
    out[15] = 0

    return out
  },

  translate: (out: Float32Array, a: Float32Array, v: number[]) => {
    const x = v[0],
      y = v[1],
      z = v[2]

    out[12] = a[0] * x + a[4] * y + a[8] * z + a[12]
    out[13] = a[1] * x + a[5] * y + a[9] * z + a[13]
    out[14] = a[2] * x + a[6] * y + a[10] * z + a[14]
    out[15] = a[3] * x + a[7] * y + a[11] * z + a[15]

    return out
  },

  rotateX: (out: Float32Array, a: Float32Array, rad: number) => {
    const s = Math.sin(rad)
    const c = Math.cos(rad)
    const a10 = a[4]
    const a11 = a[5]
    const a12 = a[6]
    const a13 = a[7]
    const a20 = a[8]
    const a21 = a[9]
    const a22 = a[10]
    const a23 = a[11]

    // Perform axis-specific matrix multiplication
    out[4] = a10 * c + a20 * s
    out[5] = a11 * c + a21 * s
    out[6] = a12 * c + a22 * s
    out[7] = a13 * c + a23 * s
    out[8] = a20 * c - a10 * s
    out[9] = a21 * c - a11 * s
    out[10] = a22 * c - a12 * s
    out[11] = a23 * c - a13 * s

    // Copy the rest of the matrix
    out[0] = a[0]
    out[1] = a[1]
    out[2] = a[2]
    out[3] = a[3]
    out[12] = a[12]
    out[13] = a[13]
    out[14] = a[14]
    out[15] = a[15]

    return out
  },

  rotateY: (out: Float32Array, a: Float32Array, rad: number) => {
    const s = Math.sin(rad)
    const c = Math.cos(rad)
    const a00 = a[0]
    const a01 = a[1]
    const a02 = a[2]
    const a03 = a[3]
    const a20 = a[8]
    const a21 = a[9]
    const a22 = a[10]
    const a23 = a[11]

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c - a20 * s
    out[1] = a01 * c - a21 * s
    out[2] = a02 * c - a22 * s
    out[3] = a03 * c - a23 * s
    out[8] = a00 * s + a20 * c
    out[9] = a01 * s + a21 * c
    out[10] = a02 * s + a22 * c
    out[11] = a03 * s + a23 * c

    // Copy the rest of the matrix
    out[4] = a[4]
    out[5] = a[5]
    out[6] = a[6]
    out[7] = a[7]
    out[12] = a[12]
    out[13] = a[13]
    out[14] = a[14]
    out[15] = a[15]

    return out
  },
}

