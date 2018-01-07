import { WebGLRenderer, Graphics, Container } from 'pixi.js';
import Tog from './Tog';

const RED = 0xFF0000;
const GREEN = 0x00FF00;
const BLUE = 0x0000FF;

const WIDTH = window.innerWidth - 20;
const HEIGHT = window.innerHeight - 20;

function setupRenderer() {
    const renderer = new WebGLRenderer(WIDTH, HEIGHT);
    console.log(renderer.screen.width);
    renderer.backgroundColor = 0xF1F1F1;
    const canvas = document.querySelector('canvas');
    if (canvas) {
        canvas.parentElement.removeChild(canvas);
    }
    document.body.appendChild(renderer.view)
    return renderer;
}

function generateTogs(population: number) {
    const togs = [];
    for (let i = 0; i < population; i++) {
        const x = Math.floor(Math.random() * WIDTH) - 5;
        const y = Math.floor(Math.random() * HEIGHT) - 5;
        const heading = Math.floor(Math.random() * 4);
        togs.push(new Tog(x, y, heading, WIDTH, HEIGHT));
    }

    return togs;
}

const renderer = setupRenderer();

// const stage = createGrid();
const stage = new Container();

const togs = generateTogs(200);
togs.forEach(sprite => stage.addChild(sprite.sprite));


function render() {
    togs.forEach(tog => tog.step());
    renderer.render(stage);
    requestAnimationFrame(render);
}

render();




