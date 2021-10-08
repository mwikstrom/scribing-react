import { ParagraphStyle, TargetOptions } from "scribing";
import { KeyHandler } from "./KeyHandler";

export const SetParagraphStyleHandler: KeyHandler = (e, state) => {
    // CTRL + 0 to CTRL + 9 changes paragraph style variant
    if (e.key >= "0" && e.key <= "9" && e.ctrlKey && !e.shiftKey && !e.altKey) {
        if (state.selection) {
            const variant = ([
                "normal",   // CTRL + 0
                "h1",       // CTRL + 1
                "h2",       // CTRL + 2
                "h3",       // CTRL + 3
                "h4",       // CTRL + 4
                "h5",       // CTRL + 5
                "h6",       // CTRL + 6
                "title",    // CTRL + 7
                "code",     // CTRL + 8
                "preamble", // CTRL + 9
            ] as const)[e.key.charCodeAt(0) - "0".charCodeAt(0)];
            const options: TargetOptions = {
                target: state.content,
                theme: state.theme,
            };
            const style = ParagraphStyle.empty.set("variant", variant);
            const operation = state.selection.formatParagraph(style, options);
            return operation;
        }

        return null;
    }
};
