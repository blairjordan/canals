import { useGLTF } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'

const someInclude = (key, array) => array.some((item) => key.includes(item))

export function Objects(props) {
  const { scene, nodes } = useGLTF('/models/canals.glb') 


  const [colorMap] = useLoader(THREE.TextureLoader, [
    '/textures/canal_colour_palette.jpg'
  ])
  const basicMaterial = new THREE.MeshBasicMaterial({ map: colorMap });

  const objects = Object.entries(nodes).reduce((prev, [key, object]) => {
    if (!someInclude(key, ['tree_', 'boathouse', 'bush_', 'building', 'bridge', 'bike', 'bin', 'industrial', 'petrol', 'shop', 'street_lamp_01', 'street_lamp_02'])) { return prev }

    if (object.isMesh
      && (someInclude(key, ['tree_', 'bush_'])
      // 🌉 specific bridges to texture with basic material
      || ['bridge', 'bridge002', 'bridge003'].includes(key))) {
      object.material = basicMaterial;
    }
    
    // TODO: texture the rest of the buildings
    // if (object.isGroup || object instanceof THREE.Object3D) {
    //   object.traverse(child => {
    //     if (child.isMesh) {
    //       child.material = basicMaterial;
    //     }
    //   })
    // }

    prev.push(object)
    return prev
  }, [])


  return <>
    {objects.map(object => 
      (<primitive key={object.name} object={object} map={colorMap} />)
    )}
  </>
  
}
