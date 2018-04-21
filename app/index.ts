import 'babel-polyfill';
import { WebGLRenderer, Graphics, Container, WebGLRendererOptions } from 'pixi.js';
import Tog from './Tog';

const RED = 0xFF0000;
const GREEN = 0x00FF00;
const BLUE = 0x0000FF;

const WIDTH = window.innerWidth - 20;
const HEIGHT = window.innerHeight - 20;

function setupRenderer() {
    const renderOptions: WebGLRendererOptions = {
        transparent: true
    }
    const renderer = new WebGLRenderer(WIDTH, HEIGHT, renderOptions);
    const canvas = document.querySelector('canvas');
    if (canvas) {
        canvas.parentElement.removeChild(canvas);
    }
    document.body.appendChild(renderer.view)
    return renderer;
}

function generateTogs(population: number) {
    const togs = [];
    for (let i = 1; i < population; i++) {
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

const togs = generateTogs(500);
togs.forEach(tog => tog.addTo(stage));


function render() {
    togs.forEach(tog => tog.step(renderer));
    renderer.render(stage);
    requestAnimationFrame(render);
}

render();




