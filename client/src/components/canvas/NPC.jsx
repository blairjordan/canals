import { useGLTF, useAnimations } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect } from 'react'

export function NPC({ position, object, ...props }) {
  const { nodes, animations } = useGLTF('/models/characters.glb')

  const { ref, mixer } = useAnimations(animations, nodes)

  useEffect(() => {
    if (animations.length > 0 && mixer) {
      const action = mixer.clipAction(animations[animations.length - 1], nodes[object])
      action.play()
    }
  }, [animations, mixer])

  useFrame((state, delta) => mixer && mixer.update(delta))

  return <primitive object={nodes[object]} position={position} {...props} />
}
