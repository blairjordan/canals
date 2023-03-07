
class GamePadMapping {
    constructor() {
        
        this.buttons = {};
        for(let i = 0; i < 16; i++) {
            this.buttons[i] = '';
        }

        //Default Mapping
        // case 0: //a
        // case 1: //b
        // case 2: //x
        // case 3: //y
        this.buttons[3] = 'f'
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
    }

    getMapping(char) {
        for(let i = 0; i < 16; i++) {
            if(this.buttons[i] === char) {
                return i;
            }
        }
        return -1
    }
}

export {GamePadMapping}