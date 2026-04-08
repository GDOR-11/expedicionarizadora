import { vec2 } from "gl-matrix";
import type Textbox from "./textbox";
import { add_update_listener, broadcast_update } from "./update_handler";
import RenderSpace from "movable-render-space";

type Pointer = {
    start_pos: vec2;
    start_time: number;
    target?: Textbox;
    dragging: boolean;
};

export const textboxes: Textbox[] = [];

export default function setup_editor() {
    const canvas = document.getElementById("editor") as HTMLCanvasElement;
    const space = new RenderSpace(canvas);
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

    function render() {
        space.clearScreen();

        space.ctx.fillStyle = "#ffffff";
        space.ctx.shadowColor = "#808080";
        space.ctx.shadowBlur = 16;
        space.ctx.fillRect(0, 0, 210, 297);
        space.ctx.shadowBlur = 0;

        for (const textbox of textboxes) {
            textbox.render(space);
        }
    }
    render();
    space.addListener(render);
    add_update_listener(render);


    const pointers: { [id: number]: Pointer } = {};
    canvas.addEventListener("pointerdown", event => {
        let target: Textbox | null = null;
        for (const textbox of textboxes) {
            const AABB = textbox.getAABB();
            const [x, y] = space.screenToRenderSpace([event.offsetX, event.offsetY]);
            if (x >= AABB[0][0] && x <= AABB[1][0] && y >= AABB[0][1] && y <= AABB[1][1]) {
                target = textbox;
                break;
            }
        }
        if (target) {
            space.config.panning = false;
            space.config.zooming = false;
        }
        pointers[event.pointerId] = {
            start_pos: vec2.fromValues(event.x, event.y),
            start_time: performance.now(),
            target,
            dragging: false
        };
    });
    canvas.addEventListener("pointermove", event => {
        if (!pointers[event.pointerId]) return;
        const target = pointers[event.pointerId].target;
        let dx = event.x - pointers[event.pointerId].start_pos[0];
        let dy = event.y - pointers[event.pointerId].start_pos[1];
        if (pointers[event.pointerId].dragging || Math.hypot(dx, dy) > 5) {
            pointers[event.pointerId].dragging = true;
            if (!target) return;
            if (!target.selected) {
                if (!event.shiftKey) textboxes.forEach(textbox => textbox.selected = false);
                target.selected = true;
            }
            const movement = vec2.fromValues(event.movementX, event.movementY);
            vec2.scale(movement, movement, 1 / space.transform.zoom);
            textboxes.forEach(textbox => {
                if (textbox.selected) vec2.add(textbox.position, textbox.position, movement);
            });
            broadcast_update();
        }
    });
    canvas.addEventListener("pointerup", event => {
        const pointer = pointers[event.pointerId];
        delete pointers[event.pointerId];
        if (Object.values(pointers).every(pointer => pointer.target === null)) {
            space.config.panning = true;
            space.config.zooming = true;
        }
        if (pointer?.dragging) return;
        if (!event.shiftKey && (performance.now() - pointer.start_time) < 250) {
            textboxes.forEach(textbox => textbox.selected = false);
        }
        if (pointer.target) pointer.target.selected = !pointer.target.selected;
        broadcast_update();
    });
}
