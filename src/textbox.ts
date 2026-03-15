import RenderSpace from "movable-render-space";

export default class Textbox {
    constructor(
        public selected: boolean = false,
        public text: string = "Lorem ipsum\ndolor sit amet\nconsectetur adipiscing elit",
        public position: [number, number] = [0, 0],
        public font_size: number = 5,
        public alignment: "left" | "center" | "right" = "left"
    ) { }

    // TODO: this is temporary!!!
    render(space: RenderSpace) {
        space.ctx.shadowBlur = 0;

        space.ctx.textBaseline = "top";
        space.ctx.font = `${this.font_size}px sans-serif`;
        space.ctx.fillStyle = "#000000";

        const AABB = this.getAABB(space);

        let [x, y] = this.position;
        for (let line of this.text.split("\n")) {
            const measurements = space.ctx.measureText(line);
            const line_height = measurements.fontBoundingBoxAscent - measurements.ideographicBaseline;
            if (this.alignment === "left") {
                space.ctx.fillText(line, x, y + measurements.fontBoundingBoxAscent);
            } else if (this.alignment === "center") {
                let offset = (AABB[1][0] - AABB[0][0]) / 2 - measurements.width / 2;
                space.ctx.fillText(line, x + offset, y + measurements.fontBoundingBoxAscent);
            } else if (this.alignment === "right") {
                let offset = (AABB[1][0] - AABB[0][0]) - measurements.width;
                space.ctx.fillText(line, x + offset, y + measurements.fontBoundingBoxAscent);
            }
            y += line_height;
        }

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

    getAABB(space: RenderSpace): [[number, number], [number, number]] {
        let AABB: [[number, number], [number, number]] = [[Infinity, Infinity], [-Infinity, -Infinity]];
        let [x, y] = this.position;
        for (let line of this.text.split("\n")) {
            const measurements = space.ctx.measureText(line);
            const line_height = measurements.fontBoundingBoxAscent - measurements.ideographicBaseline;
            AABB[0][0] = Math.min(AABB[0][0], x);
            AABB[0][1] = Math.min(AABB[0][1], y);
            AABB[1][0] = Math.max(AABB[1][0], x + measurements.width);
            AABB[1][1] = Math.max(AABB[1][1], y + line_height);
            y += line_height;
        }
        return AABB;
    }
}
