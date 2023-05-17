import { useGLTF } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'

const someInclude = (key, array) => array.some((item) => key.includes(item))

export function Objects(props) {
  const { scene, nodes } = useGLTF('/models/canals.glb') 


  const objects = Object.entries(nodes).reduce((prev, [key, object]) => {
    if (!someInclude(key, 
      [
        'tree_',
        'boathouse',
        'bush_',
        'building',
        'bridge',
        'bike',
        'bin',
        'industrial',
        'petrol',
        'shop',
        'street_lamp_01',
        'street_lamp_02',
        'marina',
        'post_box',
        'post_office'
      ])
    ) { return prev }

    prev.push(object)
    return prev
  }, [])


  return <>
    {objects.map(object => 
      (<primitive key={object.name} object={object} />)
    )}
  </>
  
}
