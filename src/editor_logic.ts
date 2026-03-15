import { vec2 } from "gl-matrix";
import { textboxes, render, canvas, space } from "./renderer";
import Textbox from "./textbox";
import { update_header } from "./UI_handler";

type Pointer = {
    start_pos: vec2;
    target?: Textbox;
    dragging: boolean;
};
const pointers: { [id: number]: Pointer } = {};

canvas.addEventListener("pointerdown", event => {
    let target: Textbox | null = null;
    for (const textbox of textboxes) {
        const AABB = textbox.getAABB(space);
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
            update_header();
        }
        const movement = vec2.fromValues(event.movementX, event.movementY);
        vec2.scale(movement, movement, 1 / space.transform.zoom);
        textboxes.forEach(textbox => {
            if (textbox.selected) vec2.add(textbox.position, textbox.position, movement);
        });
    }
});
canvas.addEventListener("pointerup", event => {
    const pointer = pointers[event.pointerId];
    delete pointers[event.pointerId];
    if (Object.values(pointers).every(pointer => pointer.target === null)) {
        space.config.panning = true;
        space.config.zooming = true;
    }
    if (pointer?.dragging) {
        return;
    }
    if (!event.shiftKey) textboxes.forEach(textbox => textbox.selected = false);
    if (pointer.target) pointer.target.selected = !pointer.target.selected;
    update_header();
    render();
});
