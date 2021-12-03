import clsx from "clsx";
import React, { FC, useCallback, useState } from "react";
import { createUseFlowStyles } from "../JssTheming";
import { SYSTEM_FONT } from "../utils/system-font";

export interface TableSizeSelectorProps {
    onSelected: (cols: number, rows: number) => void;
}

export const TableSizeSelector: FC<TableSizeSelectorProps> = props => {
    const { onSelected } = props;
    const classes = useStyles();
    const [cols, setCols] = useState(1);
    const [rows, setRows] = useState(1);
    const onClick = useCallback(() => onSelected(cols, rows), [cols, rows]);
    const setSize = useCallback((c: number, r: number) => {
        setCols(c);
        setRows(r);
    }, [setCols, setRows]);
    return (
        <div className={classes.root} onClick={onClick}>
            {makeArray(rows).map(r => (
                <div key={r}>
                    {makeArray(cols).map(c => (
                        <span key={c} className={classes.cell} onMouseOver={setSize.bind(null, c, r)}>
                            <span className={clsx(
                                classes.box,
                                c <= cols && r <= rows && classes.active,
                            )}/>
                        </span>
                    ))}
                </div>
            ))}
            <div className={classes.summary}>{`${cols} x ${rows}`}</div>
        </div>
    );
};

const makeArray = (count: number) => new Array(Math.max(5, Math.min(20, count + 1)))
    .fill(1)
    .map((base, index) => base + index);

const useStyles = createUseFlowStyles("TableSizeSelector", ({palette}) => ({
    root: {
        padding: "1rem",
        cursor: "pointer",
    },
    cell: {
        display: "inline-flex",
        width: "1rem",
        height: "1rem",
        alignItems: "center",
        justifyContent: "center",
    },
    box: {
        width: "0.75rem",
        height: "0.75rem",
        backgroundColor: palette.paper,
    },
    active: {
        backgroundColor: palette.selection,
    },
    summary: {
        fontFamily: SYSTEM_FONT,
        fontSize: "0.75rem",
        paddingTop: "1rem",
        textAlign: "center",
        color: palette.tooltipText,
    }
}));
