import { KeyHandler } from "./KeyHandler";

export const SetParagraphVariantHandler: KeyHandler = (e, commands) => {
    // CTRL + 0 to CTRL + 9 changes paragraph style variant
    if (e.key >= "0" && e.key <= "9" && e.ctrlKey && !e.shiftKey && !e.altKey) {
        e.preventDefault();
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
        commands.setParagraphVariant(variant);
    }
};
