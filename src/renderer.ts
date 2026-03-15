import RenderSpace from "movable-render-space";
import { vec2 } from "gl-matrix";
import Textbox from "./textbox";

export const canvas = document.getElementById("canvas") as HTMLCanvasElement;
export const space = new RenderSpace(canvas);
space.config.rotating = false;
space.translate(vec2.fromValues(window.innerWidth / 2 - 105, window.innerHeight / 2 - 148.5));

new ResizeObserver(entries => {
    for (let entry of entries) {
        if (entry.target === canvas) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            space.updateTransform();
        }
    }
}).observe(canvas);

export const textboxes = [new Textbox()];

export function render() {
    space.clearScreen();

    space.ctx.fillStyle = "#ffffff";
    space.ctx.shadowColor = "#808080";
    space.ctx.shadowBlur = 16;
    space.ctx.fillRect(0, 0, 210, 297);

    for (const textbox of textboxes) {
        textbox.render(space);
    }
}
render();
space.addListener(render);
