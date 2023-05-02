import { extend, useThree, useLoader, useFrame } from '@react-three/fiber'
import { forwardRef, useContext, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { AppContext } from '@/context'
import { useGLTF } from '@react-three/drei'
// import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';

function Locks(props) {
  const [state, dispatch] = useContext(AppContext)
  const lockGroupRef = useRef({ group: new THREE.Group(), scene: null, lockGates: [], lockWater: [], lockBounds: [] })

  const lock1 = useState({ openTop: false, openBottom: false, raisingLock: false, loweringLock: false })
  const lock2 = useState({ openTop: false, openBottom: false, raisingLock: false, loweringLock: false })
  const lock3 = useState({ openTop: false, openBottom: false, raisingLock: false, loweringLock: false })

  const { scene, nodes, materials } = useGLTF('/models/locks.glb')

  useEffect(() => {
    if (!lockGroupRef.current.scene) {
      lockGroupRef.current.scene = scene
      lockGroupRef.current.group.add(scene)
      Object.values(nodes).forEach((child) => {
        if (child.isMesh) {
          if (child.name.includes('water')) {
            child.material = props.canalRef.current.material
            lockGroupRef.current.lockWater.push(child)
          }
          if (child.name.includes('Bounds')) {
            child.visible = false
            lockGroupRef.current.lockBounds.push(child)
          }
          if (child.name.includes('gates')) {
            lockGroupRef.current.lockGates.push(child)
          }
        }
      })
    } else {
      return
    }
  }, [scene])

  useFrame((state, delta) => {
    //
  })

  return <primitive object={lockGroupRef.current.group} />
}

Locks.displayName = 'Locks'

export { Locks }
