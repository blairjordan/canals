import * as THREE from "three";
import { forwardRef, useMemo } from "react";
import { useGLTF } from "@react-three/drei";

//import boatUrl from "../../assets/models/boat_01.glb";

const Boat = forwardRef((props, ref) => {
  const playerGroup = new THREE.Group();
  playerGroup.rotation.order = "YXZ";
  const boatItems = {};
  const { scene, nodes, materials } = useGLTF('/models/boat_01.glb');

  function addPart(partName) {
    partName = partName.replace(".", "");

    if (boatItems[partName]) {
      for (let i = 0; i < boatItems[partName].parts.length; i++) {
        boatItems[partName].parts[i].rotateY(Math.PI);
        playerGroup.add(boatItems[partName].parts[i]);
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

  useMemo(() => {
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
      addPart("house_boat_stern_traditional");
      addPart("house_boat_stern_traditional_window_01");
      addPart("house_boat_stern_traditional_window_02");
      addPart("house_boat_stern_traditional_window_03");
      addPart("house_boat_stern_traditional_window_04");
    } else if (whichOne < 0.68) {
      addPart("house_boat_stern_semi_cruiser_handrail");
      addPart("house_boat_stern_semi_cruiser_wall");
      addPart("house_boat_stern_semi_cruiser_window_01");
      addPart("house_boat_main_door_02");
    } else {
      addPart("house_boat_stern_semi_traditional_door");
      addPart("house_boat_stern_semi_traditional_seating");
      addPart("house_boat_stern_semi_traditional_walls");
      addPart("house_boat_stern_semi_traditional_window_01");
    }
  }, [nodes, materials]);

  //Add boat engine
//   useFrame(
//     (state, delta) => (ref.current.material.uniforms.time.value += (delta*0.5))
//   );

  return <primitive ref={ref}
  object={playerGroup} 
  {...props} 
  />;
})

export { Boat }