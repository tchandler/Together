import { WebGLRenderer, Graphics, Container, utils } from "pixi.js";

const width = 5;
const height = 8;
const GREEN = 0x00FF00;

const HEADINGS = [
    { x: 0, y: 1 },
    { x: 1, y: 0 },
    { x: 0, y: -1 },
    { x: -1, y: 0 }
]

const getHeading = (index: number) => ({...HEADINGS[index]}) 

export default class Tog {
    public position: {x: number, y: number};
    public heading: {x: number, y: number, chase?: boolean};
    public color: number;

    private sprite: Graphics;
    private xWrap: number;
    private yWrap: number;
    private framesToSkip: number = 0;
    private skipChance: number = 0.75;

    private jumpOffset = this.jumpPhase();

    public constructor(x: number, y: number, heading: number, xWrap: number, yWrap: number) {
        this.position = {x, y};

        this.heading = getHeading(heading);

        this.xWrap = xWrap;
        this.yWrap = yWrap;
        
        this.createSprite(x, y);

        this.skipChance = Math.random();
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
        const color = Math.floor(Math.random() * 0xFFFFFF);
        this.sprite = new Graphics();
        this.sprite.moveTo(x, y)
            .beginFill(color)
            .drawRect(0, 0, width, height)
            .endFill();
        this.sprite.cacheAsBitmap = true;
        this.sprite.interactive = true;
        this.sprite.hitArea = new PIXI.Rectangle(0, 0, width * 1.2, height * 1.2);
        this.sprite.on('mouseover', mouseData => {
            this.teleport();
        });
    }

    private teleport() {
        const newX = Math.floor(Math.random() * this.xWrap);
        const newY = Math.floor(Math.random() * this.yWrap);
        console.log('teleport to', newX, newY);
        this.move({x: newX, y: newY});
    }

    private getUpdatedPosition(mousePosition) {
        let { x, y } = this.position;

        let { x: dx, y: dy } =
            this.determineNewHeading(
                this.position,
                this.heading,
                mousePosition
            );

        dy -= this.getJumpOffset();

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
            this.framesToSkip = 10 + Math.floor(Math.random() * 30);
            this.heading = getHeading(Math.floor(Math.random() * HEADINGS.length));
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
