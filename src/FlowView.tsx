import React, { FC } from "react";
import { createUseStyles } from "react-jss";
import { FlowContent, FlowSelection } from "scribing";
import { FlowFragmentView } from "./internal/FlowFragmentView";
import { makeJssId } from "./internal/utils/make-jss-id";

/**
 * Component props for {@link FlowView}
 * @public
 */
export interface FlowViewProps {
    content: FlowContent;
    selection?: FlowSelection | null;
}

/**
 * Flow content view component
 * @public
 */
export const FlowView: FC<FlowViewProps> = props => {
    const { content: { nodes }, selection } = props;
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <FlowFragmentView nodes={nodes} selection={selection ?? false} emptyTrailingPara/>
        </div>
    );
};

const useStyles = createUseStyles({
    root: {
        counterReset: [...new Array(9)].map((_,i) => `li${i + 1} 0`).join(" "),
    },
}, {
    generateId: makeJssId("FlowView"),
});
