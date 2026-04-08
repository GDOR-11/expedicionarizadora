import * as React from "react";
import { broadcast_update } from "../scripts/update_handler";

export default function EditorButton(args: {
    id: string,
    "data-i18n": string,
    onclick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}) {
    return <button
        className="editor-button"
        id={args.id}
        data-i18n={args["data-i18n"]}
        onClick={(e => {
            args.onclick(e);
            broadcast_update();
        })}
    />;
}
