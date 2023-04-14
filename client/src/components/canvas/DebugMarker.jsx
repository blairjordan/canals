import { useMemo, useState } from 'react'
import * as THREE from 'three'
import { Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

const DebugMarker = ({
  isDebugMode = true,
  scale = 2, position,
  radius = 5,
  color = "#ff0000"
}) => {
  const [pulse, setPulse] = useState(1)
  const circlePoints = useMemo(
    () =>
      new THREE.EllipseCurve(0, 0, radius, radius, 0, 2 * Math.PI, false, 0).getPoints(
        100
      ),
    []
  )

  useFrame((state, delta) => {
    const elapse = 0.5 + (Math.sin(state.clock.elapsedTime) * 0.5);
    setPulse(elapse)
  })

  return isDebugMode ? (
    <>
    <Line
      worldUnits
      position={[position.x, 0, position.y]}
      scale={scale}
      points={circlePoints}
      color={color}
      lineWidth={0.15}
      rotation={[Math.PI * -0.5, 0, 0]}
    />
    <Line
      worldUnits
      position={[position.x, 10-(pulse*10), position.y]}
      scale={scale*pulse}
      points={circlePoints}
      opacity={0.2}
      color={color}
      lineWidth={0.15}
      rotation={[Math.PI * -0.5, 0, 0]}
    />
    </>
  ) : <></>
}

DebugMarker.displayName = 'DebugMarker';

export { DebugMarker }
