import clsx from "clsx";
import React, { useMemo } from "react";
import { TableStyle, FlowTable, CellPosition, FlowRangeSelection, FlowTableSelection } from "scribing";
import { useEditMode } from "./EditModeScope";
import { flowNode } from "./FlowNodeComponent";
import { FlowTableCellView } from "./FlowTableCellView";
import { createUseFlowStyles } from "./JssTheming";

export const FlowTableView = flowNode<FlowTable>((props, ref) => {
    const { node, selection: outerSelection } = props;
    const { content } = node;
    const { style: givenStyle } = node;
    const classes = useStyles();   
    const style = useMemo(() => TableStyle.ambient.merge(givenStyle), [givenStyle]);
    const editMode = useEditMode();
    const showSelectionOutline = (
        outerSelection === true || 
        (
            outerSelection instanceof FlowRangeSelection &&
            outerSelection.range.first === 0 &&
            outerSelection.range.last >= 1
        ) ||
        (
            outerSelection instanceof FlowTableSelection &&
            outerSelection.position === 0
        )
    );
    const className = clsx(
        classes.root,
        style.inline && classes.inline,
        showSelectionOutline && (editMode === true ? classes.selectedActive : classes.selectedInactive),
    );
    const { positions, rowCount } = content;
    const rows = useMemo(() => splitPositionsIntoRows(positions, rowCount), [positions, rowCount]);
    return (
        <table
            ref={ref}
            className={className}
            contentEditable={false}
            children={
                <tbody>
                    {rows.map((row, index) => (
                        <tr key={index}>
                            {row.map(pos => (
                                <FlowTableCellView
                                    key={pos.toString()}
                                    position={pos}
                                    cell={node.content.getCell(pos, true)}
                                    outerSelection={outerSelection}
                                    headingRowCount={style.head || 0}
                                    totalRowCount={rows.length}
                                />
                            ))}
                        </tr>
                    ))}
                </tbody>
            }
        />
    );
});

const useStyles = createUseFlowStyles("FlowTable", ({palette}) => ({
    root: {
        display: "table",
        tableLayout: "fixed",
        width: "100%",
        borderCollapse: "collapse",
    },
    inline: {
        display: "inline-table",
        width: "auto",
    },
    selectedActive: {
        outline: `1px solid ${palette.selection}`,
    },
    selectedInactive: {
        outline: `1px solid ${palette.inactiveSelection}`,
    },
}));

const splitPositionsIntoRows = (positions: readonly CellPosition[], rowCount: number): CellPosition[][] => {
    const result: CellPosition[][] = [];
    let rowArray: CellPosition[] = [];
    let rowIndex = 0;
    const emitRows = (until: number): void => {
        while (rowIndex < until) {
            result.push(rowArray);
            rowArray = [];
            ++rowIndex;
        }
    };
    for (const pos of positions) {
        emitRows(pos.row);
        rowArray.push(pos);
    }
    emitRows(rowCount);
    return result;
};
