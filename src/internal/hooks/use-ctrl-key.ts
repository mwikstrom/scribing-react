import { useEffect, useState } from "react";
import { PubSub } from "../utils/PubSub";

/** @internal */
export const useCtrlKey = (): boolean => {
    const [state, setState] = useState(!!CtrlKeySource.current);
    useEffect(() => CtrlKeySource.sub(setState), [setState]);
    return state;
};

interface CtrlKeyEvent {
    ctrlKey: boolean;
}

const CtrlKeySource = new (class CtrlKeySource extends PubSub<boolean> {
    #ctrlKeyEventHandler = (e: CtrlKeyEvent) => this.pub(e.ctrlKey);
    #eventSources = new Set<Window>();
    constructor() { super(false); }
    onStart() {
        try {
            let w: Window = window;
            while (w) {
                CTRL_KEY_EVENTS.forEach(type => w.addEventListener(type, this.#ctrlKeyEventHandler));
                this.#eventSources.add(w);
                const { parent } = w;
                if (parent === null || parent === w) {
                    break;
                } else {
                    w = parent;
                }
            }
        } catch {
            // ignored. may throw when access to parent window is denied
        }        
    }
    onStop() {
        for (const w of this.#eventSources) {
            CTRL_KEY_EVENTS.forEach(type => w.removeEventListener(type, this.#ctrlKeyEventHandler));
        }
        this.#eventSources.clear();
    }
})();

const CTRL_KEY_EVENTS = [
    "keydown",
    "keyup",
    "mousemove",
] as const;
