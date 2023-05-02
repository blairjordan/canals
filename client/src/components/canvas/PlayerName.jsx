import React from 'react'
import { Billboard, Text } from '@react-three/drei'

const PlayerName = ({ username, position }) => {
  
  if (!(position && username)) { 
    return;
  }
  
  // FIXME: Player names produce a warning in the console:
  // "L_INVALID_OPERATION: Feedback loop formed between Framebuffer and active Texture."
  return (
    <group position={[ position.x, position.y+3, position.z ]}>
      <Billboard>
        <Text
          fontSize={1}
          color="black"
          anchorX="center"
          anchorY="middle"
          billboard
        >{username}</Text>
      </Billboard>
    </group>
  )
}

export { PlayerName }