import { extend, useThree, useLoader, useFrame } from '@react-three/fiber'
import { forwardRef, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils'

import { Water } from 'three-stdlib'
import NodeGenerator from '../utils/NodeGenerator'
import { useGLTF } from '@react-three/drei'

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

      {/* Canal edges */}
      <mesh geometry={geom2} rotation-x={-Math.PI / 2}>
        <meshLambertMaterial attach='material' color='grey' />
      </mesh>
    </>
})

CanalWater.displayName = 'CanalWater'

export { CanalWater }
