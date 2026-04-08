import { textboxes } from "./editor_logic";
import Textbox from "./textbox";
import languages from "../assets/languages.json";
import { type FontId, fonts, get_font } from "./text_renderer";
import { add_update_listener, broadcast_update } from "./update_handler";

function get_element(id: string): HTMLElement {
    return document.getElementById(id);
}
function onclick(id: string, callback: (event: MouseEvent) => void) {
    get_element(id).addEventListener("click", callback);
}
function setup_language() {
    let language_tag = (navigator.language || navigator.languages[0] || "pt").split("-")[0];
    if (!(language_tag in languages)) language_tag = "pt";
    let language = languages[language_tag as keyof typeof languages];
    for (let id in language) {
        document.querySelectorAll(`[data-i18n="${id}"]`).forEach(element => {
            element.textContent = language[id as keyof typeof language];
        });
    }
}
function setup_font_selector() {
    for (let font of fonts) {
        const option = document.createElement("option");
        option.value = font;
        option.textContent = get_font(font).info["font-family"];
        get_element("select-font").appendChild(option);
    }
    add_update_listener(() => {
        const selected = textboxes.filter(textbox => textbox.selected);
        if (selected.length === 0) return;
        const all_same_font = selected.every(textbox => textbox.font === selected[0].font);
        if (all_same_font) {
            (get_element("select-font") as HTMLSelectElement).value = selected[0].font;
        } else {
            (get_element("select-font") as HTMLSelectElement).value = "";
        }
    });
}
function setup_header() {
    add_update_listener(() => {
        if (textboxes.every(textbox => !textbox.selected)) {
            get_element("default-header").style.display = "flex";
            get_element("edit-header").style.display = "none";
        } else {
            get_element("default-header").style.display = "none";
            get_element("edit-header").style.display = "flex";
        }
    });
}

export default function setup_UI() {
    setup_language();
    setup_font_selector();
    setup_header();

    onclick("textbox-editor-done", () => {
        const selected = textboxes.filter(textbox => textbox.selected);
        const new_text = (get_element("textbox-editor-input") as HTMLTextAreaElement).value;
        selected.forEach(textbox => textbox.text = new_text);
        get_element("textbox-editor-container").style.display = "none";
        (get_element("textbox-editor-input") as HTMLTextAreaElement).value = "";
        broadcast_update();
    });
    onclick("textbox-editor-cancel", () => {
        get_element("textbox-editor-container").style.display = "none";
        (get_element("textbox-editor-input") as HTMLTextAreaElement).value = "";
    });

    onclick("delete-textbox", () => {
        for (let i = textboxes.length - 1; i >= 0; i--) {
            if (textboxes[i].selected) textboxes.splice(i, 1);
        }
        broadcast_update();
    });

    onclick("increase-size", () => {
        textboxes.forEach(textbox => {
            if (textbox.selected) textbox.font_size *= 1.05;
        });
        broadcast_update();
    });
    onclick("decrease-size", () => {
        textboxes.forEach(textbox => {
            if (textbox.selected) textbox.font_size /= 1.05;
        });
        broadcast_update();
    });

    get_element("select-font").addEventListener("change", () => {
        const font = (get_element("select-font") as HTMLSelectElement).value;
        textboxes.forEach(textbox => {
            if (textbox.selected) textbox.font = font as FontId;
        });
        broadcast_update();
    });

    onclick("switch-alignment", () => {
        textboxes.forEach(textbox => {
            if (textbox.selected) {
                if (textbox.alignment === "left") textbox.alignment = "center";
                else if (textbox.alignment === "center") textbox.alignment = "right";
                else if (textbox.alignment === "right") textbox.alignment = "left";
            }
        });
        broadcast_update();
    });

}
