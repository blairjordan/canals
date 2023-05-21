import { extend, useThree, useLoader, useFrame } from '@react-three/fiber'
import { forwardRef, useContext, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils'

import { Water } from 'three-stdlib'
import NodeGenerator from '../utils/NodeGenerator'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter'
import { useGLTF } from '@react-three/drei'
// import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';

extend({ Water })

const CanalWater = forwardRef((props, ref) => {

  const geomRef = useRef(null)
  const geom2Ref = useRef(null)
  const nodeGenRef = useRef({ generator: NodeGenerator })
  const raycaster = useRef(new THREE.Raycaster())
  raycaster.current.firstHitOnly = true

  const { scene, nodes, materials } = useGLTF('/models/water.glb')
  const {  scene: scene2, nodes: nodes2, materials: materials2  } = useGLTF('/models/walls.glb')

  const gl = useThree((state) => state.gl)
  const waterNormals = useLoader(THREE.TextureLoader, '/textures/waternormals.jpg')
  waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping

  const { geom, geom2 } = useMemo(() => {
    if (geomRef.current && geom2Ref.current) return { geom: geomRef.current, geom2: geom2Ref.current }
    
    if(!geomRef.current && nodes) {
      const parts = [];
      Object.values(nodes).forEach((child) => {
        if (child.isMesh) {
          parts.push(child.geometry.clone())
        }
      })
      geomRef.current = mergeBufferGeometries(parts)
    }
  if(!geom2Ref.current && nodes2) {
      const parts = [];
      Object.values(nodes2).forEach((child) => {
        if (child.isMesh) {
          parts.push(child.geometry.clone())
        }
      })
      geom2Ref.current = mergeBufferGeometries(parts)

      console.log('load walls geom')
  }

    return  { geom: geomRef.current, geom2: geom2Ref.current }
  }, [])

  // const geom = useMemo(() => {
  //   if(geomRef.current) return geomRef.current

  //   //Need to connect this to something that can pull nodes down from the serva bro
  //   nodeGenRef.current.generator.init()
  //   const nodeRows = nodeGenRef.current.generator.nodeVectors
  //   const connections = nodeGenRef.current.generator.nodeConnections
  //   const sectionPoints = nodeGenRef.current.generator.nodeSectionPoints
  //   const deadends = nodeGenRef.current.generator.nodeDeadends

  //   //console.log('CanalWater geom useMemo')

  //   const nodeGeoms = []
  //   const center = new THREE.Vector2()
  //   const vector2 = new THREE.Vector2()
  //   const vector2a = new THREE.Vector2()
  //   const vector2b = new THREE.Vector2()

  //   const circleRadius = 12500
  //   const oceanShape = new THREE.Shape()
  //     .moveTo(0, circleRadius)
  //     .quadraticCurveTo(circleRadius, circleRadius, circleRadius, 0)
  //     .quadraticCurveTo(circleRadius, -circleRadius, 0, -circleRadius)
  //     .quadraticCurveTo(-circleRadius, -circleRadius, -circleRadius, 0)
  //     .quadraticCurveTo(-circleRadius, circleRadius, 0, circleRadius)

  //   // nodeRows.map((nodes) => {
  //   //   nodes.map((node) => {
  //   //     const nodeShape = new THREE.Shape()
  //   //     const nodePoints = []
  //   //     for (let i = 0; i < 8; i++) {
  //   //       center.set(node.x, node.z)
  //   //       vector2.set(center.x + 40, center.y)
  //   //       vector2.rotateAround(center, (i * 45 + 22.5) * THREE.MathUtils.DEG2RAD)
  //   //       nodePoints.push(new THREE.Vector2(vector2.x, -vector2.y))
  //   //     }
  //   //     nodeShape.setFromPoints(nodePoints)
  //   //     const nodeGeom = new THREE.ShapeGeometry(nodeShape)
  //   //     nodeGeoms.push(nodeGeom)
  //   //   })
  //   // })

  //   // connections.map((connection) => {
  //   //   const nodeA = nodeRows[connection[0]][connection[1]]
  //   //   const nodeB = nodeRows[connection[2]][connection[3]]
  //   //   const connShape = new THREE.Shape()
  //   //   const connPoints = []

  //   //   vector2.set(nodeA.x, nodeA.z)
  //   //   vector2b.set(nodeB.x, nodeB.z)

  //   //   const pos = vector2a.set(nodeB.x, nodeB.z).sub(vector2)
  //   //   const angle = pos.angle() * THREE.MathUtils.RAD2DEG
  //   //   vector2a.copy(pos).normalize()

  //   //   //start left
  //   //   center.set(nodeA.x, nodeA.z)
  //   //   vector2.set(center.x + 40, center.y)
  //   //   vector2.rotateAround(center, (angle - 22.5) * THREE.MathUtils.DEG2RAD)
  //   //   connPoints.push(new THREE.Vector2(vector2.x, -vector2.y))

  //   //   //end left
  //   //   center.set(nodeB.x, nodeB.z)
  //   //   vector2.set(center.x + 40, center.y)
  //   //   vector2.rotateAround(center, (angle + 180 + 22.5) * THREE.MathUtils.DEG2RAD)
  //   //   connPoints.push(new THREE.Vector2(vector2.x, -vector2.y))

  //   //   //end right
  //   //   center.set(nodeB.x, nodeB.z)
  //   //   vector2.set(center.x + 40, center.y)
  //   //   vector2.rotateAround(center, (angle + 180 - 22.5) * THREE.MathUtils.DEG2RAD)
  //   //   connPoints.push(new THREE.Vector2(vector2.x, -vector2.y))

  //   //   //start right
  //   //   center.set(nodeA.x, nodeA.z)
  //   //   vector2.set(center.x + 40, center.y)
  //   //   vector2.rotateAround(center, (angle + 22.5) * THREE.MathUtils.DEG2RAD)
  //   //   connPoints.push(new THREE.Vector2(vector2.x, -vector2.y))

  //   //   connShape.setFromPoints(connPoints)
  //   //   const connGeom = new THREE.ShapeGeometry(connShape)

  //   //   nodeGeoms.push(connGeom)
  //   // })

  //   sectionPoints.map((sectionPoint) => {
  //     let section = sectionPoint.slice().reverse();
  //     //Holes need reverse winding.
  //     const holePath = new THREE.Shape(section)
  //     oceanShape.holes.push(holePath)

  //     // const sectionShapeGeom = new THREE.ShapeGeometry(sectionShape)
  //     // nodeGeoms.push(sectionShapeGeom)

  //   },[])

  //   // deadends.map((deadend) => {
  //   //   const cutRadius = 60
  //   //   const cutShape = new THREE.Shape()
  //   //     .moveTo(0, cutRadius)
  //   //     .quadraticCurveTo(cutRadius, cutRadius, cutRadius, 0)
  //   //     .quadraticCurveTo(cutRadius, -cutRadius, 0, -cutRadius)
  //   //     .quadraticCurveTo(-cutRadius, -cutRadius, -cutRadius, 0)
  //   //     .quadraticCurveTo(-cutRadius, cutRadius, 0, cutRadius)

  //   //     const points = cutShape.getPoints()
  //   //     points.forEach((p) => p.add(new THREE.Vector2(deadend.x, -deadend.z)))
  //   //     const holePath = new THREE.Shape(points)
  //   //     oceanShape.holes.push(holePath)
  //   // })

  //   const oceanShapeGeom = new THREE.ShapeGeometry(oceanShape)
  //   nodeGeoms.push(oceanShapeGeom)

  //   geomRef.current = mergeBufferGeometries(nodeGeoms)

  //   // geomRef.current.computeBoundsTree();

  //   return geomRef.current
  // }, [])

  const config = useMemo(
    () => ({
      textureWidth: 1024,
      textureHeight: 1024,
      waterNormals,
      sunDirection: new THREE.Vector3(0, 150, -1500),
      sunColor: 0x041e25,
      waterColor: 0x275980, //000b0e,
      distortionScale: 2.0,
      fog: false,
      format: gl.encoding,
      alpha: 1.0,
      size: 12,
    }),
    [waterNormals],
  )

  useFrame((state, delta) => {
    if (ref) ref.current.material.uniforms.time.value += delta * 0.5

  })
  return <>
      <water ref={ref} args={[geom, config]} rotation={[Math.PI*-0.5,0,0]}/>

      <mesh geometry={geom2} rotation-x={-Math.PI / 2}>
        <meshLambertMaterial attach='material' color='grey' />
      </mesh>
    </>
})

CanalWater.displayName = 'CanalWater'

export { CanalWater }
