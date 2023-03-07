
import { Group, Color } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import boatModelUrl from "../../Assets/models/test_boat.glb";


class Player {
    constructor(app, playerData) {
        this.app = app;
        this.playerData = playerData;

        this.ready = false
        this.playerGroup = new Group();
        this.playerGroup.rotation.order = "YXZ";

        this.wake = null;

        this.init = this.init.bind(this);
    }

    async init(callback = null) {

        await this.loadPlayerBoat();

        this.app.scene.add(this.playerGroup);

        this.ready = true

        if(callback) {
          callback()
        }
    }

    async loadPlayerBoat() {
        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync(boatModelUrl);
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
  const i = Math.round(Math.random() * 63.99)
  const c = new Color();
  c.setHSL(i%8 / 8, 0.2 + (((i/8)/8) * 0.8), 0 + ((i/8)/8));
  return c;
} 

export {Player, randomColor}