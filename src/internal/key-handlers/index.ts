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
import { LeftRightSelectionHandler } from "./LeftRightSelectionHandler";

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
    LeftRightSelectionHandler,
];

export const handleKeyEvent: KeyHandler = (event, controller) => {
    for (const handler of ALL_HANDLERS) {
        handler(event, controller);
        if (event.defaultPrevented) {
            break;
        }
    }
};
