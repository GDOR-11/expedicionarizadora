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
    "error-popup-container": null,
    "error-message": null,
    "error-popup-ok": null,
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

const language = (() => {
    let language_tag = (navigator.language || navigator.languages[0] || "pt").split("-")[0];
    if (!(language_tag in languages)) language_tag = "pt";
    const language = languages[language_tag as keyof typeof languages];
    for (let id in language) {
        document.querySelectorAll(`[data-i18n="${id}"]`).forEach(element => {
            element.textContent = language[id as keyof typeof language];
        });
    }
    return language;
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


function open_error_popup(error_message: string) {
    elements["error-popup-container"].style.display = "flex";
    elements["error-message"].innerText = error_message;
}
elements["error-popup-ok"].addEventListener("click", () => {
    elements["error-popup-container"].style.display = "none";
});


elements["edit-textbox"].addEventListener("click", () => {
    elements["textbox-editor-container"].style.display = "flex";
    const selected = textboxes.filter(textbox => textbox.selected);
    if (selected.every(textbox => textbox.text === selected[0].text)) {
        (elements["textbox-editor-input"] as HTMLTextAreaElement).value = selected[0].text;
    }
});
elements["textbox-editor-done"].addEventListener("click", () => {
    const new_text = (elements["textbox-editor-input"] as HTMLTextAreaElement).value;
    const invalid_char = new_text.split("").find(char => char !== "\n" && !Object.keys(get_font("EMSAllure").chars).includes(char));

    if (invalid_char !== undefined) {
        open_error_popup(language["error.invalid-character"] + invalid_char);
    } else {
        const selected = textboxes.filter(textbox => textbox.selected);
        selected.forEach(textbox => textbox.text = new_text);
        broadcast_update();
    }

    elements["textbox-editor-container"].style.display = "none";
    (elements["textbox-editor-input"] as HTMLTextAreaElement).value = "";
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
