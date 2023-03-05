import {
    Euler,
    Vector2,
    Vector3,
    Object3D
  } from "three";

  //This is more gamepad manager where we can take input from keyboard, mouse and controllers
  // and so somethings with it.
        // case 0: //a
        // case 1: //b
        // case 2: //x
        // case 3: //y
        // case 4: //lb (left top button)
        // case 5: //lr (right top button)
        // case 6: //lt (left trigger)
        // case 7: //rt (right trigger)
        // case 8: //select
        // case 9: //start
        // case 10: //left joystick
        // case 11: //right joystick
        // case 12: //dpad up
        // case 13: //dpad down
        // case 14: //dpad left
        // case 15: //dpad right
class GamePad {
    constructor(app) {
        this.app = app;
        this.currentDelta = 0
        this.buttons = {};
        //init buttons
        for(let i = 0; i < 16; i++) {
            this.buttons[i] = {pressed: false, lastFrame: false, touched: false, value: 0}
        }

        this.euler = new Euler()
        this.deadzone = 0.2
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

                    if(this.app.controls) {
                        this.app.controls.update(this.rightAxis.x * this.currentDelta,0)
                        
                    }
                }
            }, false );
        document.addEventListener( "updateAxis3", (e) => {
                if(Math.abs(this.rightAxis.y) > this.deadzone) {
                    this.targetObject.rotateX(-this.rightAxis.y / 60.0)

                    if(this.app.controls) {
                        this.app.controls.update(0,-this.rightAxis.y * this.currentDelta)
                    }
                }
            }, false );

        this.buttonEventMapping = {}
        this.buttonAction0 = new Event("buttonAction0");
        this.buttonAction1 = new Event("buttonAction1");
        this.buttonAction2 = new Event("buttonAction2");
        this.buttonAction3 = new Event("buttonAction3");
        this.buttonAction4 = new Event("buttonAction4");
        this.buttonAction5 = new Event("buttonAction5");
        this.buttonAction6 = new Event("buttonAction6");
        this.buttonAction7 = new Event("buttonAction7");
        this.buttonAction8 = new Event("buttonAction8");
        this.buttonAction9 = new Event("buttonAction9");
        this.buttonAction10 = new Event("buttonAction10");
        this.buttonAction11 = new Event("buttonAction11");
        this.buttonAction12 = new Event("buttonAction12");
        this.buttonAction13 = new Event("buttonAction13");
        this.buttonAction14 = new Event("buttonAction14");
        this.buttonAction15 = new Event("buttonAction15");
        this.buttonEventMapping[0] = this.buttonAction0;
        this.buttonEventMapping[1] = this.buttonAction1;
        this.buttonEventMapping[2] = this.buttonAction2;
        this.buttonEventMapping[3] = this.buttonAction3;
        this.buttonEventMapping[4] = this.buttonAction4;
        this.buttonEventMapping[5] = this.buttonAction5;
        this.buttonEventMapping[6] = this.buttonAction6;
        this.buttonEventMapping[7] = this.buttonAction7;
        this.buttonEventMapping[8] = this.buttonAction8;
        this.buttonEventMapping[9] = this.buttonAction9;
        this.buttonEventMapping[10] = this.buttonAction10;
        this.buttonEventMapping[11] = this.buttonAction11;
        this.buttonEventMapping[12] = this.buttonAction12;
        this.buttonEventMapping[13] = this.buttonAction13;
        this.buttonEventMapping[14] = this.buttonAction14;
        this.buttonEventMapping[15] = this.buttonAction15;

        document.addEventListener( ("buttonAction0"), (e) => {
            if(this.buttons[0].pressed && this.buttons[0].pressed !== this.buttons[0].lastFrame) {
                console.log('press A')
            } else if(this.buttons[0].pressed) {
                console.log('hold A')
            }
        }, false );
        document.addEventListener( ("buttonAction1"), (e) => {
            if(this.buttons[1].pressed && this.buttons[1].pressed !== this.buttons[1].lastFrame) {
                console.log('press B')
            } else if(this.buttons[1].pressed) {
                console.log('hold B')
            }
        }, false );
        document.addEventListener( ("buttonAction2"), (e) => {
            if(this.buttons[2].pressed && this.buttons[2].pressed !== this.buttons[2].lastFrame) {
                console.log('press X')
            } else if(this.buttons[2].pressed) {
                console.log('hold X')
            }
        }, false );
        document.addEventListener( ("buttonAction3"), (e) => {
            if(this.buttons[3].pressed && this.buttons[3].pressed !== this.buttons[3].lastFrame) {
                console.log('press Y')
            } else if(this.buttons[3].pressed) {
                console.log('hold Y')
            }
        }, false );
        document.addEventListener( ("buttonAction4"), (e) => {
            console.log('press Left Top Button')
        }, false );
        document.addEventListener( ("buttonAction5"), (e) => {
            console.log('press Right Top Button')
        }, false );
        document.addEventListener( ("buttonAction6"), (e) => {
            console.log('press Left Trigger')
        }, false );
        document.addEventListener( ("buttonAction7"), (e) => {
            console.log('press Right Trigger')
        }, false );
        document.addEventListener( ("buttonAction8"), (e) => {
            console.log('press Select')
        }, false );
        document.addEventListener( ("buttonAction9"), (e) => {
            console.log('press Start')
        }, false );
        document.addEventListener( ("buttonAction10"), (e) => {
            console.log('press Left Joystick Button')
        }, false );
        document.addEventListener( ("buttonAction11"), (e) => {
            console.log('press Right Joystick Button')
        }, false );
        document.addEventListener( ("buttonAction12"), (e) => {
            console.log('press Dpad Up')
        }, false );
        document.addEventListener( ("buttonAction13"), (e) => {
            console.log('press Dpad Down')
        }, false );
        document.addEventListener( ("buttonAction14"), (e) => {
            console.log('press Dpad Left')
        }, false );
        document.addEventListener( ("buttonAction15"), (e) => {
            console.log('press Dpad Right')
        }, false );
    }

    clearInputs() {
        this.leftAxis.x = 0
        this.leftAxis.y = 0
        this.rightAxis.x = 0
        this.rightAxis.y = 0
        for(let i = 0; i < 16; i++) {
            this.buttons[i].pressed = false;
            this.buttons[i].touched = false;
            this.buttons[i].value = 0;
        }
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

    update(delta) {
        this.currentDelta = delta;

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

        for(let i = 0; i < 16; i++) {
            if(this.buttons[i]) {
                if(this.buttons[i].pressed) {
                    document.dispatchEvent(this.buttonEventMapping[i]);
                }
                this.buttons[i].lastFrame = this.buttons[i].pressed;
            }
        }
    }

    clampY() {
        if(this.targetObject.position.y < 1) {
            this.targetObject.position.y = 1;
        } else if(this.targetObject.position.y > 1000) {
            this.targetObject.position.y = 1000;
        }
    }

    //Need to figure out a sensible way to make the gamepad buttons to keys
    buttonAction(button, i) {
        if(button.pressed || button.value !== 0) {
            if(!this.buttons[i].firstDown) {
                this.buttons[i].firstDown = true
            }

            this.buttons[i].pressed = button.pressed ? button.pressed : false
            this.buttons[i].touched = button.touched ? button.touched : false
            this.buttons[i].value = button.value ? button.value : 0

        }
        // switch(i) {
        //     //right side buttons (bottom, right, left, top)
        //     case 0: //a
        //     case 1: //b
        //     case 2: //x
        //         break;
        //     case 3: //y
        //         break;
        //     case 4: //lb (left top button)
        //     case 5: //lr (right top button)
        //         break;
        //     case 6: //lt (left trigger)
        //     case 7: //rt (right trigger)
        //         // if(button.pressed) {
        //         //     this.targetObject.translateY( i === 6 ? -button.value : button.value)
        //         //     this.clampY()
        //         // }
        //         break;
        //     case 8: //select
        //     case 9: //start
        //     case 10: //left joystick
        //     case 11: //right joystick
        //     case 12: //dpad up
        //     case 13: //dpad down
        //     case 14: //dpad left
        //     case 15: //dpad right
        //     case 16:
        //         //if(button.value !==0) console.log('button:' + i + ", pressed: " + button.pressed + ', value:' + button.value)
        //     break;
        //     default:
        //         break;
        // }
    }
}
export {GamePad}