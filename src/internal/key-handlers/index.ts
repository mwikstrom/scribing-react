import { ArrowBackHandler } from "./ArrowBackHandler";
import { ArrowForwardHandler } from "./ArrowForwardHandler";
import { BackspaceHandler } from "./BackspaceHandler";
import { EndHandler } from "./EndHandler";
import { KeyHandler } from "./KeyHandler";
import { RedoHandler } from "./RedoHandler";
import { SetListMarkerHandler } from "./SetListMarkerHandler";
import { SetParagraphStyleHandler } from "./SetParagraphStyleHandler";
import { TabHandler } from "./TabHandler";
import { ToggleFormattingMarksHandler } from "./ToggleFormattingMarksHandler";
import { UndoHandler } from "./UndoHandler";
import { VerticalArrowHandler } from "./VerticalArrowHandler";

const ALL_HANDLERS = [
    ArrowBackHandler,
    ArrowForwardHandler,
    BackspaceHandler,
    EndHandler,
    RedoHandler,
    SetListMarkerHandler,
    SetParagraphStyleHandler,
    TabHandler,
    ToggleFormattingMarksHandler,
    UndoHandler,
    VerticalArrowHandler,
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
