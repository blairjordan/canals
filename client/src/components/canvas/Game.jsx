import { useMemo } from 'react'
import * as THREE from "three";
// import { useRouter } from 'next/router'
// import { useCursor, MeshDistortMaterial } from '@react-three/drei'

import { CanalWater } from "./CanalWater";
import { Controls } from "./Controls";
import { Line, Sky } from '@react-three/drei'

export default function Game({ route, ...props }) {
//   const router = useRouter()
//   const [hovered, hover] = useState(false)
//   useCursor(hovered)

    const points = useMemo(() => new THREE.EllipseCurve(0, 0, 5, 5, 0, 2 * Math.PI, false, 0).getPoints(100), [])
  return (
    <>
        <CanalWater />
        <Sky scale={1000} sunPosition={[500, 150, -1000]} turbidity={0.1} />
        <Controls  />
        <Line worldUnits scale={2} points={points} color='#ff0000' lineWidth={0.15} rotation={[Math.PI*-0.5, 0, 0]} />
        <Line worldUnits scale={4} points={points} color='#ff0000' lineWidth={0.15} rotation={[Math.PI*-0.5, 0, 0]} />
        <Line worldUnits scale={8} points={points} color='#ff0000' lineWidth={0.15} rotation={[Math.PI*-0.5, 0, 0]} />
        <Line worldUnits scale={16} points={points} color='#ff0000' lineWidth={0.15} rotation={[Math.PI*-0.5, 0, 0]} />
    </>
  )
}
