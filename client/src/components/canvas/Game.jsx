import { useMemo, useRef } from 'react'
import * as THREE from "three";
// import { useRouter } from 'next/router'
// import { useCursor, MeshDistortMaterial } from '@react-three/drei'

import { CanalWater } from "./CanalWater";
import { Controls } from "./Controls";
import { Line, Sky } from '@react-three/drei'
import { useFrame } from '@react-three/fiber';

export default function Game({ route, ...props }) {
    const radarLine = useRef(null)
    const radarLine2 = useRef(null)
    const radarLine3 = useRef(null)
//   const router = useRouter()
//   const [hovered, hover] = useState(false)
//   useCursor(hovered)

  const circlePoints = useMemo(() => new THREE.EllipseCurve(0, 0, 5, 5, 0, 2 * Math.PI, false, 0).getPoints(100), [])
  const linePoints = useMemo(() => new THREE.LineCurve(new THREE.Vector2(0,0), new THREE.Vector2(40,0)).getPoints(2), [])

  useFrame((state,delta) => {
    radarLine.current.rotateZ(delta) 
    radarLine2.current.rotateZ(delta*0.75) 
    radarLine3.current.rotateZ(delta*0.5) 
  })
  return (
    <>
        <CanalWater />
        <Sky scale={1000} sunPosition={[500, 150, -1000]} turbidity={0.1} />
        <Controls/>
        <Line worldUnits scale={2} points={circlePoints} color='#ff0000' lineWidth={0.15} rotation={[Math.PI*-0.5, 0, 0]} />
        <Line worldUnits scale={4} points={circlePoints} color='#ff0000' lineWidth={0.15} rotation={[Math.PI*-0.5, 0, 0]} />
        <Line worldUnits scale={8} points={circlePoints} color='#ff0000' lineWidth={0.15} rotation={[Math.PI*-0.5, 0, 0]} />
        <Line ref={radarLine} worldUnits scale={1} points={linePoints} color='#ff0000' lineWidth={0.15} rotation={[Math.PI*-0.5, 0, 0]} />
        <Line ref={radarLine2} worldUnits scale={0.5} points={linePoints} color='#ff0000' lineWidth={0.15} rotation={[Math.PI*-0.5, 0, 0]} />
        <Line ref={radarLine3} worldUnits scale={0.25} points={linePoints} color='#ff0000' lineWidth={0.15} rotation={[Math.PI*-0.5, 0, 0]} />
    </>
  )
}
