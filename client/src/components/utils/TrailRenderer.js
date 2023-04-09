import * as THREE from 'three'
/**
 * @author Mark Kellogg - http://www.github.com/mkkellogg
 * @editor nitrogem35 - http://www.github.com/nitrogem35
 */

//=======================================
// Trail Renderer
//=======================================

export default class TrailRenderer {
  constructor(scene, orientToMovement) {
    let obj = new THREE.Object3D()
    for (let key of Object.keys(obj)) {
      this[key] = obj[key]
    }

    this.active = false

    this.orientToMovement = false
    if (orientToMovement) this.orientToMovement = true

    this.scene = scene

    this.geometry = null
    this.mesh = null
    this.nodeCenters = null

    this.lastNodeCenter = null
    this.currentNodeCenter = null
    this.lastOrientationDir = null
    this.nodeIDs = null
    this.currentLength = 0
    this.currentEnd = 0
    this.currentNodeID = 0
    this.MaxHeadVertices = 128
    this.LocalOrientationTangent = new THREE.Vector3(1, 0, 0)
    this.LocalOrientationDirection = new THREE.Vector3(0, 0, -1)
    this.LocalHeadOrigin = new THREE.Vector3(0, 0, 0)

    this.tempMatrix4 = new THREE.Matrix4()
    this.tempQuaternion = new THREE.Quaternion()
    this.tempOffset = new THREE.Vector3()
    this.tempMatrix3 = new THREE.Matrix3()
    this.tempPosition = new THREE.Vector3()
    this.worldOrientation = new THREE.Vector3()
    this.tempDirection = new THREE.Vector3()
    this.tempLocalHeadGeometry = []

    for (let i = 0; i < this.MaxHeadVertices; i++) {
      let vertex = new THREE.Vector3()
      this.tempLocalHeadGeometry.push(vertex)
    }

    this.Shader = {}

    this.initShader()
  }

  initShader() {
    this.Shader.BaseVertexVars = [
      'attribute float nodeID;',
      'attribute float nodeVertexID;',
      'attribute vec3 nodeCenter;',

      'uniform float lengthScale;',
      'uniform float minID;',
      'uniform float maxID;',
      'uniform float trailLength;',
      'uniform float maxTrailLength;',
      'uniform float verticesPerNode;',
      'uniform vec2 textureTileFactor;',

      'uniform vec4 headColor;',
      'uniform vec4 tailColor;',

      'varying vec4 vColor;',
    ].join('\n')

    this.Shader.TexturedVertexVars = [
      this.Shader.BaseVertexVars,
      'varying vec2 vUV;',
      'uniform float dragTexture;',
    ].join('\n')

    this.Shader.BaseFragmentVars = ['varying vec4 vColor;', 'uniform sampler2D textureMap;'].join('\n')

    this.Shader.TexturedFragmentVars = [this.Shader.BaseFragmentVars, 'varying vec2 vUV;'].join('\n')

    this.Shader.VertexShaderCore = [
      'float fraction = (( maxID - nodeID ) / ( maxID - minID ));',
      'vColor = ( 0.9 - fraction ) * headColor + fraction * tailColor;',
      'vec4 realPosition = vec4( ( 1.0 - fraction ) * position.xyz + fraction * nodeCenter.xyz, 1.0 ); ',
      'if(lengthScale > 0.0) {',
      '	realPosition = vec4( ( 1.0 - exp(exp(fraction+lengthScale))) * position.xyz + exp(exp(fraction+lengthScale)) * nodeCenter.xyz, 1.0 ); ',
      '}',
    ].join('\n')

    this.Shader.BaseVertexShader = [
      this.Shader.BaseVertexVars,

      'void main() { ',

      this.Shader.VertexShaderCore,
      'gl_Position = projectionMatrix * viewMatrix * realPosition;',

      '}',
    ].join('\n')

    this.Shader.BaseFragmentShader = [
      this.Shader.BaseFragmentVars,

      'void main() { ',

      'gl_FragColor = vColor;',

      '}',
    ].join('\n')

    this.Shader.TexturedVertexShader = [
      this.Shader.TexturedVertexVars,

      'void main() { ',

      this.Shader.VertexShaderCore,
      'float s = 0.0;',
      'float t = 0.0;',
      'if ( dragTexture == 1.0 ) { ',
      '   s = fraction *  textureTileFactor.s; ',
      ' 	t = ( nodeVertexID / verticesPerNode ) * textureTileFactor.t;',
      '} else { ',
      '	s = nodeID / maxTrailLength * textureTileFactor.s;',
      ' 	t = ( nodeVertexID / verticesPerNode ) * textureTileFactor.t;',
      '}',
      'vUV = vec2( s, t ); ',
      'gl_Position = projectionMatrix * viewMatrix * realPosition;',

      '}',
    ].join('\n')

    this.Shader.TexturedFragmentShader = [
      this.Shader.TexturedFragmentVars,

      'void main() { ',

      'vec4 textureColor = texture2D( textureMap, vUV );',
      'gl_FragColor = vColor * textureColor;',

      '}',
    ].join('\n')
  }

