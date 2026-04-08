import * as React from "react";
import { textboxes } from "../../scripts/editor_logic";
import EditorButton from "../EditorButton";

import { TextboxesContext } from "../../app";

export default function EditTexboxButton() {
    function handleClick() {
        document.getElementById("textbox-editor-container").style.display = "flex";
        const selected = textboxes.filter(textbox => textbox.selected);
        if (selected.every(textbox => textbox.text === selected[0].text)) {
            (document.getElementById("textbox-editor-input") as HTMLTextAreaElement).value = selected[0].text;
        }
    }

    return <EditorButton
        id="edit-texbox"
        data-i18n="header.edit-textbox"
        onclick={handleClick}
    />
}
