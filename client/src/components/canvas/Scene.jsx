import { Canvas } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import KeyboardInput from '../input/KeyboardInput'
import { Controls } from './Controls'

export default function Scene({ children, ...props }) {
  // Everything defined in here will persist between route changes, only children are swapped
  return (
    <Canvas {...props} camera={{ position: [0, 20, 20], fov: 55 }}>
      <directionalLight intensity={0.75} />
      <ambientLight intensity={0.75} />
      {children}
      <Preload all />
      <Controls/>
      <KeyboardInput />
    </Canvas>
  )
}
