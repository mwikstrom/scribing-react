import { CellPosition, CellRange, FlowRange, FlowTable, FlowTableCellSelection, FlowTableSelection } from "scribing";
import { getEndOfFlow } from "../utils/get-end-of-flow";
import { KeyHandler } from "./KeyHandler";

export const TableSelectionHandler: KeyHandler = (e, commands) => {
    if (isArrowOrEscapeKey(e.key) && commands.isTableSelection()) {
        e.preventDefault();
        commands.getSelection()?.visitRanges((range, {wrap, position, target}) => {
            if (range instanceof CellRange && typeof position === "number") {
                const node = target?.peek(position).node;
                if (node instanceof FlowTable) {
                    const { rowCount, columnCount } = node.content;
                    const focus = move(range.focus, e.key, rowCount, columnCount);
                    if (e.key === "Escape") {
                        const cell = node.content.getCell(focus);
                        if (cell) {
                            const endOfCellContent = getEndOfFlow(cell.content);
                            commands.setSelection(wrap(FlowRange.at(endOfCellContent)));
                        }
                    } else if (e.shiftKey) {                    
                        commands.setSelection(wrap(range.set("focus", focus)));
                    } else {
                        const anchor = focus;
                        commands.setSelection(wrap(range.merge({ focus, anchor })));
                    }
                }
            }
        }, commands.getTargetOptions());
    } else if (e.key === "ArrowLeft" && e.shiftKey && commands.isAtStartOfTableCell()) {
        e.preventDefault();
        commands.getSelection()?.visitRanges((_, {outer, replace}) => {
            if (outer instanceof FlowTableCellSelection) {
                const anchor = outer.cell;
                const focus = anchor.column > 0 ? anchor.set("column", anchor.column - 1) : anchor;
                const range = CellRange.at(anchor, focus);
                commands.setSelection(replace(new FlowTableSelection({
                    position: outer.position,
                    range,
                })));
            }
        });
    } else if (e.key === "ArrowRight" && e.shiftKey && commands.isAtEndOfTableCell()) {
        e.preventDefault();
        commands.getSelection()?.visitRanges((_, {outer, replace}) => {
            if (outer instanceof FlowTableCellSelection) {
                const anchor = outer.cell;
                const focus = anchor.set("column", anchor.column + 1);
                // TODO: MAKE SURE FOCUS ISNT PLACED OUTSIDE OF TABLE (CHECK COLUMN COUNT)
                const range = CellRange.at(anchor, focus);
                commands.setSelection(replace(new FlowTableSelection({
                    position: outer.position,
                    range,
                })));
            }
        }, commands.getTargetOptions());
    }
};

const move = (pos: CellPosition, key: string, rowCount: number, columnCount: number): CellPosition => {
    const { row, column } = pos;
    if (key === "ArrowUp" && row > 0) {
        return pos.set("row", row - 1);
    } else if (key === "ArrowDown" && row < rowCount - 1) {
        return pos.set("row", row + 1);
    } else if (key === "ArrowLeft" && column > 0) {
        return pos.set("column", column - 1);
    } else if (key === "ArrowRight" && column < columnCount - 1) {
        return pos.set("column", column + 1);
    } else {
        return pos;
    }
};

const isArrowOrEscapeKey = (key: string) => (
    key === "Escape" ||
    isArrowKey(key)
);

const isArrowKey = (key: string) => (
    key === "ArrowUp" ||
    key === "ArrowDown" ||
    key === "ArrowLeft" ||
    key === "ArrowRight"
);
