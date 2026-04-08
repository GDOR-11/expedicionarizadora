import * as React from "react";
import Header from "./components/header";
import Popup from "./components/popup";
import setup from "./scripts/main";
import EditorButton from "./components/EditorButton";
import { textboxes } from "./scripts/editor_logic";
import Textbox from "./scripts/textbox";
import EditTexboxButton from "./components/editor_buttons/EditTexbox";
import equal from "fast-deep-equal";

export const TextboxesContext = React.createContext<{ textboxes: Textbox[], mut_textboxes: () => Textbox[] }>(null);

export default function App() {
    React.useEffect(setup, []);

    const [textboxes, setTextboxes] = React.useState([]);
    const mut_textboxes = () => {
        const new_textboxes = textboxes.slice();
        setTextboxes(new_textboxes);
        return new_textboxes;
    };

    return <TextboxesContext value={{ textboxes, mut_textboxes }}>
        <Header id="default-header">
            <EditorButton id="new-textbox" data-i18n="header.new-textbox" onclick={() => mut_textboxes().push(new Textbox())}/>
            <EditorButton id="select-all" data-i18n="header.select-all" onclick={() => mut_textboxes().forEach(t => t.selected = true)}/>
        </Header>
        <Header id="edit-header" hidden>
            <EditTexboxButton/>
            <button id="delete-textbox" data-i18n="header.delete-textbox"></button>
            <button id="increase-size" data-i18n="header.increase-size"></button>
            <button id="decrease-size" data-i18n="header.decrease-size"></button>
            <select id="select-font"></select>
            <button id="switch-alignment" data-i18n="header.switch-alignment"></button>
        </Header>
        <canvas id="editor"></canvas>
        <Popup id="textbox-editor-container">
            <textarea id="textbox-editor-input"></textarea>
            <div id="textbox-editor-buttons">
                <button id="textbox-editor-done" data-i18n="textbox-editor.done"></button>
                <button id="textbox-editor-cancel" data-i18n="textbox-editor.cancel"></button>
            </div>
        </Popup>
    </TextboxesContext>;
}
