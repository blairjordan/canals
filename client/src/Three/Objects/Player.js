import { Group, Color } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import boatModelDemoUrl from "../../Assets/models/test_boat.glb";
import boatModelsUrl from "../../Assets/models/boat_01.glb";

class Player {
  constructor(app, playerData) {
    this.app = app;
    this.playerData = playerData;

    this.ready = false;
    this.playerGroup = new Group();
    this.playerGroup.rotation.order = "YXZ";

    this.wake = null;

    //speed value of 10 = 20 Nautical miles / hour
    //speed value of 20 = 40 Nautical miles / hour
    //speed value of 30 = 60 Nautical miles / hour

    //turnSpeed value of 1 (45°/s)

    this.boatStats = {
      speed: 8,
      turnSpeed: 0.5,
      acceleration: 1,
      brakes: 1,
    }

    this.boatItems = {
      //example object
      // item: {
      //   parts:[],
      //   category:''
      // }
    }

    this.init = this.init.bind(this);
  }

  async init(callback = null) {
    await this.loadPlayerBoat();

    this.app.scene.add(this.playerGroup);

    this.ready = true;

    if (callback) {
      callback();
    }
  }

  async loadPlayerBoat() {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(boatModelsUrl);
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        // child.material.emissive.set(0xffffff);
        // child.material.emissiveMap = child.material.map;
        // child.material.emissiveIntensity = 1.0;
        let nameCheck = child.name;
        if(nameCheck.includes('Cube') || nameCheck.includes('Cylinder')) {
          nameCheck = child.parent.name.replace('.','')
        }
        nameCheck = nameCheck.replace('.','')


        if(!this.boatItems[nameCheck]) {
          this.boatItems[nameCheck] = {
            parts: [],
            category:this.getCategory(nameCheck)
          }
        }

        this.boatItems[nameCheck].parts.push(child);
      }
    });
    //default parts
      this.addPart('hull_flooring')
      this.addPart('hull_v_shaped')

    //decor
      //potplants
    this.addPart('decor_pot_plant_cactus')
    this.addPart('decor_pot_plant_hanging_flowers')
    this.addPart('decor_pot_plant_hanging_plant')
      //solar_panels
    this.addPart('decor_solar_panel_01')
    this.addPart('decor_solar_panel_02')
    this.addPart('decor_solar_panel_03')
    this.addPart('decor_solar_panel_04')
      //deck_chair
    this.addPart('decor_deck_chair')
    this.addPart('decor_deck_chair_material')
      //air_con
    this.addPart('decor_air_con')
      //bell
    this.addPart('decor_bell_01')
      //rod
    this.addPart('decor_fishing_rod_01.001')

    //engines
      //engine_electric
    this.addPart('engine_electric')

    //boat
    this.addPart('house_boat_main_body')
    this.addPart('house_boat_main_door_01')
    this.addPart('house_boat_main_window_01')
    this.addPart('house_boat_main_window_02')
    this.addPart('house_boat_main_window_03')
    this.addPart('house_boat_main_window_04')
    this.addPart('house_boat_main_window_05')
    this.addPart('house_boat_main_window_06')
    this.addPart('house_boat_main_window_07')
    this.addPart('house_boat_main_window_08')
    this.addPart('house_boat_main_window_09')
    this.addPart('house_boat_main_window_10')
    this.addPart('house_boat_main_window_11')

    //sterns
      //stern_traditional
        //house_boat_stern_traditional
    const whichOne = Math.random();
    if(whichOne < 0.34)  {
    this.addPart('house_boat_stern_traditional')
    this.addPart('house_boat_stern_traditional_window_01')
    this.addPart('house_boat_stern_traditional_window_02')
    this.addPart('house_boat_stern_traditional_window_03')
    this.addPart('house_boat_stern_traditional_window_04')
    } else if(whichOne < 0.68)  {
    this.addPart('house_boat_stern_semi_cruiser_handrail')
    this.addPart('house_boat_stern_semi_cruiser_wall')
    this.addPart('house_boat_stern_semi_cruiser_window_01')
    this.addPart('house_boat_main_door_02')
    } else {
    this.addPart('house_boat_stern_semi_traditional_door')
    this.addPart('house_boat_stern_semi_traditional_seating')
    this.addPart('house_boat_stern_semi_traditional_walls')
    this.addPart('house_boat_stern_semi_traditional_window_01')
    }
  }

  addPart(partName) {
    partName = partName.replace('.','')

    if(this.boatItems[partName]) {
      for(let i = 0; i < this.boatItems[partName].parts.length; i++) {
        this.boatItems[partName].parts[i].rotateY(Math.PI)
        this.playerGroup.add(this.boatItems[partName].parts[i]);
      }
    }
  }

  removePart() {
    //TODO
  }

  getCategory(name) {
    if(name.includes('hull_')) return 'hull'
    if(name.includes('decor_pot_plant')) return 'decor|pot_plant'
    if(name.includes('decor_solar_panel')) return 'decor|solar_panel'
    if(name.includes('decor_deck_chair')) return 'decor|deck_chair'
    if(name.includes('decor_air_con')) return 'decor|air_con'
    if(name.includes('decor_bell')) return 'decor|bell'
    if(name.includes('decor_fishing_rod')) return 'decor|fishing_rod'
    if(name.includes('engine')) return 'engine'
    if(name.includes('house_boat_main')) return 'house_boat|main'
    if(name.includes('house_boat_stern_traditional')) return 'house_boat|traditional'
    if(name.includes('house_boat_semi_traditional')) return 'house_boat|semi_traditional'
    if(name.includes('house_boat_stern_semi_cruiser')) return 'house_boat|semi_cruiser'

    return 'none'
  }

  async loadPlayerBoatDemo() {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(boatModelDemoUrl);
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.material.emissive.set(0xffffff);
        child.material.emissiveMap = child.material.map;
        child.material.emissiveIntensity = 1.0;

        //when testing under the boat
        // child.material.opacity = 0.2
        // child.material.transparent = true
      }
    });
    //gltf.scene.rotateY(Math.PI * 0.5);

    this.playerGroup.add(gltf.scene);
  }
}

function randomColor() {
  const i = Math.round(Math.random() * 63.99);
  const c = new Color();
  c.setHSL((i % 8) / 8, 0.2 + (i / 8 / 8) * 0.8, 0 + i / 8 / 8);
  return c;
}

export { Player, randomColor };
