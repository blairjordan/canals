
import { Group } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import boatModelUrl from "../../Assets/models/test_boat.glb";


class Player {
    constructor(app, playerData) {
        this.app = app;
        this.playerData = playerData;

        this.ready = false
        this.playerGroup = new Group();
        this.playerGroup.rotation.order = "YXZ";

        this.init = this.init.bind(this);
    }

    async init() {

        await this.loadPlayerBoat();

        this.app.scene.add(this.playerGroup);

        this.ready = true
    }

    async loadPlayerBoat() {
        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync(boatModelUrl);
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            child.material.emissive.set(0xffffff);
            child.material.emissiveMap = child.material.map;
            child.material.emissiveIntensity = 1.0;
          }
        });
        //gltf.scene.rotateY(Math.PI * 0.5);
        this.playerGroup.add(gltf.scene);
    }
}

export {Player}