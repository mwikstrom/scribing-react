import { BackspaceHandler } from "./BackspaceHandler";
import { BaselineHandler } from "./BaselineHandler";
import { TableSelectionHandler } from "./TableSelectionHandler";
import { KeyHandler } from "./KeyHandler";
import { RedoHandler } from "./RedoHandler";
import { SetListMarkerHandler } from "./SetListMarkerHandler";
import { SetParagraphVariantHandler } from "./SetParagraphVariantHandler";
import { TabHandler } from "./TabHandler";
import { ToggleFormattingMarksHandler } from "./ToggleFormattingMarksHandler";
import { UndoHandler } from "./UndoHandler";
import { SelectAllHandler } from "./SelectAllHandler";

const ALL_HANDLERS = [
    BackspaceHandler,
    BaselineHandler,
    RedoHandler,
    SelectAllHandler,
    SetListMarkerHandler,
    SetParagraphVariantHandler,
    TabHandler,
    TableSelectionHandler,
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
