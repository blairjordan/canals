import React, {useRef} from 'react'
import useStore from "../helpers/store"
import { useFrame } from '@react-three/fiber';
import { Boat } from './Boat';

const Controls = (props) => {
    const playerRef = useRef(null);

    useFrame(({camera}) => {
        const { controls } = useStore.getState();
        // console.log(controls)
        if(controls.forward) {
            playerRef.current.position.z -= 0.1
            camera.position.z -= 0.1
        }
        if(controls.backward) {
            playerRef.current.position.z += 0.1
            camera.position.z += 0.1
        }
        if(controls.left) {
            playerRef.current.position.x -= 0.1
            camera.translateX(-0.1);
            // camera.position.x -= 0.1
        }
        if(controls.right) {
            playerRef.current.position.x += 0.1
            camera.translateX(0.1);
            // camera.position.x += 0.1
        }
    })
  return (
    <><Boat ref={playerRef} /></>
  )
}

export { Controls }