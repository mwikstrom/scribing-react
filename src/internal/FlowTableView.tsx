import clsx from "clsx";
import React, { useMemo } from "react";
import { TableStyle, FlowTable, CellPosition } from "scribing";
import { FlowFragmentView } from "./FlowFragmentView";
import { flowNode } from "./FlowNodeComponent";
import { createUseFlowStyles } from "./JssTheming";

export const FlowTableView = flowNode<FlowTable>((props, ref) => {
    const { node } = props;
    const { content } = node;
    const { style: givenStyle } = node;
    const classes = useStyles();   
    const style = useMemo(() => TableStyle.ambient.merge(givenStyle), [givenStyle]);
    const className = clsx(
        classes.root,
        style.inline && classes.inline,
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
                                <td key={pos.toString()} colSpan={content.getCell(pos)?.colSpan} rowSpan={content.getCell(pos)?.rowSpan}>
                                    <FlowFragmentView
                                        nodes={content.getCell(pos)?.content.nodes ?? []}
                                        selection={false}
                                    />
                                </td>
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
        "& td, & tr": {
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
        }
    },
    inline: {
        display: "inline-table",
        width: "auto",
    }
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
