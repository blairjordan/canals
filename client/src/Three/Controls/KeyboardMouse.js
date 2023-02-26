import { MathUtils } from "three";

class KeyboardAndMouse {
  constructor(app, gamePad) {
    this.app = app;
    this.gamePad = gamePad;

    this.enabled = true;
    this.enabledZoom = true;
    this.mouseAction = -1;
    this.zoomSpeed = 100;

    this.init();
  }

  init() {
    this.onContextMenu = this.onContextMenu.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onMouseWheel = this.onMouseWheel.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);

    window.addEventListener("contextmenu", this.onContextMenu);

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("wheel", this.onMouseWheel, {
      passive: false,
    });
  }

  onContextMenu(event) {
    if (this.enabled === false) return;

    event.preventDefault();
  }

  onKeyDown(event) {
    if (this.enabled === false) return;

    event = event || window.event;
    switch (event.key) {
      case "ArrowLeft":
      case "a":
      case "A":
          this.gamePad.updateAxis(0, -10);
        break;
      case "ArrowRight":
      case "d":
      case "D":
          this.gamePad.updateAxis(0, 10);
        break;
      case "ArrowUp":
      case "w":
      case "W":
          this.gamePad.updateAxis(1, -10);
        break;
      case "ArrowDown":
      case "s":
      case "S":
          this.gamePad.updateAxis(1, 10);
        break;
      case "q":
      case "Q":
          this.gamePad.updateAxis(2, -10);
        break;
      case "e":
      case "E":
          this.gamePad.updateAxis(2, 10);
        break;
      default:
        //do nothing (unassigned keys)
        break;
    }
  }

  onPointerDown(event) {
    if (this.enabled === false) return;

    if (event.pointerType === "touch") {
      this.onTouchStart(event);
    } else {
      this.onMouseDown(event);
    }
  }

  onPointerUp(event) {
    if (this.enabled === false) return;

    if (event.pointerType === "touch") {
      this.onTouchEnd(event);
    } else {
      this.onMouseUp(event);
    }
  }

  onPointerMove(event) {
    if (this.enabled === false) return;

    if (event.pointerType === "touch") {
      this.onTouchMove(event);
    } else {
      this.onMouseMove(event);
    }
  }

  onTouchStart(event) {
    //
  }
  onTouchEnd(event) {
    //
  }

  onTouchMove(event) {
    //
  }

  onMouseDown(event) {
    this.mouseAction = event.button;
  }

  onMouseUp(event) {
    this.mouseAction = -1;
  }

  onMouseMove(event) {
    if (this.mouseAction === 0) {
      //look
      this.gamePad.updateAxis(2, MathUtils.clamp(event.movementX, -1, 1));
      this.gamePad.updateAxis(3, MathUtils.clamp(event.movementY, -1, 1));
    }
    if (this.mouseAction === 1 || this.mouseAction === 2) {
      //pan
      this.gamePad.updateAxis(0, MathUtils.clamp(event.movementX, -1, 1));

      if (event.movementY > 0) {
        this.gamePad.buttonAction({ pressed: true, value: 1 }, 6);
      } else {
        this.gamePad.buttonAction({ pressed: true, value: 1 }, 7);
      }
      // this.gamePad.updateAxis(
      //   1,
      //   MathUtils.clamp(event.movementY, -1, 1)
      // );
    }
  }

  onMouseWheel(event) {
    if (this.enabled === false || this.enableZoom === false) return;

    event.preventDefault();

    this.gamePad.updateAxis(1, event.deltaY * 0.5);
  }
}

export { KeyboardAndMouse };