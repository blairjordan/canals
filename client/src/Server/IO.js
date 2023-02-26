import * as THREE from "three";
import { io } from "socket.io-client";
import { Player, randomColor } from "./Player";

class Connectivity {
  constructor(app, player) {
    this.app = app;
    this.socket = null;
    this.id = Math.round(Math.random() * 10000);
    if (this.app.id) {
      this.id = this.app.id;
    }
    this.color = randomColor();
    console.log("Player id:" + this.id);
    this.player = player;
    this.lastPlayerPosition = new THREE.Vector3();

    this.players = [];
    this.updatePlayers = this.updatePlayers.bind(this);
    this.removePlayers = this.removePlayers.bind(this);
    this.init = this.init.bind(this);
    this.update = this.update.bind(this);
  }

  init() {
    this.socket = io("http://localhost:3000");

    this.socket.on("player-update", (socket) => {
      //console.log('player-update:' + socket.id)
      this.updatePlayers(socket);
    });
    this.socket.on("player-join", (socket) => {
      console.log("player-join:" + socket.id);
      this.updatePlayers(socket);
    });
    this.socket.on("player-leave", (socket) => {
      console.log("player-leave:" + socket.id);
      this.removePlayers(socket);
    });
    this.socket.on("update", (socket) => {
      //console.log('update:' + socket.id)
      this.updatePlayers(socket);
    });
    this.socket.on("item-collected", (socket) => {
      //console.log(`collect :) ${socket.items} by ${socket.id}`)
      if (socket.id !== this.id) {
        this.app.collectItems(socket.items);
      }
    });
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

    const dist = this.lastPlayerPosition.distanceTo(this.player.position);

    if (dist > 1) {
      this.socket.emit("update", {
        id: this.id,
        positionData: {
          position: [
            this.player.position.x,
            this.player.position.z,
            this.player.position.y,
          ],
          color: this.color.getHex(),
        },
      });
      this.lastPlayerPosition.copy(this.player.position);
    }
  }
}

export { Connectivity };
