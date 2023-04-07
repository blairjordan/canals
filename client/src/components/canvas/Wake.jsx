//
import { useLoader, useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'
import TrailRenderer from '../utils/TrailRenderer'
import MeshLineMaterial from '../utils/MeshLineMaterial'
// import MeshLine from '../utils/MeshLine'
import { Trail } from '@react-three/drei'
import { MeshLineGeometry } from 'meshline'

function BoatWake(props) {
  const [created, setCreated] = useState(false)
  const updateFrameRef = useRef(0)
  const wakeGroupRef = useRef(null)
  const lineGeomRef = useRef(null)
  const lineMaterialRef = useRef(null)
  const trailRendererRef = useRef(null)
  const trailPointRef = useRef(null)
  const trailPointsRef = useRef(null)
  const trailIndexRef = useRef(0)
  const helperRef = useRef({ vector3: new THREE.Vector3() })
  const wakeTex = useLoader(THREE.TextureLoader, '/textures/wake.png')
  wakeTex.wrapS = wakeTex.wrapT = THREE.RepeatWrapping

  const createTrail = () => {
    if (created) return
    if (!props.player.current) return
    if (!wakeTex) return
    if (props.player.current.children.length === 0) return
    if (trailRendererRef.current) return

    setCreated(true)

    const scene = props.player.current.parent

    const points = []
    for (let j = 0; j < 60; j++) {
      points.push(
        new THREE.Vector3(props.player.current.position.x + j * 0.1, 0.1, props.player.current.position.z + j * 0.1),
      )
    }

    const line = new MeshLineGeometry()
    // const trailGeom = new THREE.BufferGeometry()
    // trailGeom.setFromPoints(points, (p) => 0.75 - p)
    // trailGeom.computeBoundingBox()
    // line.setGeometry(trailGeom)
    line.setFromPoints(points, (p) => 0.75 - p)
    let lineMaterial = new MeshLineMaterial({
      color: new THREE.Color('white'),
      map: wakeTex,
      useMap: 1,
      alphaMap: wakeTex,
      useAlphaMap: 1,
      transparent: true,
      opacity: 1.0,
      //alphaTest: 0.2,
      repeat: new THREE.Vector2(1, 1),
      resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
      sizeAttenuation: false,
      lineWidth: 1000,
      length: 20,
      // near: this.camera.near,
      // far: this.camera.far
    })
    lineMaterial.fog = false

    const mesh = new THREE.Mesh(line, lineMaterial)
    mesh.frustumCulled = false
    mesh.visible = true
    mesh.renderOrder = -1
    scene.add(mesh)

    var trailPoint = new THREE.Object3D()
    props.player.current.add(trailPoint)
    trailPoint.translateZ(5)
    trailPoint.translateY(0.1)
    trailPoint.translateX(-0.25)

    var trailRenderer = new TrailRenderer(scene, true)
    var trailLength = 60 + Math.floor(Math.random() * 2)
    var trailMaterial = trailRenderer.createTexturedMaterial()
    trailMaterial.uniforms.textureMap.value = wakeTex
    trailMaterial.uniforms.headColor.value.set(1.0, 1.0, 1.0, 0.4)
    trailMaterial.uniforms.tailColor.value.set(1.0, 1.0, 1.0, 0.0)
    trailMaterial.uniforms.lengthScale.value = 0.25

    const width = 0.5
    trailMaterial.side = THREE.DoubleSide
    var trailHeadGeometry = []
    trailHeadGeometry.push(
      new THREE.Vector3(width, 0.0, 0.0),
      //new THREE.Vector3(0, -0.2, 0.0),
      new THREE.Vector3(-width, 0.0, 0.0),
    )
    trailRenderer.initialize(trailMaterial, trailLength, false, 0, trailHeadGeometry, trailPoint)
    trailRenderer.frustumCulled = false
    trailRenderer.activate()
    trailMaterial.uniforms.textureTileFactor.value = new THREE.Vector2(1.0, 1.0)

    trailPointRef.current = trailPoint
    lineGeomRef.current = line
    lineMaterialRef.current = lineMaterial
    trailPointsRef.current = points
    trailRendererRef.current = trailRenderer
    console.log('created wake')
  }

  useFrame((state, delta) => {
    createTrail()
    if (trailRendererRef.current) {

      updateFrameRef.current += 1
      if (updateFrameRef.current % 5 == 0) {
        trailRendererRef.current.advance()
        trailRendererRef.current.updateHead()
      }
    }
  })

  return <group ref={wakeGroupRef} />
}

export { BoatWake }
