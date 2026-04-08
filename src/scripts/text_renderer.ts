import type RenderSpace from "movable-render-space";
import { vec2 } from "gl-matrix";

import data from "../assets/data.json";
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

function render_character(space: RenderSpace, character: Character) {
    const font = data[character.font];
    const char_data = font.chars[character.char as keyof typeof font.chars];
    if (!char_data) return;

    let path = (char_data.d as string | null) ?? "";

    space.ctx.strokeStyle = "#000000";
    space.ctx.lineWidth = 0.4;
    space.ctx.lineJoin = "round";
    space.ctx.lineCap = "round";
    space.ctx.beginPath();
    space.ctx.save();
    space.ctx.translate(character.pos[0], character.pos[1]);
    space.ctx.scale(character.size / 1000, character.size / 1000);

    const number_regex = " ([+-]?(?:\\d+(?:[.]\\d*)?(?:[eE][+-]?\\d+)?|[.]\\d+(?:[eE][+-]?\\d+)?))";
    while (path.length > 0) {
        const cmd = path[0];
        if (cmd === "M") {
            const [_, x, y, rest] = path.match(`M${number_regex.repeat(2)} ?(.*)$`);
            space.ctx.moveTo(Number(x), -Number(y));
            path = rest;
        } else if (cmd === "L") {
            const [_, x, y, rest] = path.match(`L${number_regex.repeat(2)} ?(.*)$`);
            space.ctx.lineTo(Number(x), -Number(y));
            path = rest;
        } else if (cmd === "Z") {
            const [_, rest] = path.match(/Z ?(.*)$/);
            space.ctx.closePath();
            path = rest;
        } else if (cmd === "C") {
            const [_, x1, y1, x2, y2, x, y, rest] = path.match(`C${number_regex.repeat(6)} ?(.*)$`);
            space.ctx.bezierCurveTo(Number(x1), -Number(y1), Number(x2), -Number(y2), Number(x), -Number(y));
            path = rest;
        }
    }
    space.ctx.restore();
    space.ctx.stroke();
}

export function render_textbox(space: RenderSpace, texbox: Textbox) {
    let [x, y] = texbox.position;
    const chars = data[texbox.font].chars;
    const line_height = (data[texbox.font].info.ascent - data[texbox.font].info.descent) * texbox.font_size / 1000;

    const max_width = (() => {
        let max_width = 0;
        for (let line of texbox.text.split("\n")) {
            const line_width = line.split("").reduce(
                (acc, char) => acc + chars[char as keyof typeof chars].width * texbox.font_size / 1000,
            0);
            max_width = Math.max(max_width, line_width);
        }
        return max_width;
    })();

    y += line_height;
    for (let line of texbox.text.split("\n")) {
        const line_width = line.split("").reduce(
            (acc, char) => acc + chars[char as keyof typeof chars].width * texbox.font_size / 1000,
        0);
        if (texbox.alignment === "center") {
            x += (max_width - line_width) / 2;
        } else if (texbox.alignment === "right") {
            x += max_width - line_width;
        }
        for (let char of line) {
            render_character(space, {
                char,
                pos: vec2.fromValues(x, y),
                size: texbox.font_size,
                font: texbox.font,
            });
            x += chars[char as keyof typeof chars].width * (texbox.font_size / 1000);
        }
        y += line_height;
        x = texbox.position[0];
    }
}

export function get_textbox_AABB(texbox: Textbox): [[number, number], [number, number]] {
    let [x, y] = texbox.position;
    const chars = data[texbox.font].chars;
    const line_height = (data[texbox.font].info.ascent - data[texbox.font].info.descent) * texbox.font_size / 1000;

    let AABB: [[number, number], [number, number]] = [[Infinity, Infinity], [-Infinity, -Infinity]];
    y += line_height;
    for (let line of texbox.text.split("\n")) {
        for (let char of line) {
            const char_data = chars[char as keyof typeof chars];
            if (!char_data) continue;
            AABB[0][0] = Math.min(AABB[0][0], x);
            AABB[0][1] = Math.min(AABB[0][1], y - line_height);
            AABB[1][0] = Math.max(AABB[1][0], x + char_data.width * (texbox.font_size / 1000));
            AABB[1][1] = Math.max(AABB[1][1], y);
            x += char_data.width * (texbox.font_size / 1000);
        }
        y += line_height;
        x = texbox.position[0];
    }
    return AABB;
}
