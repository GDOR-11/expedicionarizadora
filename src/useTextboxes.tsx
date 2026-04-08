import { useSyncExternalStore } from "react";
import Textbox from "./scripts/textbox";
import equal from "fast-deep-equal";

let textboxes: Textbox[] = [];
const listeners: (() => void)[] = [];

function subscribe(callback: () => void) {
    listeners.push(callback);
    return () => {
        listeners.splice(listeners.indexOf(callback));
    };
}

export default function useTextboxes<T>(selector: (textboxes: Textbox[]) => T) {
    const cache: { value: T } | null = null;
    useSyncExternalStore(subscribe);
}
