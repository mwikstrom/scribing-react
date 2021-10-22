import React, { FC } from "react";
import { createUseStyles } from "react-jss";
import { FlowContent } from "scribing";
import { FlowFragmentView } from "./FlowFragmentView";
import { makeJssId } from "./internal/utils/make-jss-id";

/**
 * Component props for {@link FlowView}
 * @public
 */
export interface FlowViewProps {
    content: FlowContent;
}

/**
 * Flow content view component
 * @public
 */
export const FlowView: FC<FlowViewProps> = props => {
    const { content: { nodes } } = props;
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <FlowFragmentView nodes={nodes}/>
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
