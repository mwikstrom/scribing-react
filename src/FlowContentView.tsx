import React, { FC } from "react";
import { FlowContent } from "scribing";

/**
 * Component props for {@link FlowContentView}
 * @public
 */
export interface FlowContentViewProps {
    content: FlowContent;
}

/**
 * Flow content view component
 * @public
 */
export const FlowContentView: FC<FlowContentViewProps> = props => {
    const { content } = props;
    return <>{content}</>;
};
