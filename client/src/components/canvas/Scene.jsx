import dynamic from 'next/dynamic'
import { Canvas } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import KeyboardInput from '../input/KeyboardInput'

const DepthOfField = dynamic(
  () =>
    import("@react-three/postprocessing").then((module) => module.DepthOfField),
  {
    ssr: false,
  },
)
const Bloom = dynamic(
  () =>
    import("@react-three/postprocessing").then((module) => module.Bloom),
  {
    ssr: false,
  },
)
const Vignette = dynamic(
  () =>
    import("@react-three/postprocessing").then((module) => module.Vignette),
  {
    ssr: false,
  },
)
const EffectComposer = dynamic(
  () =>
    import("@react-three/postprocessing").then(
      (module) => module.EffectComposer,
    ),
  {
    ssr: false,
  },
)

export default function Scene({ children, ...props }) {
  // Everything defined in here will persist between route changes, only children are swapped
  return (
    <Canvas {...props} camera={{ position: [0, 20, 20], fov: 55, far: 25000 }}>
      <directionalLight intensity={0.75} />
      <ambientLight intensity={0.75} />
      {children}
      <Preload all />
      <KeyboardInput />
      <EffectComposer>
        {/* https://codesandbox.io/embed/r3f-game-i2160  */}
        <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={2} height={480} />
        <Bloom luminanceThreshold={0.9} luminanceSmoothing={0.1} height={300} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </Canvas>
  )
}
