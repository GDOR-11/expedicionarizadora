import type RenderSpace from "movable-render-space";
import { type FontId, get_textbox_AABB, render_textbox } from "./text_renderer";

export default class Textbox {
    constructor(
        public selected: boolean = false,
        public text: string = "Lorem ipsum\ndolor sit amet",
        public position: [number, number] = [0, 0],
        public font: FontId = "EMSReadability",
        public font_size: number = 5,
        public alignment: "left" | "center" | "right" = "left"
    ) { }

    render(space: RenderSpace) {
        const AABB = this.getAABB();

        render_textbox(space, this);

        if (this.selected) {
            space.ctx.strokeStyle = "highlight";
            space.ctx.lineWidth = 2 / space.transform.zoom;
            space.ctx.strokeRect(
                AABB[0][0],
                AABB[0][1],
                AABB[1][0] - AABB[0][0],
                AABB[1][1] - AABB[0][1],
            );
        }
    }

    getAABB(): [[number, number], [number, number]] {
        return get_textbox_AABB(this);
    }
}
