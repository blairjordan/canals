import * as THREE from 'three'
import { Line } from '@react-three/drei'

const DebugAreaLine = ({ fromPosition, toPosition, color = 'red', height = 5 }) => {
  const points = [
    new THREE.Vector3(fromPosition.x, height, fromPosition.z),
    new THREE.Vector3(toPosition.x, height, toPosition.z),
  ]

  return (
    <>
      <Line points={points} color={color} />
    </>
  )
}

export { DebugAreaLine }
