import React, { FC } from "react";
import { createUseStyles } from "react-jss";
import { FlowNode } from "scribing";
import { InlineView } from "./InlineView";
import { makeJssId } from "./make-jss-id";

/** @internal */
export interface LineViewProps {
    children: FlowNode[];
}

export const LineView: FC<LineViewProps> = props => {
    const { children } = props;
    const classes = useStyles();
    return (
        <div
            className={classes.root}
            children={children.map(child => <InlineView key={child.transientKey} node={child}/>)}
        />
    );
};

const useStyles = createUseStyles({
    root: {},
}, {
    generateId: makeJssId("Line"),
});
