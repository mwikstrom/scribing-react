import React, { FC } from "react";
import { FlowNode, LineBreak, ParagraphBreak, TextRun } from "scribing";
import { LineBreakView } from "./LineBreakView";
import { ParagraphBreakView } from "./ParagraphBreakView";
import { TextRunView } from "./TextRunView";
import { UnsupportedElementView } from "./UnsupportedElementView";

/** @internal */
export interface ParagraphElementViewProps {
    node: FlowNode;
}

export const ParagraphElementView: FC<ParagraphElementViewProps> = props => {
    const { node } = props;
    if (node instanceof LineBreak) {
        return <LineBreakView node={node}/>;
    } else if (node instanceof ParagraphBreak) {
        return <ParagraphBreakView node={node}/>;
    } else if (node instanceof TextRun) {
        return <TextRunView node={node}/>;
    } else {
        return <UnsupportedElementView node={node}/>;
    }
};
