import * as THREE from "three";
import { cyrb128, sfc32 } from "../Utils/utils";

class BaseScene {
  constructor() {

    this.container = null;
    this.camera = null;
    this.scene = null;
    this.renderer = null;
    this.clock = new THREE.Clock();
    this.texLoader = new THREE.TextureLoader();

    const seed = cyrb128('canals-predictable-seed');
    this.canalRand = sfc32(seed[0], seed[1], seed[2], seed[3]); 

    this.animate = this.animate.bind(this);
    this.update = this.update.bind(this);
    this.init = this.init.bind(this);
  }

  init() {
    this.onWindowResize = this.onWindowResize.bind(this);

    this.container = document.getElementById("canvasContainer");

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      1,
      20000
    );
    this.camera.position.set(20, 20, 20);

    this.controlGroup = new THREE.Group();
    this.controlGroupRotation = new THREE.Vector2();
    this.controlGroup.position.set(30, 30, 30);
    this.controlGroup.rotation.order = "YXZ";
    this.scene.add(this.controlGroup);
    this.scene.add(this.camera);

    window.addEventListener("resize", this.onWindowResize);

    this.animate();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {

    let delta = this.clock.getDelta();
    let time = this.clock.getElapsedTime();

    this.update(delta);
    requestAnimationFrame(this.animate);
    this.render();
  }

  update(delta) {
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

export { BaseScene };
