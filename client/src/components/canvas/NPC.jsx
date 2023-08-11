import { useGLTF, useAnimations } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect } from 'react'

export function NPC({ position, rotation, markerKey, ...props }) {
  const { nodes, animations } = useGLTF('/models/characters.glb')

  const { ref, mixer } = useAnimations(animations, nodes)

  useEffect(() => {
    if (animations.length > 0 && mixer) {
      const animation = animations.find((animation) => animation.name === markerKey)
      const action = mixer.clipAction(animation, nodes[markerKey])
      action.play()
    }
  }, [animations, mixer])

  useFrame((state, delta) => mixer && mixer.update(delta))

  return <primitive object={nodes[markerKey]} position={position} rotation={[Math.PI / 2, 0, rotation]} {...props} />
}
