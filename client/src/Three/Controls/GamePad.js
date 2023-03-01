import {
    Euler,
    Vector2,
    Vector3,
    Object3D
  } from "three";

class GamePad {
    constructor(app) {
        this.app = app;
        this.buttons = {};

        this.euler = new Euler()
        this.deadzone = 0.01
        this.leftAxis = new Vector2()
        this.rightAxis = new Vector2()

        this.targetObject = new Object3D();
        this.targetObject.position.set(30,30,30)

        this.boatTargetObject = new Object3D();
    }

    updateAxis(i, state) {
        switch(i) {
            case 0: //left/spin left
                if(Math.abs(state) > this.deadzone) {
                    this.leftAxis.x = state
                    this.targetObject.translateX(this.leftAxis.x)
                    this.boatTargetObject.rotateOnWorldAxis(new Vector3(0.0, 1.0, 0.0), -this.leftAxis.x / 60.0) 
                    this.clampY()
                } else {
                    this.leftAxis.x = 0
                }
            break;
            case 1: //right/spin right
                if(Math.abs(state) > this.deadzone) {
                    this.leftAxis.y = state
                    this.targetObject.translateZ(this.leftAxis.y)
                    this.clampY()
                    this.boatTargetObject.translateZ(this.leftAxis.y);
                } else {
                    this.leftAxis.y = 0
                }
            break;
            case 2: //forward/up
                if(Math.abs(state) > this.deadzone) {
                    this.rightAxis.x = state
                    this.targetObject.rotateOnWorldAxis(new Vector3(0.0, 1.0, 0.0), -this.rightAxis.x / 60.0) 
                    this.targetObject.translateZ(this.leftAxis.y)
                } else {
                    this.rightAxis.x = 0
                }
            break;
            case 3: //back/down
                if(Math.abs(state) > this.deadzone) {
                    this.rightAxis.y = state
                    this.targetObject.rotateX(-this.rightAxis.y / 60.0)
                } else {
                    this.rightAxis.y = 0
                }
            break;
            default:
                break;
        }
    }

    clampY() {
        if(this.targetObject.position.y < 1) {
            this.targetObject.position.y = 1;
        } else if(this.targetObject.position.y > 1000) {
            this.targetObject.position.y = 1000;
        }
    }

    buttonAction(button, i) {
        this.buttons[i] = button
        switch(i) {
            //right side buttons (bottom, right, left, top)
            case 0: //a
            case 1: //b
            case 2: //x
            case 3: //y
            case 4: //lb (left top button)
            case 5: //lr (right top button)
                break;
            case 6: //lt (left trigger)
            case 7: //rt (right trigger)
                if(button.pressed) {
                    this.targetObject.translateY( i === 6 ? -button.value : button.value)
                    this.clampY()
                }
                break;
            case 8: //select
            case 9: //start
            case 10: //left joystick
            case 11: //right joystick
            case 12: //dpad up
            case 13: //dpad down
            case 14: //dpad left
            case 15: //dpad right
            case 16:
                //if(button.value !==0) console.log('button:' + i + ", pressed: " + button.pressed + ', value:' + button.value)
            break;
            default:
                break;
        }
    }
}
export {GamePad}