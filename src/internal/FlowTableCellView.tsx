import clsx from "clsx";
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
    heading: boolean;
}

export const FlowTableCellView: FC<FlowTableCellViewProps> = props => {
    const { cell, position, outerSelection, heading } = props;
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
    const innerTheme = heading ? outerTheme.getTableHeadingTheme() : outerTheme.getTableBodyTheme();
    const className = clsx(
        classes.root,
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
        border: `1px solid ${palette.subtle}`,
        padding: "0.2rem 0.5rem",
        outline: "none",
        verticalAlign: "top",
        "&>.ScribingParagraph-root:first-child": {
            marginTop: "0 !important",
        },
        "&>.ScribingParagraph-root:last-child": {
            marginBottom: "0 !important",
        },
    },
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
