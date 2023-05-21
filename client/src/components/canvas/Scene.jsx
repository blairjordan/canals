import dynamic from 'next/dynamic'
import { Canvas } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import KeyboardInput from '../input/KeyboardInput'

// TODO: Add to global config file
const EFFECTS_SETTINGS = {
  effectsEnabled: false,
  depthOfField: {
    enabled: true,
    focalLength: 0.02,
    bokehScale: 2,
    height: 480
  },
  bloom: {
    enabled: true,
    luminanceThreshold: 0.9,
    luminanceSmoothing: 0.1,
    height: 300
  },
  vignette: {
    enabled: true,
    eskil: false,
    offset: 0.1,
    darkness: 1.1,
  }
}

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
      <ambientLight intensity={0.15} />
      {children}
      <Preload all />
      <KeyboardInput />
      {
        EFFECTS_SETTINGS.effectsEnabled
        &&
        <EffectComposer>
        {/* https://codesandbox.io/embed/r3f-game-i2160  */}
        {
          EFFECTS_SETTINGS.depthOfField.enabled
          &&
          <DepthOfField {...EFFECTS_SETTINGS.depthOfField} />
        }
        {
          EFFECTS_SETTINGS.bloom.enabled
          &&
          <Bloom {...EFFECTS_SETTINGS.bloom} />
        }
        {
          EFFECTS_SETTINGS.vignette.enabled
          &&
          <Vignette {...EFFECTS_SETTINGS.vignette} />
        }
      </EffectComposer>
      }
      
    </Canvas>
  )
}
