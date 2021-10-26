import { ArrowHandler } from "./ArrowHandler";
import { BackspaceHandler } from "./BackspaceHandler";
import { EndHandler } from "./EndHandler";
import { KeyHandler } from "./KeyHandler";
import { RedoHandler } from "./RedoHandler";
import { SetListMarkerHandler } from "./SetListMarkerHandler";
import { SetParagraphStyleHandler } from "./SetParagraphStyleHandler";
import { TabHandler } from "./TabHandler";
import { ToggleFormattingMarksHandler } from "./ToggleFormattingMarksHandler";
import { UndoHandler } from "./UndoHandler";

const ALL_HANDLERS = [
    ArrowHandler,
    BackspaceHandler,
    EndHandler,
    RedoHandler,
    SetListMarkerHandler,
    SetParagraphStyleHandler,
    TabHandler,
    ToggleFormattingMarksHandler,
    UndoHandler,
];

export const handleKeyEvent: KeyHandler = (e, state) => {
    for (const handler of ALL_HANDLERS) {
        const result = handler(e, state);
        if (result !== void(0)) {
            e.preventDefault();
            return result;
        }
    }
};
