import { ReactNode } from "react";
import { FlowNode, ParagraphStyle, TextStyle} from "scribing";

export class MarkupReplacement extends FlowNode {
    constructor(
        public readonly size: number,
        public readonly rendition: ReactNode,
    ) {
        super();
    }

    completeUpload(): FlowNode { return this; }
    formatBox(): FlowNode { return this; }
    formatParagraph(): FlowNode { return this; }
    formatText(): FlowNode { return this; }
    getUniformParagraphStyle(): ParagraphStyle | null { return null; }
    getUniformTextStyle(): TextStyle | null { return null; }
    toData(): never { throw new Error("Markup replacement node cannot be converted to data"); }
    unformatAmbient(): FlowNode { return this; }
    unformatBox(): FlowNode { return this; }
    unformatParagraph(): FlowNode { return this; }
    unformatText(): FlowNode { return this; }
}