  createMaterial(vertexShader, fragmentShader, customUniforms) {
    customUniforms = customUniforms || {}

    customUniforms.trailLength = { type: 'f', value: null }
    customUniforms.verticesPerNode = { type: 'f', value: null }
    customUniforms.minID = { type: 'f', value: null }
    customUniforms.maxID = { type: 'f', value: null }
    customUniforms.dragTexture = { type: 'f', value: null }
    customUniforms.maxTrailLength = { type: 'f', value: null }
    customUniforms.textureTileFactor = { type: 'v2', value: null }

    customUniforms.headColor = { type: 'v4', value: new THREE.Vector4() }
    customUniforms.tailColor = { type: 'v4', value: new THREE.Vector4() }

    customUniforms.lengthScale = { type: 'f', value: 0.0 }

    vertexShader = vertexShader || this.Shader.BaseVertexShader
    fragmentShader = fragmentShader || this.Shader.BaseFragmentShader

    return new THREE.ShaderMaterial({
      uniforms: customUniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,

      transparent: true,
      alphaTest: 0.5,

      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
      blendEquation: THREE.AddEquation,

      depthTest: true,
      depthWrite: false,

      side: THREE.DoubleSide,
    })
  }

  createBaseMaterial(customUniforms) {
    return this.createMaterial(this.Shader.BaseVertexShader, this.Shader.BaseFragmentShader, customUniforms)
  }

  createTexturedMaterial(customUniforms) {
    customUniforms = {}
    customUniforms.textureMap = { type: 't', value: null }

    return this.createMaterial(this.Shader.TexturedVertexShader, this.Shader.TexturedFragmentShader, customUniforms)
  }

  initialize(material, length, dragTexture, localHeadWidth, localHeadGeometry, targetObject) {
    this.deactivate()
    this.destroyMesh()

    this.length = length > 0 ? length + 1 : 0
    this.dragTexture = !dragTexture ? 0 : 1
    this.targetObject = targetObject

    this.initializeLocalHeadGeometry(localHeadWidth, localHeadGeometry)

    this.nodeIDs = []
    this.nodeCenters = []

    for (let i = 0; i < this.length; i++) {
      this.nodeIDs[i] = -1
      this.nodeCenters[i] = new THREE.Vector3()
    }

    this.material = material

    this.initializeGeometry()
    this.initializeMesh()

    this.material.uniforms.trailLength.value = 0
    this.material.uniforms.minID.value = 0
    this.material.uniforms.maxID.value = 0
    this.material.uniforms.dragTexture.value = this.dragTexture
    this.material.uniforms.maxTrailLength.value = this.length
    this.material.uniforms.verticesPerNode.value = this.VerticesPerNode
    this.material.uniforms.textureTileFactor.value = new THREE.Vector2(1.0, 1.0)

    this.reset()
  }

  initializeLocalHeadGeometry(localHeadWidth, localHeadGeometry) {
    this.localHeadGeometry = []

    if (!localHeadGeometry) {
      let halfWidth = localHeadWidth || 1.0
      halfWidth = halfWidth / 2.0

      this.localHeadGeometry.push(new THREE.Vector3(-halfWidth, 0, 0))
      this.localHeadGeometry.push(new THREE.Vector3(halfWidth, 0, 0))

      this.VerticesPerNode = 2
    } else {
      this.VerticesPerNode = 0
      for (let i = 0; i < localHeadGeometry.length && i < this.MaxHeadVertices; i++) {
        let vertex = localHeadGeometry[i]

        if (vertex && vertex instanceof THREE.Vector3) {
          let vertexCopy = new THREE.Vector3()

          vertexCopy.copy(vertex)

          this.localHeadGeometry.push(vertexCopy)
          this.VerticesPerNode++
        }
      }
    }

    this.FacesPerNode = (this.VerticesPerNode - 1) * 2
    this.FaceIndicesPerNode = this.FacesPerNode * 3
  }

