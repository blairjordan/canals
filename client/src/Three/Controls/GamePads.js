import { GamePad } from "./GamePad";
import { KeyboardAndMouse } from "./KeyboardMouse";
import { KNOWN_CONTROLLERS } from "./KnownControllers";

class GamePads {
  constructor(app) {
    this.app = app;

    this.gamePad = new GamePad(app);
    this.keyboardAndMouse = new KeyboardAndMouse(app, this.gamePad)

    this.update = this.update.bind(this);
    this.gamepadHandler = this.gamepadHandler.bind(this);

    window.addEventListener(
      "gamepadconnected",
      (e) => {
        this.gamepadHandler(e, true);
      },
      false
    );
    window.addEventListener(
      "gamepaddisconnected",
      (e) => {
        this.gamepadHandler(e, false);
      },
      false
    );
  }

  gamepadHandler(event, connecting) {
    const gamepad = event.gamepad;
    // Note:
    // gamepad === navigator.getGamepads()[gamepad.index]

    if (connecting) {
      let knownController = KNOWN_CONTROLLERS.find((matcher) =>
        matcher.match(gamepad.id)
      );
      if (knownController) {
        gamepad.vibrationActuator.playEffect("dual-rumble", {
          startDelay: 0,
          duration: 250,
          weakMagnitude: 0.25,
          strongMagnitude: 0.25,
        });
      }
    }
  }

  vibrate() {
    const gamepads = navigator.getGamepads();
    if (gamepads === null) return;
    Object.keys(gamepads).forEach((key) => {
      const controller = gamepads[key];
      if (controller !== null) {
        let knownController = KNOWN_CONTROLLERS.find((matcher) =>
          matcher.match(controller.id)
        );
        if (knownController) {
          controller.vibrationActuator.playEffect("dual-rumble", {
            startDelay: 0,
            duration: 250,
            weakMagnitude: 0.25,
            strongMagnitude: 0.25,
          });
        }
      }
    });
  }

  update() {

    const gamepads = navigator.getGamepads();
    if (gamepads !== null) {
      Object.keys(gamepads).forEach((key) => {
        const controller = gamepads[key];
        if (controller !== null) {
          let knownController = KNOWN_CONTROLLERS.find((matcher) =>
            matcher.match(controller.id)
          );
          if (knownController) {
            for (let i = 0; i < controller.buttons.length; i++) {
              const button = controller.buttons[i];
              if (typeof button === "object") {
                this.gamePad.buttonAction(button, i);
              }
            }
            for (let i = 0; i < controller.axes.length; i++) {
              const axis = controller.axes[i];
              this.gamePad.updateAxis(i, axis);
            }
          }
        }
      });
    }
    if(this.keyboardAndMouse !== null) {
      Object.keys(this.keyboardAndMouse.keys).forEach((key) => {
        if (this.keyboardAndMouse.keys[key]) {
          switch (key) {
            case "ArrowLeft":
            case "a":
            case "A":
              this.gamePad.updateAxis(0, -1);
              break;
            case "ArrowRight":
            case "d":
            case "D":
              this.gamePad.updateAxis(0, 1);
              break;
            case "ArrowUp":
            case "w":
            case "W":
              this.gamePad.updateAxis(1, -1);
              break;
            case "ArrowDown":
            case "s":
            case "S":
              this.gamePad.updateAxis(1, 1);
              break;
            case "q":
            case "Q":
              this.gamePad.updateAxis(2, -1);
              break;
            case "e":
            case "E":
              this.gamePad.updateAxis(2, 1);
              break;
            default:
              //do nothing (unassigned keys)
              break;
          }
        }
      });
    }
    this.gamePad.update()
    this.gamePad.clearAxes();
  }
}

export { GamePads };
