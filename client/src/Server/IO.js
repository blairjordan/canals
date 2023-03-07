import * as THREE from "three";
import GraphQL from "../Server/graphQL";
import TWEEN from "@tweenjs/tween.js";
import { Player, randomColor } from "../Three/Objects/Player";

class Connectivity {
  constructor(app, player) {
    this.app = app;
    this.socket = null;
    this.id = app.playerData.id
    this.color = randomColor();
    this.player = player;
    this.lastPlayerPosition = new THREE.Vector3();
    this.lastPlayerRotation = 0;

    this.updateDistance = 2; //1m
    this.updateRotation = 0.1 //5deg in radians
    this.updateTime = 1000; //1s (1000ms)
    this.timeSinceLastUpdate = 0;
    this.lastUpdateTime = 0;
    this.deltaTime = 0;

    this.updateDistance = 2; //1m
    this.updateTime = 1000; //1s (1000ms)
    this.timeSinceLastUpdate = 0;
    this.lastUpdateTime = 0;
    this.deltaTime = 0;

    this.players = [];
    this.updatePlayerPositions = this.updatePlayerPositions.bind(this);
    this.init = this.init.bind(this);
    this.update = this.update.bind(this);
  }

  init() {
    GraphQL.subscriptions.initPlayerSubscriptions(this.updatePlayerPositions);
  }

  updatePlayerPositions(result) {
    if(result) {
      for(let i = 0; i < result.length; i++) {
        var data = result[i]
        if(data) {
          if(data.id !== this.id) {
            //update player position
            if(data.position) {
              const transform = (typeof data.position === 'object') ? data.position : JSON.parse(data.position);
              let playerIndex = this.findPlayer(data.id);
              if(playerIndex>=0) {
                this.updatePlayerPosition(playerIndex, transform);
              } else {
                playerIndex = this.players.length
                const callback = () => {
                  this.updatePlayerPosition(playerIndex, transform)
                }

                const player = new Player(this.app, data);
                this.players.push(player)
                player.init(callback);
              }
            }
          }
        }
      }
    }
  }

  updatePlayerPosition(playerIndex, transform) {
    const initVal = { 
      x:this.players[playerIndex].playerGroup.position.x,
      y:this.players[playerIndex].playerGroup.position.z,
      z:this.players[playerIndex].playerGroup.position.y,
      r:this.players[playerIndex].playerGroup.rotation.y  };
    if(this.players[playerIndex].updateTween) {
      this.players[playerIndex].updateTween.stop()
    }
    this.players[playerIndex].updateTween = new TWEEN.Tween(initVal)
      .to({ 
        x: transform.x, 
        y: transform.y, 
        z: transform.z, 
        r: transform.r ? transform.r : this.players[playerIndex].playerGroup.rotation.y }
        , 250)
      .onUpdate(() => {
        this.players[playerIndex].playerGroup.position.x = initVal.x
        this.players[playerIndex].playerGroup.position.y = initVal.z
        this.players[playerIndex].playerGroup.position.z = initVal.y
        this.players[playerIndex].playerGroup.rotation.y = initVal.r
      })
      .start();
  }

  findPlayer(id) {
    let index = -1
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i].playerData.id === id) {
        index = i;
        break;
      }
    }
    return index;
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
    const rot = Math.abs(this.lastPlayerRotation-this.player.rotation.y)

    // const deltaTime = performance.now(); - this.deltaTime; 
    // this.deltaTime = performance.now();
    // this.timeSinceLastUpdate += deltaTime;


    if (dist > this.updateDistance || rot > this.updateRotation) {
      GraphQL.players.updatePlayerPosition(this.id.toString(), {
         x:this.player.position.x,
         y:this.player.position.z,
         z:this.player.position.y,
         r:this.player.rotation.y})
      this.lastPlayerPosition.copy(this.player.position);
      this.lastPlayerRotation = this.player.rotation.y;
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