  initializeGeometry() {
    this.vertexCount = this.length * this.VerticesPerNode
    this.faceCount = this.length * this.FacesPerNode

    let geometry = new THREE.BufferGeometry()

    let nodeIDs = new Float32Array(this.vertexCount)
    let nodeVertexIDs = new Float32Array(this.vertexCount * this.VerticesPerNode)
    let positions = new Float32Array(this.vertexCount * 3)
    let nodeCenters = new Float32Array(this.vertexCount * 3)
    let uvs = new Float32Array(this.vertexCount * 2)
    let indices = new Uint32Array(this.faceCount * 3)

    let nodeIDAttribute = new THREE.BufferAttribute(nodeIDs, 1)
    geometry.setAttribute('nodeID', nodeIDAttribute)

    let nodeVertexIDAttribute = new THREE.BufferAttribute(nodeVertexIDs, 1)
    geometry.setAttribute('nodeVertexID', nodeVertexIDAttribute)

    let nodeCenterAttribute = new THREE.BufferAttribute(nodeCenters, 3)
    geometry.setAttribute('nodeCenter', nodeCenterAttribute)

    let positionAttribute = new THREE.BufferAttribute(positions, 3)
    geometry.setAttribute('position', positionAttribute)

    let uvAttribute = new THREE.BufferAttribute(uvs, 2)
    geometry.setAttribute('uv', uvAttribute)

    let indexAttribute = new THREE.BufferAttribute(indices, 1)
    geometry.setIndex(indexAttribute)

    this.geometry = geometry
  }

  zeroVertices() {
    let positions = this.geometry.attributes.position
    for (let i = 0; i < this.vertexCount; i++) {
      let index = i * 3

      positions.array[index] = 0
      positions.array[index + 1] = 0
      positions.array[index + 2] = 0
    }

    positions.needsUpdate = true
  }

  zeroIndices() {
    let indices = this.geometry.getIndex()

    for (let i = 0; i < this.faceCount; i++) {
      let index = i * 3

      indices.array[index] = 0
      indices.array[index + 1] = 0
      indices.array[index + 2] = 0
    }

    indices.needsUpdate = true
  }

  formInitialFaces() {
    this.zeroIndices()

    let indices = this.geometry.getIndex()

    for (let i = 0; i < this.length - 1; i++) {
      this.connectNodes(i, i + 1)
    }

    indices.needsUpdate = true
  }

  initializeMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.dynamic = true
    this.mesh.frustumCulled = false
    this.mesh.matrixAutoUpdate = false
  }

  destroyMesh() {
    if (this.mesh) {
      this.scene.remove(this.mesh)
      this.mesh = null
    }
  }

  reset() {
    this.currentLength = 0
    this.currentEnd = -1

    this.lastNodeCenter = null
    this.currentNodeCenter = null
    this.lastOrientationDir = null

    this.currentNodeID = 0

    this.formInitialFaces()
    this.zeroVertices()

    this.geometry.setDrawRange(0, 0)
  }

  updateUniforms() {
    if (this.currentLength < this.length) {
      this.material.uniforms.minID.value = 0
    } else {
      this.material.uniforms.minID.value = this.currentNodeID - this.length
    }
    this.material.uniforms.maxID.value = this.currentNodeID
    this.material.uniforms.trailLength.value = this.currentLength
    this.material.uniforms.maxTrailLength.value = this.length
    this.material.uniforms.verticesPerNode.value = this.VerticesPerNode
  }

  advance() {
    this.targetObject.updateMatrixWorld()
    this.tempMatrix4.copy(this.targetObject.matrixWorld)

    this.advanceWithTransform(this.tempMatrix4)

    this.updateUniforms()
  }

  advanceWithPositionAndOrientation(nextPosition, orientationTangent) {
    this.advanceGeometry({ position: nextPosition, tangent: orientationTangent }, null)
  }

  advanceWithTransform(transformMatrix) {
    this.advanceGeometry(null, transformMatrix)
  }

  advanceGeometry(positionAndOrientation, transformMatrix) {
    let nextIndex = this.currentEnd + 1 >= this.length ? 0 : this.currentEnd + 1

    if (transformMatrix) {
      this.updateNodePositionsFromTransformMatrix(nextIndex, transformMatrix)
    } else {
      this.updateNodePositionsFromOrientationTangent(
        nextIndex,
        positionAndOrientation.position,
        positionAndOrientation.tangent,
      )
    }

    if (this.currentLength >= 1) {
      this.connectNodes(this.currentEnd, nextIndex)

      if (this.currentLength >= this.length) {
        let disconnectIndex = this.currentEnd + 1 >= this.length ? 0 : this.currentEnd + 1
        this.disconnectNodes(disconnectIndex)
      }
    }

    if (this.currentLength < this.length) {
      this.currentLength++
    }

    this.currentEnd++
    if (this.currentEnd >= this.length) {
      this.currentEnd = 0
    }

    if (this.currentLength >= 1) {
      if (this.currentLength < this.length) {
        this.geometry.setDrawRange(0, (this.currentLength - 1) * this.FaceIndicesPerNode)
      } else {
        this.geometry.setDrawRange(0, this.currentLength * this.FaceIndicesPerNode)
      }
    }

    this.updateNodeID(this.currentEnd, this.currentNodeID)

    this.currentNodeID++
  }

  updateHead() {
    if (this.currentEnd < 0) return

    this.targetObject.updateMatrixWorld()
    this.tempMatrix4.copy(this.targetObject.matrixWorld)

    this.updateNodePositionsFromTransformMatrix(this.currentEnd, this.tempMatrix4)
  }

  updateNodeID(nodeIndex, id) {
    this.nodeIDs[nodeIndex] = id

    let nodeIDs = this.geometry.attributes.nodeID
    let nodeVertexIDs = this.geometry.attributes.nodeVertexID

    for (let i = 0; i < this.VerticesPerNode; i++) {
      let baseIndex = nodeIndex * this.VerticesPerNode + i
      nodeIDs.array[baseIndex] = id
      nodeVertexIDs.array[baseIndex] = i
    }

    nodeIDs.needsUpdate = true
    nodeVertexIDs.needsUpdate = true
  }

  updateNodeCenter(nodeIndex, nodeCenter) {
    this.lastNodeCenter = this.currentNodeCenter

    this.currentNodeCenter = this.nodeCenters[nodeIndex]
    this.currentNodeCenter.copy(nodeCenter)

    let nodeCenters = this.geometry.attributes.nodeCenter

    for (let i = 0; i < this.VerticesPerNode; i++) {
      let baseIndex = (nodeIndex * this.VerticesPerNode + i) * 3
      nodeCenters.array[baseIndex] = nodeCenter.x
      nodeCenters.array[baseIndex + 1] = nodeCenter.y
      nodeCenters.array[baseIndex + 2] = nodeCenter.z
    }

    nodeCenters.needsUpdate = true
  }

  updateNodePositionsFromOrientationTangent(nodeIndex, nodeCenter, orientationTangent) {
    let positions = this.geometry.attributes.position

    this.updateNodeCenter(nodeIndex, nodeCenter)

    this.tempOffset.copy(nodeCenter)
    this.tempOffset.sub(this.LocalHeadOrigin)
    this.tempQuaternion.setFromUnitVectors(this.LocalOrientationTangent, orientationTangent)

    for (let i = 0; i < this.localHeadGeometry.length; i++) {
      let vertex = this.tempLocalHeadGeometry[i]
      vertex.copy(this.localHeadGeometry[i])
      vertex.applyQuaternion(this.tempQuaternion)
      vertex.add(this.tempOffset)
    }

    for (let i = 0; i < this.localHeadGeometry.length; i++) {
      let positionIndex = (this.VerticesPerNode * nodeIndex + i) * 3
      let transformedHeadVertex = this.tempLocalHeadGeometry[i]

      positions.array[positionIndex] = transformedHeadVertex.x
      positions.array[positionIndex + 1] = transformedHeadVertex.y
      positions.array[positionIndex + 2] = transformedHeadVertex.z
    }

    positions.needsUpdate = true
  }

  getMatrix3FromMatrix4(matrix3, matrix4) {
    let e = matrix4.elements
    matrix3.set(e[0], e[1], e[2], e[4], e[5], e[6], e[8], e[9], e[10])
  }

  updateNodePositionsFromTransformMatrix(nodeIndex, transformMatrix) {
    let positions = this.geometry.attributes.position

    this.tempPosition.set(0, 0, 0)
    this.tempPosition.applyMatrix4(transformMatrix)
    this.updateNodeCenter(nodeIndex, this.tempPosition)

    for (let i = 0; i < this.localHeadGeometry.length; i++) {
      let vertex = this.tempLocalHeadGeometry[i]
      vertex.copy(this.localHeadGeometry[i])
    }

    for (let i = 0; i < this.localHeadGeometry.length; i++) {
      let vertex = this.tempLocalHeadGeometry[i]
      vertex.applyMatrix4(transformMatrix)
    }

    if (this.lastNodeCenter && this.orientToMovement) {
      this.getMatrix3FromMatrix4(this.tempMatrix3, transformMatrix)
      this.worldOrientation.set(0, 0, -1)
      this.worldOrientation.applyMatrix3(this.tempMatrix3)

      this.tempDirection.copy(this.currentNodeCenter)
      this.tempDirection.sub(this.lastNodeCenter)
      this.tempDirection.normalize()

      if (this.tempDirection.lengthSq() <= 0.0001 && this.lastOrientationDir) {
        this.tempDirection.copy(this.lastOrientationDir)
      }

      if (this.tempDirection.lengthSq() > 0.0001) {
        if (!this.lastOrientationDir) this.lastOrientationDir = new THREE.Vector3()

        this.tempQuaternion.setFromUnitVectors(this.worldOrientation, this.tempDirection)

        this.tempOffset.copy(this.currentNodeCenter)

        for (let i = 0; i < this.localHeadGeometry.length; i++) {
          let vertex = this.tempLocalHeadGeometry[i]
          vertex.sub(this.tempOffset)
          vertex.applyQuaternion(this.tempQuaternion)
          vertex.add(this.tempOffset)
        }
      }
    }

    for (let i = 0; i < this.localHeadGeometry.length; i++) {
      let positionIndex = (this.VerticesPerNode * nodeIndex + i) * 3
      let transformedHeadVertex = this.tempLocalHeadGeometry[i]

      positions.array[positionIndex] = transformedHeadVertex.x
      positions.array[positionIndex + 1] = transformedHeadVertex.y
      positions.array[positionIndex + 2] = transformedHeadVertex.z
    }

    positions.needsUpdate = true
  }

  connectNodes(srcNodeIndex, destNodeIndex) {
    let indices = this.geometry.getIndex()

    for (let i = 0; i < this.localHeadGeometry.length - 1; i++) {
      let srcVertexIndex = this.VerticesPerNode * srcNodeIndex + i
      let destVertexIndex = this.VerticesPerNode * destNodeIndex + i

      let faceIndex = (srcNodeIndex * this.FacesPerNode + i * 2) * 3

      indices.array[faceIndex] = srcVertexIndex
      indices.array[faceIndex + 1] = destVertexIndex
      indices.array[faceIndex + 2] = srcVertexIndex + 1

      indices.array[faceIndex + 3] = destVertexIndex
      indices.array[faceIndex + 4] = destVertexIndex + 1
      indices.array[faceIndex + 5] = srcVertexIndex + 1
    }

    indices.needsUpdate = true
  }

  disconnectNodes(srcNodeIndex) {
    let indices = this.geometry.getIndex()

    for (let i = 0; i < this.localHeadGeometry.length - 1; i++) {
      let srcVertexIndex = this.VerticesPerNode * srcNodeIndex + i

      let faceIndex = (srcNodeIndex * this.FacesPerNode + i * 2) * 3

      indices.array[faceIndex] = 0
      indices.array[faceIndex + 1] = 0
      indices.array[faceIndex + 2] = 0

      indices.array[faceIndex + 3] = 0
      indices.array[faceIndex + 4] = 0
      indices.array[faceIndex + 5] = 0
    }

    indices.needsUpdate = true
  }

  deactivate() {
    if (this.isActive) {
      this.scene.remove(this.mesh)
      this.isActive = false
    }
  }

  activate() {
    if (!this.isActive) {
      this.scene.add(this.mesh)
      this.isActive = true
    }
  }
}
