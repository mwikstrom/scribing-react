import clsx from "clsx";
import Color from "color";
import React, { FC, useCallback, useMemo, useState } from "react";
import { CellPosition, FlowSelection, FlowTableCell, FlowTableCellSelection, NestedFlowSelection } from "scribing";
import { useEditMode } from "./EditModeScope";
import { FlowContentView } from "./FlowContentView";
import { FlowThemeScope, useFlowTheme } from "./FlowThemeScope";
import { useIsParentSelectionActive } from "./hooks/use-is-parent-selection-active";
import { createUseFlowStyles } from "./JssTheming";
import { FlowAxis, setupFlowAxisMapping } from "./mapping/flow-axis";
import { getFlowTableCellSelection } from "./utils/get-sub-selection";

export interface FlowTableCellViewProps {
    cell: FlowTableCell;
    position: CellPosition;
    outerSelection: FlowSelection | boolean;
    headingRowCount: number;
    totalRowCount: number;
}

export const FlowTableCellView: FC<FlowTableCellViewProps> = props => {
    const { cell, position, outerSelection, headingRowCount, totalRowCount } = props;
    const { content, colSpan, rowSpan } = cell;
    const [rootElem, setRootElem] = useState<HTMLElement | null>(null);
    const ref = useCallback((dom: HTMLElement | null) => {
        setRootElem(dom);
        if (dom) {
            setupFlowAxisMapping(dom, new FlowTableCellAxis(position));
        }        
    }, [position]);
    const isParentSelectionActive = useIsParentSelectionActive(rootElem);
    const innerSelection = useMemo(
        () => getFlowTableCellSelection(outerSelection, cell.getSpannedPositions(position, true)),
        [outerSelection, position, cell]
    );
    const editMode = useEditMode();
    const classes = useStyles();
    const outerTheme = useFlowTheme();
    const isHeadingCell = position.row < headingRowCount;
    const isFirstRow = position.row === 0;
    const isLastHeadingRow = position.row + cell.rowSpan === headingRowCount;
    const isLastRow = position.row + cell.rowSpan === totalRowCount;
    const innerTheme = isHeadingCell ? outerTheme.getTableHeadingTheme() : outerTheme.getTableBodyTheme();
    const className = clsx(
        classes.root,
        editMode && classes.editMode,
        isHeadingCell && classes.heading,
        isFirstRow && classes.firstRow,
        isLastHeadingRow && classes.lastHeadingRow,
        isLastRow && classes.lastRow,
        innerSelection === true && (editMode === true ? classes.selectedActive : classes.selectedInactive),
    );
    return (
        <td 
            ref={ref}
            className={className}
            colSpan={colSpan}
            rowSpan={rowSpan}
            contentEditable={!!editMode && !isParentSelectionActive}
            suppressContentEditableWarning={true}
            children={(
                <FlowThemeScope theme={innerTheme}>
                    <FlowContentView
                        content={content}
                        selection={innerSelection}
                    />
                </FlowThemeScope>
            )}
        />
    );
};

const useStyles = createUseFlowStyles("FlowTableCell", ({palette}) => ({
    root: {
        padding: "0.2rem 0.5rem",
        outline: "none",
        verticalAlign: "top",
        "&$editMode": {
            border: `1px dashed ${Color(palette.subtle).alpha(0.25)}`,
        },
        "&>.ScribingParagraph-root:first-child": {
            marginTop: "0 !important",
        },
        "&>.ScribingParagraph-root:last-child": {
            marginBottom: "0 !important",
        },
        "&$firstRow": {
            borderTop: `1px solid ${Color(palette.subtle).alpha(0.5)}`,
        },
        "&:not($heading)": {
            borderBottom: `1px solid ${Color(palette.subtle).alpha(0.5)}`,
        },
        "&$heading": {
            backgroundColor: Color(palette.subtle).alpha(0.075).toString(),
        },
        "&$lastHeadingRow": {
            borderBottom: `1px solid ${Color(palette.subtle).alpha(0.5)}`,
        },
    },
    editMode: {},
    heading: {},
    lastRow: {},
    firstRow: {},
    lastHeadingRow: {},
    selectedActive: {
        borderColor: palette.selectionText,
        backgroundColor: palette.selection,
        color: palette.selectionText,
    },
    selectedInactive: {
        borderColor: palette.inactiveSelectionText,
        backgroundColor: palette.inactiveSelection,
        color: palette.inactiveSelectionText,
    },
}));

class FlowTableCellAxis extends FlowAxis {
    #position: CellPosition;

    constructor(position: CellPosition) { 
        super();
        this.#position = position;
    }

    equals(other: FlowAxis): boolean {
        return other instanceof FlowTableCellAxis && other.#position.equals(this.#position);
    }

    createNestedSelection(outerPosition: number, innerSelection: FlowSelection): NestedFlowSelection {
        return new FlowTableCellSelection({
            position: outerPosition,
            cell: this.#position,
            content: innerSelection,
        });
    }

    getInnerSelection(outer: NestedFlowSelection): FlowSelection | null {
        if (outer instanceof FlowTableCellSelection && outer.cell.equals(this.#position)) {
            return outer.content;
        } else {
            return null;
        }
    }
}
