import hershey from "hersheytext";

const data: { [id: string]: any } = {};
const fonts = hershey.getFonts().map((font: any) => hershey.getFontData(font))
    .filter((font: any) => Object.keys(font.chars).length === 187);
for (const font of fonts) {
    console.log(font.info["font-family"]);
    data[font.info.id] = font;
    font.info["units-per-em"] = Number(font.info["units-per-em"]);
    font.info.ascent = Number(font.info.ascent);
    font.info.descent = Number(font.info.descent);
    font.info["cap-height"] = Number(font.info["cap-height"]);
    font.info["x-height"] = Number(font.info["x-height"]);
    font.info["horiz-adv-x"] = Number(font.info["horiz-adv-x"]);
    for (const char in font.chars) {
        if (font.chars[char].d === null) continue;
        font.chars[char].d = font.chars[char].d
            .replaceAll(/([MLCZ])([-+\d])/g, "$1 $2")
            .replaceAll(/(\d)([MLCZ])/g, "$1 $2")
            .replaceAll(/ +/g, " ")
            .trim();
    }
}
const json = JSON.stringify(data, null, 4);
Deno.writeFile("../src/assets/data.json", new TextEncoder().encode(json));
