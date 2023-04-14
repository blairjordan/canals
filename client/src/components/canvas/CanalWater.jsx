import { extend, useThree, useLoader, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils'

import { Water } from 'three-stdlib'
import NodeGenerator from '../utils/NodeGenerator'

extend({ Water })

function CanalWater() {
  const ref = useRef()
  const geomRef = useRef(null)
  const nodeGenRef = useRef({ generator: NodeGenerator })

  const gl = useThree((state) => state.gl)
  const waterNormals = useLoader(THREE.TextureLoader, '/textures/waternormals.jpg')
  waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping
  const geom = useMemo(() => {
    if(geomRef.current) return geomRef.current

    //Need to connect this to something that can pull nodes down from the serva bro
    nodeGenRef.current.generator.init()
    const nodeRows = nodeGenRef.current.generator.nodeVectors
    const connections = nodeGenRef.current.generator.nodeConnections
    const sectionPoints = nodeGenRef.current.generator.nodeSectionPoints
    const deadends = nodeGenRef.current.generator.nodeDeadends

    //console.log('CanalWater geom useMemo')

    const nodeGeoms = []
    const center = new THREE.Vector2()
    const vector2 = new THREE.Vector2()
    const vector2a = new THREE.Vector2()
    const vector2b = new THREE.Vector2()

    const circleRadius = 12500
    const oceanShape = new THREE.Shape()
      .moveTo(0, circleRadius)
      .quadraticCurveTo(circleRadius, circleRadius, circleRadius, 0)
      .quadraticCurveTo(circleRadius, -circleRadius, 0, -circleRadius)
      .quadraticCurveTo(-circleRadius, -circleRadius, -circleRadius, 0)
      .quadraticCurveTo(-circleRadius, circleRadius, 0, circleRadius)

    // nodeRows.map((nodes) => {
    //   nodes.map((node) => {
    //     const nodeShape = new THREE.Shape()
    //     const nodePoints = []
    //     for (let i = 0; i < 8; i++) {
    //       center.set(node.x, node.z)
    //       vector2.set(center.x + 40, center.y)
    //       vector2.rotateAround(center, (i * 45 + 22.5) * THREE.MathUtils.DEG2RAD)
    //       nodePoints.push(new THREE.Vector2(vector2.x, -vector2.y))
    //     }
    //     nodeShape.setFromPoints(nodePoints)
    //     const nodeGeom = new THREE.ShapeGeometry(nodeShape)
    //     nodeGeoms.push(nodeGeom)
    //   })
    // })

    // connections.map((connection) => {
    //   const nodeA = nodeRows[connection[0]][connection[1]]
    //   const nodeB = nodeRows[connection[2]][connection[3]]
    //   const connShape = new THREE.Shape()
    //   const connPoints = []

    //   vector2.set(nodeA.x, nodeA.z)
    //   vector2b.set(nodeB.x, nodeB.z)

    //   const pos = vector2a.set(nodeB.x, nodeB.z).sub(vector2)
    //   const angle = pos.angle() * THREE.MathUtils.RAD2DEG
    //   vector2a.copy(pos).normalize()

    //   //start left
    //   center.set(nodeA.x, nodeA.z)
    //   vector2.set(center.x + 40, center.y)
    //   vector2.rotateAround(center, (angle - 22.5) * THREE.MathUtils.DEG2RAD)
    //   connPoints.push(new THREE.Vector2(vector2.x, -vector2.y))

    //   //end left
    //   center.set(nodeB.x, nodeB.z)
    //   vector2.set(center.x + 40, center.y)
    //   vector2.rotateAround(center, (angle + 180 + 22.5) * THREE.MathUtils.DEG2RAD)
    //   connPoints.push(new THREE.Vector2(vector2.x, -vector2.y))

    //   //end right
    //   center.set(nodeB.x, nodeB.z)
    //   vector2.set(center.x + 40, center.y)
    //   vector2.rotateAround(center, (angle + 180 - 22.5) * THREE.MathUtils.DEG2RAD)
    //   connPoints.push(new THREE.Vector2(vector2.x, -vector2.y))

    //   //start right
    //   center.set(nodeA.x, nodeA.z)
    //   vector2.set(center.x + 40, center.y)
    //   vector2.rotateAround(center, (angle + 22.5) * THREE.MathUtils.DEG2RAD)
    //   connPoints.push(new THREE.Vector2(vector2.x, -vector2.y))

    //   connShape.setFromPoints(connPoints)
    //   const connGeom = new THREE.ShapeGeometry(connShape)

    //   nodeGeoms.push(connGeom)
    // })
    
    sectionPoints.map((sectionPoint) => {
      var section = sectionPoint.slice().reverse();
      //Holes need reverse winding.
      const holePath = new THREE.Shape(section)
      oceanShape.holes.push(holePath)

      // const sectionShapeGeom = new THREE.ShapeGeometry(sectionShape)
      // nodeGeoms.push(sectionShapeGeom)
      
    },[])

    // deadends.map((deadend) => {
    //   const cutRadius = 60
    //   const cutShape = new THREE.Shape()
    //     .moveTo(0, cutRadius)
    //     .quadraticCurveTo(cutRadius, cutRadius, cutRadius, 0)
    //     .quadraticCurveTo(cutRadius, -cutRadius, 0, -cutRadius)
    //     .quadraticCurveTo(-cutRadius, -cutRadius, -cutRadius, 0)
    //     .quadraticCurveTo(-cutRadius, cutRadius, 0, cutRadius)
        
    //     const points = cutShape.getPoints()
    //     points.forEach((p) => p.add(new THREE.Vector2(deadend.x, -deadend.z)))
    //     const holePath = new THREE.Shape(points)
    //     oceanShape.holes.push(holePath)
    // })

    const oceanShapeGeom = new THREE.ShapeGeometry(oceanShape)
    nodeGeoms.push(oceanShapeGeom)

    geomRef.current = mergeBufferGeometries(nodeGeoms)
    return geomRef.current
  }, [])

  const config = useMemo(
    () => ({
      textureWidth: 1024,
      textureHeight: 1024,
      waterNormals,
      sunDirection: new THREE.Vector3(0, 150, -1500),
      sunColor: 0x041e25,
      waterColor: 0x000b0e,
      distortionScale: 8.0,
      fog: false,
      format: gl.encoding,
      alpha: 0.8,
      size: 6,
      wireframe: true,
    }),
    [waterNormals],
  )
  
  useFrame((state, delta) => {
    if (ref) ref.current.material.uniforms.time.value += delta * 0.5
  })
  return <water ref={ref} args={[geom, config]} rotation-x={-Math.PI / 2} />
}

CanalWater.displayName = 'CanalWater'

export { CanalWater }
