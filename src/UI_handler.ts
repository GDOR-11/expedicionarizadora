import { textboxes, render } from "./renderer";
import Textbox from "./textbox";

const default_header = document.getElementById("default-header");
const edit_header = document.getElementById("edit-header");
export function update_header() {
    if (textboxes.every(textbox => !textbox.selected)) {
        default_header.style.display = "flex";
        edit_header.style.display = "none";
    } else {
        default_header.style.display = "none";
        edit_header.style.display = "flex";
    }
}

document.getElementById("new-textbox").addEventListener("click", () => {
    textboxes.push(new Textbox());
    render();
});
document.getElementById("select-all").addEventListener("click", () => {
    textboxes.forEach(textbox => textbox.selected = true);
    update_header();
    render();
});
document.getElementById("delete-textbox").addEventListener("click", () => {
    for (let i = textboxes.length - 1; i >= 0; i--) {
        if (textboxes[i].selected) textboxes.splice(i, 1);
    }
    update_header();
    render();
});
document.getElementById("edit-textbox").addEventListener("click", () => {
    document.getElementById("textbox-editor-container").style.display = "flex";
    const selected = textboxes.filter(textbox => textbox.selected);
    if (selected.every(textbox => textbox.text === selected[0].text)) {
        (document.getElementById("textbox-editor-input") as HTMLTextAreaElement).value = selected[0].text;
    }
});
document.getElementById("textbox-editor-done").addEventListener("click", () => {
    const selected = textboxes.filter(textbox => textbox.selected);
    const new_text = (document.getElementById("textbox-editor-input") as HTMLTextAreaElement).value;
    selected.forEach(textbox => textbox.text = new_text);
    document.getElementById("textbox-editor-container").style.display = "none";
    (document.getElementById("textbox-editor-input") as HTMLTextAreaElement).value = "";
    render();
});
document.getElementById("textbox-editor-cancel").addEventListener("click", () => {
    document.getElementById("textbox-editor-container").style.display = "none";
    (document.getElementById("textbox-editor-input") as HTMLTextAreaElement).value = "";
});
document.getElementById("increase-font").addEventListener("click", () => {
    textboxes.forEach(textbox => {
        if (textbox.selected) textbox.font_size *= 1.05;
    });
    render();
});
document.getElementById("decrease-font").addEventListener("click", () => {
    textboxes.forEach(textbox => {
        if (textbox.selected) textbox.font_size /= 1.05;
    });
    render();
});
document.getElementById("switch-alignment").addEventListener("click", () => {
    textboxes.forEach(textbox => {
        if (textbox.selected) {
            if (textbox.alignment === "left") textbox.alignment = "center";
            else if (textbox.alignment === "center") textbox.alignment = "right";
            else if (textbox.alignment === "right") textbox.alignment = "left";
        }
    });
    render();
});
