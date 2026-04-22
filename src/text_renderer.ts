import type RenderSpace from "movable-render-space";
import { vec2 } from "gl-matrix";

import data from "./data.json";
import type Textbox from "./textbox";

export type FontId = keyof typeof data;
export type Font = typeof data[FontId];
export const fonts = Object.keys(data) as FontId[];
export function get_font(font_id: FontId): Font {
    return data[font_id];
}

type Character = {
    char: string;
    pos: vec2;
    size: number;
    font: keyof typeof data;
}

function render_character(space: RenderSpace, character: Character): string {
    const font = data[character.font];
    const char_data = font.chars[character.char as keyof typeof font.chars];
    if (!char_data) return;

    let path = (char_data.d as string | null) ?? "";
    let penup = true;
    let pen_pos = vec2.create();
    let first_point: vec2 | null = null;
    let template = "";

    space.ctx.strokeStyle = "#000000";
    space.ctx.lineWidth = 0.4;
    space.ctx.lineJoin = "round";
    space.ctx.lineCap = "round";
    space.ctx.beginPath();
    const font_to_screen = (out: vec2, x: string, y: string) => vec2.set(out,
        Number(x) * character.size / 1000 + character.pos[0],
        -Number(y) * character.size / 1000 + character.pos[1]
    );
    const round = (v: vec2) => vec2.set(v,
        Math.round(v[0] * 10) / 10,
        Math.round(v[1] * 10) / 10
    );
    const vec2_to_str = (v: vec2) => `${Math.round(v[0] * 10) / 10},${Math.round(v[0] * 10) / 10};`;

    const number_regex = " ([+-]?(?:\\d+(?:[.]\\d*)?(?:[eE][+-]?\\d+)?|[.]\\d+(?:[eE][+-]?\\d+)?))";
    while (path.length > 0) {
        const cmd = path[0];
        if (cmd === "M") {
            const [_, x, y, rest] = path.match(`M${number_regex.repeat(2)} ?(.*)$`);
            path = rest;

            font_to_screen(pen_pos, x, y);
            round(pen_pos);
            if (!penup) {
                penup = true;
                template += "U;";
            }
            if (first_point === null) {
                first_point = vec2.clone(pen_pos);
            }
            template += vec2_to_str(pen_pos);

            space.ctx.moveTo(pen_pos[0], pen_pos[1]);
        } else if (cmd === "L") {
            const [_, x, y, rest] = path.match(`L${number_regex.repeat(2)} ?(.*)$`);
            path = rest;

            font_to_screen(pen_pos, x, y);
            round(pen_pos);
            if (penup) {
                penup = false;
                template += "D;"
            }
            template += vec2_to_str(pen_pos);

            space.ctx.lineTo(pen_pos[0], pen_pos[1]);
        } else if (cmd === "Z") {
            const [_, rest] = path.match(/Z ?(.*)$/);
            path = rest;

            if (penup) {
                penup = false;
                template += "D;"
            }
            template += vec2_to_str(first_point);

            space.ctx.closePath();
        } else if (cmd === "C") {
            const [_, x1, y1, x2, y2, x, y, rest] = path.match(`C${number_regex.repeat(6)} ?(.*)$`);
            path = rest;

            let p0 = pen_pos;
            let p1 = font_to_screen(vec2.create(), x1, y1);
            let p2 = font_to_screen(vec2.create(), x2, y2);
            let p3 = font_to_screen(vec2.create(), x, y);

            if (penup) {
                penup = false;
                template += "D;";
            }
            for (let i = 0; i <= 10; i++) {
                let t = i / 10;
                let p = vec2.create();
                vec2.scaleAndAdd(p, p, p0, (1 - t) ** 3);
                vec2.scaleAndAdd(p, p, p1, 3 * (1 - t) ** 2 * t);
                vec2.scaleAndAdd(p, p, p2, 3 * (1 - t) * t ** 2);
                vec2.scaleAndAdd(p, p, p3, t ** 3);
                round(p);

                template += vec2_to_str(p);
                space.ctx.lineTo(p[0], p[1]);
            }

            vec2.copy(pen_pos, p3);
        }
    }

    space.ctx.stroke();

    if (!penup) {
        template += "U;";
    }
    return template;
}

export function render_textbox(space: RenderSpace, textbox: Textbox): string {
    let [x, y] = textbox.position;
    const chars = data[textbox.font].chars;
    const line_height = (data[textbox.font].info.ascent - data[textbox.font].info.descent) * textbox.font_size / 1000;
    const line_width = (line: string) => line.split("").reduce(
        (acc, char) => acc + chars[char as keyof typeof chars].width * textbox.font_size / 1000,
        0
    );

    let max_width = 0;
    for (let line of textbox.text.split("\n")) {
        max_width = Math.max(max_width, line_width(line));
    }

    let template = "";

    y += line_height;
    for (let line of textbox.text.split("\n")) {
        if (textbox.alignment === "center") {
            x += (max_width - line_width(line)) / 2;
        } else if (textbox.alignment === "right") {
            x += max_width - line_width(line);
        }
        for (let char of line) {
            template += render_character(space, {
                char,
                pos: vec2.fromValues(x, y),
                size: textbox.font_size,
                font: textbox.font,
            });
            x += chars[char as keyof typeof chars].width * (textbox.font_size / 1000);
        }
        y += line_height;
        x = textbox.position[0];
    }

    return template;
}

export function get_textbox_AABB(textbox: Textbox): [[number, number], [number, number]] {
    let [x, y] = textbox.position;
    const chars = data[textbox.font].chars;
    const line_height = (data[textbox.font].info.ascent - data[textbox.font].info.descent) * textbox.font_size / 1000;

    let AABB: [[number, number], [number, number]] = [[Infinity, Infinity], [-Infinity, -Infinity]];
    y += line_height;
    for (let line of textbox.text.split("\n")) {
        for (let char of line) {
            const char_data = chars[char as keyof typeof chars];
            if (!char_data) continue;
            AABB[0][0] = Math.min(AABB[0][0], x);
            AABB[0][1] = Math.min(AABB[0][1], y - line_height);
            AABB[1][0] = Math.max(AABB[1][0], x + char_data.width * (textbox.font_size / 1000));
            AABB[1][1] = Math.max(AABB[1][1], y);
            x += char_data.width * (textbox.font_size / 1000);
        }
        y += line_height;
        x = textbox.position[0];
    }
    return AABB;
}
