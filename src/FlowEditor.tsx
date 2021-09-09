import React from "react";
import { FC } from "react";
import { FlowContent, FlowRange } from "scribing";

/**
 * Component props for {@link FlowEditor}
 * @public
 */
export interface FlowEditorProps {
    content?: FlowContent;
    selection?: FlowRange;
}

/**
 * Flow editor component
 * @public
 */
export const FlowEditor: FC<FlowEditorProps> = () => {
    return <div/>;
};