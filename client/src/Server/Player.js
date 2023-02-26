

import {
    Color
  } from "three";


class Player {
    constructor() {
        this.id = -1;
        this.positionData = {
            position: [0,0,0],
            color: randomColor()
        }

        this.mesh = null;
    }
}


function randomColor() {
    const i = Math.round(Math.random() * 63.99)
    const c = new Color();
    c.setHSL(i%8 / 8, 0.2 + (((i/8)/8) * 0.8), 0 + ((i/8)/8));
    return c;
} 

export {Player, randomColor}