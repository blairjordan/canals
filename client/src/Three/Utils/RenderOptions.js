import * as THREE from "three";


export default class RenderOptions {
    constructor(app) {
        this.app = app;

        this.preBloomDarkObjects = [];
        this.preBloomDarkOrigMaterials = [];

        this.darkMaterial = new THREE.MeshBasicMaterial( { colorWrite: false, side: THREE.DoubleSide} );
        this.darkMaterial.needsUpdate = true;

        this.preBloom = this.preBloom.bind(this);
        this.postBloom = this.postBloom.bind(this);
    }

    addDarkObject(o) {
        this.preBloomDarkObjects.push(o);
        this.preBloomDarkOrigMaterials.push(o.material);
    }

    preBloom() {
        for(let i = 0; i < this.preBloomDarkObjects.length; i++) {
            // all materials should be overwritten to reduce render calls
            this.preBloomDarkObjects[i].material = this.darkMaterial;
            this.preBloomDarkObjects[i].material.colorWrite = false;
        }
    }
    
    postBloom() {
        for(let i = 0; i < this.preBloomDarkObjects.length; i++) {
            this.preBloomDarkObjects[i].material = this.preBloomDarkOrigMaterials[i];
            this.preBloomDarkObjects[i].material.colorWrite = true;
        }
    }

    preBloomReflection() {
        for(let i = 0; i < this.preBloomDarkObjects.length; i++) {
            // all materials should be overwritten to reduce render calls
            this.preBloomDarkObjects[i].material.color = this.preBloomDarkOrigMaterials[i].color
        }
    }
    postBloomReflection() {
        for(let i = 0; i < this.preBloomDarkObjects.length; i++) {
            this.preBloomDarkObjects[i].material = this.preBloomDarkOrigMaterials[i];
            this.preBloomDarkObjects[i].material.colorWrite = true;
        }
    }
}