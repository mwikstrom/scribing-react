import { BackspaceHandler } from "./BackspaceHandler";
import { BaselineHandler } from "./BaselineHandler";
import { KeyHandler } from "./KeyHandler";
import { RedoHandler } from "./RedoHandler";
import { SetListMarkerHandler } from "./SetListMarkerHandler";
import { SetParagraphVariantHandler } from "./SetParagraphVariantHandler";
import { TabHandler } from "./TabHandler";
import { ToggleFormattingMarksHandler } from "./ToggleFormattingMarksHandler";
import { UndoHandler } from "./UndoHandler";

const ALL_HANDLERS = [
    BackspaceHandler,
    BaselineHandler,
    RedoHandler,
    SetListMarkerHandler,
    SetParagraphVariantHandler,
    TabHandler,
    ToggleFormattingMarksHandler,
    UndoHandler,
];

export const handleKeyEvent: KeyHandler = (event, commands) => {
    for (const handler of ALL_HANDLERS) {
        handler(event, commands);
        if (event.defaultPrevented) {
            break;
        }
    }
};
