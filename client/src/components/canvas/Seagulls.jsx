import * as THREE from 'three'
import { forwardRef, useEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame, useLoader } from '@react-three/fiber'
import { MeshBasicMaterial, MeshStandardMaterial } from 'three'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils'

const Seagull = forwardRef((props, ref) => {
  const seagullGroup = useRef({ group: new THREE.Group() })
  const seagullRef = useRef(null)
  const { scene, nodes, materials } = useGLTF('/models/seagull.glb')
  const seagullStateRef = useRef({
    center: new THREE.Vector2(),
    vector2: new THREE.Vector2(),
    angle: 0,
    keyIndex: 0,
    seagulls: [],
  })

  useEffect(() => {
    //Need to find a better way to handle this,
    // without a code change will rebuild this and it gets messed up?
    if (seagullGroup.current.group.children.length > 0) return

    seagullGroup.current.group.name = 'Seagull Group'
    seagullGroup.current.group.rotation.order = 'YXZ'
    Object.values(nodes).forEach((child) => {
      if (child.isMesh) {
        child.scale.set(0.2, 0.2, 0.2)
        seagullRef.current = child
        seagullRef.current.material.metalness = 0
        seagullRef.current.material.roughness = 0
      }
    })

    const s1 = clone(seagullRef.current)
    const s2 = clone(seagullRef.current)
    const s3 = clone(seagullRef.current)
    s1.position.set(-5, 0, 0)
    s1.morphTargetInfluences[0] = Math.random()
    seagullGroup.current.group.add(s1)
    s2.position.set(5, 0, 0)
    s2.morphTargetInfluences[0] = Math.random()
    seagullGroup.current.group.add(s2)
    s3.position.set(3, 3, 0)
    s3.morphTargetInfluences[0] = Math.random()
    seagullGroup.current.group.add(s3)
    s1.keyIndex = 0
    s2.keyIndex = 1
    s3.keyIndex = 0
    seagullStateRef.current.seagulls = [s1, s2, s3]
  }, [nodes])

  useFrame((state, delta) => {
    if (seagullRef.current) {
      seagullStateRef.current.angle += delta
      seagullStateRef.current.vector2.set(seagullStateRef.current.center.x + 10, seagullStateRef.current.center.y)
      seagullStateRef.current.vector2.rotateAround(seagullStateRef.current.center, seagullStateRef.current.angle)
      seagullGroup.current.group.position.set(seagullStateRef.current.vector2.x, 10, seagullStateRef.current.vector2.y)

      for (let i = 0; i < seagullStateRef.current.seagulls.length; i++) {
        const gull = seagullStateRef.current.seagulls[i]
        const m = seagullStateRef.current.seagulls[i].morphTargetInfluences
        gull.rotation.y = -seagullStateRef.current.angle + Math.PI
        if (gull.keyIndex === 0) {
          m[0] = Math.min(m[0] + delta * 2, 1)
          m[1] = Math.max(m[1] - delta * 8.0, 0)
          if (m[0] >= 1) {
            gull.keyIndex = 1
          }
        } else {
          m[0] = Math.max(m[0] - delta * 8.0, 0)
          m[1] = Math.min(m[1] + delta * 2, 1)
          if (m[1] >= 1) {
            gull.keyIndex = 0
          }
        }
      }
    }
  })

  return <primitive ref={ref} object={seagullGroup.current.group} {...props} />
})

Seagull.displayName = 'Seagull'

export { Seagull }
