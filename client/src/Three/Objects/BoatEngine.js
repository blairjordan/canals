

export default class BoatEngine {
    constructor(app) {
        this.app = app
        this.hasFuel = true;

        this.maxPower = 0.0075
        this.maxReverse = 0.00375
        this.powerFactor = 0.0001
        this.reverseFactor = 0.0005
      
        this.boosting = false;
        this.boosterPower = 0.0

        this.drag = 0.85;
        this.angularDrag = 0.55;
        this.turnSpeed = 0.0015

        this.x= 0;
        this.y= 0;
        this.xVelocity= 0;
        this.yVelocity= 0;
        this.power= 0;
        this.reverse= 0;
        this.angle=0;
        this.angularVelocity= 0;
        this.isThrottling= false;
        this.isReversing= false;
        this.isTurningLeft= false;
        this.isTurningRight= false;
        
        document.addEventListener( "updateAxis0", (e) => {
          if(Math.abs(this.app.gamepads.gamePad.leftAxis.x) > this.app.gamepads.gamePad.deadzone) {
              this.isTurningLeft = this.app.gamepads.gamePad.leftAxis.x < 0
              this.isTurningRight = this.app.gamepads.gamePad.leftAxis.x > 0
          } else {
              this.isTurningLeft = false
              this.isTurningRight = false
          }
      }, false );
    document.addEventListener( "updateAxis1", (e) => {
            if(Math.abs(this.app.gamepads.gamePad.leftAxis.y) > this.app.gamepads.gamePad.deadzone) {
                this.isThrottling = this.app.gamepads.gamePad.leftAxis.y > 0
                this.isReversing = this.app.gamepads.gamePad.leftAxis.y < 0
            } else {
              this.isThrottling = false
              this.isReversing = false
            }
        }, false );
    }

    updatePosition(x, y) {
      this.x= x;
      this.y= y;
    }

    update (delta) {
        if (this.isThrottling && this.hasFuel) {
          this.power += this.powerFactor * this.isThrottling;
        } else {
          this.power -= this.powerFactor;
          if(this.power <0) this.power = 0
        }
        if (this.isReversing && this.hasFuel) {
          this.reverse += this.reverseFactor;
        } else {
          this.reverse -= this.reverseFactor;
          if(this.reverse <0) this.reverse = 0
        }

        this.power = Math.max(0, Math.min(this.maxPower+(this.boosting ? this.boosterPower : 0), this.power*(this.boosting ? 2.0 : 1.0)));
        this.reverse = Math.max(0, Math.min(this.maxReverse, this.reverse));
    
        const direction = this.power > this.reverse ? 1 : -1;
    
        if (this.isTurningLeft) {
          this.angularVelocity += direction * this.turnSpeed * this.isTurningLeft;
        }
        if (this.isTurningRight) {
          this.angularVelocity -= direction * this.turnSpeed * this.isTurningRight;
        }
    
        this.xVelocity += Math.sin(this.angle) * (this.power - this.reverse);
        this.yVelocity += Math.cos(this.angle) * (this.power - this.reverse);
    
        this.x += this.xVelocity;
        this.y -= this.yVelocity;
        this.xVelocity *= this.drag;
        this.yVelocity *= this.drag;
        this.angle += this.angularVelocity;
        this.angularVelocity *= this.angularDrag;
    
      }

}