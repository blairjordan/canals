import {
    Euler,
    Vector2,
    Vector3,
    Object3D
  } from "three";

  //This is more gamepad manager where we can take input from keyboard, mouse and controllers
  // and so somethings with it.
class GamePad {
    constructor(app) {
        this.app = app;
        this.buttons = {};

        this.euler = new Euler()
        this.deadzone = 0.1
        this.leftAxis = new Vector2()
        this.rightAxis = new Vector2()

        this.targetObject = new Object3D();
        this.targetObject.position.set(30,30,30)

        this.boatTargetObject = new Object3D();

        this.updateAxis0 = new Event("updateAxis0");
        this.updateAxis1 = new Event("updateAxis1");
        this.updateAxis2 = new Event("updateAxis2");
        this.updateAxis3 = new Event("updateAxis3");

        document.addEventListener( "updateAxis0", (e) => {
                if(Math.abs(this.leftAxis.x) > this.deadzone) {
                    this.targetObject.translateX(this.leftAxis.x)
                    this.clampY()
                    this.boatTargetObject.rotateOnWorldAxis(new Vector3(0.0, 1.0, 0.0), (-this.leftAxis.y >= 0 ? -this.leftAxis.x : this.leftAxis.x) / 60.0) 
                }
            }, false );
        document.addEventListener( "updateAxis1", (e) => {
                if(Math.abs(this.leftAxis.y) > this.deadzone) {
                    this.targetObject.translateZ(this.leftAxis.y)
                    this.clampY()
                    this.boatTargetObject.translateZ(this.leftAxis.y);
                }
            }, false );
        document.addEventListener( "updateAxis2", (e) => {
                if(Math.abs(this.rightAxis.x) > this.deadzone) {
                    this.targetObject.rotateOnWorldAxis(new Vector3(0.0, 1.0, 0.0), -this.rightAxis.x / 60.0) 
                    this.targetObject.translateZ(this.leftAxis.y)
                }
            }, false );
        document.addEventListener( "updateAxis3", (e) => {
                if(Math.abs(this.rightAxis.y) > this.deadzone) {
                    this.targetObject.rotateX(-this.rightAxis.y / 60.0)
                }
            }, false );
    }

    clearAxes() {
        this.leftAxis.x = 0
        this.leftAxis.y = 0
        this.rightAxis.x = 0
        this.rightAxis.y = 0
    }

    updateAxis(i, state) {
        switch(i) {
            case 0: //left/spin left
                this.leftAxis.x = state
            break;
            case 1: //right/spin right
                this.leftAxis.y = state
            break;
            case 2: //forward/up
                this.rightAxis.x = state
            break;
            case 3: //back/down
                this.rightAxis.y = state
            break;
            default:
                break;
        }
    }

    update() {
        if(Math.abs(this.leftAxis.x) > this.deadzone) {
            document.dispatchEvent(this.updateAxis0);
        }
        if(Math.abs(this.leftAxis.y) > this.deadzone) {
            document.dispatchEvent(this.updateAxis1);
        }
        if(Math.abs(this.rightAxis.x) > this.deadzone) {
            document.dispatchEvent(this.updateAxis2);
        }
        if(Math.abs(this.rightAxis.y) > this.deadzone) {
            document.dispatchEvent(this.updateAxis3);
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