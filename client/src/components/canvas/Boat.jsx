import * as THREE from "three";
import { forwardRef, useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, useLoader } from "@react-three/fiber";
import { MeshBasicMaterial, MeshStandardMaterial } from "three";
import { clone } from 'three/examples/jsm/utils/SkeletonUtils';

//import boatUrl from "../../assets/models/boat_01.glb";

const Boat = forwardRef((props, ref) => {
  const playerGroup = useRef({group: new THREE.Group() })
  const sideWake = useRef(null)
  const boatItems = {};
  const { scene, nodes, materials } = useGLTF('/models/boat_01.glb');
  const { scene: sideScene, nodes: sideNodes, materials: sideMaterials } = useGLTF('/models/side_wake.glb');
  const [wakeTexture, gradTex] = useLoader(
    THREE.TextureLoader, ['/textures/wakeV.png', '/textures/threeTone.jpg']
  );
  wakeTexture.wrapS = wakeTexture.wrapT = THREE.RepeatWrapping;
  gradTex.wrapS = gradTex.wrapT = THREE.RepeatWrapping

  function addPart(partName) {
    partName = partName.replace(".", "");

    if (boatItems[partName]) {
      for (let i = 0; i < boatItems[partName].parts.length; i++) {
        const part = clone(boatItems[partName].parts[i])
        part.rotateY(Math.PI);
        playerGroup.current.group.add(part);
      }
    }
  }

  function getCategory(name) {
    if (name.includes("hull_")) return "hull";
    if (name.includes("decor_pot_plant")) return "decor|pot_plant";
    if (name.includes("decor_solar_panel")) return "decor|solar_panel";
    if (name.includes("decor_deck_chair")) return "decor|deck_chair";
    if (name.includes("decor_air_con")) return "decor|air_con";
    if (name.includes("decor_bell")) return "decor|bell";
    if (name.includes("decor_fishing_rod")) return "decor|fishing_rod";
    if (name.includes("engine")) return "engine";
    if (name.includes("house_boat_main")) return "house_boat|main";
    if (name.includes("house_boat_stern_traditional"))
      return "house_boat|traditional";
    if (name.includes("house_boat_semi_traditional"))
      return "house_boat|semi_traditional";
    if (name.includes("house_boat_stern_semi_cruiser"))
      return "house_boat|semi_cruiser";

    return "none";
  }

  useEffect(() => {
    //Need to find a better way to handle this, without a code change will rebuild this and it gets messed up?
    if(playerGroup.current.group.children.length>0) return;

    playerGroup.current.group.name = 'Player Boat';
    playerGroup.current.group.rotation.order = "YXZ";
    Object.values(nodes).forEach((child) => {
      if (child.isMesh) {
        let nameCheck = child.name;
        if (nameCheck.includes("Cube") || nameCheck.includes("Cylinder")) {
          nameCheck = child.parent.name.replace(".", "");
        }
        nameCheck = nameCheck.replace(".", "");

        if (!boatItems[nameCheck]) {
          boatItems[nameCheck] = {
            parts: [],
            category: getCategory(nameCheck),
          };
        }

        boatItems[nameCheck].parts.push(child);
      }
    });

    //default parts
    addPart("hull_flooring");
    addPart("hull_v_shaped");

    //decor
    //potplants
    addPart("decor_pot_plant_cactus");
    addPart("decor_pot_plant_hanging_flowers");
    addPart("decor_pot_plant_hanging_plant");
    //solar_panels
    addPart("decor_solar_panel_01");
    addPart("decor_solar_panel_02");
    addPart("decor_solar_panel_03");
    addPart("decor_solar_panel_04");
    //deck_chair
    addPart("decor_deck_chair");
    addPart("decor_deck_chair_material");
    //air_con
    addPart("decor_air_con");
    //bell
    addPart("decor_bell_01");
    //rod
    addPart("decor_fishing_rod_01.001");

    //engines
    //engine_electric
    addPart("engine_electric");

    //boat
    addPart("house_boat_main_body");
    addPart("house_boat_main_door_01");
    addPart("house_boat_main_window_01");
    addPart("house_boat_main_window_02");
    addPart("house_boat_main_window_03");
    addPart("house_boat_main_window_04");
    addPart("house_boat_main_window_05");
    addPart("house_boat_main_window_06");
    addPart("house_boat_main_window_07");
    addPart("house_boat_main_window_08");
    addPart("house_boat_main_window_09");
    addPart("house_boat_main_window_10");
    addPart("house_boat_main_window_11");

    // sterns
    // stern_traditional
    // house_boat_stern_traditional
    const whichOne = Math.random();
    if (whichOne < 0.34) {
      console.log('Boat Stern: Traditional')
      addPart("house_boat_stern_traditional");
      addPart("house_boat_stern_traditional_window_01");
      addPart("house_boat_stern_traditional_window_02");
      addPart("house_boat_stern_traditional_window_03");
      addPart("house_boat_stern_traditional_window_04");
    } else if (whichOne < 0.68) {
      console.log('Boat Stern: Semi Cruiser')
      addPart("house_boat_stern_semi_cruiser_handrail");
      addPart("house_boat_stern_semi_cruiser_wall");
      addPart("house_boat_stern_semi_cruiser_window_01");
      addPart("house_boat_main_door_02");
    } else {
      console.log('Boat Stern: Semi Traditional')
      addPart("house_boat_stern_semi_traditional_door");
      addPart("house_boat_stern_semi_traditional_seating");
      addPart("house_boat_stern_semi_traditional_walls");
      addPart("house_boat_stern_semi_traditional_window_01");
    }

    playerGroup.current.group.traverse((item) => {
      if(item.isMesh) {
        if(item.material) {
          
          const toonMat = new THREE.MeshToonMaterial()
          toonMat.copy(item.material)
          toonMat.gradientMap = gradTex
          item.material = toonMat;
        }
      }
    })

    // if(sideNodes) {
    //   Object.values(sideNodes).forEach((child) => {
    //     if (child.isMesh) {
    //       child.position.y = 0.11
    //       child.rotateY(Math.PI);
    //       playerGroup.current.group.add(child)
    //       sideWake.current = child;
          
    //       const map = sideWake.current.material.map.clone()
    //       const alphaMap = wakeTexture ? sideWake.current.material.map.clone() : wakeTexture; 
    //       const mat = new MeshBasicMaterial({alphaMap: alphaMap, transparent: true, map: map, opacity: 0.8})
    //       child.material = mat;
    //       console.log(sideWake.current.material)
          
    //     }
    //   })
    // }
  }, [nodes]);

  useEffect(() => {
    if(sideWake.current) sideWake.current.material.alphaMap = wakeTexture;
  }, [wakeTexture])

  //playerGroup changes on reload???

  useFrame(
    (state, delta) => {
      //if(sideWake.current) sideWake.current.material.map.offset.y+=delta*-0.2
    }
  );

  return <primitive ref={ref}
    object={playerGroup.current.group} 
    {...props} 
  />;
})

Boat.displayName = 'Boat';

export { Boat }