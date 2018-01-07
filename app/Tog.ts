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

export default class Tog {
    public position: {x: number, y: number};
    public heading: {x: number, y: number};
    public color: number;

    private sprite: Graphics;
    private xWrap: number;
    private yWrap: number;
    private skip: number = 0;

    private jumpOffset = this.jumpPhase();

    public constructor(x: number, y: number, heading: number, xWrap: number, yWrap: number) {
        this.position = {x, y};

        this.heading = HEADINGS[heading];

        this.xWrap = xWrap;
        this.yWrap = yWrap;
        
        this.sprite = new Graphics();
        this.sprite.moveTo(x,y)
            .beginFill(Math.floor(Math.random() * 0xFFFFFF))
            .drawRect(0, 0, width, height)
            .endFill();
        this.sprite.cacheAsBitmap = true;
    }

    public step(): void {
        if (this.skip) {
            this.skip--;
            return;
        }
        let { x, y } = this.position;
        let { x: dx, y: dy } = this.heading;

        dy -= this.getJumpOffset();
        
        let newX = x + dx;
        let newY = y + dy;
        
        if (newX > this.xWrap + this.sprite.width) {
            newX = 0;
        } else if (newX < 0 - this.sprite.width) {
            newX = this.xWrap - this.sprite.width;
        }

        if (newY > this.yWrap + this.sprite.height) {
            newY = 0;
        } else if (newY < 0 - this.sprite.height) {
            newY = this.yWrap - this.sprite.height;
        }

        this.position = {x: newX, y: newY };

        this.sprite.position.set(this.position.x, this.position.y);        
    }

    private getJumpOffset(): number {
        const jumpOffset = this.jumpOffset.next().value;
        if (jumpOffset !== 0) {
            return jumpOffset;
        } 
        
        const skip = Math.floor(Math.random() * 20);
        if (skip > 15) {
            this.skip = Math.floor(Math.random() * 20);
            this.heading = HEADINGS[Math.floor(Math.random() * HEADINGS.length)];
        }

        return 0;
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
