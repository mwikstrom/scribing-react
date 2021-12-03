import { CellPosition, CellRange, FlowRange, FlowTable, FlowTableCellSelection, FlowTableSelection } from "scribing";
import { getEndOfFlow } from "../utils/get-end-of-flow";
import { KeyHandler } from "./KeyHandler";

export const TableSelectionHandler: KeyHandler = (e, controller) => {
    if (isArrowOrEscapeKey(e.key) && controller.isTableSelection()) {
        e.preventDefault();
        controller.getSelection()?.visitRanges((range, {wrap, position, target}) => {
            if (range instanceof CellRange && typeof position === "number") {
                const node = target?.peek(position).node;
                if (node instanceof FlowTable) {
                    const { rowCount, columnCount } = node.content;
                    const focus = move(range.focus, e.key, rowCount, columnCount);
                    if (e.key === "Escape") {
                        const cell = node.content.getCell(focus);
                        if (cell) {
                            const endOfCellContent = getEndOfFlow(cell.content);
                            controller.setSelection(wrap(FlowRange.at(endOfCellContent)));
                        }
                    } else if (e.shiftKey) {                    
                        controller.setSelection(wrap(range.set("focus", focus)));
                    } else {
                        const anchor = focus;
                        controller.setSelection(wrap(range.merge({ focus, anchor })));
                    }
                }
            }
        }, controller.getTargetOptions());
    } else if (
        e.shiftKey &&
        (
            (e.key === "ArrowLeft" && controller.isAtStartOfTableCell()) ||
            (e.key === "ArrowRight" && controller.isAtEndOfTableCell())
        )
    ) {
        e.preventDefault();
        controller.getSelection()?.visitRanges((_, {outer, replace}) => {
            if (outer instanceof FlowTableCellSelection) {
                const anchor = outer.cell;
                const range = CellRange.at(anchor);
                controller.setSelection(replace(new FlowTableSelection({
                    position: outer.position,
                    range,
                })));
            }
        });
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
