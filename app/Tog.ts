import { WebGLRenderer, Graphics, Container, Point } from "pixi.js";
import * as _ from 'lodash';

const WIDTH = 5;
const HEIGHT = 8;

const getHeading = () => {
    return {
        x: _.random(-1, 1, true),
        y: _.random(-1, 1, true)
    };
}

export default class Tog {
    public position: {x: number, y: number};
    public heading: {x: number, y: number, chase?: boolean};
    public color: number;

    private sprite: Graphics;
    private xWrap: number;
    private yWrap: number;
    private framesToSkip: number = 0;
    private skipChance: number = 0.75;
    private inclination: {x: number, y: number};
    private pep: number;
    private soaring: { remainingX: number, remainingY: number, timeInFlight: number, timeRemaining: number };

    private jumpOffset = this.jumpPhase();

    public constructor(x: number, y: number, heading: number, xWrap: number, yWrap: number) {
        this.position = {x, y};

        this.heading = getHeading();

        this.xWrap = xWrap;
        this.yWrap = yWrap;
        
        this.createSprite(x, y);

        this.skipChance = Math.random();

        this.inclination = {
            x: _.random(0.9, 1.1, true),
            y: _.random(0.9, 1.1, true)
    }

        this.pep = _.random(0.75, 1.75, true)
    }

    public addTo(container: Container): void {
        container.addChild(this.sprite);
    }

    public step(renderer: WebGLRenderer): void {
        if (this.framesToSkip) {
            this.framesToSkip--;
            return;
        }

        const mousePosition = renderer.plugins.interaction.mouse.global;

        this.move(this.getUpdatedPosition(mousePosition));        
    }

    private move(newPosition) {
        this.position = newPosition;
        this.sprite.position.set(newPosition.x, newPosition.y);
    }

    private createSprite(x: number, y: number) {
        this.color = _.random(0xFFFFFF, false);
        this.sprite = new Graphics();
        this.sprite.cacheAsBitmap = true;
        this.sprite.interactive = true;
        this.sprite.hitArea = new PIXI.Rectangle(0, 0, WIDTH * 1.2, HEIGHT * 1.2);
        this.sprite.on('mouseover', mouseData => {
            this.soar();
        });
        this.sprite.moveTo(x, y)
            .beginFill(this.color)
            .drawRect(0, 0, WIDTH, HEIGHT)
            .endFill();
    }

    private soar() {
        if (this.soaring == null) {
            const timeInFlight = _.random(30, 120, false)
            this.soaring = {
                remainingX:  (_.random(this.xWrap, false) - this.position.x) / timeInFlight,
                remainingY: (_.random(this.yWrap, false) - this.position.y) / timeInFlight,
                timeInFlight,
                timeRemaining: timeInFlight
            }
        }
    }

    private teleport() {
        const newX = Math.floor(Math.random() * this.xWrap);
        const newY = Math.floor(Math.random() * this.yWrap);
        console.log('teleport to', newX, newY);
        this.move({x: newX, y: newY});
    }

    private getUpdatedPosition(mousePosition) {
        let { x, y } = this.position;

        if (this.soaring) {
            const soaringPosition = {
                x: x + this.soaring.remainingX,
                y: y + this.soaring.remainingY
            }

            const midPoint = this.soaring.timeInFlight / 2
            const scale = midPoint > this.soaring.timeRemaining ?
                (this.soaring.timeRemaining * 2) / this.soaring.timeInFlight :
                (this.soaring.timeInFlight - this.soaring.timeRemaining) * 2 / this.soaring.timeInFlight

            this.sprite.scale.x = 1 + scale * 1.5
            this.sprite.scale.y =  1 + scale * 1.5

            this.soaring.timeRemaining -= 1
            if (this.soaring.timeRemaining === 0) {
                this.soaring = null
            }

            return soaringPosition
        } else {
            this.sprite.scale = new Point(1, 1)
        }

        let { x: dx, y: dy } =
            this.determineNewHeading(
                this.position,
                this.heading,
                mousePosition
            );

        let { x: ix, y: iy } = this.inclination;

        dx = dx * ix * this.pep; 

        dy = (dy * iy - this.getJumpOffset()) * this.pep;

        let { newX, newY } = this.checkWrap(x + dx, y + dy);

        return {
            x: newX,
            y: newY
        };
    }

  private checkWrap(newX: number, newY: number) {
    if (newX > this.xWrap + this.sprite.width) {
      newX = 0;
    }
    else if (newX < 0 - this.sprite.width) {
      newX = this.xWrap - this.sprite.width;
    }
    if (newY > this.yWrap + this.sprite.height) {
      newY = 0;
    }
    else if (newY < 0 - this.sprite.height) {
      newY = this.yWrap - this.sprite.height;
    }
    return { newX, newY };
  }

    private determineNewHeading(currentPosition, currentHeading, mousePosition) {
        let { x, y } = currentPosition;
        let { x: dx, y: dy } = currentHeading;
        let { x: mouseX, y: mouseY } = mousePosition;

        let dMouseX = x - mouseX;
        let dMouseY = y - mouseY;

        let distance = Math.sqrt(dMouseX*dMouseX + dMouseY*dMouseY);

        if (distance < 100) {
            if ( dMouseX < 1 ) {
                dx = 1;
            } else if (dMouseX > 1) {
                dx = -1;
            }
    
            if ( dMouseY < 1 ) {
                dy = 1;
            } else if ( dMouseY > 1 ) {
                dy = -1;
            }
    
            this.heading.x = dx;
            this.heading.y = dy;
            this.heading.chase = true;
        } else {
            this.heading.chase = false;
        }

        return this.heading;
    }

    private getJumpOffset(): number {
        const jumpOffset = this.jumpOffset.next().value;
        if (jumpOffset !== 0) {
            return jumpOffset;
        } else {
            this.reconsider();
        }

        return 0;
    }

    private reconsider() {
        const shouldReconsider = Math.random() < this.skipChance;
        if (shouldReconsider && !this.heading.chase) {
            this.framesToSkip = 10 + _.random(30, false);
            this.heading = getHeading();
        }
    }
    
    private * jumpPhase () {
        const phases = [0, 1, 1, 2, -1, -2, -1, 0];
        while (true) {
            for(const phase of phases) {
                yield phase;
            }
        }
    }    
}
