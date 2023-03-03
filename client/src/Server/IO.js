import * as THREE from "three";
import { io } from "socket.io-client";
import { Player, randomColor } from "./Player";
import GraphQL from "../Server/graphQL";
import graphQL from "../Server/graphQL";

class Connectivity {
  constructor(app, player) {
    this.app = app;
    this.socket = null;
    this.id = app.playerData.id
    this.color = randomColor();
    console.log("Player id:" + this.id);
    this.player = player;
    this.lastPlayerPosition = new THREE.Vector3();

    this.updateDistance = 2; //1m
    this.updateTime = 1000; //1s (1000ms)
    this.timeSinceLastUpdate = 0;
    this.lastUpdateTime = 0;
    this.deltaTime = 0;

    this.players = [];
    this.updatePlayers = this.updatePlayers.bind(this);
    this.removePlayers = this.removePlayers.bind(this);
    this.updatePlayerPositions = this.updatePlayerPositions.bind(this);
    this.init = this.init.bind(this);
    this.update = this.update.bind(this);
  }

  init() {
    GraphQL.initPlayerSubscriptions(this.updatePlayerPositions);
  }

  updatePlayerPositions(players) {
    
  }

  removePlayers(socket) {
    let index = -1;
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i].id === socket.id) {
        index = i;
      }
    }
    if (index >= 0) {
      this.players[index].mesh.geometry.dispose();
      this.players[index].mesh.material.dispose();
      this.app.scene.remove(this.players[index].mesh);
      this.players.splice(index, 1);
    }
  }

  updatePlayers(socket) {
    let updated = false;
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i].id === socket.id) {
        if (socket.id !== this.id) {
          this.players[i].positionData.position[0] =
            socket.positionData.position[0];
          this.players[i].positionData.position[1] =
            socket.positionData.position[1];
          this.players[i].positionData.position[2] =
            socket.positionData.position[2];
          this.players[i].mesh.position.set(
            this.players[i].positionData.position[0],
            this.players[i].positionData.position[2],
            this.players[i].positionData.position[1]
          );
        }
        updated = true;
      }
    }

    if (!updated) {
      this.createOtherPlayer(socket);
    }
  }

  createOtherPlayer(socket) {
    const player = new Player();
    player.id = socket.id;
    player.positionData.position[0] = socket.positionData.position[0];
    player.positionData.position[1] = socket.positionData.position[1];
    player.positionData.position[2] = socket.positionData.position[2];
    player.positionData.color = socket.positionData.color;

    const color = new THREE.Color();
    color.setHex(player.positionData.color);
    const geometry = new THREE.SphereGeometry(5, 5, 5);
    const material = new THREE.MeshBasicMaterial({ color: color, opacity: 0.5, transparent: true });
    const mesh = new THREE.Mesh(geometry, material);
    player.mesh = mesh;
    player.mesh.position.set(
      player.positionData.position[0],
      player.positionData.position[2],
      player.positionData.position[1]
    );
    this.app.scene.add(player.mesh);

    this.players.push(player);
  }

  itemsCollected(items) {
    this.socket.emit("item-collected", {
      id: this.id,
      items,
    });
  }

  update() {
    if (!this.player) return;

    // calculate the difference in milliseconds
    const dist = this.lastPlayerPosition.distanceTo(this.player.position);

    // const deltaTime = performance.now(); - this.deltaTime; 
    // this.deltaTime = performance.now();
    // this.timeSinceLastUpdate += deltaTime;


    if (dist > this.updateDistance) {
      graphQL.updatePlayerPosition(this.id.toString(), {
         x:this.player.position.x,
         y:this.player.position.z,
         z:this.player.position.y })
      this.lastPlayerPosition.copy(this.player.position);
    }
  }


  updateIfNoMoreUpdate(time, id, pos) {
    if(this.nextUpdatePos) {
      clearTimeout(this.nextUpdatePos)
    }
    this.nextUpdatePos = setTimeout(() => {
      //we can hold off spamming the connection and make sure we only send update to every 1s.
      this.nextUpdatePos = null;
    }, this.updateTime)
  }
}

export { Connectivity };
