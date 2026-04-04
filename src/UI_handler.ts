import { textboxes } from "./renderer";
import Textbox from "./textbox";
import languages from "./languages.json";
import { type FontId, fonts, get_font } from "./text_renderer";
import { add_update_listener, broadcast_update } from "./update_handler";

const elements: { [id: string]: HTMLElement } = {
    "default-header": null,
    "edit-header": null,
    "new-textbox": null,
    "select-all": null,
    "delete-textbox": null,
    "edit-textbox": null,
    "textbox-editor-container": null,
    "textbox-editor-input": null,
    "textbox-editor-done": null,
    "textbox-editor-cancel": null,
    "select-font": null,
    "increase-size": null,
    "decrease-size": null,
    "switch-alignment": null
} as any as { [id: string]: HTMLElement };
for (const id in elements) {
    const element = document.getElementById(id);
    if (element === null) {
        alert("shit");
        throw "fuck";
    }
    elements[id] = element;
}

(() => {
    let language_tag = (navigator.language || navigator.languages[0] || "pt").split("-")[0];
    if (!(language_tag in languages)) language_tag = "pt";
    let language = languages[language_tag as keyof typeof languages];
    for (let id in language) {
        document.querySelectorAll(`[data-i18n="${id}"]`).forEach(element => {
            element.textContent = language[id as keyof typeof language];
        });
    }
})();

for (let font of fonts) {
    const option = document.createElement("option");
    option.value = font;
    option.textContent = get_font(font).info["font-family"];
    elements["select-font"].appendChild(option);
}

export function update_header() {
    if (textboxes.every(textbox => !textbox.selected)) {
        elements["default-header"].style.display = "flex";
        elements["edit-header"].style.display = "none";
    } else {
        elements["default-header"].style.display = "none";
        elements["edit-header"].style.display = "flex";
    }
}
add_update_listener(update_header);



elements["new-textbox"].addEventListener("click", () => {
    textboxes.push(new Textbox());
    broadcast_update();
});
elements["select-all"].addEventListener("click", () => {
    textboxes.forEach(textbox => textbox.selected = true);
    broadcast_update();
});


elements["edit-textbox"].addEventListener("click", () => {
    elements["textbox-editor-container"].style.display = "flex";
    const selected = textboxes.filter(textbox => textbox.selected);
    if (selected.every(textbox => textbox.text === selected[0].text)) {
        (elements["textbox-editor-input"] as HTMLTextAreaElement).value = selected[0].text;
    }
});
elements["textbox-editor-done"].addEventListener("click", () => {
    const selected = textboxes.filter(textbox => textbox.selected);
    const new_text = (elements["textbox-editor-input"] as HTMLTextAreaElement).value;
    selected.forEach(textbox => textbox.text = new_text);
    elements["textbox-editor-container"].style.display = "none";
    (elements["textbox-editor-input"] as HTMLTextAreaElement).value = "";
    broadcast_update();
});
elements["textbox-editor-cancel"].addEventListener("click", () => {
    elements["textbox-editor-container"].style.display = "none";
    (elements["textbox-editor-input"] as HTMLTextAreaElement).value = "";
});

elements["delete-textbox"].addEventListener("click", () => {
    for (let i = textboxes.length - 1; i >= 0; i--) {
        if (textboxes[i].selected) textboxes.splice(i, 1);
    }
    broadcast_update();
});

elements["increase-size"].addEventListener("click", () => {
    textboxes.forEach(textbox => {
        if (textbox.selected) textbox.font_size *= 1.05;
    });
    broadcast_update();
});
elements["decrease-size"].addEventListener("click", () => {
    textboxes.forEach(textbox => {
        if (textbox.selected) textbox.font_size /= 1.05;
    });
    broadcast_update();
});

add_update_listener(() => {
    const selected = textboxes.filter(textbox => textbox.selected);
    if (selected.length === 0) return;
    const all_same_font = selected.every(textbox => textbox.font === selected[0].font);
    if (all_same_font) {
        (elements["select-font"] as HTMLSelectElement).value = selected[0].font;
    } else {
        (elements["select-font"] as HTMLSelectElement).value = "";
    }
});
elements["select-font"].addEventListener("change", () => {
    const font = (elements["select-font"] as HTMLSelectElement).value;
    textboxes.forEach(textbox => {
        if (textbox.selected) textbox.font = font as FontId;
    });
    broadcast_update();
});

elements["switch-alignment"].addEventListener("click", () => {
    textboxes.forEach(textbox => {
        if (textbox.selected) {
            if (textbox.alignment === "left") textbox.alignment = "center";
            else if (textbox.alignment === "center") textbox.alignment = "right";
            else if (textbox.alignment === "right") textbox.alignment = "left";
        }
    });
    broadcast_update();
});
